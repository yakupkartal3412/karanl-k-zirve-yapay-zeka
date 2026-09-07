/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatSession, LanguageCode } from "../types";
import { PERSONAS } from "../data/personas";
import { AI_ENGINES } from "../data/engines";
import { getTranslation } from "../i18n/translations";

/**
 * Escapes HTML characters to prevent XSS in generated HTML documents
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Simple, robust markdown to HTML converter for export documents
 */
function markdownToHtml(md: string): string {
  let html = escapeHtml(md);

  // Code blocks: ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `<div class="code-container"><div class="code-header"><span>${lang || "kod"}</span></div><pre><code class="lang-${lang}">${code.trim()}</code></pre></div>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`);

  // Headings: ### H3, ## H2, # H1
  html = html.replace(/^### (.*$)/gim, `<h3 class="doc-h3">$1</h3>`);
  html = html.replace(/^## (.*$)/gim, `<h2 class="doc-h2">$1</h2>`);
  html = html.replace(/^# (.*$)/gim, `<h1 class="doc-h1">$1</h1>`);

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, `<strong>$1</strong>`);
  html = html.replace(/\*([^*]+)\*/g, `<em>$1</em>`);

  // Blockquotes: > quote
  html = html.replace(/^> (.*$)/gim, `<blockquote class="doc-quote">$1</blockquote>`);

  // Unordered list items: - item or * item
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, `<li class="list-item">$1</li>`);
  // Wrap sequential list items
  html = html.replace(/(<li class="list-item">.*<\/li>\n?)+/g, `<ul class="doc-list">$&</ul>`);

  // Ordered list items: 1. item
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, `<li class="ordered-item">$1</li>`);
  html = html.replace(/(<li class="ordered-item">.*<\/li>\n?)+/g, `<ol class="doc-ordered-list">$&</ol>`);

  // Paragraphs (double newlines)
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (
        trimmed.startsWith("<div class=\"code-container\"") ||
        trimmed.startsWith("<h1") ||
        trimmed.startsWith("<h2") ||
        trimmed.startsWith("<h3") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<blockquote")
      ) {
        return trimmed;
      }
      return `<p class="doc-paragraph">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

/**
 * Downloads a string as a file in the browser with UTF-8 BOM support
 */
export function triggerFileDownload(filename: string, content: string, mimeType: string) {
  // \uFEFF BOM ensures Turkish and Unicode characters render correctly in text editors (Windows Notepad, etc.)
  const blob = new Blob(["\uFEFF", content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a filename slug from session title
 */
function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9ğüşıöçĞÜŞİÖÇ\-_ ]/gi, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 40) || "sohbet_dokumu";
}

/**
 * 1. Export as HTML / PDF-ready document
 */
export function generateHtmlExport(session: ChatSession, lang: LanguageCode): string {
  const t = getTranslation(lang);
  const personaObj = PERSONAS.find((p) => p.id === session.persona) || PERSONAS[0];
  const personaName = t.personas[session.persona]?.name || personaObj.name;
  const personaBadge = t.personas[session.persona]?.badge || personaObj.badge;
  const engineObj = AI_ENGINES.find((e) => e.id === session.engine) || AI_ENGINES[0];
  const engineName = engineObj.name;
  const createdDate = new Date(session.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const messagesHtml = session.messages
    .map((msg, index) => {
      const isUser = msg.role === "user";
      const timeStr = new Date(msg.timestamp).toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const senderLabel = isUser ? t.userYou : t.assistant;

      let imageHtml = "";
      if (msg.image?.data) {
        imageHtml = `
          <div class="message-image-box">
            <img src="${msg.image.data}" alt="Ekli Görsel" class="message-image" />
          </div>
        `;
      }

      const formattedContent = isUser
        ? `<p class="user-text">${escapeHtml(msg.content).replace(/\n/g, "<br/>")}</p>`
        : markdownToHtml(msg.content);

      return `
        <div class="message-card ${isUser ? "user-card" : "assistant-card"}" id="msg-${index + 1}">
          <div class="message-header">
            <div class="sender-info">
              <span class="avatar-badge ${isUser ? "user-avatar" : "assistant-avatar"}">
                ${isUser ? "👤" : "✨"}
              </span>
              <div>
                <span class="sender-name">${senderLabel}</span>
                ${
                  !isUser
                    ? `<span class="persona-tag">${personaName} (${personaBadge})</span>`
                    : ""
                }
              </div>
            </div>
            <span class="message-time">${timeStr}</span>
          </div>
          <div class="message-body">
            ${imageHtml}
            ${formattedContent}
          </div>
        </div>
      `;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(session.title)} - Sohbet Dökümü</title>
  <style>
    :root {
      --bg-color: #f8fafc;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --border-color: #e2e8f0;
      --primary: #059669;
      --primary-light: #ecfdf5;
      --user-bg: #f1f5f9;
      --code-bg: #1e293b;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #09090b;
        --card-bg: #18181b;
        --text-main: #f4f4f5;
        --text-muted: #a1a1aa;
        --border-color: #27272a;
        --primary: #10b981;
        --primary-light: #064e3b;
        --user-bg: #27272a;
        --code-bg: #000000;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      line-height: 1.6;
      padding: 24px 16px;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    /* Print & Action Bar */
    .action-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 12px 20px;
      border-radius: 14px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .action-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
    }

    .btn-group {
      display: flex;
      gap: 10px;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      background: var(--card-bg);
      color: var(--text-main);
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .action-btn:hover {
      background: var(--user-bg);
    }

    .action-btn.primary {
      background: var(--primary);
      color: #ffffff;
      border-color: var(--primary);
    }

    .action-btn.primary:hover {
      filter: brightness(0.95);
    }

    /* Header document card */
    .doc-header {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      padding: 28px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .doc-title {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 12px;
      line-height: 1.3;
    }

    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      font-size: 12px;
      color: var(--text-muted);
    }

    .meta-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 6px;
      background: var(--user-bg);
      font-weight: 500;
    }

    .meta-badge.model {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 600;
    }

    /* Messages List */
    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .message-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 20px 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .user-card {
      border-left: 4px solid var(--text-muted);
      background: var(--user-bg);
    }

    .assistant-card {
      border-left: 4px solid var(--primary);
    }

    .message-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--border-color);
    }

    .sender-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar-badge {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      background: var(--card-bg);
      border: 1px solid var(--border-color);
    }

    .sender-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
    }

    .persona-tag {
      font-size: 11px;
      color: var(--primary);
      font-weight: 600;
      margin-left: 6px;
      padding: 2px 6px;
      background: var(--primary-light);
      border-radius: 4px;
    }

    .message-time {
      font-size: 11px;
      color: var(--text-muted);
    }

    .message-body {
      font-size: 14.5px;
      color: var(--text-main);
      line-height: 1.7;
    }

    .message-image-box {
      margin-bottom: 14px;
    }

    .message-image {
      max-width: 100%;
      max-height: 320px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      object-fit: cover;
    }

    .user-text {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 15px;
    }

    /* Markdown Formats */
    .doc-paragraph {
      margin-bottom: 12px;
    }
    .doc-paragraph:last-child {
      margin-bottom: 0;
    }

    .doc-h1 { font-size: 20px; font-weight: 700; margin: 18px 0 10px; }
    .doc-h2 { font-size: 17px; font-weight: 700; margin: 16px 0 8px; }
    .doc-h3 { font-size: 15px; font-weight: 600; margin: 14px 0 6px; }

    .doc-list, .doc-ordered-list {
      margin: 10px 0 14px 24px;
    }
    .list-item, .ordered-item {
      margin-bottom: 6px;
    }

    .doc-quote {
      border-left: 3px solid var(--primary);
      padding: 8px 14px;
      margin: 12px 0;
      background: var(--user-bg);
      border-radius: 0 6px 6px 0;
      color: var(--text-muted);
      font-style: italic;
    }

    .inline-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12.5px;
      background: var(--user-bg);
      border: 1px solid var(--border-color);
      padding: 2px 6px;
      border-radius: 4px;
      color: #e11d48;
    }

    .code-container {
      background: var(--code-bg);
      color: #e2e8f0;
      border-radius: 10px;
      margin: 14px 0;
      overflow: hidden;
      border: 1px solid #334155;
    }

    .code-header {
      background: #0f172a;
      padding: 6px 14px;
      font-size: 11px;
      text-transform: uppercase;
      color: #94a3b8;
      font-weight: 600;
      border-bottom: 1px solid #334155;
    }

    pre {
      padding: 14px;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      line-height: 1.5;
    }

    .doc-footer {
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
    }

    /* Print styling: Perfect PDF generation */
    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .action-bar {
        display: none !important;
      }
      .container {
        max-width: 100% !important;
      }
      .doc-header, .message-card {
        box-shadow: none !important;
        border: 1px solid #cbd5e1 !important;
        page-break-inside: avoid;
      }
      .user-card {
        background-color: #f8fafc !important;
      }
      .assistant-card {
        background-color: #ffffff !important;
      }
      .code-container {
        background: #f1f5f9 !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
      }
      .code-header {
        background: #e2e8f0 !important;
        color: #475569 !important;
      }
      .action-btn {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Quick actions (hidden on print) -->
    <div class="action-bar">
      <div class="action-title">📄 Sohbet Dökümü Hazır</div>
      <div class="btn-group">
        <button onclick="window.print()" class="action-btn primary">
          🖨️ Yazdır / PDF Olarak Kaydet
        </button>
      </div>
    </div>

    <!-- Document Header -->
    <header class="doc-header">
      <h1 class="doc-title">${escapeHtml(session.title)}</h1>
      <div class="meta-row">
        <span class="meta-badge">📅 ${createdDate}</span>
        <span class="meta-badge model">⚡ ${engineName}</span>
        <span class="meta-badge">🎭 ${personaName}</span>
        <span class="meta-badge">💬 ${(session.messages || []).length} mesaj</span>
      </div>
    </header>

    <!-- Messages -->
    <main class="messages-list">
      ${messagesHtml}
    </main>

    <!-- Footer -->
    <footer class="doc-footer">
      <p>Bu döküm <strong>Dark Peak - ${engineName}</strong> ile oluşturulmuştur. • ${new Date().toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}</p>
    </footer>
  </div>
</body>
</html>`;
}

/**
 * 2. Export as High-Quality Markdown (.md)
 */
export function generateMarkdownExport(session: ChatSession, lang: LanguageCode): string {
  const t = getTranslation(lang);
  const personaObj = PERSONAS.find((p) => p.id === session.persona) || PERSONAS[0];
  const personaName = t.personas[session.persona]?.name || personaObj.name;
  const personaBadge = t.personas[session.persona]?.badge || personaObj.badge;
  const engineObj = AI_ENGINES.find((e) => e.id === session.engine) || AI_ENGINES[0];
  const engineName = engineObj.name;
  const createdDate = new Date(session.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let md = `# 💬 ${session.title}\n\n`;
  md += `> **Tarih:** ${createdDate}  \n`;
  md += `> **Motor (Model):** ${engineName}  \n`;
  md += `> **Rol:** ${personaName} (${personaBadge})  \n`;
  md += `> **Toplam Mesaj:** ${(session.messages || []).length}  \n\n`;
  md += `---\n\n`;

  (session.messages || []).forEach((msg, idx) => {
    const isUser = msg.role === "user";
    const timeStr = new Date(msg.timestamp).toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isUser) {
      md += `### 👤 ${t.userYou} *(${timeStr})*\n\n`;
      if (msg.image) {
        md += `> 🖼️ *[Görsel eklendi - ${msg.image.mimeType}]*\n\n`;
      }
      md += `${msg.content}\n\n`;
    } else {
      md += `### ✨ ${t.assistant} — ${personaName} *(${timeStr})*\n\n`;
      md += `${msg.content}\n\n`;
    }

    if (idx < (session.messages || []).length - 1) {
      md += `---\n\n`;
    }
  });

  md += `\n---\n*Bu döküm Dark Peak AI (${engineName}) ile oluşturulmuştur.*  \n`;
  return md;
}

/**
 * 3. Export as Clean Plain Text (.txt)
 */
export function generateTextExport(session: ChatSession, lang: LanguageCode): string {
  const t = getTranslation(lang);
  const personaObj = PERSONAS.find((p) => p.id === session.persona) || PERSONAS[0];
  const personaName = t.personas[session.persona]?.name || personaObj.name;
  const engineObj = AI_ENGINES.find((e) => e.id === session.engine) || AI_ENGINES[0];
  const engineName = engineObj.name;
  const createdDate = new Date(session.createdAt).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const separatorDouble = "=".repeat(75);
  const separatorSingle = "-".repeat(75);

  let txt = `${separatorDouble}\n`;
  txt += `SOHBET RAPORU: ${session.title.toUpperCase()}\n`;
  txt += `Tarih: ${createdDate} | Motor: ${engineName}\n`;
  txt += `Rol / Persona: ${personaName} | Toplam Mesaj: ${(session.messages || []).length}\n`;
  txt += `${separatorDouble}\n\n`;

  (session.messages || []).forEach((msg, idx) => {
    const isUser = msg.role === "user";
    const timeStr = new Date(msg.timestamp).toLocaleTimeString(lang === "tr" ? "tr-TR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const roleName = isUser ? `[${t.userYou.toUpperCase()}]` : `[${t.assistant.toUpperCase()} - ${personaName}]`;
    txt += `${roleName} • ${timeStr}\n`;
    if (msg.image) {
      txt += `(Ekli Görsel: ${msg.image.mimeType})\n`;
    }
    txt += `${msg.content}\n\n`;

    if (idx < (session.messages || []).length - 1) {
      txt += `${separatorSingle}\n\n`;
    }
  });

  txt += `${separatorDouble}\n`;
  txt += `Dark Peak AI (${engineName}) tarafından dışa aktarıldı.\n`;
  txt += `${separatorDouble}\n`;

  return txt;
}

/**
 * 4. Export as JSON backup (.json)
 */
export function generateJsonExport(session: ChatSession): string {
  const engineObj = AI_ENGINES.find((e) => e.id === session.engine) || AI_ENGINES[0];
  const exportPayload = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    session: {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      engine: session.engine || "prime-core-fast",
      engineName: engineObj.name,
      persona: session.persona,
      customSystemPrompt: session.customSystemPrompt,
      messageCount: (session.messages || []).length,
      messages: session.messages || [],
    },
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Unified export runner
 */
export function exportChatSession(
  session: ChatSession,
  format: "html" | "markdown" | "text" | "json",
  lang: LanguageCode
) {
  const baseName = sanitizeFilename(session.title);

  switch (format) {
    case "html": {
      const content = generateHtmlExport(session, lang);
      triggerFileDownload(`${baseName}.html`, content, "text/html");
      break;
    }
    case "markdown": {
      const content = generateMarkdownExport(session, lang);
      triggerFileDownload(`${baseName}.md`, content, "text/markdown");
      break;
    }
    case "text": {
      const content = generateTextExport(session, lang);
      triggerFileDownload(`${baseName}.txt`, content, "text/plain");
      break;
    }
    case "json": {
      const content = generateJsonExport(session);
      triggerFileDownload(`${baseName}.json`, content, "application/json");
      break;
    }
  }
}
