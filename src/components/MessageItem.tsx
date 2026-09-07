import { useState } from "react";
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  AlertCircle,
  Pencil,
  X,
  ZoomIn,
} from "lucide-react";
import { ChatMessage, LanguageCode, ThemeMode } from "../types";
import { getTranslation } from "../i18n/translations";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isLast?: boolean;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
  onSpeak?: (text: string, id: string) => void;
  isSpeaking?: boolean;
  theme?: ThemeMode;
  language?: LanguageCode;
}

export function MessageItem({
  message,
  isStreaming = false,
  isLast = false,
  onRegenerate,
  onEdit,
  onSpeak,
  isSpeaking = false,
  theme = "dark",
  language = "tr",
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const isLight = theme === "light";
  const t = getTranslation(language);

  const handleCopy = async () => {
    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(message.content);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = message.content;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  if (isUser) {
    // Collect all images attached to this message (new multi-image or legacy single-image)
    const displayImages: Array<{ previewUrl?: string; data?: string; mimeType?: string; name?: string }> = [];
    if (Array.isArray(message.images) && message.images.length > 0) {
      displayImages.push(...message.images);
    } else if (message.image && (message.image.previewUrl || message.image.data)) {
      displayImages.push(message.image);
    }

    const getImageSrc = (img: { previewUrl?: string; data?: string; mimeType?: string }) => {
      if (img.previewUrl) return img.previewUrl;
      if (img.data) return `data:${img.mimeType || "image/jpeg"};base64,${img.data}`;
      return "";
    };

    // User message: Modern ChatGPT style pill/bubble aligned right
    return (
      <div
        id={`message-${message.id}`}
        className="w-full py-2.5 px-4 md:px-6 flex justify-end"
      >
        <div className="max-w-[90%] sm:max-w-[75%] flex flex-col items-end">
          {/* Multi-Image or Single-Image Display Gallery */}
          {displayImages.length > 0 && (
            <div
              className={`mb-2.5 ${
                displayImages.length === 1
                  ? "max-w-sm"
                  : displayImages.length === 2
                  ? "grid grid-cols-2 gap-2 max-w-md"
                  : displayImages.length <= 4
                  ? "grid grid-cols-2 gap-2 max-w-lg"
                  : "grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-xl"
              }`}
            >
              {displayImages.map((img, idx) => {
                const src = getImageSrc(img);
                if (!src) return null;
                return (
                  <div
                    key={idx}
                    onClick={() => setLightboxImage(src)}
                    className="group relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 cursor-zoom-in transition-all hover:opacity-95 shadow-xs"
                  >
                    <img
                      src={src}
                      alt={img.name || `Görsel ${idx + 1}`}
                      className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                        displayImages.length === 1
                          ? "h-auto max-h-72 object-contain"
                          : "h-36 sm:h-44"
                      }`}
                      referrerPolicy="no-referrer"
                    />
                    {/* Hover zoom overlay badge */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="p-2 rounded-full bg-black/60 text-white backdrop-blur-xs">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lightbox Modal */}
          {lightboxImage && (
            <div
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
            >
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Kapat"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={lightboxImage}
                alt="Büyütülmüş görsel"
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>
          )}

          {message.content && (
            <div
              className={`rounded-3xl px-4 py-2.5 text-[16px] sm:text-[16.5px] leading-relaxed break-words shadow-2xs group relative ${
                isLight
                  ? "bg-zinc-100 text-zinc-900"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          )}

          {/* Quick Edit button for user message */}
          {onEdit && (
            <div className="mt-1 flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                id={`edit-btn-${message.id}`}
                onClick={() => onEdit(message.content)}
                title={t.edit || "Düzenle"}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>{t.edit || "Düzenle"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant message: Clean, full-bleed ChatGPT style text layout (no avatar box, no striped container)
  return (
    <div
      id={`message-${message.id}`}
      className="w-full py-4 px-4 md:px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Error Message */}
        {message.error ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold">Bir hata meydana geldi:</p>
              <p className="text-sm opacity-90 mt-1">{message.content}</p>
              {onRegenerate && (
                <button
                  id={`retry-btn-${message.id}`}
                  onClick={onRegenerate}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Yeniden Dene
                </button>
              )}
            </div>
          </div>
        ) : (
          <MarkdownRenderer
            content={message.content}
            theme={theme}
            isStreaming={isStreaming}
          />
        )}

        {/* Minimalist ChatGPT Action Bar (under assistant message) */}
        {!isStreaming && !message.error && (
          <div className="mt-2 pt-1 flex items-center gap-1 text-zinc-400">
            {/* Copy Button */}
            <button
              id={`copy-btn-${message.id}`}
              onClick={handleCopy}
              title={copied ? t.copied || "Kopyalandı" : t.copy || "Kopyala"}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                copied
                  ? "text-emerald-500 bg-emerald-500/10"
                  : isLight
                  ? "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            {/* Text to Speech */}
            {onSpeak && (
              <button
                id={`speak-btn-${message.id}`}
                onClick={() => onSpeak(message.content, message.id)}
                title={isSpeaking ? t.stopSpeaking || "Durdur" : t.speak || "Seslendir"}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isSpeaking
                    ? "text-emerald-500 bg-emerald-500/10"
                    : isLight
                    ? "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Regenerate for last assistant message */}
            {isLast && onRegenerate && (
              <button
                id={`regenerate-btn-${message.id}`}
                onClick={onRegenerate}
                title={t.regenerate || "Yeniden Yanıtla"}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isLight
                    ? "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
