import { PersonaConfig } from "../types";

export const PERSONAS: PersonaConfig[] = [
  {
    id: "general",
    name: "Genel Asistan",
    description: "Her türlü günlük soru, bilgi edinme ve beyin fırtınası için ideal.",
    badge: "Standart",
    iconName: "Sparkles",
  },
  {
    id: "coder",
    name: "Yazılım Uzmanı",
    description: "Algoritma, temiz kod, hata ayıklama ve mimari odaklı teknik rehber.",
    badge: "Teknik",
    iconName: "Code2",
  },
  {
    id: "writer",
    name: "Yazar & Edebiyatçı",
    description: "Yaratıcı hikayeler, şiirler, etkileyici metinler ve Türkçe dil zenginliği.",
    badge: "Yaratıcı",
    iconName: "Feather",
  },
  {
    id: "academic",
    name: "Akademik & Analitik",
    description: "Bilimsel metodoloji, ayrıntılı tez analizi ve mantıksal argümanlar.",
    badge: "Araştırma",
    iconName: "GraduationCap",
  },
  {
    id: "concise",
    name: "Öz & Net",
    description: "Dolambaçsız, en kısa ve en pratik şekilde doğrudan sonuca giden yanıtlar.",
    badge: "Hızlı",
    iconName: "Zap",
  },
];
