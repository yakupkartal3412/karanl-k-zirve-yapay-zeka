/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import {
  Download,
  X,
  FileText,
  FileCode,
  AlignLeft,
  Database,
  Check,
  Printer,
  ExternalLink,
} from "lucide-react";
import { ChatSession, LanguageCode, ThemeMode } from "../types";
import { getTranslation } from "../i18n/translations";
import { exportChatSession, generateHtmlExport } from "../utils/exportChat";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: ChatSession | null;
  theme: ThemeMode;
  language: LanguageCode;
}

type ExportFormat = "html" | "markdown" | "text" | "json";

export function ExportModal({
  isOpen,
  onClose,
  session,
  theme,
  language,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("html");
  const [isDownloaded, setIsDownloaded] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === "light";
  const t = getTranslation(language);

  const hasMessages = session && session.messages && session.messages.length > 0;

  const handleDownload = () => {
    if (!session || !hasMessages) return;

    exportChatSession(session, selectedFormat, language);
    setIsDownloaded(true);
    setTimeout(() => {
      setIsDownloaded(false);
    }, 2500);
  };

  const handleOpenPrintPreview = () => {
    if (!session || !hasMessages) return;
    const html = generateHtmlExport(session, language);
    const newWindow = window.open("", "_blank");
    if (newWindow) {
      newWindow.document.write(html);
      newWindow.document.close();
    }
  };

  const formats: {
    id: ExportFormat;
    name: string;
    ext: string;
    description: string;
    icon: any;
    recommended?: boolean;
    badgeColor?: string;
  }[] = [
    {
      id: "html",
      name: t.exportFormatHtml || "HTML / PDF Raporu",
      ext: ".html",
      description:
        t.exportFormatHtmlDesc ||
        "Yazdırmaya ve PDF olarak kaydetmeye hazır renkli, şık doküman",
      icon: FileText,
      recommended: true,
      badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
    {
      id: "markdown",
      name: t.exportFormatMd || "Zengin Markdown",
      ext: ".md",
      description:
        t.exportFormatMdDesc ||
        "Notion, Obsidian ve not defteri uygulamaları için yapılandırılmış metin",
      icon: FileCode,
    },
    {
      id: "text",
      name: t.exportFormatTxt || "Düz Metin Belgesi",
      ext: ".txt",
      description:
        t.exportFormatTxtDesc ||
        "Her cihazda ve metin düzenleyicide açılabilen temiz döküm",
      icon: AlignLeft,
    },
    {
      id: "json",
      name: t.exportFormatJson || "JSON Veri Yedeklemesi",
      ext: ".json",
      description:
        t.exportFormatJsonDesc ||
        "Tüm mesaj geçmişini ve zaman damgalarını içeren tam yedek",
      icon: Database,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="export-modal-card"
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors border animate-in fade-in zoom-in-95 duration-150 ${
          isLight
            ? "bg-white border-slate-200 text-slate-800"
            : "bg-zinc-900 border-zinc-800 text-zinc-100"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isLight ? "border-slate-200 bg-slate-50/70" : "border-zinc-800 bg-zinc-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2
                className={`text-base font-bold leading-tight ${
                  isLight ? "text-slate-900" : "text-zinc-100"
                }`}
              >
                {t.exportChat || "Sohbeti İndir"}
              </h2>
              <p className={`text-[11px] ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                {t.exportSubtitle || "Sohbet dökümünü istediğiniz formatta yüksek kalitede kaydedin."}
              </p>
            </div>
          </div>
          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Target session info banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isLight
                ? "bg-slate-50 border-slate-200 text-slate-700"
                : "bg-zinc-950/60 border-zinc-800 text-zinc-300"
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className={`text-[11px] uppercase tracking-wider block font-semibold ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                {t.chatHistory}
              </span>
              <p className="font-semibold text-xs truncate mt-0.5">
                {session?.title || t.newChat}
              </p>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-md shrink-0 font-medium ${
                isLight ? "bg-slate-200/80 text-slate-700" : "bg-zinc-800 text-zinc-300"
              }`}
            >
              {session?.messages?.length || 0} {language === "tr" ? "mesaj" : "messages"}
            </span>
          </div>

          {/* Format selection */}
          <div className="space-y-2">
            <label
              className={`block text-xs font-semibold uppercase tracking-wider ${
                isLight ? "text-slate-500" : "text-zinc-400"
              }`}
            >
              {t.dataExportSection || "Dışa Aktarma Formatı"}
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {formats.map((fmt) => {
                const isSelected = selectedFormat === fmt.id;
                const Icon = fmt.icon;
                return (
                  <button
                    key={fmt.id}
                    id={`export-format-${fmt.id}`}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? "bg-emerald-50/80 border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-500/50"
                          : "bg-zinc-800 border-emerald-500/80 text-zinc-100 shadow-sm ring-1 ring-emerald-500/50"
                        : isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? isLight
                            ? "bg-emerald-600 text-white"
                            : "bg-emerald-500 text-zinc-950"
                          : isLight
                          ? "bg-slate-100 text-slate-600"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs">{fmt.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded ${
                              isLight ? "bg-slate-100 text-slate-600" : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {fmt.ext}
                          </span>
                        </div>
                        {fmt.recommended && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold border ${fmt.badgeColor}`}
                          >
                            Önerilen
                          </span>
                        )}
                        {isSelected && !fmt.recommended && (
                          <Check className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-relaxed ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                        {fmt.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {!hasMessages && (
            <p className="text-xs text-amber-500 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              {t.noMessagesToExport || "Dışa aktarmak için sohbette en az bir mesaj bulunmalıdır."}
            </p>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            {selectedFormat === "html" && hasMessages && (
              <button
                id="preview-print-html-btn"
                type="button"
                onClick={handleOpenPrintPreview}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700"
                    : "bg-zinc-800 hover:bg-zinc-700 border-zinc-750 text-zinc-200"
                }`}
                title="Yeni sekmede aç ve yazdır"
              >
                <Printer className="w-4 h-4" />
                <span>{t.printOrSavePdf || "Yazdır / PDF Olarak Kaydet"}</span>
                <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            )}

            <button
              id="confirm-download-file-btn"
              type="button"
              disabled={!hasMessages}
              onClick={handleDownload}
              className={`flex-1 w-full inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm ${
                !hasMessages
                  ? "opacity-50 cursor-not-allowed bg-zinc-600"
                  : isDownloaded
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-emerald-600 hover:bg-emerald-500 hover:shadow-md active:scale-98"
              }`}
            >
              {isDownloaded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t.downloadSuccess || "Dosya İndirildi!"}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    {t.downloadFile || "Dosyayı İndir"} ({selectedFormat.toUpperCase()})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
