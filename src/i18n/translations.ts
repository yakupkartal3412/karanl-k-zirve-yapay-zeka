import { LanguageCode } from "../types";

export interface Translations {
  appName: string;
  newChat: string;
  searchChats: string;
  chatHistory: string;
  noChatsYet: string;
  noSearchResults: string;
  deleteChat: string;
  renameChat: string;
  confirmDelete: string;
  save: string;
  cancel: string;
  activeChat: string;
  
  // Welcome screen
  welcomeTitle: string;
  welcomeSubtitle: string;
  suggestions: {
    category: string;
    title: string;
    prompt: string;
  }[];

  // Input
  inputPlaceholder: string;
  send: string;
  stop: string;
  attachImage: string;
  imageAttached: string;
  removeImage: string;
  shiftEnterHint: string;

  // Messages
  userYou: string;
  assistant: string;
  copy: string;
  copied: string;
  speak: string;
  speaking: string;
  stopSpeaking: string;
  edit: string;
  regenerate: string;
  errorGenerating: string;

  // Settings Modal
  settingsTitle: string;
  languageSection: string;
  languageDesc: string;
  themeSection: string;
  darkMode: string;
  darkModeDesc: string;
  lightMode: string;
  lightModeDesc: string;
  personaSection: string;
  personas: {
    [key: string]: {
      name: string;
      description: string;
      badge: string;
    };
  };
  customInstruction: string;
  optional: string;
  customInstructionPlaceholder: string;
  saveInstruction: string;
  instructionSaved: string;
  dataExportSection: string;
  exportMarkdown: string;
  clearHistory: string;
  clearConfirmTitle: string;
  clearConfirmDesc: string;
  clearConfirmYes: string;
  clearConfirmCancel: string;

  // Model Badge
  modelBadge: string;

  // Extra UI helpers
  openSidebar?: string;
  switchToDark?: string;
  switchToLight?: string;
  language?: string;
  serverConnectionError?: string;

  // Export Modal
  exportChat?: string;
  exportSubtitle?: string;
  exportFormatHtml?: string;
  exportFormatHtmlDesc?: string;
  exportFormatMd?: string;
  exportFormatMdDesc?: string;
  exportFormatTxt?: string;
  exportFormatTxtDesc?: string;
  exportFormatJson?: string;
  exportFormatJsonDesc?: string;
  downloadFile?: string;
  downloadSuccess?: string;
  noMessagesToExport?: string;
  printOrSavePdf?: string;

  // Voice Input
  voiceInput?: string;
  voiceListening?: string;
  voiceStop?: string;
  voiceNotSupported?: string;
  micPermissionDenied?: string;

  // Advanced Voice Mode
  voiceMode?: string;
  voiceModeDesc?: string;
  voiceModeListening?: string;
  voiceModeThinking?: string;
  voiceModeSpeaking?: string;
  voiceModeInterrupted?: string;
  voiceModeMute?: string;
  voiceModeUnmute?: string;
  voiceModeEndCall?: string;
  voiceModeInterrupt?: string;
  voiceSelect?: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  tr: {
    appName: "Dark Peak",
    voiceMode: "Gelişmiş Ses Modu",
    voiceModeDesc: "Doğal ve kesintisiz sesli sohbet",
    voiceModeListening: "Dinliyor...",
    voiceModeThinking: "Düşünüyor...",
    voiceModeSpeaking: "Konuşuyor...",
    voiceModeInterrupted: "Araya girildi",
    voiceModeMute: "Mikrofonu Kapat",
    voiceModeUnmute: "Mikrofonu Aç",
    voiceModeEndCall: "Sesli Sohbeti Bitir",
    voiceModeInterrupt: "Araya Gir",
    voiceSelect: "Ses Seçimi",
    newChat: "Yeni Sohbet",
    searchChats: "Sohbetlerde ara...",
    chatHistory: "Sohbet Geçmişi",
    noChatsYet: "Henüz bir sohbet yok.",
    noSearchResults: "Sonuç bulunamadı.",
    deleteChat: "Sohbeti Sil",
    renameChat: "Yeniden Adlandır",
    confirmDelete: "Sil?",
    save: "Kaydet",
    cancel: "İptal",
    activeChat: "Aktif Sohbet",
    welcomeTitle: "Bugün size nasıl yardımcı olabilirim?",
    welcomeSubtitle: "Sorularınızı sorun, kod yazdırın, belgeleri inceleyin veya yaratıcı fikirler üretin.",
    suggestions: [
      {
        category: "Kodlama & Mimari",
        title: "React & TypeScript Hook",
        prompt: "React ve TypeScript ile 'useDebounce' custom hook'unu açıklamalı ve örnekli olarak yaz.",
      },
      {
        category: "İş & İletişim",
        title: "Profesyonel E-posta",
        prompt: "Yöneticime projenin başarıyla tamamlandığını bildiren nazik ve profesyonel bir e-posta taslağı hazırla.",
      },
      {
        category: "Bilim & Teknoloji",
        title: "Kuantum Bilgisayarları",
        prompt: "Kuantum bilgisayarlarının geleneksel bilgisayarlardan farkını 12 yaşındaki birinin anlayabileceği şekilde açıkla.",
      },
      {
        category: "Yaratıcı & Edebi",
        title: "Türkçe Kısa Hikaye",
        prompt: "Sonbaharda İstanbul Boğazı'nda bir vapur yolculuğunu anlatan nostaljik ve edebi bir kısa öykü yaz.",
      },
    ],
    inputPlaceholder: "Bir mesaj yazın veya soru sorun...",
    send: "Gönder",
    stop: "Durdur",
    attachImage: "Görsel Ekle (PNG, JPG, WEBP)",
    imageAttached: "Görsel eklendi",
    removeImage: "Görseli kaldır",
    shiftEnterHint: "Shift + Enter ile yeni satır",
    userYou: "Siz",
    assistant: "Yapay Zeka Asistanı",
    copy: "Kopyala",
    copied: "Kopyalandı!",
    speak: "Sesli Oku",
    speaking: "Okunuyor...",
    stopSpeaking: "Durdur",
    edit: "Düzenle",
    regenerate: "Yeniden Oluştur",
    errorGenerating: "Yapay zeka yanıtı oluşturulurken bir hata oluştu.",
    settingsTitle: "Asistan & Uygulama Ayarları",
    languageSection: "Dil Seçimi (Language)",
    languageDesc: "Uygulama arayüzü ve asistanın öncelikli yanıt dili",
    themeSection: "Görünüm ve Tema (Light / Dark Mode)",
    darkMode: "Koyu Mod",
    darkModeDesc: "Göz yormayan koyu renkler",
    lightMode: "Aydınlık Mod",
    lightModeDesc: "Ferah ve net görünüm",
    personaSection: "Asistan Uzmanlık Modu",
    personas: {
      general: {
        name: "Genel Asistan",
        description: "Her türlü günlük soru, bilgi edinme ve beyin fırtınası için ideal.",
        badge: "Standart",
      },
      coder: {
        name: "Yazılım Uzmanı",
        description: "Algoritma, temiz kod, hata ayıklama ve mimari odaklı teknik rehber.",
        badge: "Teknik",
      },
      writer: {
        name: "Yazar & Edebiyatçı",
        description: "Yaratıcı hikayeler, şiirler, etkileyici metinler ve güçlü anlatım.",
        badge: "Yaratıcı",
      },
      academic: {
        name: "Akademik & Analitik",
        description: "Bilimsel metodoloji, ayrıntılı tez analizi ve mantıksal argümanlar.",
        badge: "Araştırma",
      },
      concise: {
        name: "Öz & Net",
        description: "Dolambaçsız, en kısa ve en pratik şekilde doğrudan sonuca giden yanıtlar.",
        badge: "Hızlı",
      },
    },
    customInstruction: "Kişisel Talimatlar (System Prompt)",
    optional: "Opsiyonel",
    customInstructionPlaceholder: "Örnek: 'Bana yanıt verirken her zaman madde madde ve pratik örneklerle açıkla.'",
    saveInstruction: "Talimatı Kaydet",
    instructionSaved: "Kaydedildi!",
    dataExportSection: "Veri ve Dışa Aktarma",
    exportMarkdown: "Sohbeti İndir (Markdown)",
    clearHistory: "Tüm Geçmişi Temizle",
    clearConfirmTitle: "Tüm Sohbet Geçmişi Silinsin mi?",
    clearConfirmDesc: "Bu işlem geri alınamaz. Kaydedilen tüm sohbet geçmişiniz cihazınızdan tamamen kaldırılacaktır.",
    clearConfirmYes: "Evet, Hepsini Sil",
    clearConfirmCancel: "Vazgeç",
    modelBadge: "Gemini 3.8 Flash",
  },

  en: {
    appName: "Dark Peak",
    newChat: "New Chat",
    searchChats: "Search chats...",
    chatHistory: "Chat History",
    noChatsYet: "No chats yet.",
    noSearchResults: "No results found.",
    deleteChat: "Delete Chat",
    renameChat: "Rename",
    confirmDelete: "Delete?",
    save: "Save",
    cancel: "Cancel",
    activeChat: "Active Chat",
    welcomeTitle: "How can I help you today?",
    welcomeSubtitle: "Ask questions, write code, analyze documents, or brainstorm creative ideas.",
    suggestions: [
      {
        category: "Coding & Architecture",
        title: "React & TypeScript Hook",
        prompt: "Write a clean and well-documented 'useDebounce' custom hook in React with TypeScript.",
      },
      {
        category: "Work & Communication",
        title: "Professional Email",
        prompt: "Draft a polite and professional email informing my manager that the project has been successfully completed.",
      },
      {
        category: "Science & Technology",
        title: "Quantum Computing",
        prompt: "Explain the difference between quantum and classical computing as if I were 12 years old.",
      },
      {
        category: "Creative Writing",
        title: "Short Story",
        prompt: "Write a reflective, atmospheric short story about a late evening walk in an ancient coastal city.",
      },
    ],
    inputPlaceholder: "Type a message or ask a question... (Shift + Enter for new line)",
    send: "Send",
    stop: "Stop",
    attachImage: "Attach Image (PNG, JPG, WEBP)",
    imageAttached: "Image attached",
    removeImage: "Remove image",
    shiftEnterHint: "Shift + Enter for new line",
    userYou: "You",
    assistant: "AI Assistant",
    copy: "Copy",
    copied: "Copied!",
    speak: "Read Aloud",
    speaking: "Speaking...",
    stopSpeaking: "Stop",
    edit: "Edit",
    regenerate: "Regenerate",
    errorGenerating: "An error occurred while generating the AI response.",
    settingsTitle: "Assistant & App Settings",
    languageSection: "Language Selection",
    languageDesc: "Application interface and preferred response language",
    themeSection: "Appearance & Theme",
    darkMode: "Dark Mode",
    darkModeDesc: "Comfortable, eye-friendly dark tones",
    lightMode: "Light Mode",
    lightModeDesc: "Crisp and clear bright layout",
    personaSection: "Assistant Persona Mode",
    personas: {
      general: {
        name: "General Assistant",
        description: "Great for everyday questions, general knowledge, and brainstorming.",
        badge: "Standard",
      },
      coder: {
        name: "Code Specialist",
        description: "Algorithms, clean code, debugging, and system architecture guidance.",
        badge: "Technical",
      },
      writer: {
        name: "Writer & Storyteller",
        description: "Creative stories, essays, persuasive copywriting, and poetic style.",
        badge: "Creative",
      },
      academic: {
        name: "Academic & Analytical",
        description: "Scientific methodology, rigorous analysis, and structured arguments.",
        badge: "Research",
      },
      concise: {
        name: "Concise & Direct",
        description: "Straight to the point, zero fluff, actionable and fast answers.",
        badge: "Fast",
      },
    },
    customInstruction: "Custom System Instructions",
    optional: "Optional",
    customInstructionPlaceholder: "Example: 'Always provide responses in bullet points with real-world examples.'",
    saveInstruction: "Save Instructions",
    instructionSaved: "Saved!",
    dataExportSection: "Data & Export",
    exportMarkdown: "Download Chat (Markdown)",
    clearHistory: "Clear All History",
    clearConfirmTitle: "Delete All Chat History?",
    clearConfirmDesc: "This action cannot be undone. All saved chat sessions will be permanently removed from your device.",
    clearConfirmYes: "Yes, Delete Everything",
    clearConfirmCancel: "Cancel",
    modelBadge: "Gemini 3.8 Flash",
  },

  de: {
    appName: "Dark Peak",
    newChat: "Neuer Chat",
    searchChats: "Chats durchsuchen...",
    chatHistory: "Chatverlauf",
    noChatsYet: "Noch keine Chats vorhanden.",
    noSearchResults: "Keine Ergebnisse gefunden.",
    deleteChat: "Chat löschen",
    renameChat: "Umbenennen",
    confirmDelete: "Löschen?",
    save: "Speichern",
    cancel: "Abbrechen",
    activeChat: "Aktiver Chat",
    welcomeTitle: "Wie kann ich Ihnen heute helfen?",
    welcomeSubtitle: "Stellen Sie Fragen, lassen Sie Code erstellen oder entwickeln Sie neue Ideen.",
    suggestions: [
      {
        category: "Programmierung",
        title: "React & TypeScript Hook",
        prompt: "Schreibe einen sauberen 'useDebounce' Custom-Hook in React und TypeScript mit Erklärung.",
      },
      {
        category: "Beruf & Kommunikation",
        title: "Professionelle E-Mail",
        prompt: "Erstelle eine freundliche E-Mail an meinen Vorgesetzten über den erfolgreichen Projektabschluss.",
      },
      {
        category: "Wissenschaft",
        title: "Quantencomputer",
        prompt: "Erkläre Quantencomputer so, dass es ein 12-Jähriger leicht verstehen kann.",
      },
      {
        category: "Kreatives Schreiben",
        title: "Kurzgeschichte",
        prompt: "Schreibe eine poetische Kurzgeschichte über einen herbstlichen Spaziergang.",
      },
    ],
    inputPlaceholder: "Nachricht schreiben oder Frage stellen... (Shift + Enter für neue Zeile)",
    send: "Senden",
    stop: "Stopp",
    attachImage: "Bild anhängen (PNG, JPG)",
    imageAttached: "Bild hinzugefügt",
    removeImage: "Bild entfernen",
    shiftEnterHint: "Shift + Enter für neue Zeile",
    userYou: "Sie",
    assistant: "KI-Assistent",
    copy: "Kopieren",
    copied: "Kopiert!",
    speak: "Vorlesen",
    speaking: "Liest vor...",
    stopSpeaking: "Stopp",
    edit: "Bearbeiten",
    regenerate: "Neu generieren",
    errorGenerating: "Beim Erstellen der KI-Antwort ist ein Fehler aufgetreten.",
    settingsTitle: "Assistent & Einstellungen",
    languageSection: "Sprachauswahl (Language)",
    languageDesc: "Benutzeroberfläche und bevorzugte Antwortsprache",
    themeSection: "Erscheinungsbild & Design",
    darkMode: "Dunkelmodus",
    darkModeDesc: "Augenschonende dunkle Farben",
    lightMode: "Hellmodus",
    lightModeDesc: "Helle und klare Benutzeroberfläche",
    personaSection: "Expertenmodus",
    personas: {
      general: {
        name: "Allgemeiner Assistent",
        description: "Ideal für Alltagsfragen, Allgemeinwissen und Brainstorming.",
        badge: "Standard",
      },
      coder: {
        name: "Software-Experte",
        description: "Algorithmen, sauberer Code, Debugging und Software-Architektur.",
        badge: "Technisch",
      },
      writer: {
        name: "Autor & Texter",
        description: "Kreative Geschichten, Texte und ausdrucksstarke Beschreibungen.",
        badge: "Kreativ",
      },
      academic: {
        name: "Akademisch & Analytisch",
        description: "Wissenschaftliche Methoden, fundierte Analysen und logische Struktur.",
        badge: "Forschung",
      },
      concise: {
        name: "Präzise & Direkt",
        description: "Direkt auf den Punkt gebracht, kurz und zielorientiert.",
        badge: "Schnell",
      },
    },
    customInstruction: "Individuelle Systemanweisung",
    optional: "Optional",
    customInstructionPlaceholder: "Beispiel: 'Antworte immer strukturiert in Stichpunkten mit Beispielen.'",
    saveInstruction: "Anweisung speichern",
    instructionSaved: "Gespeichert!",
    dataExportSection: "Daten & Export",
    exportMarkdown: "Chat herunterladen (Markdown)",
    clearHistory: "Gesamten Verlauf löschen",
    clearConfirmTitle: "Verlauf wirklich löschen?",
    clearConfirmDesc: "Alle gespeicherten Chats werden unwiderruflich von diesem Gerät entfernt.",
    clearConfirmYes: "Ja, alles löschen",
    clearConfirmCancel: "Abbrechen",
    modelBadge: "Gemini 3.8 Flash",
  },

  es: {
    appName: "Dark Peak",
    newChat: "Nuevo chat",
    searchChats: "Buscar chats...",
    chatHistory: "Historial de chat",
    noChatsYet: "Aún no hay chats.",
    noSearchResults: "No se encontraron resultados.",
    deleteChat: "Eliminar chat",
    renameChat: "Renombrar",
    confirmDelete: "¿Eliminar?",
    save: "Guardar",
    cancel: "Cancelar",
    activeChat: "Chat activo",
    welcomeTitle: "¿Cómo puedo ayudarte hoy?",
    welcomeSubtitle: "Haz preguntas, escribe código, analiza textos o genera ideas creativas.",
    suggestions: [
      {
        category: "Programación",
        title: "Hook en React & TypeScript",
        prompt: "Escribe un hook personalizado 'useDebounce' limpio y explicado en React con TypeScript.",
      },
      {
        category: "Trabajo & Negocios",
        title: "Correo profesional",
        prompt: "Redacta un correo profesional informando a mi supervisor sobre la conclusión exitosa del proyecto.",
      },
      {
        category: "Ciencia & Tecnología",
        title: "Computación cuántica",
        prompt: "Explica qué es un ordenador cuántico como si tuviera 12 años.",
      },
      {
        category: "Escritura creativa",
        title: "Relato breve",
        prompt: "Escribe un breve relato nostálgico sobre un paseo nocturno junto al mar.",
      },
    ],
    inputPlaceholder: "Escribe un mensaje o haz una pregunta... (Shift + Enter para nueva línea)",
    send: "Enviar",
    stop: "Detener",
    attachImage: "Adjuntar imagen (PNG, JPG)",
    imageAttached: "Imagen adjunta",
    removeImage: "Quitar imagen",
    shiftEnterHint: "Shift + Enter para nueva línea",
    userYou: "Tú",
    assistant: "Asistente IA",
    copy: "Copiar",
    copied: "¡Copiado!",
    speak: "Leer en voz alta",
    speaking: "Leyendo...",
    stopSpeaking: "Detener",
    edit: "Editar",
    regenerate: "Regenerar",
    errorGenerating: "Ocurrió un error al generar la respuesta de la IA.",
    settingsTitle: "Ajustes del Asistente",
    languageSection: "Selección de idioma (Language)",
    languageDesc: "Interfaz de la app e idioma preferido de respuesta",
    themeSection: "Apariencia y tema",
    darkMode: "Modo oscuro",
    darkModeDesc: "Colores oscuros y cómodos para la vista",
    lightMode: "Modo claro",
    lightModeDesc: "Diseño luminoso, nítido y fresco",
    personaSection: "Modo de especialidad",
    personas: {
      general: {
        name: "Asistente General",
        description: "Ideal para consultas diarias, conocimientos generales e ideas.",
        badge: "Estándar",
      },
      coder: {
        name: "Especialista en Código",
        description: "Algoritmos, código limpio, depuración y arquitectura de software.",
        badge: "Técnico",
      },
      writer: {
        name: "Escritor y Redactor",
        description: "Narrativa creativa, redacción persuasiva y expresión cuidada.",
        badge: "Creativo",
      },
      academic: {
        name: "Académico y Analítico",
        description: "Metodología científica, análisis riguroso y argumentos lógicos.",
        badge: "Investigación",
      },
      concise: {
        name: "Conciso y Directo",
        description: "Directo al grano, sin rodeos, respuestas rápidas y prácticas.",
        badge: "Rápido",
      },
    },
    customInstruction: "Instrucciones personalizadas (System Prompt)",
    optional: "Opcional",
    customInstructionPlaceholder: "Ejemplo: 'Responde siempre con listas de puntos y ejemplos claros.'",
    saveInstruction: "Guardar instrucciones",
    instructionSaved: "¡Guardado!",
    dataExportSection: "Datos y exportación",
    exportMarkdown: "Descargar chat (Markdown)",
    clearHistory: "Borrar todo el historial",
    clearConfirmTitle: "¿Eliminar todo el historial?",
    clearConfirmDesc: "Esta acción no se puede deshacer. Se borrarán permanentemente todos los chats guardados.",
    clearConfirmYes: "Sí, borrar todo",
    clearConfirmCancel: "Cancelar",
    modelBadge: "Gemini 3.8 Flash",
  },

  fr: {
    appName: "Dark Peak",
    newChat: "Nouvelle discussion",
    searchChats: "Rechercher...",
    chatHistory: "Historique des discussions",
    noChatsYet: "Aucune discussion pour l'instant.",
    noSearchResults: "Aucun résultat trouvé.",
    deleteChat: "Supprimer la discussion",
    renameChat: "Renommer",
    confirmDelete: "Supprimer ?",
    save: "Enregistrer",
    cancel: "Annuler",
    activeChat: "Discussion active",
    welcomeTitle: "Comment puis-je vous aider aujourd'hui ?",
    welcomeSubtitle: "Posez vos questions, écrivez du code, analysez des documents ou explorez des idées.",
    suggestions: [
      {
        category: "Code & Développement",
        title: "Hook React & TypeScript",
        prompt: "Écris un hook personnalisé 'useDebounce' propre et commenté en React et TypeScript.",
      },
      {
        category: "Travail & Communication",
        title: "E-mail professionnel",
        prompt: "Rédige un e-mail professionnel et courtois annonçant à mon responsable la réussite du projet.",
      },
      {
        category: "Sciences & Technologies",
        title: "Informatique quantique",
        prompt: "Explique le fonctionnement des ordinateurs quantiques comme à un enfant de 12 ans.",
      },
      {
        category: "Écriture créative",
        title: "Nouvelle courte",
        prompt: "Écris une courte histoire atmosphérique sur une promenade nocturne au bord de l'eau.",
      },
    ],
    inputPlaceholder: "Écrivez un message ou posez une question... (Maj + Entrée pour nouvelle ligne)",
    send: "Envoyer",
    stop: "Arrêter",
    attachImage: "Joindre une image (PNG, JPG)",
    imageAttached: "Image jointe",
    removeImage: "Supprimer l'image",
    shiftEnterHint: "Maj + Entrée pour nouvelle ligne",
    userYou: "Vous",
    assistant: "Assistant IA",
    copy: "Copier",
    copied: "Copié !",
    speak: "Lire à voix haute",
    speaking: "Lecture en cours...",
    stopSpeaking: "Arrêter",
    edit: "Modifier",
    regenerate: "Régénérer",
    errorGenerating: "Une erreur est survenue lors de la génération de la réponse.",
    settingsTitle: "Paramètres de l'Assistant",
    languageSection: "Choix de la langue (Language)",
    languageDesc: "Langue de l'interface et langue préférée des réponses",
    themeSection: "Apparence & Thème",
    darkMode: "Mode Sombre",
    darkModeDesc: "Teintes sombres reposantes pour les yeux",
    lightMode: "Mode Clair",
    lightModeDesc: "Mise en page lumineuse et claire",
    personaSection: "Mode Spécialiste",
    personas: {
      general: {
        name: "Assistant Général",
        description: "Idéal pour toutes les questions du quotidien et le brainstorming.",
        badge: "Standard",
      },
      coder: {
        name: "Expert Code",
        description: "Algorithmes, code propre, débogage et conseils d'architecture.",
        badge: "Technique",
      },
      writer: {
        name: "Auteur & Rédacteur",
        description: "Récits créatifs, textes élégants et style littéraire.",
        badge: "Créatif",
      },
      academic: {
        name: "Académique & Analytique",
        description: "Rigueur scientifique, argumentation logique et analyse poussée.",
        badge: "Recherche",
      },
      concise: {
        name: "Concis & Direct",
        description: "Droit au but, réponses brèves et concrètes.",
        badge: "Rapide",
      },
    },
    customInstruction: "Instructions personnalisées (System Prompt)",
    optional: "Facultatif",
    customInstructionPlaceholder: "Exemple : 'Réponds toujours sous forme de liste avec des exemples concrets.'",
    saveInstruction: "Enregistrer l'instruction",
    instructionSaved: "Enregistré !",
    dataExportSection: "Données et Export",
    exportMarkdown: "Télécharger la discussion (Markdown)",
    clearHistory: "Effacer tout l'historique",
    clearConfirmTitle: "Effacer tout l'historique ?",
    clearConfirmDesc: "Cette action est irréversible. Toutes vos discussions enregistrées seront définitivement supprimées.",
    clearConfirmYes: "Oui, tout supprimer",
    clearConfirmCancel: "Annuler",
    modelBadge: "Gemini 3.8 Flash",
  },

  ar: {
    appName: "Dark Peak",
    newChat: "محادثة جديدة",
    searchChats: "البحث في المحادثات...",
    chatHistory: "سجل المحادثات",
    noChatsYet: "لا توجد محادثات حتى الآن.",
    noSearchResults: "لم يتم العثور على نتائج.",
    deleteChat: "حذف المحادثة",
    renameChat: "إعادة تسمية",
    confirmDelete: "حذف؟",
    save: "حفظ",
    cancel: "إلغاء",
    activeChat: "المحادثة النشطة",
    welcomeTitle: "كيف يمكنني مساعدتك اليوم؟",
    welcomeSubtitle: "اطرح الأسئلة، واكتب الأكواد، وحلل المستندات، واستكشف أفكاراً جديدة.",
    suggestions: [
      {
        category: "البرمجة والتقنية",
        title: "React & TypeScript Hook",
        prompt: "اكتب خطاف 'useDebounce' مخصص ونظيف في React مع TypeScript مع شرح كامل.",
      },
      {
        category: "العمل والتواصل",
        title: "بريد إلكتروني مهني",
        prompt: "اكتب مسودة بريد إلكتروني مهني ومهذب لإبلاغ مديري بإتمام المشروع بنجاح.",
      },
      {
        category: "العلوم والتكنولوجيا",
        title: "الحوسبة الكمومية",
        prompt: "اشرح الفرق بين الحواسيب الكمومية والتقليدية بطريقة يفهمها طفل عمره 12 عاماً.",
      },
      {
        category: "الكتابة الإبداعية",
        title: "قصة قصيرة",
        prompt: "اكتب قصة قصيرة أدبية ومؤثرة عن رحلة ليلية على شاطئ البحر.",
      },
    ],
    inputPlaceholder: "اكتب رسالة أو اطرح سؤالاً... (Shift + Enter لسطر جديد)",
    send: "إرسال",
    stop: "إيقاف",
    attachImage: "إرفاق صورة (PNG, JPG)",
    imageAttached: "تم إرفاق صورة",
    removeImage: "إزالة الصورة",
    shiftEnterHint: "Shift + Enter لسطر جديد",
    userYou: "أنت",
    assistant: "مساعد الذكاء الاصطناعي",
    copy: "نسخ",
    copied: "تم النسخ!",
    speak: "قراءة صوتية",
    speaking: "جارٍ القراءة...",
    stopSpeaking: "إيقاف",
    edit: "تعديل",
    regenerate: "إعادة التوليد",
    errorGenerating: "حدث خطأ أثناء توليد رد الذكاء الاصطناعي.",
    settingsTitle: "إعدادات المساعد والتطبيق",
    languageSection: "اختيار اللغة (Language)",
    languageDesc: "لغة واجهة التطبيق ولغة الرد المفضلة للمساعد",
    themeSection: "المظهر والسمة",
    darkMode: "الوضع الداكن",
    darkModeDesc: "ألوان داكنة مريحة للعينين",
    lightMode: "الوضع الفاتح",
    lightModeDesc: "مظهر ناصع وواضح وأنيق",
    personaSection: "نمط تخصص المساعد",
    personas: {
      general: {
        name: "المساعد العام",
        description: "مثالي للأسئلة اليومية والمعلومات العامة والعصف الذهني.",
        badge: "قياسي",
      },
      coder: {
        name: "خبير البرمجة",
        description: "الخوارزميات، الكود النظيف، تصحيح الأخطاء وهندسة الأنظمة.",
        badge: "تقني",
      },
      writer: {
        name: "كاتب وأديب",
        description: "قصص إبداعية، كتابة نصوص بليغة وأسلوب لغوي قوي.",
        badge: "إبداعي",
      },
      academic: {
        name: "أكاديمي وتحليلي",
        description: "منهجية علمية، تحليل دقيق وحجج منطقية قوية.",
        badge: "أبحاث",
      },
      concise: {
        name: "موجز ومباشر",
        description: "إجابات مباشرة ومختصرة تركز على النتيجة فوراً.",
        badge: "سريع",
      },
    },
    customInstruction: "تعليمات مخصصة (System Prompt)",
    optional: "اختياري",
    customInstructionPlaceholder: "مثال: 'أجب دائماً بنقاط محددة وقدم أمثلة واقعية.'",
    saveInstruction: "حفظ التعليمات",
    instructionSaved: "تم الحفظ!",
    dataExportSection: "البيانات والتصدير",
    exportMarkdown: "تنزيل المحادثة (Markdown)",
    clearHistory: "مسح السجل بالكامل",
    clearConfirmTitle: "هل تريد حذف جميع المحادثات؟",
    clearConfirmDesc: "لا يمكن التراجع عن هذا الإجراء. سيتم حذف جميع المحادثات المحفوظة نهائياً من جهازك.",
    clearConfirmYes: "نعم، احذف كل شيء",
    clearConfirmCancel: "إلغاء",
    modelBadge: "Gemini 3.8 Flash",
  },

  ru: {
    appName: "Dark Peak",
    newChat: "Новый чат",
    searchChats: "Поиск в чатах...",
    chatHistory: "История чатов",
    noChatsYet: "Пока нет чатов.",
    noSearchResults: "Ничего не найдено.",
    deleteChat: "Удалить чат",
    renameChat: "Переименовать",
    confirmDelete: "Удалить?",
    save: "Сохранить",
    cancel: "Отмена",
    activeChat: "Активный чат",
    welcomeTitle: "Чем я могу вам помочь сегодня?",
    welcomeSubtitle: "Задавайте вопросы, пишите код, анализируйте тексты или генерируйте идеи.",
    suggestions: [
      {
        category: "Код & Разработка",
        title: "Хук React & TypeScript",
        prompt: "Напиши чистый хук 'useDebounce' на React и TypeScript с подробными пояснениями.",
      },
      {
        category: "Работа & Деловая переписка",
        title: "Деловое письмо",
        prompt: "Составь вежливое профессиональное письмо руководителю об успешном завершении проекта.",
      },
      {
        category: "Наука & Технологии",
        title: "Квантовые компьютеры",
        prompt: "Объясни, как работают квантовые компьютеры, простыми словами для 12-летнего ребенка.",
      },
      {
        category: "Творчество",
        title: "Короткий рассказ",
        prompt: "Напиши атмосферный короткий рассказ о вечерней прогулке у осеннего моря.",
      },
    ],
    inputPlaceholder: "Введите сообщение или задайте вопрос... (Shift + Enter для переноса строки)",
    send: "Отправить",
    stop: "Остановить",
    attachImage: "Прикрепить изображение (PNG, JPG)",
    imageAttached: "Изображение прикреплено",
    removeImage: "Удалить изображение",
    shiftEnterHint: "Shift + Enter для переноса строки",
    userYou: "Вы",
    assistant: "ИИ-Ассистент",
    copy: "Копировать",
    copied: "Скопировано!",
    speak: "Озвучить",
    speaking: "Озвучивание...",
    stopSpeaking: "Остановить",
    edit: "Редактировать",
    regenerate: "Сгенерировать снова",
    errorGenerating: "Произошла ошибка при генерации ответа ИИ.",
    settingsTitle: "Настройки ассистента",
    languageSection: "Выбор языка (Language)",
    languageDesc: "Язык интерфейса приложения и приоритетный язык ответов ассистента",
    themeSection: "Внешний вид и тема",
    darkMode: "Темная тема",
    darkModeDesc: "Комфортные темные тона для глаз",
    lightMode: "Светлая тема",
    lightModeDesc: "Чистый, четкий и светлый дизайн",
    personaSection: "Режим специализации",
    personas: {
      general: {
        name: "Общий ассистент",
        description: "Подходит для любых повседневных вопросов, поиска знаний и идей.",
        badge: "Стандарт",
      },
      coder: {
        name: "Эксперт по коду",
        description: "Алгоритмы, чистый код, отладка и архитектурные решения.",
        badge: "Технический",
      },
      writer: {
        name: "Писатель и автор",
        description: "Творческие истории, статьи, выразительные и живые тексты.",
        badge: "Творческий",
      },
      academic: {
        name: "Академический",
        description: "Научный подход, доказательный анализ и логическая аргументация.",
        badge: "Исследования",
      },
      concise: {
        name: "Краткий и точный",
        description: "Без лишних слов, максимально сжатые и практичные ответы.",
        badge: "Быстрый",
      },
    },
    customInstruction: "Пользовательские инструкции (System Prompt)",
    optional: "Необязательно",
    customInstructionPlaceholder: "Пример: 'Всегда отвечай структурированно по пунктам с примерами.'",
    saveInstruction: "Сохранить инструкции",
    instructionSaved: "Сохранено!",
    dataExportSection: "Данные и экспорт",
    exportMarkdown: "Скачать чат (Markdown)",
    clearHistory: "Очистить всю историю",
    clearConfirmTitle: "Удалить всю историю чатов?",
    clearConfirmDesc: "Это действие необратимо. Все сохраненные диалоги будут удалены с устройства.",
    clearConfirmYes: "Да, удалить всё",
    clearConfirmCancel: "Отмена",
    modelBadge: "Gemini 3.8 Flash",
  },
};

export function getTranslation(lang: LanguageCode): Translations {
  const base = TRANSLATIONS[lang] || TRANSLATIONS.tr;
  const isTr = lang === "tr";
  return {
    ...base,
    openSidebar: base.openSidebar || (isTr ? "Menüyü Aç" : "Open sidebar"),
    switchToDark: base.switchToDark || (isTr ? "Karanlık Mod'a geç" : "Switch to dark mode"),
    switchToLight: base.switchToLight || (isTr ? "Aydınlık Mod'a geç" : "Switch to light mode"),
    language: base.language || (isTr ? "Dil / Language" : "Language"),
    serverConnectionError:
      base.serverConnectionError ||
      (isTr
        ? "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
        : "Failed to connect to the server. Please check your internet connection and try again."),
    exportChat: base.exportChat || (isTr ? "Sohbeti İndir" : "Download Chat"),
    exportSubtitle:
      base.exportSubtitle ||
      (isTr
        ? "Sohbet dökümünü istediğiniz formatta yüksek kalitede kaydedin."
        : "Save chat transcript in your preferred format with high-quality formatting."),
    exportFormatHtml: base.exportFormatHtml || (isTr ? "HTML / PDF Raporu" : "HTML / PDF Report"),
    exportFormatHtmlDesc:
      base.exportFormatHtmlDesc ||
      (isTr
        ? "Yazdırmaya ve PDF olarak kaydetmeye hazır renkli, şık doküman (Önerilen)"
        : "Color-styled document ready for printing and saving as PDF (Recommended)"),
    exportFormatMd: base.exportFormatMd || (isTr ? "Zengin Markdown (.md)" : "Enhanced Markdown (.md)"),
    exportFormatMdDesc:
      base.exportFormatMdDesc ||
      (isTr
        ? "Notion, Obsidian ve not uygulamaları için yapılandırılmış metin"
        : "Structured text for Notion, Obsidian, and markdown editors"),
    exportFormatTxt: base.exportFormatTxt || (isTr ? "Düz Metin (.txt)" : "Plain Text (.txt)"),
    exportFormatTxtDesc:
      base.exportFormatTxtDesc ||
      (isTr ? "Her cihazda ve editörde açılabilen temiz metin dökümü" : "Clean text transcript openable on any device"),
    exportFormatJson: base.exportFormatJson || (isTr ? "JSON Veri Yedeklemesi (.json)" : "JSON Data Backup (.json)"),
    exportFormatJsonDesc:
      base.exportFormatJsonDesc ||
      (isTr ? "Tüm mesaj geçmişini ve zaman damgalarını içeren tam yedek" : "Full backup with message history and timestamps"),
    downloadFile: base.downloadFile || (isTr ? "Dosyayı İndir" : "Download File"),
    downloadSuccess: base.downloadSuccess || (isTr ? "Dosya İndirildi!" : "Downloaded!"),
    noMessagesToExport:
      base.noMessagesToExport ||
      (isTr ? "Dışa aktarmak için sohbette en az bir mesaj bulunmalıdır." : "There must be at least one message to export."),
    printOrSavePdf: base.printOrSavePdf || (isTr ? "Yazdır / PDF Olarak Kaydet" : "Print / Save as PDF"),
    voiceInput: base.voiceInput || (isTr ? "Sesle Yaz" : "Voice Typing"),
    voiceListening: base.voiceListening || (isTr ? "Dinleniyor... Konuşun" : "Listening... Speak now"),
    voiceStop: base.voiceStop || (isTr ? "Dinlemeyi Durdur" : "Stop Listening"),
    voiceNotSupported:
      base.voiceNotSupported ||
      (isTr
        ? "Tarayıcınız ses tanıma özelliğini desteklemiyor."
        : "Voice recognition is not supported in this browser."),
    micPermissionDenied:
      base.micPermissionDenied ||
      (isTr ? "Mikrofon erişimine izin verilmedi." : "Microphone access was denied."),
  };
}
