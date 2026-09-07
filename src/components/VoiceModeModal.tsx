import { useState, useEffect, useRef, useCallback } from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Volume2,
  ListCollapse,
  VolumeX,
  Radio,
  Check,
  ChevronDown,
  Minimize2,
  Maximize2,
  X,
  AlertCircle,
  ExternalLink,
  Send,
  RefreshCw,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { AudioOrb, VoiceState } from "./AudioOrb";
import { DarkPeakLogo } from "./DarkPeakLogo";
import {
  connectMicrophoneToAnalyser,
  disconnectMicrophone,
  playVoiceResponse,
  stopAllAudioPlayback,
  playChimeTone,
  getAnalyserNode,
} from "../utils/audioPlayer";
import { ChatMessage, AssistantPersona, LanguageCode } from "../types";

export interface VoiceOption {
  id: string;
  name: string;
  gender: "female" | "male";
  tone: string;
}

export const AVAILABLE_VOICES: VoiceOption[] = [
  { id: "Kore", name: "Kore", gender: "female", tone: "Yumuşak & Dengeli" },
  { id: "Puck", name: "Puck", gender: "male", tone: "Enerjik & Neşeli" },
  { id: "Zephyr", name: "Zephyr", gender: "female", tone: "Sıcak & Samimi" },
  { id: "Charon", name: "Charon", gender: "male", tone: "Derin & Kararlı" },
  { id: "Fenrir", name: "Fenrir", gender: "male", tone: "Güçlü & Net" },
  { id: "system", name: "Sistem Sesi", gender: "female", tone: "Yerel Türkçe" },
];

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: LanguageCode;
  persona?: AssistantPersona;
  customSystemPrompt?: string;
  existingMessages: ChatMessage[];
  onCommitVoiceMessage: (userText: string, assistantText: string) => void;
}

export function VoiceModeModal({
  isOpen,
  onClose,
  language = "tr",
  persona = "general",
  customSystemPrompt = "",
  existingMessages,
  onCommitVoiceMessage,
}: VoiceModeModalProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("Kore");
  const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const [currentUserText, setCurrentUserText] = useState("");
  const [interimUserText, setInterimUserText] = useState("");
  const [currentAssistantText, setCurrentAssistantText] = useState("");

  const [voiceLog, setVoiceLog] = useState<{ role: "user" | "assistant"; text: string }[]>([]);

  // Detailed Microphone Diagnostics & Alternatives
  const [micError, setMicError] = useState<{
    code: "not-allowed" | "service-not-allowed" | "not-supported" | "audio-capture" | "other";
    message: string;
  } | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [micLevel, setMicLevel] = useState<number>(0);
  const [manualText, setManualText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(false);
  const isListeningIntentRef = useRef(false);
  const currentAssistantFullTextRef = useRef("");
  const activeFetchAbortRef = useRef<AbortController | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const conversationHistoryRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    conversationHistoryRef.current = existingMessages;
  }, [existingMessages]);

  // Handle Speech Recognition Setup
  const stopRecognition = useCallback(() => {
    isListeningIntentRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // Send collected user speech to Gemini AI and stream response
  const handleProcessUserSpeech = useCallback(
    async (spokenText: string) => {
      const cleanInput = spokenText.trim();
      if (!cleanInput) {
        startListening();
        return;
      }

      setMicError(null);
      stopRecognition();
      setState("thinking");
      setCurrentUserText(cleanInput);
      setInterimUserText("");
      setCurrentAssistantText("");
      currentAssistantFullTextRef.current = "";

      setVoiceLog((prev) => [...prev, { role: "user", text: cleanInput }]);

      // Construct payload with conversation context
      const updatedMessages = [
        ...conversationHistoryRef.current,
        {
          id: "voice_user_" + Date.now(),
          role: "user" as const,
          content: cleanInput,
          timestamp: Date.now(),
        },
      ];

      const abortController = new AbortController();
      activeFetchAbortRef.current = abortController;

      try {
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortController.signal,
          body: JSON.stringify({
            messages: updatedMessages,
            persona,
            customSystemPrompt:
              (customSystemPrompt ? customSystemPrompt + "\n\n" : "") +
              "SESLİ SOHBET MODU AKTİF: Kullanıcı ile telefon veya canlı ses üzerinden konuşuyorsun. Yanıtların doğal, konuşma diline uygun, akıcı ve gereksiz uzun olmayan, dinlemesi keyifli yanıtlar olsun. Çok uzun listeler yerine özet ve net konuş.",
            language,
          }),
        });

        if (!response.ok) {
          throw new Error(`Stream responded with ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantFullReply = "";

        if (!reader) {
          throw new Error("No reader stream available");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const rawChunk = decoder.decode(value, { stream: true });
          const lines = rawChunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              const dataPayload = trimmed.slice(6).trim();
              if (dataPayload === "[DONE]") continue;

              try {
                const parsed = JSON.parse(dataPayload);
                if (parsed.text) {
                  assistantFullReply += parsed.text;
                  currentAssistantFullTextRef.current = assistantFullReply;
                  setCurrentAssistantText(assistantFullReply);
                }
              } catch {}
            }
          }
        }

        if (!assistantFullReply.trim()) {
          assistantFullReply = "Sizi anladım, dinliyorum.";
        }

        setVoiceLog((prev) => [...prev, { role: "assistant", text: assistantFullReply }]);
        onCommitVoiceMessage(cleanInput, assistantFullReply);

        // Transition to Speaking
        setState("speaking");

        // Speak the reply via Gemini TTS / Web Speech
        await playVoiceResponse(
          assistantFullReply,
          selectedVoice === "system" ? "" : selectedVoice,
          language,
          () => {
            if (isMountedRef.current) setState("speaking");
          },
          () => {
            // Speech finished -> Auto-listen for user's next question!
            if (isMountedRef.current && !isMuted) {
              startListening();
            } else {
              setState("idle");
            }
          },
          () => {
            if (isMountedRef.current && !isMuted) {
              startListening();
            } else {
              setState("idle");
            }
          }
        );
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.warn("Voice interaction error:", err);
        setState("idle");
        setTimeout(() => {
          if (isMountedRef.current && !isMuted) startListening();
        }, 1000);
      }
    },
    [language, persona, customSystemPrompt, selectedVoice, isMuted, onCommitVoiceMessage]
  );

  const startListening = useCallback(() => {
    if (!isMountedRef.current || isMuted) return;

    stopAllAudioPlayback();
    stopRecognition();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser");
      setMicError({
        code: "not-supported",
        message: "Tarayıcınız yerel konuşma tanımayı desteklemiyor. Google Chrome veya Microsoft Edge önerilir.",
      });
      setState("idle");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        language === "tr"
          ? "tr-TR"
          : language === "en"
          ? "en-US"
          : language === "de"
          ? "de-DE"
          : language === "es"
          ? "es-ES"
          : language === "fr"
          ? "fr-FR"
          : language === "ru"
          ? "ru-RU"
          : "tr-TR";

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalCapturedText = "";
      let silenceTimer: any = null;

      recognition.onstart = () => {
        isListeningIntentRef.current = true;
        setMicError(null);
        setState("listening");
        setInterimUserText("");
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalCapturedText += transcript + " ";
          } else {
            interim += transcript;
          }
        }

        const combined = (finalCapturedText + interim).trim();
        setInterimUserText(combined);

        // Reset silence detection timeout
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          if (combined.length > 0) {
            try {
              recognition.stop();
            } catch {}
          }
        }, 1600);
      };

      recognition.onerror = (event: any) => {
        if (event.error === "no-speech") {
          // Restart listening softly if still active
          if (isListeningIntentRef.current && isMountedRef.current && !isMuted) {
            setTimeout(() => {
              if (isMountedRef.current && isListeningIntentRef.current) {
                startListening();
              }
            }, 350);
          }
          return;
        }

        console.warn("Speech recognition error:", event.error);

        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setMicError({
            code: "not-allowed",
            message: "Mikrofon erişim izni engellendi. Lütfen tarayıcı adres çubuğundaki kilit/izin simgesinden mikrofona izin verin.",
          });
          setState("idle");
        } else if (event.error === "service-not-allowed") {
          setMicError({
            code: "service-not-allowed",
            message: "Önizleme çerçevesi (iframe) konuşma tanıma servisini kısıtladı. Uygulamayı yeni sekmede açarak tam yetkiyle kullanabilirsiniz.",
          });
          setState("idle");
        } else if (event.error === "audio-capture") {
          setMicError({
            code: "audio-capture",
            message: "Mikrofon aygıtı bulunamadı. Lütfen mikrofonunuzun bağlı ve açık olduğundan emin olun.",
          });
          setState("idle");
        } else {
          setMicError({
            code: "other",
            message: `Ses algılama sorunu (${event.error}). 'Tekrar Dene' butonuna basabilir veya yazarak konuşabilirsiniz.`,
          });
          setState("idle");
        }
      };

      recognition.onend = () => {
        const textToProcess = (finalCapturedText || interimUserText).trim();
        if (textToProcess.length > 1) {
          handleProcessUserSpeech(textToProcess);
        } else if (isMountedRef.current && !isMuted && state === "listening") {
          // Restart listening if no speech was detected
          setTimeout(() => {
            if (isMountedRef.current && !isMuted) startListening();
          }, 350);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn("Failed to start speech recognition:", err);
      setMicError({
        code: "other",
        message: "Mikrofon başlatılamadı. Lütfen mikrofon izinlerini kontrol edin.",
      });
      setState("idle");
    }
  }, [language, isMuted, state, handleProcessUserSpeech, interimUserText]);

  // User explicitly clicks "Mikrofon İzni Ver"
  const handleGrantPermission = async () => {
    setIsRequestingPermission(true);
    setMicError(null);

    try {
      // 1. Direct getUserMedia call inside user click handler forces the browser permission dialog to appear
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (stream) {
        await connectMicrophoneToAnalyser();
        setMicError(null);
        setState("listening");
        setTimeout(() => {
          if (isMountedRef.current && !isMuted) {
            startListening();
          }
        }, 200);
      }
    } catch (err: any) {
      console.warn("Microphone permission request error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setMicError({
          code: "not-allowed",
          message: isInIframe
            ? "Tarayıcınız önizleme çerçevesinde mikrofon izin penceresini açmadı. Lütfen aşağıdaki 'Yeni Sekmede Aç ve İzin Ver' butonuna tıklayınız."
            : "Mikrofon izni verilmedi. Tarayıcınızın adres çubuğundaki kilit (🔒) simgesine tıklayıp Mikrofon'u 'İzin Ver' olarak ayarlayınız.",
        });
      } else {
        setMicError({
          code: "other",
          message: err.message || "Mikrofon başlatılamadı. Lütfen mikrofon aygıtınızı kontrol ediniz.",
        });
      }
      setState("idle");
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Initial mount & unmount management
  useEffect(() => {
    if (!isOpen) return;

    isMountedRef.current = true;
    const inIframe = window.self !== window.top;
    setIsInIframe(inIframe);

    playChimeTone("connect");

    // Live audio level measurement
    const updateMicLevel = () => {
      try {
        const analyser = getAnalyserNode();
        const buffer = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length;
        const normalized = Math.min(100, Math.round((avg / 120) * 100));
        setMicLevel(normalized);
      } catch {}

      if (isMountedRef.current) {
        animFrameRef.current = requestAnimationFrame(updateMicLevel);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateMicLevel);

    // Try connecting or starting softly
    let timer: any = null;
    connectMicrophoneToAnalyser()
      .then((stream) => {
        if (!isMountedRef.current) return;
        if (stream) {
          timer = setTimeout(() => {
            if (isMountedRef.current && !isMuted) {
              startListening();
            }
          }, 350);
        } else {
          // If browser hasn't prompted yet, provide clean prompt
          setMicError({
            code: "not-allowed",
            message: inIframe
              ? "Önizleme çerçevesinde mikrofon izni bekleniyor. Aşağıdaki 'Mikrofon İzni Ver' veya 'Yeni Sekmede Aç' butonunu kullanabilirsiniz."
              : "Sesli konuşma yapabilmek için mikrofon erişimine izin vermeniz gerekiyor.",
          });
        }
      })
      .catch(() => {
        if (!isMountedRef.current) return;
        setMicError({
          code: "not-allowed",
          message: "Mikrofon izni gerekiyor. Lütfen aşağıdaki 'Mikrofon İzni Ver' butonuna tıklayınız.",
        });
      });

    return () => {
      isMountedRef.current = false;
      if (timer) clearTimeout(timer);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      stopRecognition();
      stopAllAudioPlayback();
      disconnectMicrophone();
      if (activeFetchAbortRef.current) {
        activeFetchAbortRef.current.abort();
      }
    };
  }, [isOpen]);

  const handleManualSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    setShowTextInput(false);
    handleProcessUserSpeech(text);
  };

  // Handle Interrupt (Araya Gir)
  const handleInterrupt = () => {
    playChimeTone("interrupt");
    stopAllAudioPlayback();
    if (activeFetchAbortRef.current) {
      activeFetchAbortRef.current.abort();
    }
    setState("listening");
    startListening();
  };

  // Toggle Mute
  const handleToggleMute = () => {
    if (!isMuted) {
      stopRecognition();
      stopAllAudioPlayback();
      setIsMuted(true);
      setState("idle");
    } else {
      setIsMuted(false);
      startListening();
    }
  };

  // Close voice call
  const handleEndCall = () => {
    playChimeTone("disconnect");
    stopAllAudioPlayback();
    stopRecognition();
    disconnectMicrophone();
    setIsMinimized(false);
    onClose();
  };

  if (!isOpen) return null;

  const currentVoiceObj =
    AVAILABLE_VOICES.find((v) => v.id === selectedVoice) || AVAILABLE_VOICES[0];

  // --------------------------------------------------------------------------
  // MINIMIZED FLOATING PiP WIDGET (Browsing Chat while Talking)
  // --------------------------------------------------------------------------
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 p-3 rounded-3xl bg-zinc-900/95 border border-emerald-500/40 backdrop-blur-2xl shadow-[0_15px_45px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5 duration-200">
        {/* Animated Beacon Indicator */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
          <Radio className="w-5 h-5 relative z-10" />
        </div>

        <div className="flex flex-col pr-1 cursor-pointer" onClick={() => setIsMinimized(false)}>
          <span className="text-xs font-bold text-white tracking-tight">Dark Peak Canlı Ses</span>
          <span className="text-[11px] text-emerald-300 font-medium">
            {state === "listening"
              ? "Sizi dinliyor..."
              : state === "thinking"
              ? "Düşünüyor..."
              : state === "speaking"
              ? "Konuşuyor..."
              : "Hazır"}
          </span>
        </div>

        {/* Mic Toggle */}
        <button
          type="button"
          onClick={handleToggleMute}
          className={`p-2 rounded-2xl border transition-colors cursor-pointer ${
            isMuted
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
          }`}
          title={isMuted ? "Mikrofonu Aç" : "Sessize Al"}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Maximize Back to Fullscreen */}
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
          title="Büyüt"
        >
          <Maximize2 className="w-4 h-4 text-emerald-400" />
        </button>

        {/* End Call */}
        <button
          type="button"
          onClick={handleEndCall}
          className="p-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md"
          title="Bitir"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // CLEAN, MINIMALIST & SERENE VOICE EXPERIENCE
  // --------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090b0e] text-white select-none overflow-hidden animate-in fade-in duration-300">
      {/* Soft Ambient Center Backlight */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ${
          state === "listening"
            ? "bg-emerald-500/12 scale-110"
            : state === "thinking"
            ? "bg-sky-500/12 scale-105"
            : state === "speaking"
            ? "bg-emerald-400/18 scale-120"
            : "bg-zinc-800/10 scale-95"
        }`}
      />

      <div className="relative w-full h-full max-w-3xl flex flex-col justify-between p-5 sm:p-8 z-20">
        {/* Sleek Minimal Header */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <DarkPeakLogo size={20} />
            <span className="text-sm font-semibold tracking-tight text-zinc-200">
              Dark Peak
            </span>
            <span className="text-xs text-zinc-500 font-medium hidden sm:inline">
              • Sesli Asistan
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>{currentVoiceObj.name}</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </button>

              {isVoiceDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-in fade-in duration-150">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Ses Karakteri
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {AVAILABLE_VOICES.map((voice) => (
                      <button
                        key={voice.id}
                        type="button"
                        onClick={() => {
                          setSelectedVoice(voice.id);
                          setIsVoiceDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                          selectedVoice === voice.id
                            ? "bg-emerald-500/15 text-emerald-300 font-medium"
                            : "text-zinc-300 hover:bg-zinc-800/80"
                        }`}
                      >
                        <div>
                          <div className="text-zinc-200">{voice.name}</div>
                          <div className="text-[10px] text-zinc-500">{voice.tone}</div>
                        </div>
                        {selectedVoice === voice.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transcript Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowTranscript(!showTranscript)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                showTranscript
                  ? "bg-zinc-800 text-zinc-100 border-zinc-700"
                  : "bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 border-zinc-800"
              }`}
              title="Konuşma Metni"
            >
              <ListCollapse className="w-4 h-4" />
            </button>

            {/* Minimize to PiP */}
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 transition-colors cursor-pointer"
              title="Küçült"
            >
              <Minimize2 className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
              title="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Center: Minimalist Orb, Audio Level & Subtitles */}
        <main className="flex-1 flex flex-col items-center justify-center my-2 relative">
          {/* Diagnostic & Interactive Permission Card */}
          {micError && (
            <div className="mb-4 w-full max-w-md p-4 rounded-3xl bg-zinc-900/95 border border-emerald-500/40 text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2.5 shadow-inner">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>

                <h3 className="text-sm font-semibold text-white mb-1">
                  Mikrofon İzni Gerekli
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-sm mb-3.5">
                  {micError.message}
                </p>

                {/* Big Prominent Action Buttons */}
                <div className="w-full flex flex-col sm:flex-row gap-2 items-center justify-center">
                  {/* 1. Main Direct Permission Request Button */}
                  <button
                    id="grant-mic-permission-btn"
                    type="button"
                    onClick={handleGrantPermission}
                    disabled={isRequestingPermission}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Mic className="w-4 h-4 stroke-[2.2]" />
                    <span>{isRequestingPermission ? "İzin İsteniyor..." : "Mikrofon İzni Ver"}</span>
                  </button>

                  {/* 2. Open in New Tab Button */}
                  <button
                    id="open-in-new-tab-btn"
                    type="button"
                    onClick={() => window.open(window.location.href, "_blank")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-all cursor-pointer"
                    title="Yeni sekmede açarak tarayıcı izin penceresini açın"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Yeni Sekmede Aç</span>
                  </button>

                  {/* 3. Text Chat in Voice Mode Fallback */}
                  <button
                    type="button"
                    onClick={() => setShowTextInput(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2.5 rounded-2xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Yazarak Konuş</span>
                  </button>
                </div>

                {/* 4. Browser URL bar permission guide */}
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 w-full text-left text-[11px] text-zinc-400 flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed text-zinc-400">
                    <span className="text-zinc-300 font-medium">İzin penceresi gelmediyse: </span>
                    Adres çubuğundaki kilit (🔒) simgesine basıp <strong className="text-emerald-400 font-medium">Mikrofon</strong>'u <strong className="text-white font-medium">"İzin Ver"</strong> yapın veya <strong className="text-white font-medium">"Yeni Sekmede Aç"</strong> ile kullanın.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtle Status Text & Live Mic Level */}
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isMuted
                    ? "bg-rose-400"
                    : state === "listening"
                    ? "bg-emerald-400 animate-pulse"
                    : state === "thinking"
                    ? "bg-sky-400 animate-pulse"
                    : state === "speaking"
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-zinc-500"
                }`}
              />
              <span>
                {isMuted
                  ? "Mikrofon Sessizde"
                  : state === "listening"
                  ? "Dinliyor..."
                  : state === "thinking"
                  ? "Düşünüyor..."
                  : state === "speaking"
                  ? "Konuşuyor..."
                  : "Hazır"}
              </span>
            </div>

            {/* Live Visual Volume Bar when listening */}
            {state === "listening" && !isMuted && !micError && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 font-medium">Mikrofon:</span>
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden flex items-center">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(8, micLevel)}%` }}
                  />
                </div>
                {micLevel > 15 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>
            )}
          </div>

          {/* Clean Organic Breathing Orb */}
          <AudioOrb state={state} isMuted={isMuted} />

          {/* Minimal Subtitles & Action */}
          <div className="w-full max-w-lg min-h-[60px] flex flex-col items-center justify-center text-center px-4 mt-4">
            {state === "listening" && interimUserText && (
              <div className="flex flex-col items-center gap-2 animate-in fade-in duration-150">
                <p className="text-sm font-normal text-emerald-300 leading-relaxed">
                  "{interimUserText}"
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (interimUserText.trim()) {
                      handleProcessUserSpeech(interimUserText.trim());
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-medium border border-emerald-500/40 transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Şimdi Cevapla</span>
                </button>
              </div>
            )}

            {state === "speaking" && currentAssistantText && (
              <p className="text-sm font-normal text-zinc-300 leading-relaxed line-clamp-3">
                "{currentAssistantText.slice(-140)}"
              </p>
            )}

            {state === "idle" && !isMuted && !micError && (
              <p className="text-xs text-zinc-500 font-light">
                Konuşmaya başlayabilirsiniz veya bir soru sorabilirsiniz
              </p>
            )}
          </div>

          {/* Optional Quick Text Input for silent environments or mic issues */}
          {showTextInput && (
            <form
              onSubmit={handleManualSubmit}
              className="mt-3 w-full max-w-md flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Sesli sormak istediğiniz soruyu yazın..."
                className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none px-1 py-1"
                autoFocus
              />
              <button
                type="submit"
                disabled={!manualText.trim()}
                className="p-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowTextInput(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </main>

        {/* Collapsible Transcript Drawer */}
        {showTranscript && (
          <div className="absolute inset-x-5 top-20 bottom-28 bg-zinc-900/98 backdrop-blur-xl border border-zinc-800 rounded-3xl p-5 overflow-y-auto z-30 shadow-2xl flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-semibold text-zinc-400">
              <span>Konuşma Geçmişi</span>
              <button
                type="button"
                onClick={() => setShowTranscript(false)}
                className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {voiceLog.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-500 py-8">
                Henüz konuşma kaydı bulunmuyor.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {voiceLog.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      log.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 mb-0.5 px-1">
                      {log.role === "user" ? "Siz" : "Asistan"}
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${
                        log.role === "user"
                          ? "bg-emerald-600/30 text-emerald-100 border border-emerald-500/30"
                          : "bg-zinc-800/80 text-zinc-200 border border-zinc-700/50"
                      }`}
                    >
                      <p className="leading-relaxed">{log.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Clean, Simple Floating Control Dock */}
        <footer className="flex items-center justify-center pb-2">
          <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-xl">
            {/* Mute Button */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isMuted
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/40"
                  : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              }`}
              title={isMuted ? "Mikrofonu Aç" : "Sessize Al"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Interrupt Button ("Araya Gir") */}
            {(state === "speaking" || state === "thinking") && (
              <button
                type="button"
                onClick={handleInterrupt}
                className="px-4 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer"
                title="Sözü Kes"
              >
                <VolumeX className="w-4 h-4 text-emerald-400" />
                <span>Araya Gir</span>
              </button>
            )}

            {/* End Call Button */}
            <button
              type="button"
              onClick={handleEndCall}
              className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer shadow-md"
              title="Aramayı Sonlandır"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
