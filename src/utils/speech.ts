/**
 * Browser Turkish Text-to-Speech (TTS) utility
 */

import { LanguageCode } from "../types";

let activeUtterance: SpeechSynthesisUtterance | null = null;

const LANG_MAP: Record<LanguageCode, string> = {
  tr: "tr-TR",
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  ar: "ar-SA",
  ru: "ru-RU",
};

export function speakText(
  text: string,
  lang: LanguageCode = "tr",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (!("speechSynthesis" in window)) {
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown formatting for cleaner speech
  const cleanText = text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~#>]/g, "")
    .replace(/[-+*]\s+/g, "")
    .trim();

  if (!cleanText) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  const targetLang = LANG_MAP[lang] || "tr-TR";
  utterance.lang = targetLang;
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to locate a matching voice for the language
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith(lang.toLowerCase()) ||
      v.lang.toLowerCase().includes(targetLang.toLowerCase())
  );
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => {
    activeUtterance = utterance;
    onStart?.();
  };

  utterance.onend = () => {
    activeUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    onError?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

// Backwards compatibility alias
export const speakTurkishText = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) => speakText(text, "tr", onStart, onEnd, onError);

export function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    activeUtterance = null;
  }
}
