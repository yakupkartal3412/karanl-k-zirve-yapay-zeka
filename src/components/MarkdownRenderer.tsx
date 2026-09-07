import React, { useState, useMemo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import {
  Copy,
  Check,
  Code2,
  ListOrdered,
  ExternalLink,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ThemeMode } from "../types";

interface MarkdownRendererProps {
  content: string;
  theme?: ThemeMode;
  isStreaming?: boolean;
}

// Friendly display name for programming languages
const LANGUAGE_NAMES: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "React TSX",
  jsx: "React JSX",
  py: "Python",
  python: "Python",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  markdown: "Markdown",
  bash: "Bash / Shell",
  sh: "Shell",
  zsh: "Zsh",
  sql: "SQL",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  cs: "C#",
  java: "Java",
  rust: "Rust",
  rs: "Rust",
  go: "Go",
  golang: "Go",
  php: "PHP",
  ruby: "Ruby",
  rb: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  kt: "Kotlin",
  dart: "Dart",
  dockerfile: "Dockerfile",
  docker: "Docker",
  diff: "Diff",
  plaintext: "Text",
  text: "Text",
};

interface CodeBlockProps {
  language: string;
  code: string;
  isLight?: boolean;
}

function CodeBlock({ language, code, isLight = false }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const cleanCode = code.replace(/\n$/, "");
  const lineCount = useMemo(() => cleanCode.split("\n").length, [cleanCode]);

  const displayName =
    LANGUAGE_NAMES[language.toLowerCase()] ||
    (language ? language.toUpperCase() : "Code");

  // Perform syntax highlighting via highlight.js
  const highlightedHtml = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(cleanCode, {
          language,
          ignoreIllegals: true,
        }).value;
      }
      // Auto-detect if reasonable length
      if (cleanCode.length < 5000) {
        const auto = hljs.highlightAuto(cleanCode);
        if (auto.language && hljs.getLanguage(auto.language)) {
          return auto.value;
        }
      }
      return hljs.highlight(cleanCode, {
        language: "plaintext",
      }).value;
    } catch {
      // Fallback: simple HTML escape
      return cleanCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [cleanCode, language]);

  const handleCopy = async () => {
    let success = false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(cleanCode);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = cleanCode;
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

  return (
    <div
      className={`my-4 rounded-2xl overflow-hidden border shadow-lg transition-all ${
        isLight
          ? "border-zinc-200/90 bg-[#1e1e24] shadow-zinc-200/50"
          : "border-zinc-800 bg-[#16161a] shadow-black/40"
      }`}
    >
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#23232a] border-b border-zinc-800/80 text-zinc-300 select-none">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-zinc-200 tracking-wide truncate">
            {displayName}
          </span>
          <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline-block">
            • {lineCount} {lineCount === 1 ? "satır" : "satır"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Toggle line numbers button for multi-line code */}
          {lineCount > 3 && (
            <button
              type="button"
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              title={showLineNumbers ? "Satır numaralarını gizle" : "Satır numaralarını göster"}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                showLineNumbers
                  ? "bg-zinc-800 text-emerald-400"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Satırlar</span>
            </button>
          )}

          {/* Collapse/Expand for long code snippets */}
          {lineCount > 15 && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title={isCollapsed ? "Genişlet" : "Daralt"}
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              copied
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/50"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11.5px] font-medium text-emerald-300">Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11.5px]">Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      {!isCollapsed && (
        <div className="relative overflow-x-auto p-4 text-[13.5px] sm:text-[14px] leading-relaxed font-mono">
          <div className="flex min-w-full">
            {/* Line Numbers Gutter */}
            {showLineNumbers && lineCount > 1 && (
              <div
                className="select-none text-right pr-4 text-zinc-600 font-mono text-[13px] border-r border-zinc-800/80 mr-4 shrink-0 flex flex-col leading-relaxed"
                aria-hidden="true"
              >
                {Array.from({ length: lineCount }).map((_, i) => (
                  <span key={i} className="block leading-relaxed">
                    {i + 1}
                  </span>
                ))}
              </div>
            )}

            {/* Syntax Highlighted Code */}
            <pre className="flex-1 overflow-x-auto m-0 p-0 bg-transparent text-zinc-100 focus:outline-none">
              <code
                className={`hljs language-${language || "plaintext"} font-mono`}
                style={{ background: "transparent", padding: 0 }}
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </pre>
          </div>
        </div>
      )}

      {isCollapsed && (
        <div
          onClick={() => setIsCollapsed(false)}
          className="py-2.5 text-center text-xs text-zinc-400 hover:text-zinc-200 bg-zinc-900/50 cursor-pointer border-t border-zinc-800"
        >
          {lineCount} satır gizlendi. Genişletmek için tıklayın...
        </div>
      )}
    </div>
  );
}

export function MarkdownRenderer({
  content,
  theme = "dark",
  isStreaming = false,
}: MarkdownRendererProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`prose-container text-[16px] sm:text-[16.5px] leading-[1.75] break-words ${
        isLight ? "text-zinc-900" : "text-zinc-100"
      }`}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Professional Headings
          h1: ({ children }) => (
            <h1
              className={`text-2xl sm:text-[26px] font-bold tracking-tight mt-7 mb-3.5 pb-2 border-b ${
                isLight
                  ? "text-zinc-950 border-zinc-200"
                  : "text-white border-zinc-800"
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-xl sm:text-[22px] font-bold tracking-tight mt-6 mb-3 pb-1 border-b ${
                isLight
                  ? "text-zinc-950 border-zinc-200/70"
                  : "text-white border-zinc-800/60"
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-lg sm:text-[19px] font-semibold tracking-tight mt-5 mb-2.5 ${
                isLight ? "text-zinc-900" : "text-zinc-100"
              }`}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              className={`text-base font-semibold mt-4 mb-2 ${
                isLight ? "text-zinc-900" : "text-zinc-200"
              }`}
            >
              {children}
            </h4>
          ),

          // Paragraphs with comfortable spacing and balanced line-height
          p: ({ children }) => (
            <p className="mb-4 leading-[1.75] text-[16px] sm:text-[16.5px]">
              {children}
            </p>
          ),

          // Bold text with crisp contrast
          strong: ({ children }) => (
            <strong
              className={`font-semibold ${
                isLight ? "text-zinc-950" : "text-white"
              }`}
            >
              {children}
            </strong>
          ),

          // Emphasis / Italic
          em: ({ children }) => <em className="italic text-inherit">{children}</em>,

          // Horizontal rule
          hr: () => (
            <hr
              className={`my-6 border-t ${
                isLight ? "border-zinc-200" : "border-zinc-800"
              }`}
            />
          ),

          // Refined Lists (Unordered & Ordered)
          ul: ({ children, className }) => {
            const isTaskList = className?.includes("contains-task-list");
            return (
              <ul
                className={`my-3.5 space-y-2.5 ${
                  isTaskList
                    ? "list-none pl-0 space-y-2"
                    : "list-disc list-outside pl-6 marker:text-emerald-500 dark:marker:text-emerald-400 [&_ul]:list-[circle] [&_ul]:my-2 [&_ul]:space-y-2 [&_ul_ul]:list-[square]"
                }`}
              >
                {children}
              </ul>
            );
          },

          ol: ({ children }) => (
            <ol className="my-3.5 space-y-3 list-decimal list-outside pl-6 marker:font-semibold marker:text-emerald-600 dark:marker:text-emerald-400 [&_ol]:list-[lower-alpha] [&_ol]:my-2 [&_ol]:space-y-2">
              {children}
            </ol>
          ),

          li: ({ children, className, ...props }) => {
            const isTaskList = className?.includes("task-list-item");
            return (
              <li
                className={`leading-[1.75] pl-1 [&>p]:mb-1.5 [&>p:last-child]:mb-0 ${
                  isTaskList ? "flex items-start gap-2.5 list-none -ml-1 pl-0" : ""
                }`}
                {...props}
              >
                {children}
              </li>
            );
          },

          // Task list checkbox
          input: ({ type, checked, disabled, ...props }) => {
            if (type === "checkbox") {
              return (
                <span className="inline-flex items-center shrink-0 mt-1 select-none">
                  {checked ? (
                    <span className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isLight ? "border-zinc-400 bg-white" : "border-zinc-600 bg-zinc-800"
                      }`}
                    />
                  )}
                </span>
              );
            }
            return <input type={type} checked={checked} disabled={disabled} {...props} />;
          },

          // Quotes / Callouts
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-4 pl-4 py-2 my-4 rounded-r-xl italic ${
                isLight
                  ? "border-emerald-600/70 bg-emerald-50/60 text-zinc-800"
                  : "border-emerald-500/60 bg-emerald-950/20 text-zinc-300"
              }`}
            >
              {children}
            </blockquote>
          ),

          // Responsive Tables
          table: ({ children }) => (
            <div
              className={`overflow-x-auto my-5 rounded-2xl border shadow-xs ${
                isLight ? "border-zinc-200 bg-white" : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              <table
                className={`min-w-full divide-y text-sm ${
                  isLight ? "divide-zinc-200" : "divide-zinc-800"
                }`}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead
              className={`font-semibold text-xs uppercase tracking-wider ${
                isLight ? "bg-zinc-100/90 text-zinc-800" : "bg-zinc-900 text-zinc-200"
              }`}
            >
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td
              className={`px-4 py-3 border-t text-sm leading-relaxed ${
                isLight
                  ? "border-zinc-100 text-zinc-800"
                  : "border-zinc-800/80 text-zinc-300"
              }`}
            >
              {children}
            </td>
          ),

          // Links with external indicators
          a: ({ href, children }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 underline decoration-emerald-500/40 hover:decoration-emerald-400 font-medium transition-colors"
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="w-3 h-3 opacity-70" />}
              </a>
            );
          },

          // Inline Code and Code Blocks
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children);
            const isInline = !match && !codeString.includes("\n");

            // Inline Code Badge
            if (isInline) {
              return (
                <code
                  className={`px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[13.5px] sm:text-[14px] font-medium border ${
                    isLight
                      ? "bg-zinc-100 text-emerald-700 border-zinc-200"
                      : "bg-zinc-800/90 text-emerald-400 border-zinc-700/60"
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Multi-line syntax highlighted code block
            const language = match ? match[1] : "";
            return (
              <CodeBlock
                language={language}
                code={codeString}
                isLight={isLight}
              />
            );
          },
        }}
      >
        {content}
      </Markdown>

      {/* Streaming cursor indicator */}
      {isStreaming && (
        <span
          className={`inline-block w-2 h-4 ml-1 rounded-xs animate-pulse-slow align-middle ${
            isLight ? "bg-zinc-900" : "bg-zinc-100"
          }`}
        />
      )}
    </div>
  );
}
