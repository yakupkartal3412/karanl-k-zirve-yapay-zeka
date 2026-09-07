import { useState } from "react";
import {
  MessageSquarePlus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Settings,
  PanelLeftClose,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { ChatSession, LanguageCode, ThemeMode } from "../types";
import { getTranslation } from "../i18n/translations";
import { DarkPeakLogo } from "./DarkPeakLogo";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  theme: ThemeMode;
  language: LanguageCode;
}

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onOpenSettings,
  isOpen,
  onToggleOpen,
  theme,
  language,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isLight = theme === "light";
  const t = getTranslation(language);

  // Prevent multiple empty new chat items from stacking:
  // Only display sessions that contain messages, or the currently active empty session
  const visibleSessions = sessions.filter(
    (s) => s && (s.id === activeSessionId || (s.messages && s.messages.length > 0))
  );

  const filteredSessions = visibleSessions.filter((s) =>
    (s.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(id);
    setDeletingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onToggleOpen}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 flex flex-col w-72 transition-all duration-200 ease-in-out border-r ${
          isLight
            ? "bg-slate-50/95 border-slate-200 text-slate-800"
            : "bg-zinc-900 border-zinc-800 text-zinc-100"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:hidden"}`}
      >
        {/* Top Header */}
        <div
          className={`p-3 border-b flex items-center justify-between ${
            isLight ? "border-slate-200/80" : "border-zinc-800/80"
          }`}
        >
          <div className="flex items-center gap-2.5 px-2 py-1">
            <DarkPeakLogo size={22} />
            <div className="flex items-center gap-1.5">
              <span
                className={`font-bold text-sm tracking-tight ${
                  isLight ? "text-slate-900" : "text-zinc-100"
                }`}
              >
                {t.appName}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                AI
              </span>
            </div>
          </div>

          <button
            id="close-sidebar-btn"
            onClick={onToggleOpen}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            id="new-chat-btn"
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-all shadow-sm cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Search Past Chats */}
        {sessions.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search
                className={`w-4 h-4 absolute left-3 top-2.5 ${
                  isLight ? "text-slate-400" : "text-zinc-500"
                }`}
              />
              <input
                id="search-chats-input"
                type="text"
                placeholder={t.searchChats}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg transition-colors focus:outline-none ${
                  isLight
                    ? "bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-500"
                    : "bg-zinc-950/60 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:border-zinc-700"
                }`}
              />
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          <div
            className={`px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
              isLight ? "text-slate-400" : "text-zinc-500"
            }`}
          >
            {t.chatHistory}
          </div>

          {filteredSessions.length === 0 ? (
            <div
              className={`p-4 text-center text-xs ${
                isLight ? "text-slate-400" : "text-zinc-500"
              }`}
            >
              {searchQuery ? t.noSearchResults : t.noChatsYet}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isEditing = session.id === editingId;
              const isDeleting = session.id === deletingId;

              return (
                <div
                  id={`session-item-${session.id}`}
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? isLight
                        ? "bg-white text-slate-900 shadow-xs border border-slate-200/90 font-semibold"
                        : "bg-zinc-800 text-zinc-100"
                      : isLight
                      ? "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                      : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                    <MessageSquare
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? "text-emerald-500"
                          : isLight
                          ? "text-slate-400"
                          : "text-zinc-500"
                      }`}
                    />

                    {isEditing ? (
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRename(session.id, e);
                          if (e.key === "Escape") cancelRename(e as any);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className={`w-full rounded px-1.5 py-0.5 outline-none text-xs border ${
                          isLight
                            ? "bg-white text-slate-900 border-emerald-500"
                            : "bg-zinc-950 text-zinc-100 border-emerald-500"
                        }`}
                      />
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {/* Actions for Session */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => saveRename(session.id, e)}
                          title={t.save}
                          className="p-1 hover:text-emerald-500 text-slate-400 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          title={t.cancel}
                          className="p-1 hover:text-red-500 text-slate-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : isDeleting ? (
                      <div className="flex items-center gap-1 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20">
                        <span className="text-[10px] text-red-500 font-medium">{t.confirmDelete}</span>
                        <button
                          type="button"
                          onClick={(e) => confirmDelete(session.id, e)}
                          title={t.clearConfirmYes}
                          className="p-0.5 hover:text-red-600 text-red-500 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(null);
                          }}
                          title={t.cancel}
                          className="p-0.5 hover:text-slate-600 text-slate-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="hidden group-hover:flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={(e) => startRename(session, e)}
                          title={t.renameChat}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isLight
                              ? "hover:bg-slate-200 text-slate-400 hover:text-slate-700"
                              : "hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(session.id);
                          }}
                          title={t.deleteChat}
                          className={`p-1 rounded transition-colors cursor-pointer ${
                            isLight
                              ? "hover:bg-red-50 text-slate-400 hover:text-red-600"
                              : "hover:bg-zinc-700 text-zinc-400 hover:text-red-400"
                          }`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Settings Trigger */}
        <div
          className={`p-3 border-t ${
            isLight ? "border-slate-200/80" : "border-zinc-800/80"
          }`}
        >
          <button
            id="open-settings-btn"
            onClick={onOpenSettings}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              isLight
                ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{t.settingsTitle}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
