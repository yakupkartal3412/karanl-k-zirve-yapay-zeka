/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  PanelLeft,
  MessageSquarePlus,
  Settings,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  Download,
  Menu,
  ArrowDown,
  SquarePen,
  MoreVertical,
  Radio,
} from "lucide-react";
import { ChatMessage, ChatSession, AssistantPersona, ThemeMode, LanguageCode, ChatImage, AIEngineId } from "./types";
import { PERSONAS } from "./data/personas";
import { AI_ENGINES } from "./data/engines";
import { SUPPORTED_LANGUAGES } from "./data/languages";
import { getTranslation } from "./i18n/translations";
import { Sidebar } from "./components/Sidebar";
import { MessageItem } from "./components/MessageItem";
import { ChatInput } from "./components/ChatInput";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { EngineSelector } from "./components/EngineSelector";
import { SettingsModal } from "./components/SettingsModal";
import { ExportModal } from "./components/ExportModal";
import { VoiceModeModal } from "./components/VoiceModeModal";
import { speakText, stopSpeaking } from "./utils/speech";
import {
  STORAGE_KEY,
  loadInitialSessions,
  saveSessionsToIndexedDB,
  safeSaveToLocalStorage,
  clearAllSessions,
} from "./utils/storage";

const SETTINGS_KEY = "turkish_ai_settings_v1";
const THEME_KEY = "turkish_ai_theme_v1";
const LANG_KEY = "turkish_ai_lang_v1";
const ENGINE_KEY = "dark_peak_engine_v1";

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out leftover empty sessions from previous runs so they never pile up
          return parsed.filter((s) => s && s.messages && s.messages.length > 0);
        }
      }
    } catch {
      // fallback
    }
    return [];
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch {
      // fallback
    }
    return "dark";
  });

  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (
        saved &&
        SUPPORTED_LANGUAGES.some((l) => l.code === saved)
      ) {
        return saved as LanguageCode;
      }
    } catch {
      // fallback
    }
    return "tr";
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    return sessions.length > 0 ? sessions[0].id : null;
  });

  const [activePersona, setActivePersona] = useState<AssistantPersona>("general");
  const [activeEngine, setActiveEngine] = useState<AIEngineId>(() => {
    try {
      const saved = localStorage.getItem(ENGINE_KEY);
      if (
        saved === "prime-core-fast" ||
        saved === "prime-core-think" ||
        saved === "prime-core-expert"
      ) {
        return saved as AIEngineId;
      }
      // Migrate old keys if any
      if (saved === "prime-cortex") return "prime-core-think";
      if (saved === "prime-codex" || saved === "prime-creative") return "prime-core-expert";
    } catch {
      // fallback
    }
    return "prime-core-fast";
  });
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVoiceModeOpen, setIsVoiceModeOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = getTranslation(language);
  const activePersonaObj = PERSONAS.find((p) => p.id === activePersona) || PERSONAS[0];
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  const isLight = theme === "light";

  // Sync theme class to document
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    try {
      localStorage.setItem(LANG_KEY, newLang);
    } catch {
      // ignore
    }
  };

  // Load saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.persona) setActivePersona(parsed.persona);
        if (parsed.customPrompt) setCustomPrompt(parsed.customPrompt);
        if (parsed.language && SUPPORTED_LANGUAGES.some((l) => l.code === parsed.language)) {
          setLanguage(parsed.language);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save settings on update
  const saveSettings = (newPersona: AssistantPersona, newPrompt: string) => {
    setActivePersona(newPersona);
    setCustomPrompt(newPrompt);
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ persona: newPersona, customPrompt: newPrompt, language })
      );
    } catch {
      // ignore
    }
  };

  // Asynchronously hydrate from IndexedDB on initial load
  useEffect(() => {
    let isMounted = true;
    loadInitialSessions().then((loadedSessions) => {
      if (isMounted && loadedSessions.length > 0) {
        setSessions(loadedSessions);
        setActiveSessionId((prev) => prev || loadedSessions[0].id);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync sessions to IndexedDB and safe localStorage backup
  useEffect(() => {
    saveSessionsToIndexedDB(sessions);
    safeSaveToLocalStorage(sessions);
  }, [sessions]);

  // Current active session
  const currentSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = currentSession?.messages || [];

  // Scroll to bottom & tracking
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const handleChatScroll = () => {
    const el = chatScrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollToBottom(!isNearBottom);
  };

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
    setShowScrollToBottom(false);
  };

  // Scroll to bottom ONLY when switching chat sessions, not during streaming/message responses
  const prevSessionIdRef = useRef<string | null>(activeSessionId);
  useEffect(() => {
    if (activeSessionId && activeSessionId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = activeSessionId;
      setTimeout(() => {
        scrollToBottom(false);
      }, 50);
    }
  }, [activeSessionId]);

  // Focus chat textarea and scroll into chat area
  const navigateToChat = () => {
    // If mobile or smaller screen, automatically close sidebar to display chat area
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    // Automatically focus the chat input textarea
    setTimeout(() => {
      const textarea = document.getElementById("chat-textarea") as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.focus();
        textarea.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        scrollToBottom(true);
      }
    }, 60);
  };

  // Change active AI engine
  const handleSelectEngine = (engineId: AIEngineId) => {
    setActiveEngine(engineId);
    try {
      localStorage.setItem(ENGINE_KEY, engineId);
    } catch {
      // fallback
    }
    if (activeSessionId) {
      setSessions((prev) =>
        prev.map((s) => (s.id === activeSessionId ? { ...s, engine: engineId } : s))
      );
    }
  };

  // Create a new session or reuse existing empty session
  const handleNewChat = () => {
    stopSpeaking();
    setSpeakingMessageId(null);

    // Automatically navigate and focus the chat area
    navigateToChat();

    // If the currently active session is already empty (0 messages), stay on it and focus chat
    if (currentSession && currentSession.messages && currentSession.messages.length === 0) {
      return;
    }

    setSessions((prev) => {
      // Clean up any other empty sessions that have 0 messages
      const nonEmptySessions = prev.filter((s) => s && s.messages && s.messages.length > 0);
      const newSession: ChatSession = {
        id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        title: t.newChat,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        persona: activePersona,
        engine: activeEngine,
        customSystemPrompt: customPrompt,
      };
      setActiveSessionId(newSession.id);
      return [newSession, ...nonEmptySessions];
    });
  };

  // Switch session
  const handleSelectSession = (id: string) => {
    stopSpeaking();
    setSpeakingMessageId(null);
    navigateToChat();
    const target = sessions.find((s) => s.id === id);
    if (target?.engine) {
      setActiveEngine(target.engine);
    }
    setSessions((prev) => {
      // If user switches away from an unused empty session (0 messages), remove it so it doesn't linger
      return prev.filter((s) => s && (s.id === id || (s.messages && s.messages.length > 0)));
    });
    setActiveSessionId(id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      if (activeSessionId === id) {
        setActiveSessionId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Clear all history
  const handleClearAllHistory = () => {
    stopSpeaking();
    setSpeakingMessageId(null);
    setSessions([]);
    setActiveSessionId(null);
    navigateToChat();
    clearAllSessions();
  };

  // Send message handler
  const handleSend = async (
    text: string,
    imagesOrImage?: ChatImage[] | ChatImage
  ) => {
    let images: ChatImage[] | undefined = undefined;
    if (Array.isArray(imagesOrImage)) {
      images = imagesOrImage.length > 0 ? imagesOrImage : undefined;
    } else if (imagesOrImage) {
      images = [imagesOrImage];
    }

    const trimmedText = text.trim();
    if (!trimmedText && (!images || images.length === 0)) return;

    let targetSessionId = activeSessionId;

    // Derived immediate title from the prompt so "Yeni Sohbet" never lingers
    const imageCount = images?.length || 0;
    const immediateTitle =
      trimmedText.length > 0
        ? trimmedText.slice(0, 36) + (trimmedText.length > 36 ? "..." : "")
        : imageCount > 1
        ? `${imageCount} Görsel Analizi`
        : language === "tr"
        ? "Görsel Analizi"
        : "Image Analysis";

    // Create session if none active or current target session doesn't exist
    if (!targetSessionId || !sessions.some((s) => s.id === targetSessionId)) {
      const newSession: ChatSession = {
        id: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
        title: immediateTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        persona: activePersona,
        customSystemPrompt: customPrompt,
      };
      targetSessionId = newSession.id;
      setActiveSessionId(targetSessionId);
      setSessions((prev) => [newSession, ...prev.filter((s) => s && s.messages && s.messages.length > 0)]);
    }

    const currentSessionMessages =
      sessions.find((s) => s && s.id === targetSessionId)?.messages || [];
    const isFirstMessage = currentSessionMessages.length === 0;

    const userMessage: ChatMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      role: "user",
      content: text,
      timestamp: Date.now(),
      image: images && images.length > 0 ? images[0] : undefined,
      images: images,
    };

    const assistantMessageId =
      "msg_" + (Date.now() + 1) + "_" + Math.random().toString(36).substring(2, 7);
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    // Append user message and placeholder, and immediately set title if it was default new chat title
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          const isDefaultTitle =
            isFirstMessage ||
            s.title === "Yeni Sohbet" ||
            s.title === "New Chat" ||
            s.title === t.newChat;
          return {
            ...s,
            title: isDefaultTitle ? immediateTitle : s.title,
            updatedAt: Date.now(),
            messages: [...s.messages, userMessage, assistantPlaceholder],
          };
        }
        return s;
      })
    );

    // Directly scroll into the newly written user message first
    setTimeout(() => {
      const userMsgEl = document.getElementById(`message-${userMessage.id}`);
      if (userMsgEl) {
        userMsgEl.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollToBottom(true);
      }
    }, 40);

    // If it's the first message of the session, asynchronously generate a smart title
    if (isFirstMessage && trimmedText) {
      fetch("/api/chat/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstMessage: trimmedText, language }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title && data.title !== "Yeni Sohbet" && data.title !== t.newChat) {
            handleRenameSession(targetSessionId!, data.title);
          }
        })
        .catch(() => {});
    }

    // Prepare for streaming
    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    const historyToSend = [...currentSessionMessages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
      images: m.images && m.images.length > 0
        ? m.images.map((img) => ({ data: img.data, mimeType: img.mimeType }))
        : undefined,
      image: m.image
        ? { data: m.image.data, mimeType: m.image.mimeType }
        : undefined,
    }));

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: historyToSend,
          persona: activePersona,
          engine: currentSession?.engine || activeEngine,
          customSystemPrompt: customPrompt,
          language,
          images: images && images.length > 0
            ? images.map((img) => ({ data: img.data, mimeType: img.mimeType }))
            : undefined,
          image: images && images.length > 0
            ? { data: images[0].data, mimeType: images[0].mimeType }
            : undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Sunucu yanıtı başarısız (${response.status})`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Yayın akışı başlatılamadı.");

      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const dataStr = trimmed.replace(/^data:\s*/, "");
          if (dataStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              accumulatedText = parsed.error;
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === targetSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: accumulatedText, error: true }
                          : m
                      ),
                    };
                  }
                  return s;
                })
              );
              break;
            }

            if (parsed.text) {
              accumulatedText += parsed.text;
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === targetSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId ? { ...m, content: accumulatedText } : m
                      ),
                    };
                  }
                  return s;
                })
              );
            }
          } catch {
            // ignore JSON parse error on malformed chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        // user aborted stream
      } else {
        console.warn("Stream failed, attempting fallback to non-streaming API...", err);

        // Try fallback to non-streaming endpoint
        try {
          const fallbackRes = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: historyToSend,
              persona: activePersona,
              customSystemPrompt: customPrompt,
              language,
              images: images && images.length > 0
                ? images.map((img) => ({ data: img.data, mimeType: img.mimeType }))
                : undefined,
              image: images && images.length > 0
                ? { data: images[0].data, mimeType: images[0].mimeType }
                : undefined,
            }),
          });

          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            if (fallbackData.text) {
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id === targetSessionId) {
                    return {
                      ...s,
                      messages: s.messages.map((m) =>
                        m.id === assistantMessageId ? { ...m, content: fallbackData.text, error: false } : m
                      ),
                    };
                  }
                  return s;
                })
              );
              return;
            } else if (fallbackData.error) {
              throw new Error(fallbackData.error);
            }
          }
          throw new Error(`Sunucu hatası (${fallbackRes.status})`);
        } catch (fallbackErr: any) {
          console.error("Fallback chat error:", fallbackErr);
          const displayError =
            fallbackErr?.message?.includes("Failed to fetch") || err?.message?.includes("Failed to fetch")
              ? t.serverConnectionError
              : fallbackErr?.message || err?.message || t.errorGenerating;

          setSessions((prev) =>
            prev.map((s) => {
              if (s.id === targetSessionId) {
                return {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === assistantMessageId
                      ? {
                          ...m,
                          content: displayError,
                          error: true,
                        }
                      : m
                  ),
                };
              }
              return s;
            })
          );
        }
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Stop active stream
  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    if (!currentSession || messages.length < 2 || isStreaming) return;

    const lastMsg = messages[messages.length - 1];
    const secondLastMsg = messages[messages.length - 2];

    if (lastMsg.role !== "assistant" || secondLastMsg.role !== "user") return;

    const lastUserMsg = secondLastMsg;

    // Remove the last assistant message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === currentSession.id) {
          const trimmed = s.messages.slice(0, -1);
          return { ...s, messages: trimmed };
        }
        return s;
      })
    );

    handleSend(
      lastUserMsg.content,
      lastUserMsg.images && lastUserMsg.images.length > 0
        ? lastUserMsg.images
        : lastUserMsg.image
        ? [lastUserMsg.image]
        : undefined
    );
  };

  // Edit user message
  const handleEditUserMessage = (content: string) => {
    setEditingText(content);
  };

  // Speech TTS handler
  const handleSpeak = (text: string, id: string) => {
    if (speakingMessageId === id) {
      stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(id);
      const success = speakText(
        text,
        language,
        () => setSpeakingMessageId(id),
        () => setSpeakingMessageId(null),
        () => setSpeakingMessageId(null)
      );
      if (!success) {
        setSpeakingMessageId(null);
      }
    }
  };

  // Commit voice messages to the active chat session
  const handleCommitVoiceMessage = (userText: string, assistantText: string) => {
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      const newSessionId = "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const immediateTitle = userText.slice(0, 36) + (userText.length > 36 ? "..." : "");
      const newSession: ChatSession = {
        id: newSessionId,
        title: immediateTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          { id: "msg_" + Date.now() + "_u", role: "user", content: userText, timestamp: Date.now() },
          { id: "msg_" + Date.now() + "_a", role: "assistant", content: assistantText, timestamp: Date.now() },
        ],
        persona: activePersona,
        engine: activeEngine,
        customSystemPrompt: customPrompt,
      };
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSessionId);
      return;
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === targetSessionId) {
          const updatedMessages: ChatMessage[] = [
            ...s.messages,
            { id: "msg_" + Date.now() + "_u", role: "user", content: userText, timestamp: Date.now() },
            { id: "msg_" + Date.now() + "_a", role: "assistant", content: assistantText, timestamp: Date.now() },
          ];
          const newTitle =
            s.title === t.newChat && userText.length > 0
              ? userText.slice(0, 36) + (userText.length > 36 ? "..." : "")
              : s.title;

          return {
            ...s,
            title: newTitle,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        }
        return s;
      })
    );
  };

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden transition-colors duration-150 ${
        isLight ? "bg-white text-zinc-900" : "bg-[#212121] text-zinc-100"
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        theme={theme}
        language={language}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col h-full min-w-0 relative transition-colors ${
          isLight ? "bg-white" : "bg-[#212121]"
        }`}
      >
        {/* Top Navbar */}
        <header
          className={`h-14 shrink-0 border-b px-3 sm:px-4 flex items-center justify-between backdrop-blur-md z-10 transition-colors ${
            isLight
              ? "bg-white/95 border-zinc-200/70 text-zinc-800"
              : "bg-[#212121]/95 border-zinc-800/80 text-zinc-100"
          }`}
        >
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                id="open-sidebar-btn"
                onClick={() => setIsSidebarOpen(true)}
                title={t.openSidebar}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer border ${
                  isLight
                    ? "border-zinc-200/80 bg-white text-zinc-800 hover:bg-zinc-100 shadow-2xs"
                    : "border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                <Menu className="w-5 h-5 stroke-[2]" />
              </button>
            )}

            {/* AI Engine Selector */}
            <div className="flex items-center gap-2 min-w-0">
              <EngineSelector
                activeEngine={activeEngine}
                onSelectEngine={handleSelectEngine}
                theme={theme}
              />
            </div>
          </div>

          {/* Right Header Pill (like official ChatGPT mobile app) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Advanced Voice Mode Header Trigger */}
            <button
              id="top-voice-mode-btn"
              onClick={() => setIsVoiceModeOpen(true)}
              title={t.voiceMode || "Gelişmiş Ses Modu"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs border ${
                isLight
                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border-emerald-700/60"
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden sm:inline font-medium">{t.voiceMode || "Ses Modu"}</span>
            </button>

            {/* Quick Theme Switcher */}
            <button
              id="quick-theme-toggle-btn"
              onClick={() => handleThemeChange(isLight ? "dark" : "light")}
              title={isLight ? t.switchToDark : t.switchToLight}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isLight
                  ? "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* ChatGPT Action Pill with New Chat & Settings */}
            <div
              className={`flex items-center gap-0.5 rounded-full p-0.5 border ${
                isLight
                  ? "bg-zinc-50 border-zinc-200 text-zinc-700"
                  : "bg-zinc-900 border-zinc-800 text-zinc-300"
              }`}
            >
              {/* New Chat Top Icon */}
              <button
                id="top-new-chat-btn"
                onClick={handleNewChat}
                title={t.newChat}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isLight
                    ? "hover:bg-zinc-200/70 text-zinc-800"
                    : "hover:bg-zinc-800 text-zinc-200"
                }`}
              >
                <SquarePen className="w-4 h-4 stroke-[2]" />
              </button>

              {/* Settings Trigger */}
              <button
                id="top-settings-btn"
                onClick={() => setIsSettingsOpen(true)}
                title={t.settingsTitle}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isLight
                    ? "hover:bg-zinc-200/70 text-zinc-800"
                    : "hover:bg-zinc-800 text-zinc-200"
                }`}
              >
                <MoreVertical className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Stream / Messages View */}
        <div
          ref={chatScrollRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative"
        >
          {messages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => handleSend(prompt)}
              activePersona={activePersona}
              onChangePersona={(p) => saveSettings(p, customPrompt)}
              activeEngine={activeEngine}
              onChangeEngine={handleSelectEngine}
              theme={theme}
              language={language}
            />
          ) : (
            <div className="flex-1 py-3 sm:py-4 space-y-2">
              {messages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === "assistant" && index === messages.length - 1;
                const isCurrentlyStreaming = isLastAssistant && isStreaming;

                return (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isStreaming={isCurrentlyStreaming}
                    isLast={index === messages.length - 1}
                    onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                    onEdit={
                      msg.role === "user"
                        ? () => handleEditUserMessage(msg.content)
                        : undefined
                    }
                    onSpeak={handleSpeak}
                    isSpeaking={speakingMessageId === msg.id}
                    theme={theme}
                    language={language}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-6" />
            </div>
          )}
        </div>

        {/* Floating Scroll to Bottom Button (exactly like screenshot) */}
        {showScrollToBottom && (
          <div className="flex justify-center -mb-4.5 z-20 pointer-events-auto">
            <button
              id="scroll-to-bottom-btn"
              onClick={() => scrollToBottom(true)}
              className={`w-9 h-9 rounded-full border shadow-md flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isLight
                  ? "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  : "bg-[#2f2f2f] border-zinc-700 text-zinc-200 hover:bg-zinc-700"
              }`}
              title="Aşağı kaydır"
            >
              <ArrowDown className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        )}

        {/* Bottom Input Area */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          onOpenVoiceMode={() => setIsVoiceModeOpen(true)}
          isStreaming={isStreaming}
          initialValue={editingText}
          onClearInitialValue={() => setEditingText("")}
          theme={theme}
          language={language}
          onFocus={() => {
            scrollToBottom(true);
          }}
        />
      </main>

      {/* Advanced Voice Mode Modal */}
      <VoiceModeModal
        isOpen={isVoiceModeOpen}
        onClose={() => setIsVoiceModeOpen(false)}
        language={language}
        persona={activePersona}
        customSystemPrompt={customPrompt}
        existingMessages={messages}
        onCommitVoiceMessage={handleCommitVoiceMessage}
      />

      {/* Settings & Persona Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activePersona={activePersona}
        onChangePersona={(p) => saveSettings(p, customPrompt)}
        activeEngine={activeEngine}
        onChangeEngine={handleSelectEngine}
        customPrompt={customPrompt}
        onSaveCustomPrompt={(prompt) => saveSettings(activePersona, prompt)}
        onClearAllHistory={handleClearAllHistory}
        currentSession={currentSession}
        theme={theme}
        onChangeTheme={handleThemeChange}
        language={language}
        onChangeLanguage={handleLanguageChange}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Export & Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        session={currentSession}
        theme={theme}
        language={language}
      />
    </div>
  );
}
