import { Sparkles, Code2, Mail, Lightbulb, Compass, Zap, Brain } from "lucide-react";
import { AIEngineId, AssistantPersona, LanguageCode, ThemeMode } from "../types";
import { PERSONAS } from "../data/personas";
import { AI_ENGINES } from "../data/engines";
import { getTranslation } from "../i18n/translations";
import { DarkPeakAppIcon } from "./DarkPeakLogo";

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  activePersona: AssistantPersona;
  onChangePersona: (persona: AssistantPersona) => void;
  activeEngine?: AIEngineId;
  onChangeEngine?: (engine: AIEngineId) => void;
  theme?: ThemeMode;
  language?: LanguageCode;
}

export function WelcomeScreen({
  onSelectPrompt,
  activePersona,
  onChangePersona,
  activeEngine = "prime-core-fast",
  onChangeEngine,
  theme = "dark",
  language = "tr",
}: WelcomeScreenProps) {
  const isLight = theme === "light";
  const t = getTranslation(language);

  const selectedEngine = AI_ENGINES.find((e) => e.id === activeEngine) || AI_ENGINES[0];
  const suggestionIcons = [Code2, Mail, Lightbulb, Compass];

  const getEngineIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap":
        return <Zap className="w-3.5 h-3.5" />;
      case "Brain":
        return <Brain className="w-3.5 h-3.5" />;
      case "Code2":
        return <Code2 className="w-3.5 h-3.5" />;
      case "Sparkles":
        return <Sparkles className="w-3.5 h-3.5" />;
      default:
        return <Zap className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-3xl mx-auto text-center">
      {/* Dark Peak App Icon / Logo Showcase */}
      <div className="mb-4">
        <DarkPeakAppIcon size={56} className="shadow-lg hover:scale-105 transition-transform" />
      </div>

      {/* AI Engine Status Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 mb-4 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold">{selectedEngine.name}</span>
        <span className="text-zinc-400 dark:text-zinc-400">•</span>
        <span className="font-normal text-zinc-600 dark:text-zinc-300">{selectedEngine.tagline}</span>
      </div>

      <h1
        className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
          isLight ? "text-slate-900" : "text-zinc-100"
        }`}
      >
        {t.welcomeTitle}
      </h1>
      <p
        className={`text-sm sm:text-base max-w-lg mb-6 leading-relaxed ${
          isLight ? "text-slate-600" : "text-zinc-400"
        }`}
      >
        {t.welcomeSubtitle}
      </p>

      {/* Engine Switcher Bar in Welcome Screen */}
      {onChangeEngine && (
        <div className="flex flex-col items-center mb-6">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Aktif Motoru Seçin
          </span>
          <div
            className={`flex flex-wrap items-center justify-center gap-1.5 p-1 rounded-2xl border ${
              isLight
                ? "bg-slate-100 border-slate-200/90 shadow-2xs"
                : "bg-zinc-900/90 border-zinc-800 shadow-2xs"
            }`}
          >
            {AI_ENGINES.map((eng) => {
              const isSelected = eng.id === activeEngine;
              return (
                <button
                  key={eng.id}
                  id={`welcome-engine-${eng.id}`}
                  type="button"
                  onClick={() => onChangeEngine(eng.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? isLight
                        ? "bg-white text-emerald-700 shadow-xs border border-zinc-200"
                        : "bg-zinc-800 text-emerald-400 shadow-xs border border-zinc-700/80"
                      : isLight
                      ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  {getEngineIcon(eng.iconName)}
                  <span>{eng.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Persona Pill selector */}
      <div
        className={`flex flex-wrap items-center justify-center gap-1.5 mb-8 p-1 rounded-xl border ${
          isLight
            ? "bg-slate-200/70 border-slate-300/80"
            : "bg-zinc-900 border-zinc-800"
        }`}
      >
        {PERSONAS.map((p) => {
          const isActive = p.id === activePersona;
          const personaTrans = t.personas[p.id] || { name: p.name };
          return (
            <button
              id={`persona-select-${p.id}`}
              key={p.id}
              onClick={() => onChangePersona(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? isLight
                    ? "bg-white text-emerald-700 shadow-xs border border-slate-300 font-semibold"
                    : "bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60"
                  : isLight
                  ? "text-slate-600 hover:text-slate-900 hover:bg-slate-300/50"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
              }`}
            >
              {personaTrans.name}
            </button>
          );
        })}
      </div>

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
        {t.suggestions.map((item, idx) => {
          const Icon = suggestionIcons[idx % suggestionIcons.length];
          return (
            <button
              id={`suggestion-card-${idx}`}
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`group p-3.5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                isLight
                  ? "bg-white hover:bg-zinc-50 border-zinc-200/90 shadow-2xs hover:border-zinc-300"
                  : "bg-zinc-900/60 hover:bg-zinc-850 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    isLight
                      ? "bg-zinc-100 text-zinc-700 group-hover:text-black"
                      : "bg-zinc-800 text-zinc-300 group-hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-xs font-semibold ${
                    isLight ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  {item.category}
                </span>
              </div>
              <p
                className={`text-[13.5px] leading-relaxed transition-colors line-clamp-2 ${
                  isLight
                    ? "text-zinc-700 group-hover:text-zinc-900"
                    : "text-zinc-300 group-hover:text-zinc-100"
                }`}
              >
                {item.prompt}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
