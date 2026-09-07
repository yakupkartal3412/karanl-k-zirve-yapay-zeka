import { LanguageCode } from "../types";
import { speakText, stopSpeaking } from "./speech";

let audioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let analyserNode: AnalyserNode | null = null;
let micStream: MediaStream | null = null;
let micSourceNode: MediaStreamAudioSourceNode | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function getAnalyserNode(): AnalyserNode {
  const ctx = getAudioContext();
  if (!analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;
  }
  return analyserNode;
}

// Connect user microphone to the analyser so the orb reacts to user speech
export async function connectMicrophoneToAnalyser(): Promise<MediaStream | null> {
  try {
    const ctx = getAudioContext();
    const analyser = getAnalyserNode();

    if (!micStream || !micStream.active) {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }

    if (micStream && !micSourceNode) {
      micSourceNode = ctx.createMediaStreamSource(micStream);
      micSourceNode.connect(analyser);
      // NOTE: Do not connect micSourceNode to destination, to prevent echo/feedback!
    }

    return micStream;
  } catch (err) {
    console.warn("Microphone analyser connection warning:", err);
    return null;
  }
}

export function disconnectMicrophone() {
  if (micSourceNode) {
    try {
      micSourceNode.disconnect();
    } catch {}
    micSourceNode = null;
  }
  if (micStream) {
    micStream.getTracks().forEach((t) => t.stop());
    micStream = null;
  }
}

// Convert Gemini 24kHz raw PCM base64 string to AudioBuffer
function pcm16Base64ToAudioBuffer(base64Data: string, sampleRate = 24000): AudioBuffer {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Gemini returns 16-bit linear PCM little-endian
  const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
  const float32 = new Float32Array(pcm16.length);
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 32768.0;
  }

  const ctx = getAudioContext();
  const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate);
  audioBuffer.getChannelData(0).set(float32);
  return audioBuffer;
}

export function stopAllAudioPlayback() {
  stopSpeaking();
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch {}
    currentSource = null;
  }
}

// Gentle soft chime when Voice Mode connects
export function playChimeTone(type: "connect" | "disconnect" | "interrupt" = "connect") {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "connect") {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === "interrupt") {
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.2);
    } else {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.26);
    }
  } catch {
    // AudioContext blocked before gesture, safe ignore
  }
}

// Play speech using Gemini TTS if available, or fall back to native speech synthesis
export async function playVoiceResponse(
  text: string,
  voiceName: string = "Kore",
  language: LanguageCode = "tr",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): Promise<void> {
  stopAllAudioPlayback();

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceName }),
    });

    if (!res.ok) {
      throw new Error(`TTS server responded with ${res.status}`);
    }

    const data = await res.json();
    if (!data.audio) {
      throw new Error("No audio payload returned");
    }

    const ctx = getAudioContext();
    const analyser = getAnalyserNode();
    const audioBuffer = pcm16Base64ToAudioBuffer(data.audio, 24000);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;

    // Connect through analyser to audio destination
    source.connect(analyser);
    analyser.connect(ctx.destination);

    source.onended = () => {
      currentSource = null;
      onEnd?.();
    };

    currentSource = source;
    onStart?.();
    source.start(0);
  } catch (err) {
    // Graceful fallback to browser speech synthesis
    console.warn("Falling back to browser speech synthesis:", err);
    speakText(text, language, onStart, onEnd, onError);
  }
}
