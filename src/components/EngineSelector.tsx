import { useState, useRef, useEffect } from "react";
import { Zap, Brain, Code2, Sparkles, ChevronDown, Check } from "lucide-react";
import { AIEngineId, ThemeMode } from "../types";
import { AI_ENGINES } from "../data/engines";

interface EngineSelectorProps {
  activeEngine: AIEngineId;
  onSelectEngine: (engineId: AIEngineId) => void;
  theme: ThemeMode;
}

export function EngineSelector({
  activeEngine,
  onSelectEngine,
  theme,
}: EngineSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "light";

  const selectedEngine = AI_ENGINES.find((e) => e.id === activeEngine) || AI_ENGINES[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const getEngineIcon = (iconName: string, className: string = "w-4 h-4") => {
    switch (iconName) {
      case "Zap":
        return <Zap className={className} />;
      case "Brain":
        return <Brain className={className} />;
      case "Code2":
        return <Code2 className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      default:
        return <Zap className={className} />;
    }
  };

  const getBadgeClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "purple":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "sky":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20";
      case "amber":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  const getIconContainerBg = (color: string) => {
    switch (color) {
      case "emerald":
        return "from-emerald-600 to-teal-500 text-white shadow-emerald-500/20";
      case "purple":
        return "from-purple-600 to-indigo-500 text-white shadow-purple-500/20";
      case "sky":
        return "from-sky-600 to-blue-500 text-white shadow-sky-500/20";
      case "amber":
        return "from-amber-500 to-orange-500 text-white shadow-amber-500/20";
      default:
        return "from-emerald-600 to-teal-500 text-white shadow-emerald-500/20";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        id="engine-selector-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Yapay Zeka Motorunu Değiştir"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none shadow-2xs ${
          isLight
            ? "bg-white border-zinc-200/90 text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300"
            : "bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800/90 hover:border-zinc-700"
        }`}
      >
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-tr shadow-xs ${getIconContainerBg(
            selectedEngine.badgeColor
          )}`}
        >
          {getEngineIcon(selectedEngine.iconName, "w-3 h-3")}
        </span>

        <span className="font-medium tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
          {selectedEngine.name}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          } ${isLight ? "text-zinc-400" : "text-zinc-500"}`}
        />
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div
          id="engine-selector-dropdown"
          className={`absolute left-0 mt-2 w-[310px] sm:w-[350px] rounded-2xl shadow-2xl border p-2 z-50 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            isLight
              ? "bg-white/98 border-zinc-200/90 text-zinc-900 shadow-zinc-300/40"
              : "bg-zinc-900/98 border-zinc-800 text-zinc-100 shadow-black/60"
          }`}
        >
          {/* Header info */}
          <div className="px-3 pt-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/80 mb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
                Yapay Zeka Motorları
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                {AI_ENGINES.length} Özel Motor
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              İhtiyacınıza en uygun akıl motorunu seçin.
            </p>
          </div>

          {/* Engine List */}
          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-0.5">
            {AI_ENGINES.map((engine) => {
              const isSelected = engine.id === activeEngine;
              return (
                <button
                  key={engine.id}
                  id={`engine-option-${engine.id}`}
                  type="button"
                  onClick={() => {
                    onSelectEngine(engine.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? isLight
                        ? "bg-emerald-50/70 border-emerald-300/80 text-zinc-900 shadow-2xs"
                        : "bg-emerald-950/25 border-emerald-500/40 text-white shadow-2xs"
                      : isLight
                      ? "bg-transparent border-transparent hover:bg-zinc-100/70 text-zinc-800"
                      : "bg-transparent border-transparent hover:bg-zinc-800/60 text-zinc-200"
                  }`}
                >
                  {/* Icon Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-tr shadow-md ${getIconContainerBg(
                      engine.badgeColor
                    )}`}
                  >
                    {getEngineIcon(engine.iconName, "w-4.5 h-4.5")}
                  </div>

                  {/* Engine Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold tracking-tight truncate">
                          {engine.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider ${getBadgeClasses(
                            engine.badgeColor
                          )}`}
                        >
                          {engine.badge}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                      )}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {engine.description}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-400">
                      <span>{engine.speed}</span>
                      <span>•</span>
                      <span>{engine.capability}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
