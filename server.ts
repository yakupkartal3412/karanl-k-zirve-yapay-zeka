import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Enable CORS for all routes (important for preview iframe / subdomains)
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Lazy Gemini client helper
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

const LANG_NAMES: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  ar: "العربية",
  ru: "Русский",
};

function getEngineDetails(engine: string = "prime-core-fast") {
  switch (engine) {
    case "prime-core-think":
    case "prime-cortex":
      return {
        name: "Dark Peak Core (Derin Akıl)",
        rolePrompt: "Sen Dark Peak AI platformunun **Dark Peak Core (Derin Akıl)** modulusun. İleri seviye mantık yürütme, derin muhakeme, bilimsel analiz, felsefe ve karmaşık sorgulamalar konusunda uzmanlaşmış düşünce motorusun. Soruları adım adım ele alarak, neden-sonuç bağlamlarını titizlikle analiz ederek kapsamlı yanıtla.",
        temperature: 0.4,
      };
    case "prime-core-expert":
    case "prime-codex":
    case "prime-creative":
      return {
        name: "Dark Peak Core (Uzman)",
        rolePrompt: "Sen Dark Peak AI platformunun **Dark Peak Core (Uzman)** tam donanımlı mühendislik ve yaratıcılık modulusun. Temiz yazılım mimarisi, hatasız kod blokları, teknik çözümler ve zengin yaratıcı anlatım konularında üstün yetkinliğe sahipsin. Sunduğun teknik çözümler hatasız, modern ve üretime hazır olmalıdır.",
        temperature: 0.3,
      };
    case "prime-core-fast":
    case "prime-flash":
    default:
      return {
        name: "Dark Peak Core (Hızlı)",
        rolePrompt: "Sen Dark Peak AI platformunun **Dark Peak Core (Hızlı)** ultra çevik zeka motorusun. Anlık cevaplar, hızlı çeviriler, pratik soru-cevap ve sesli sohbet için yüksek tempolu, doğrudan ve akıcı yanıtlar üretirsin.",
        temperature: 0.7,
      };
  }
}

function buildSystemInstruction(
  persona?: string,
  customSystemPrompt?: string,
  language: string = "tr",
  engine: string = "prime-core-fast"
) {
  const targetLang = LANG_NAMES[language] || "Türkçe";
  const engineInfo = getEngineDetails(engine);

  let systemInstruction = `${engineInfo.rolePrompt}

Temel İlkelerin:
1. Öncelikli yanıt dili: ${targetLang}. Kullanıcı başka bir dilde yazmadıkça veya çeviri talep etmedikçe yanıtlarını doğal, akıcı ve kusursuz ${targetLang} ile ver. Dil bilgisi, imla ve anlatım kurallarına özen göster.
2. Kullanıcının sorusu veya mesajı farklı bir dilde ise kullanıcının yazdığı dilde yanıt ver.
3. Yanıtları okuması kolay olacak biçimde Markdown ile yapılandır: Başlıklar, madde işaretleri, kalın metinler, tablolar ve kod blokları kullan.
4. Kod yazarken temiz, modern ve açıklamalı kod sun. Kod bloklarının başlangıcında programlama dilini belirt (örn: \`\`\`typescript, \`\`\`python).
5. Matematik ve mantık problemlerinde adımları mantıklı ve net bir biçimde açıkla.
6. Asla kaba veya yanıltıcı olma. Bilmediğin veya kesin olmayan konularda dürüstçe belirt.`;

  if (persona === "coder") {
    systemInstruction += "\n\nUzmanlık Modu: Kıdemli Yazılım Mühendisi ve Sistem Mimarı. Kod yazarken best-practice'lere, temiz mimariye, güvenlik ve performans ilkelerine odaklan.";
  } else if (persona === "writer") {
    systemInstruction += "\n\nUzmanlık Modu: Yaratıcı Yazar ve Dil Uzmanı. Hikaye anlatımı, edebi zenginlik, yaratıcı metaforlar ve güçlü kelime haznesi kullan.";
  } else if (persona === "academic") {
    systemInstruction += "\n\nUzmanlık Modu: Akademisyen ve Araştırmacı. Bilimsel metot, kaynaklı ve tarafsız analiz, mantıksal argümantasyon ve derinlemesine akademik üslup benimse.";
  } else if (persona === "concise") {
    systemInstruction += "\n\nUzmanlık Modu: Öz ve Hızlı. Uzun lafın kısası prensibiyle doğrudan cevaba odaklan, gereksiz dolambaçlı ifadelerden kaçın.";
  }

  if (customSystemPrompt && customSystemPrompt.trim()) {
    systemInstruction += `\n\nKullanıcı Özel Talimatı:\n${customSystemPrompt.trim()}`;
  }

  return systemInstruction;
}

function formatContents(
  messages: any[],
  images?: Array<{ data: string; mimeType: string }>,
  legacyImage?: { data: string; mimeType: string }
) {
  const contents: any[] = [];

  // Normalize images for the current/last prompt
  const currentImages: Array<{ data: string; mimeType: string }> = [];
  if (Array.isArray(images) && images.length > 0) {
    currentImages.push(...images);
  } else if (legacyImage && legacyImage.data && legacyImage.mimeType) {
    currentImages.push(legacyImage);
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const isLastMessage = i === messages.length - 1;
    const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";

    const parts: any[] = [];

    // If this is the last user message, attach current incoming images
    if (isLastMessage && role === "user" && currentImages.length > 0) {
      for (const img of currentImages) {
        if (img && img.data && img.mimeType) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          });
        }
      }
    } else if (role === "user") {
      // Prior message history might have had multiple or single images
      if (Array.isArray(msg.images) && msg.images.length > 0) {
        for (const img of msg.images) {
          if (img && img.data && img.mimeType) {
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: img.data,
              },
            });
          }
        }
      } else if (msg.image && msg.image.data && msg.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data,
          },
        });
      }
    }

    parts.push({ text: msg.content || "" });

    contents.push({
      role,
      parts,
    });
  }
  return contents;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
];

// Non-streaming chat endpoint (ideal fallback)
app.post("/api/chat", async (req, res) => {
  const {
    messages,
    persona = "general",
    customSystemPrompt,
    images,
    image,
    language = "tr",
    engine = "prime-core-fast",
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Geçerli bir mesaj listesi gereklidir." });
  }

  let ai: GoogleGenAI;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    return res.status(500).json({
      error: "GEMINI_API_KEY yapılandırılmamış. Lütfen Settings > Secrets panelinden anahtarınızı ekleyin.",
    });
  }

  const engineDetails = getEngineDetails(engine);
  const systemInstruction = buildSystemInstruction(persona, customSystemPrompt, language, engine);
  const contents = formatContents(messages, images, image);

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: engineDetails.temperature,
          automaticFunctionCalling: { disable: true },
        },
      });

      return res.json({ text: response.text || "" });
    } catch (error: any) {
      console.warn(`Model ${model} failed in /api/chat:`, error?.message || error);
      lastError = error;
    }
  }

  console.error("All models failed in /api/chat:", lastError);
  res.status(500).json({
    error: lastError?.message || "Yapay zeka yanıtı oluşturulurken bir hata oluştu.",
  });
});

// SSE Streaming Chat Endpoint
app.post("/api/chat/stream", async (req, res) => {
  const {
    messages,
    persona = "general",
    customSystemPrompt,
    images,
    image,
    language = "tr",
    engine = "prime-core-fast",
  } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Geçerli bir mesaj listesi gereklidir." });
  }

  // Set SSE Headers immediately with writeHead
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Send an immediate comment to flush connection through proxies
  res.write(": keep-alive\n\n");

  let ai: GoogleGenAI;
  try {
    ai = getGeminiClient();
  } catch (err: any) {
    res.write(
      `data: ${JSON.stringify({
        error: "GEMINI_API_KEY yapılandırılmamış. Lütfen Settings > Secrets panelinden anahtarınızı ekleyin.",
      })}\n\n`
    );
    res.write("data: [DONE]\n\n");
    return res.end();
  }

  const engineDetails = getEngineDetails(engine);
  const systemInstruction = buildSystemInstruction(persona, customSystemPrompt, language, engine);
  const contents = formatContents(messages, images, image);

  let streamStarted = false;
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: engineDetails.temperature,
          automaticFunctionCalling: { disable: true },
        },
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          streamStarted = true;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      return res.end();
    } catch (error: any) {
      console.warn(`Model ${model} failed in /api/chat/stream:`, error?.message || error);
      lastError = error;
      // If we already started streaming tokens, don't attempt another model as the output would be duplicated
      if (streamStarted) {
        break;
      }
    }
  }

  console.error("Gemini stream exhausted all models:", lastError);
  const errorMsg = lastError?.message || "Yapay zeka yanıtı oluşturulurken bir hata oluştu.";
  res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
  res.write("data: [DONE]\n\n");
  res.end();
});

// Title Generator Endpoint (Generates 2-4 word chat title in target language)
app.post("/api/chat/title", async (req, res) => {
  const { firstMessage, language = "tr" } = req.body;
  if (!firstMessage || typeof firstMessage !== "string") {
    return res.status(400).json({ title: "Yeni Sohbet" });
  }

  const langName = LANG_NAMES[language] || "Türkçe";

  try {
    const ai = getGeminiClient();
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `Aşağıdaki kullanıcı mesajına göre bu sohbet için 2 ila 4 kelimelik çok kısa, anlaşılır ve ${langName} dilinde bir sohbet başlığı üret. Sadece başlığı yaz, tırnak veya noktalama işareti koyma.\nMesaj: "${firstMessage.slice(0, 300)}"`,
          config: { automaticFunctionCalling: { disable: true } },
        });

        const title = response.text ? response.text.trim().replace(/^["']|["']$/g, "") : "";
        if (title) {
          return res.json({ title: title.slice(0, 40) });
        }
      } catch {
        continue;
      }
    }
    res.json({ title: firstMessage.slice(0, 25) + "..." });
  } catch (err) {
    res.json({ title: firstMessage.slice(0, 25) + "..." });
  }
});

// Gemini Text-to-Speech (TTS) Endpoint
app.post("/api/tts", async (req, res) => {
  const { text, voice = "Kore" } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Metin gereklidir." });
  }

  try {
    const ai = getGeminiClient();
    const allowedVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const voiceName = allowedVoices.includes(voice) ? voice : "Kore";

    // Clean text from Markdown for natural pronunciation
    const cleanText = text
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[*_~#>]/g, "")
      .replace(/[-+*]\s+/g, "")
      .trim()
      .slice(0, 1000);

    if (!cleanText) {
      return res.status(400).json({ error: "Okunacak metin bulunamadı." });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (base64Audio) {
      return res.json({ audio: base64Audio, mimeType, voice: voiceName });
    } else {
      return res.status(500).json({ error: "Ses verisi üretilemedi." });
    }
  } catch (err: any) {
    console.warn("TTS generation error:", err?.message || err);
    return res.status(500).json({ error: err?.message || "TTS hatası" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Türkçe Yapay Zeka Asistanı running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
