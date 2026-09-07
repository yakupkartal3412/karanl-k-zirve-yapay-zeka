import { ChatSession } from "../types";

const DB_NAME = "dark_peak_db";
const DB_VERSION = 1;
const STORE_NAME = "chat_store";
const SESSIONS_KEY = "sessions";
export const STORAGE_KEY = "turkish_ai_chat_sessions_v1";

// Helper to open IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Get sessions from IndexedDB
export async function getSessionsFromIndexedDB(): Promise<ChatSession[] | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(SESSIONS_KEY);

      req.onsuccess = () => {
        if (req.result && Array.isArray(req.result)) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

// Save sessions to IndexedDB
export async function saveSessionsToIndexedDB(sessions: ChatSession[]): Promise<boolean> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(sessions, SESSIONS_KEY);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Safe LocalStorage setter with automatic quota recovery
export function safeSaveToLocalStorage(sessions: ChatSession[]): void {
  try {
    const validSessions = (sessions || []).filter((s) => s && Array.isArray(s.messages));
    // Try saving full sessions first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validSessions));
  } catch (error) {
    // If quota exceeded, create a lightweight cache version without raw heavy image data
    try {
      const validSessions = (sessions || []).filter((s) => s && Array.isArray(s.messages));
      const lightSessions = validSessions.map((session) => ({
        ...session,
        messages: (session.messages || []).map((msg) => {
          let updated = { ...msg };
          if (updated.image) {
            updated.image = {
              ...updated.image,
              data: "", // stripped in localStorage to save quota
            };
          }
          if (Array.isArray(updated.images)) {
            updated.images = updated.images.map((img) => ({
              ...img,
              data: "", // stripped in localStorage to save quota
            }));
          }
          return updated;
        }),
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightSessions));
    } catch {
      // If still exceeded, keep only the 5 most recent sessions in localStorage
      try {
        const validSessions = (sessions || []).filter((s) => s && Array.isArray(s.messages));
        const minimalSessions = validSessions.slice(0, 5).map((session) => ({
          ...session,
          messages: (session.messages || []).slice(-15).map((msg) => {
            if (msg.image || msg.images) {
              return {
                ...msg,
                image: undefined,
                images: undefined,
              };
            }
            return msg;
          }),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(minimalSessions));
      } catch {
        // Safe degrade: do nothing, IndexedDB already holds the full truth
      }
    }
  }
}

// Load initial sessions with migration from LocalStorage if needed
export async function loadInitialSessions(): Promise<ChatSession[]> {
  // 1. Try reading from IndexedDB
  const idbSessions = await getSessionsFromIndexedDB();
  if (idbSessions && idbSessions.length > 0) {
    return idbSessions.filter((s) => s && s.messages && s.messages.length > 0);
  }

  // 2. If IndexedDB is empty, check LocalStorage for legacy data
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validSessions = parsed.filter((s) => s && s.messages && s.messages.length > 0);
        // Migrate to IndexedDB
        await saveSessionsToIndexedDB(validSessions);
        // Clean up localStorage to prevent future quota errors
        safeSaveToLocalStorage(validSessions);
        return validSessions;
      }
    }
  } catch {
    // fallback
  }

  return [];
}

// Clear all stored sessions
export async function clearAllSessions(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(SESSIONS_KEY);
  } catch {
    // ignore
  }
}
