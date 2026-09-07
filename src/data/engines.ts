import { AIEngineConfig } from "../types";

export const AI_ENGINES: AIEngineConfig[] = [
  {
    id: "prime-core-fast",
    name: "Dark Peak Core (Hızlı)",
    tagline: "Ultra Hızlı & Çevik",
    badge: "HIZLI",
    badgeColor: "emerald",
    speed: "⚡ Anlık Yanıt",
    capability: "Sohbet & Günlük Görevler",
    description: "Anında yanıtlar, hızlı özetler, dil çevirileri ve sesli sohbet için optimize edilmiş hafif ve çevik mod.",
    iconName: "Zap",
  },
  {
    id: "prime-core-think",
    name: "Dark Peak Core (Derin Akıl)",
    tagline: "Derin Mantık & Analiz",
    badge: "AKIL",
    badgeColor: "purple",
    speed: "🧠 Derin Düşünce",
    capability: "Karmaşık Muhakeme",
    description: "Zorlu mantık problemleri, bilimsel araştırma, felsefe ve stratejik karar verme için düşünen analiz modu.",
    iconName: "Brain",
  },
  {
    id: "prime-core-expert",
    name: "Dark Peak Core (Uzman)",
    tagline: "Mühendislik & Yaratıcılık",
    badge: "UZMAN",
    badgeColor: "sky",
    speed: "💻 Tam Yetkinlik",
    capability: "Kodlama & Proje Üretimi",
    description: "Üst düzey yazılım mimarisi, hatasız kod blokları, teknik çözümler ve yaratıcı projeler için kapsamlı uzman modu.",
    iconName: "Code2",
  },
];
