import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent, ClipboardEvent, DragEvent } from "react";
import { ArrowUp, X, Square, Plus, Mic, MicOff, AlertCircle, Image as ImageIcon, Loader2, ExternalLink, Lock } from "lucide-react";
import { LanguageCode, ThemeMode, ChatImage } from "../types";
import { getTranslation } from "../i18n/translations";
import { compressAndProcessImage } from "../utils/imageCompressor";

interface ChatInputProps {
  onSend: (text: string, images?: ChatImage[]) => void;
  onStop?: () => void;
  onOpenVoiceMode?: () => void;
  isStreaming: boolean;
  initialValue?: string;
  onClearInitialValue?: () => void;
  theme?: ThemeMode;
  language?: LanguageCode;
  onFocus?: () => void;
}

function getSpeechRecognitionLang(lang: LanguageCode): string {
  switch (lang) {
    case "tr":
      return "tr-TR";
    case "en":
      return "en-US";
    case "de":
      return "de-DE";
    case "es":
      return "es-ES";
    case "fr":
      return "fr-FR";
    case "ar":
      return "ar-SA";
    case "ru":
      return "ru-RU";
    default:
      return "tr-TR";
  }
}

export function ChatInput({
  onSend,
  onStop,
  onOpenVoiceMode,
  isStreaming,
  initialValue = "",
  onClearInitialValue,
  theme = "dark",
  language = "tr",
  onFocus,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<ChatImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const isLight = theme === "light";
  const t = getTranslation(language);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const baseTextRef = useRef<string>("");

  // Process and compress an array of image files
  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 25 * 1024 * 1024
    );
    if (validFiles.length === 0) return;

    // Limit maximum total images to 10
    const availableSlots = 10 - selectedImages.length;
    if (availableSlots <= 0) return;

    const filesToProcess = validFiles.slice(0, availableSlots);
    setIsProcessingImages(true);

    try {
      const results = await Promise.all(
        filesToProcess.map(async (file) => {
          try {
            const compressed = await compressAndProcessImage(file);
            return {
              ...compressed,
              name: file.name,
              size: file.size,
            };
          } catch (err) {
            console.warn("Failed to compress file:", file.name, err);
            return null;
          }
        })
      );

      const successful: ChatImage[] = [];
      for (const res of results) {
        if (res) {
          successful.push(res);
        }
      }
      if (successful.length > 0) {
        setSelectedImages((prev) => [...prev, ...successful].slice(0, 10));
      }
    } finally {
      setIsProcessingImages(false);
    }
  };

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Sync initialValue when editing
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      if (onClearInitialValue) onClearInitialValue();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialValue, onClearInitialValue]);

  // Auto-resize textarea based on scrollHeight
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }, [input]);

  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const requestMicAndStartRecognition = async () => {
    setVoiceError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(t.voiceNotSupported || "Tarayıcınız ses tanıma özelliğini desteklemiyor.");
      return;
    }

    try {
      // 1. Explicitly prompt for mic permission inside this user click event
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          // Stop stream tracks once permission is granted; SpeechRecognition will capture audio
          stream.getTracks().forEach((track) => track.stop());
        } catch (err: any) {
          console.warn("Microphone getUserMedia prompt error:", err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setVoiceError(
              t.micPermissionDenied ||
                "Mikrofon izni engellendi. İzin vermek için aşağıdaki 'Mikrofon İzni Ver' butonuna tıklayınız."
            );
            return;
          }
        }
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = getSpeechRecognitionLang(language);

      baseTextRef.current = input;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let fullTranscript = "";
        for (let i = 0; i < event.results.length; ++i) {
          fullTranscript += event.results[i][0].transcript;
        }

        const trimmedTranscript = fullTranscript.trim();
        if (trimmedTranscript) {
          const prefix = baseTextRef.current.trim()
            ? `${baseTextRef.current.trim()} `
            : "";
          setInput(`${prefix}${trimmedTranscript}`);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setVoiceError(
            t.micPermissionDenied ||
              "Mikrofon izni gerekiyor. İzin vermek için 'Mikrofon İzni Ver' butonuna tıklayın."
          );
        } else if (event.error === "no-speech") {
          return;
        } else {
          setVoiceError(t.voiceNotSupported || `Ses tanıma uyarısı (${event.error}).`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition start failed:", err);
      setVoiceError(t.micPermissionDenied || "Mikrofon başlatılamadı. İzin vermek için aşağıdaki butona tıklayın.");
      setIsListening(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopVoiceInput();
      return;
    }
    requestMicAndStartRecognition();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processFiles(files);
    // Reset input so re-selecting same files works
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
  };

  // Clipboard paste support for images (Ctrl+V / Cmd+V)
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData && e.clipboardData.items) {
      const items = Array.from(e.clipboardData.items);
      const imageFiles: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        processFiles(imageFiles);
      }
    }
  };

  // Drag & drop support
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer && e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (files.length > 0) {
        processFiles(files);
      }
    }
  };

  const handleSubmit = () => {
    if (isListening) {
      stopVoiceInput();
    }

    if (isStreaming) {
      if (onStop) onStop();
      return;
    }

    const trimmed = input.trim();
    if (!trimmed && selectedImages.length === 0) return;

    onSend(trimmed, selectedImages.length > 0 ? selectedImages : undefined);
    setInput("");
    setSelectedImages([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const hasText = input.trim().length > 0 || selectedImages.length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4">
      {/* Voice Error Notification with direct action buttons */}
      {voiceError && (
        <div
          className={`mb-2.5 px-3.5 py-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs border shadow-md animate-in fade-in slide-in-from-bottom-1 duration-150 ${
            isLight
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-amber-950/70 border-amber-700/80 text-amber-200"
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span className="font-medium text-xs leading-relaxed">{voiceError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              id="chat-grant-mic-permission-btn"
              type="button"
              onClick={requestMicAndStartRecognition}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Mikrofon İzni Ver</span>
            </button>
            <button
              type="button"
              onClick={() => window.open(window.location.href, "_blank")}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs border border-zinc-700 transition-all cursor-pointer"
              title="Yeni sekmede açarak tam izinle kullanın"
            >
              <ExternalLink className="w-3 h-3 text-emerald-400" />
              <span>Yeni Sekmede Aç</span>
            </button>
            <button
              id="dismiss-voice-error-btn"
              type="button"
              onClick={() => setVoiceError(null)}
              className="p-1 hover:opacity-75 cursor-pointer shrink-0"
              title="Kapat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Live Speech Recognition Active State Banner */}
      {isListening && (
        <div
          className={`mb-2 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-2 border animate-in fade-in duration-150 ${
            isLight
              ? "bg-rose-50 border-rose-200 text-rose-900 shadow-sm"
              : "bg-rose-950/40 border-rose-900/50 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {t.voiceListening || "Dinleniyor... Konuşun"}
            </span>
            {/* Audio wave bars */}
            <div className="flex items-center gap-1 h-3.5">
              <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-pulse" style={{ animationDuration: "0.5s" }}></span>
              <span className="w-0.5 h-3.5 bg-rose-500 rounded-full animate-pulse" style={{ animationDuration: "0.35s" }}></span>
              <span className="w-0.5 h-1.5 bg-rose-500 rounded-full animate-pulse" style={{ animationDuration: "0.7s" }}></span>
              <span className="w-0.5 h-3 bg-rose-500 rounded-full animate-pulse" style={{ animationDuration: "0.45s" }}></span>
            </div>
          </div>

          <button
            id="stop-voice-banner-btn"
            type="button"
            onClick={stopVoiceInput}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
              isLight
                ? "bg-white hover:bg-rose-100 border-rose-300 text-rose-800"
                : "bg-rose-900/50 hover:bg-rose-900/80 border-rose-800 text-rose-100"
            }`}
          >
            {t.voiceStop || "Durdur"}
          </button>
        </div>
      )}

      {/* Selected Images Gallery Preview */}
      {(selectedImages.length > 0 || isProcessingImages) && (
        <div className="mb-2.5 px-1 flex flex-col gap-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1 font-medium">
            <div className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {selectedImages.length === 1
                  ? "1 görsel eklendi"
                  : `${selectedImages.length} görsel eklendi (en fazla 10)`}
              </span>
            </div>
            {selectedImages.length > 1 && (
              <button
                type="button"
                onClick={clearAllImages}
                className="text-[11px] text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Tümünü Kaldır
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            {selectedImages.map((img, index) => (
              <div
                key={index}
                className={`group relative shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border shadow-sm transition-all ${
                  isLight
                    ? "border-zinc-300/80 bg-zinc-100 hover:border-zinc-400"
                    : "border-zinc-700/80 bg-zinc-900 hover:border-zinc-600"
                }`}
              >
                <img
                  src={img.previewUrl}
                  alt={img.name || `Görsel ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Number badge */}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold rounded-md pointer-events-none">
                  {index + 1}
                </span>
                {/* Remove button */}
                <button
                  id={`remove-image-${index}`}
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/75 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-sm hover:scale-105"
                  title="Görseli kaldır"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            ))}

            {/* Processing Spinner card */}
            {isProcessingImages && (
              <div
                className={`shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border flex flex-col items-center justify-center gap-1 text-zinc-400 ${
                  isLight ? "bg-zinc-100 border-zinc-300" : "bg-zinc-900 border-zinc-700"
                }`}
              >
                <Loader2 className="w-5 h-5 animate-spin text-zinc-500 dark:text-zinc-300" />
                <span className="text-[10px]">İşleniyor</span>
              </div>
            )}

            {/* Add more images button if < 10 */}
            {selectedImages.length < 10 && !isProcessingImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Daha fazla görsel ekle"
                className={`shrink-0 w-18 h-18 sm:w-20 sm:h-20 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isLight
                    ? "border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100 text-zinc-600"
                    : "border-zinc-700 hover:border-zinc-500 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300"
                }`}
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
                <span className="text-[10px] font-medium">+ Ekle</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ChatGPT Pill Input Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl sm:rounded-full transition-all border flex items-center px-2 py-1.5 sm:px-3 sm:py-2 shadow-sm ${
          isDragging
            ? "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5"
            : isLight
            ? "bg-white border-zinc-200 focus-within:border-zinc-300 focus-within:ring-1 focus-within:ring-zinc-200"
            : "bg-[#2f2f2f] border-zinc-700/80 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-700"
        }`}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />

        {/* Plus Button (+) exactly like ChatGPT */}
        <button
          id="attach-file-btn"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title={t.attachImage || "Görsel Ekle (Çoklu Seçim)"}
          className={`p-2 rounded-full transition-colors shrink-0 cursor-pointer ${
            isLight
              ? "text-zinc-700 hover:text-black hover:bg-zinc-100"
              : "text-zinc-300 hover:text-white hover:bg-zinc-700/60"
          }`}
        >
          <Plus className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Textarea */}
        <textarea
          id="chat-textarea"
          ref={textareaRef}
          rows={1}
          value={input}
          onPaste={handlePaste}
          onFocus={() => {
            onFocus?.();
          }}
          onChange={(e) => {
            setInput(e.target.value);
            onFocus?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedImages.length > 0
              ? `${selectedImages.length} görsel eklendi. Mesajınızı yazın veya soru sorun...`
              : "Bir mesaj yazın veya soru sorun..."
          }
          className={`flex-1 bg-transparent resize-none outline-none text-[16px] leading-[1.4] max-h-[180px] py-1.5 px-2.5 ${
            isLight
              ? "text-zinc-900 placeholder-zinc-400"
              : "text-zinc-100 placeholder-zinc-500"
          }`}
        />

        {/* Right side buttons */}
        <div className="flex items-center gap-1 shrink-0 pl-1">
          {/* Microphone Icon Button */}
          <button
            id="voice-input-btn"
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? t.voiceStop || "Dinlemeyi Durdur" : t.voiceInput || "Sesle Yaz"}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isListening
                ? "bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400/50"
                : isLight
                ? "text-zinc-700 hover:text-black hover:bg-zinc-100"
                : "text-zinc-300 hover:text-white hover:bg-zinc-700/60"
            }`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 animate-pulse" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Send / Stop / Audio Voice Mode Button */}
          {isStreaming ? (
            <button
              id="stop-generation-btn"
              type="button"
              onClick={onStop}
              title={t.stop || "Durdur"}
              className={`w-9 h-9 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                isLight
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              <Square className={`w-3.5 h-3.5 ${isLight ? "fill-white" : "fill-black"}`} />
            </button>
          ) : hasText ? (
            <button
              id="send-message-btn"
              type="button"
              onClick={handleSubmit}
              title={t.send || "Gönder"}
              className={`w-9 h-9 rounded-full transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-xs ${
                isLight
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            /* Circular Emerald Audio Wave Button (ChatGPT Voice Mode button) */
            <button
              id="chatgpt-voice-mode-btn"
              type="button"
              onClick={onOpenVoiceMode || toggleVoiceInput}
              title={t.voiceMode || "Gelişmiş Ses Modu"}
              className="w-9 h-9 rounded-full bg-[#10a37f] hover:bg-[#0e8e6e] text-white transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
            >
              {/* ChatGPT voice waves indicator: 4 animated vertical audio lines */}
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-0.5 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="w-0.5 h-3.5 bg-white rounded-full"></span>
                <span className="w-0.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                <span className="w-0.5 h-1.5 bg-white rounded-full"></span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Minimal Footer disclaimer */}
      <p
        className={`text-[11px] text-center mt-2 ${
          isLight ? "text-zinc-400" : "text-zinc-500"
        }`}
      >
        {language === "tr"
          ? "Yapay zeka asistanı hata yapabilir. Önemli bilgileri kontrol ediniz."
          : "AI assistant can make mistakes. Verify important information."}
      </p>
    </div>
  );
}
