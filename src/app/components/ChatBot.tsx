import { useEffect, useMemo, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getHistory as getChatHistory, sendMessage as sendChatMessage } from "../api/chat";
import { ApiError } from "../api/http";
import { LOCAL_FALLBACK_ENABLED } from "../api/localFallback";
import { findFaqAnswerLocal } from "../content/chatFaqs";

interface Message {
  id: string | number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "code"; value: string };

type Block =
  | { type: "heading"; level: 1 | 2 | 3; tokens: InlineToken[] }
  | { type: "paragraph"; tokens: InlineToken[] }
  | { type: "ul"; items: InlineToken[][] }
  | { type: "ol"; items: InlineToken[][] };

function tokenizeInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let i = 0;

  const pushText = (value: string) => {
    if (!value) return;
    const last = tokens[tokens.length - 1];
    if (last?.type === "text") {
      last.value += value;
      return;
    }
    tokens.push({ type: "text", value });
  };

  while (i < input.length) {
    const rest = input.slice(i);

    // Inline code: `...`
    if (rest.startsWith("`")) {
      const end = rest.indexOf("`", 1);
      if (end > 0) {
        const inside = rest.slice(1, end);
        if (inside) tokens.push({ type: "code", value: inside });
        i += end + 1;
        continue;
      }
    }

    // Bold: **...**
    if (rest.startsWith("**")) {
      const end = rest.indexOf("**", 2);
      if (end > 1) {
        const inside = rest.slice(2, end);
        if (inside) tokens.push({ type: "bold", value: inside });
        i += end + 2;
        continue;
      }
    }

    pushText(input[i]);
    i += 1;
  }

  return tokens;
}

function parseBlocks(text: string): Block[] {
  const lines = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const joined = paragraph.join(" ").trim();
    paragraph = [];
    if (!joined) return;
    blocks.push({ type: "paragraph", tokens: tokenizeInline(joined) });
  };

  for (let idx = 0; idx < lines.length; idx++) {
    const raw = lines[idx];
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Heading: #/##/###
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      const level = Math.min(3, headingMatch[1].length) as 1 | 2 | 3;
      blocks.push({ type: "heading", level, tokens: tokenizeInline(headingMatch[2].trim()) });
      continue;
    }

    // Unordered list: - item / * item
    const ulMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      const items: InlineToken[][] = [tokenizeInline(ulMatch[1].trim())];
      for (let j = idx + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        const m = next.match(/^[-*]\s+(.*)$/);
        if (!m) break;
        items.push(tokenizeInline(m[1].trim()));
        idx = j;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list: 1. item
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      const items: InlineToken[][] = [tokenizeInline(olMatch[1].trim())];
      for (let j = idx + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        const m = next.match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(tokenizeInline(m[1].trim()));
        idx = j;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
}

function renderInline(tokens: InlineToken[]) {
  return tokens.map((t, idx) => {
    if (t.type === "bold") return <strong key={idx}>{t.value}</strong>;
    if (t.type === "code") {
      return (
        <code key={idx} className="px-1 py-0.5 rounded bg-gray-100 text-gray-800">
          {t.value}
        </code>
      );
    }
    return <span key={idx}>{t.value}</span>;
  });
}

function ChatMarkdown({ text, inverted = false }: { text: string; inverted?: boolean }) {
  const blocks = useMemo(() => parseBlocks(text), [text]);
  const headingClass = inverted ? "text-white" : "text-gray-900";
  const paragraphClass = inverted ? "text-blue-50" : "text-gray-800";
  const listClass = inverted ? "text-blue-50" : "text-gray-800";

  return (
    <div className="space-y-2">
      {blocks.map((b, idx) => {
        if (b.type === "heading") {
          const size = b.level === 1 ? "text-base" : "text-sm";
          return (
            <div key={idx} className={`${size} font-semibold ${headingClass}`}>
              {renderInline(b.tokens)}
            </div>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={idx} className={`list-disc pl-5 space-y-1 ${listClass}`}>
              {b.items.map((it, i) => (
                <li key={i}>{renderInline(it)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={idx} className={`list-decimal pl-5 space-y-1 ${listClass}`}>
              {b.items.map((it, i) => (
                <li key={i}>{renderInline(it)}</li>
              ))}
            </ol>
          );
        }
        return (
          <div key={idx} className={`text-sm leading-relaxed whitespace-pre-wrap ${paragraphClass}`}>
            {renderInline(b.tokens)}
          </div>
        );
      })}
    </div>
  );
}

const FALLBACK_MESSAGE =
  "Mình đã ghi nhận câu hỏi. Bạn thử hỏi theo từ khóa: cơ cấu xã hội - giai cấp, quy luật biến đổi, liên minh giai cấp, nội dung liên minh.";
 
function toChatErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    const body = err.body;
    if (body && typeof body === "object") {
      const message = typeof (body as any).message === "string" ? String((body as any).message) : "";
      const upstream = (body as any).details?.error?.message;
      if (typeof upstream === "string" && upstream.trim()) {
        return message ? `${message} (${upstream.trim()})` : upstream.trim();
      }
      if (message) {
        return message;
      }
    }
    return err.message || `Request failed (${err.status})`;
  }
  if (err instanceof Error) {
    return err.message || "Request failed.";
  }
  return "Request failed.";
}

export function ChatBot() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Chào bạn, mình là trợ lý AI. Bạn có thể hỏi nhanh về Chương 5 để ôn tập.",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const botHints = useMemo(
    () => ["cơ cấu xã hội - giai cấp", "quy luật biến đổi", "liên minh giai cấp", "nội dung liên minh"],
    [],
  );

  // Prevent the underlying page from jumping/scrolling when interacting with the fixed chat UI.
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflowY: body.style.overflowY,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflowY = "scroll";

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      body.style.overflowY = prev.overflowY;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    let cancelled = false;
    getChatHistory(1, 200)
      .then((history) => {
        if (cancelled) return;
        if (!history.items?.length) return;

        const ordered = history.items.slice().reverse();
        setMessages(
          ordered.map((m) => ({
            id: m.id,
            text: m.content,
            sender: m.role === "assistant" ? "bot" : "user",
            timestamp: new Date(m.createdAt),
          })),
        );
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isOpen]);

  if (!isAuthenticated) {
    return null;
  }

  const findResponse = (text: string) => findFaqAnswerLocal(text).trim() || FALLBACK_MESSAGE;

  const handleSend = async () => {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");

    setIsSending(true);
    try {
      const response = await sendChatMessage({ message: trimmed });
      const remoteAnswer = response?.answer?.trim() ? response.answer : "";
      const answer = remoteAnswer || (LOCAL_FALLBACK_ENABLED ? findResponse(trimmed) : "AI chưa sẵn sàng. Vui lòng kiểm tra cấu hình GEMINI_API_KEY.");
      const botMessage: Message = {
        id: Date.now() + 1,
        text: answer,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = toChatErrorMessage(err);
      const botMessage: Message = {
        id: Date.now() + 1,
        text: LOCAL_FALLBACK_ENABLED ? findResponse(trimmed) : errorMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-12 h-12 rounded-full bg-[#0084ff] text-white shadow-xl hover:scale-105 transition-transform z-50"
          aria-label="Mở trợ lý AI"
        >
          <MessageCircle className="mx-auto" size={22} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-4 right-4 w-[min(92vw,360px)] h-[min(70vh,520px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="bg-[#0084ff] text-white rounded-t-2xl px-4 py-3 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Trợ lý AI</h3>
              <p className="text-[11px] text-blue-100">Hỏi nhanh nội dung Chương 5</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center"
              aria-label="Đóng trợ lý AI"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-600">Gợi ý: {botHints.join(" • ")}</div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    message.sender === "user"
                      ? "bg-[#0084ff] text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                  }`}
                >
                  <ChatMarkdown text={message.text} inverted={message.sender === "user"} />
                  <p className={`text-[10px] mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                    {message.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Nhập câu hỏi..."
                disabled={isSending}
                className="flex-1 px-3 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleSend}
                disabled={isSending}
                className="w-10 h-10 rounded-full bg-[#0084ff] text-white flex items-center justify-center hover:bg-[#0077e6] transition-colors"
                aria-label="Gửi tin nhắn"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
