export type Role = "user" | "assistant" | "system";

export type ThemeMode = "dark" | "light";

export type LanguageCode = "tr" | "en" | "de" | "es" | "fr" | "ar" | "ru";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ChatImage {
  data: string; // base64 without prefix
  mimeType: string;
  previewUrl: string;
  name?: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  image?: ChatImage; // legacy single image support
  images?: ChatImage[]; // multiple images support
  error?: boolean;
}

export type AssistantPersona = "general" | "coder" | "writer" | "academic" | "concise";

export type AIEngineId = "prime-core-fast" | "prime-core-think" | "prime-core-expert";

export interface AIEngineConfig {
  id: AIEngineId;
  name: string;
  tagline: string;
  badge: string;
  badgeColor: string;
  speed: string;
  capability: string;
  description: string;
  iconName: "Zap" | "Brain" | "Code2" | "Sparkles";
}

export interface PersonaConfig {
  id: AssistantPersona;
  name: string;
  description: string;
  badge: string;
  iconName: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  persona: AssistantPersona;
  engine?: AIEngineId;
  customSystemPrompt?: string;
}
