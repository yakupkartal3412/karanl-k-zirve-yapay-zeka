import { useState } from "react";
import {
  X,
  Sparkles,
  Trash2,
  Download,
  Check,
  Moon,
  Sun,
  Palette,
  Globe,
  FileText,
  FileCode,
  AlignLeft,
  Zap,
  Brain,
  Code2,
  Cpu,
} from "lucide-react";
import { AIEngineId, AssistantPersona, ChatSession, LanguageCode, ThemeMode } from "../types";
import { PERSONAS } from "../data/personas";
import { AI_ENGINES } from "../data/engines";
import { SUPPORTED_LANGUAGES } from "../data/languages";
import { getTranslation } from "../i18n/translations";
import { exportChatSession } from "../utils/exportChat";
import { DarkPeakLogo } from "./DarkPeakLogo";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  activePersona: AssistantPersona;
  onChangePersona: (persona: AssistantPersona) => void;
  activeEngine?: AIEngineId;
  onChangeEngine?: (engine: AIEngineId) => void;
  customPrompt: string;
  onSaveCustomPrompt: (prompt: string) => void;
  onClearAllHistory: () => void;
  currentSession: ChatSession | null;
  onOpenExport?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  onChangeTheme,
  language,
  onChangeLanguage,
  activePersona,
  onChangePersona,
  activeEngine = "prime-core-fast",
  onChangeEngine,
  customPrompt,
  onSaveCustomPrompt,
  onClearAllHistory,
  currentSession,
  onOpenExport,
}: SettingsModalProps) {
  const [promptValue, setPromptValue] = useState(customPrompt);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);

  if (!isOpen) return null;

  const isLight = theme === "light";
  const t = getTranslation(language);

  const handleSavePrompt = () => {
    onSaveCustomPrompt(promptValue);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleQuickExport = (format: "html" | "markdown" | "text") => {
    if (!currentSession || currentSession.messages.length === 0) return;
    exportChatSession(currentSession, format, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="settings-modal-card"
        className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors border ${
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
            <DarkPeakLogo size={20} />
            <h2
              className={`text-base font-bold ${
                isLight ? "text-slate-900" : "text-zinc-100"
              }`}
            >
              {t.settingsTitle}
            </h2>
          </div>
          <button
            id="close-settings-modal-btn"
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Multi-Language Selection Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Globe className="w-4 h-4 text-emerald-500" />
              <label
                className={`font-semibold ${
                  isLight ? "text-slate-800" : "text-zinc-200"
                }`}
              >
                {t.languageSection}
              </label>
            </div>
            <p
              className={`text-xs mb-3 ${
                isLight ? "text-slate-500" : "text-zinc-400"
              }`}
            >
              {t.languageDesc}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = lang.code === language;
                return (
                  <button
                    id={`language-select-${lang.code}`}
                    key={lang.code}
                    type="button"
                    onClick={() => onChangeLanguage(lang.code)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? "bg-emerald-50/80 border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-500/40"
                          : "bg-zinc-800 border-emerald-500 text-zinc-100 shadow-sm ring-1 ring-emerald-500/40"
                        : isLight
                        ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-semibold truncate ${
                            isSelected
                              ? isLight
                                ? "text-emerald-800"
                                : "text-emerald-400"
                              : ""
                          }`}
                        >
                          {lang.nativeName}
                        </div>
                        <div className="text-[10px] opacity-70 truncate">
                          {lang.name}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Theme Selector Section */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Palette className="w-4 h-4 text-emerald-500" />
              <label
                className={`font-semibold ${
                  isLight ? "text-slate-800" : "text-zinc-200"
                }`}
              >
                {t.themeSection}
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Dark Mode Button */}
              <button
                id="theme-option-dark"
                type="button"
                onClick={() => onChangeTheme("dark")}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  !isLight
                    ? "bg-zinc-800 border-emerald-500/80 text-zinc-100 shadow-sm ring-1 ring-emerald-500/50"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    !isLight
                      ? "bg-zinc-900 text-emerald-400 border border-zinc-700"
                      : "bg-white text-slate-700 border border-slate-200 shadow-xs"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{t.darkMode}</span>
                    {!isLight && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-75 truncate mt-0.5">
                    {t.darkModeDesc}
                  </p>
                </div>
              </button>

              {/* Light Mode Button */}
              <button
                id="theme-option-light"
                type="button"
                onClick={() => onChangeTheme("light")}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                  isLight
                    ? "bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-sm ring-1 ring-emerald-500/50"
                    : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-850 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isLight
                      ? "bg-white text-emerald-600 border border-emerald-200 shadow-xs"
                      : "bg-zinc-900 text-amber-400 border border-zinc-800"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{t.lightMode}</span>
                    {isLight && (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-[11px] opacity-75 truncate mt-0.5">
                    {t.lightModeDesc}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* AI Engine Selection */}
          {onChangeEngine && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`font-semibold text-sm ${
                    isLight ? "text-slate-800" : "text-zinc-200"
                  }`}
                >
                  Yapay Zeka Motoru (Model)
                </label>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {AI_ENGINES.length} Özel Motor
                </span>
              </div>
              <p
                className={`text-xs mb-3 ${
                  isLight ? "text-slate-500" : "text-zinc-400"
                }`}
              >
                Uygulamanın düşünce biçimini ve hızını belirleyen akıl motorunu seçin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AI_ENGINES.map((eng) => {
                  const isSelected = eng.id === activeEngine;
                  return (
                    <button
                      id={`settings-engine-${eng.id}`}
                      key={eng.id}
                      type="button"
                      onClick={() => onChangeEngine(eng.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? isLight
                            ? "bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-xs ring-1 ring-emerald-500/30"
                            : "bg-emerald-950/25 border-emerald-500/80 text-zinc-100 shadow-sm ring-1 ring-emerald-500/30"
                          : isLight
                          ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                            {eng.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded border uppercase font-medium bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            {eng.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-1.5">
                        {eng.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-400">
                        <span>{eng.speed}</span>
                        <span>•</span>
                        <span>{eng.capability}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Persona Selection */}
          <div>
            <label
              className={`block font-semibold mb-2 ${
                isLight ? "text-slate-800" : "text-zinc-200"
              }`}
            >
              {t.personaSection}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PERSONAS.map((p) => {
                const isSelected = p.id === activePersona;
                const personaTrans = t.personas[p.id] || {
                  name: p.name,
                  description: p.description,
                  badge: p.badge,
                };
                return (
                  <button
                    id={`persona-option-${p.id}`}
                    key={p.id}
                    type="button"
                    onClick={() => onChangePersona(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? isLight
                          ? "bg-emerald-50/70 border-emerald-500 text-slate-900 shadow-xs"
                          : "bg-zinc-800 border-emerald-500/80 text-zinc-100 shadow-sm"
                        : isLight
                        ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                        : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-semibold text-xs ${
                          isSelected
                            ? isLight
                              ? "text-emerald-800"
                              : "text-zinc-100"
                            : isLight
                            ? "text-slate-800"
                            : "text-zinc-300"
                        }`}
                      >
                        {personaTrans.name}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isLight
                            ? "bg-slate-200 text-slate-700"
                            : "bg-zinc-700 text-zinc-300"
                        }`}
                      >
                        {personaTrans.badge}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] line-clamp-2 leading-relaxed ${
                        isLight ? "text-slate-500" : "text-zinc-400"
                      }`}
                    >
                      {personaTrans.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom System Instruction */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className={`font-semibold ${
                  isLight ? "text-slate-800" : "text-zinc-200"
                }`}
              >
                {t.customInstruction}
              </label>
              <span className={`text-[11px] ${isLight ? "text-slate-400" : "text-zinc-500"}`}>
                {t.optional}
              </span>
            </div>
            <textarea
              id="custom-prompt-textarea"
              rows={3}
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder={t.customInstructionPlaceholder}
              className={`w-full p-3 rounded-xl border text-xs focus:outline-none resize-none transition-colors ${
                isLight
                  ? "bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:bg-white"
                  : "bg-zinc-950 border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-zinc-700"
              }`}
            />
            <div className="flex justify-end mt-2">
              <button
                id="save-custom-prompt-btn"
                type="button"
                onClick={handleSavePrompt}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600 font-semibold">{t.instructionSaved}</span>
                  </>
                ) : (
                  <span>{t.saveInstruction}</span>
                )}
              </button>
            </div>
          </div>

          {/* Export & Data Management */}
          <div
            className={`pt-4 border-t space-y-3 ${
              isLight ? "border-slate-200" : "border-zinc-800/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-semibold text-xs uppercase tracking-wider ${
                  isLight ? "text-slate-500" : "text-zinc-400"
                }`}
              >
                {t.dataExportSection}
              </h3>
              {currentSession && onOpenExport && (
                <button
                  id="open-full-export-modal-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenExport();
                  }}
                  className={`text-xs font-semibold hover:underline cursor-pointer ${
                    isLight ? "text-emerald-700" : "text-emerald-400"
                  }`}
                >
                  {t.exportChat || "Detaylı İndir"}
                </button>
              )}
            </div>

            {currentSession && currentSession.messages.length > 0 && (
              <div className="space-y-1.5">
                <span className={`text-[11px] block ${isLight ? "text-slate-500" : "text-zinc-400"}`}>
                  {t.exportChat} ({currentSession.title})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    id="export-format-html-btn"
                    type="button"
                    onClick={() => handleQuickExport("html")}
                    className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isLight
                        ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/40"
                    }`}
                    title="Yazdırmaya ve PDF olarak kaydetmeye hazır renkli HTML raporu"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>HTML / PDF</span>
                  </button>

                  <button
                    id="export-format-md-btn"
                    type="button"
                    onClick={() => handleQuickExport("markdown")}
                    className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    }`}
                    title="Not uygulamaları için zengin Markdown belgesi"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Markdown</span>
                  </button>

                  <button
                    id="export-format-txt-btn"
                    type="button"
                    onClick={() => handleQuickExport("text")}
                    className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isLight
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
                    }`}
                    title="Her cihazda açılan düz metin belgesi"
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Düz Metin</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <button
                id="clear-all-history-btn"
                type="button"
                onClick={() => setConfirmClearHistory(true)}
                className={`w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isLight
                    ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                    : "bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-900/50"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.clearHistory}</span>
              </button>
            </div>

            {/* Inline Confirm Dialog for clearing history */}
            {confirmClearHistory && (
              <div
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-150 ${
                  isLight
                    ? "bg-red-50/80 border-red-200"
                    : "bg-red-950/30 border-red-900/60"
                }`}
              >
                <span
                  className={`text-xs ${
                    isLight ? "text-red-800 font-medium" : "text-red-200 font-medium"
                  }`}
                >
                  {t.clearConfirmDesc}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmClearHistory(false)}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
                      isLight
                        ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    {t.clearConfirmCancel}
                  </button>
                  <button
                    id="confirm-delete-all-btn"
                    type="button"
                    onClick={() => {
                      onClearAllHistory();
                      setConfirmClearHistory(false);
                      onClose();
                    }}
                    className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    {t.clearConfirmYes}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
