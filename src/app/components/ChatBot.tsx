import { useMemo, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { sendMessage as sendChatMessage } from "../api/chat";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const BOT_RESPONSES: Record<string, string> = {
  "cơ cấu xã hội":
    "Cơ cấu xã hội là tổng thể các cộng đồng người cùng các mối quan hệ xã hội giữa các cộng đồng đó.",
  "cơ cấu xã hội - giai cấp":
    "Cơ cấu xã hội - giai cấp là hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội nhất định.",
  "giai cấp công nhân":
    "Giai cấp công nhân giữ vai trò lãnh đạo thông qua Đảng, đại diện cho lực lượng sản xuất tiên tiến.",
  "giai cấp nông dân":
    "Giai cấp nông dân là đồng minh chiến lược của công nhân, có vị trí quan trọng trong nông nghiệp, nông thôn.",
  "trí thức":
    "Đội ngũ trí thức là lực lượng lao động sáng tạo, cầu nối giữa lý luận và thực tiễn.",
  "liên minh giai cấp":
    "Liên minh giai cấp là sự liên kết giữa công nhân, nông dân và trí thức để thực hiện mục tiêu xây dựng CNXH.",
  "doanh nhân":
    "Đội ngũ doanh nhân đóng góp vào tăng trưởng GDP, tạo việc làm và thúc đẩy đổi mới sáng tạo.",
  "kết luận":
    "Củng cố khối liên minh giai cấp, tầng lớp là điều kiện chiến lược để xây dựng xã hội công bằng, dân chủ, văn minh.",
};

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
    () => ["cơ cấu xã hội", "liên minh giai cấp", "giai cấp công nhân", "trí thức"],
    [],
  );

  if (!isAuthenticated) {
    return null;
  }

  const findResponse = (text: string) => {
    const normalized = text.toLowerCase();
    for (const [keyword, answer] of Object.entries(BOT_RESPONSES)) {
      if (normalized.includes(keyword)) {
        return answer;
      }
    }
    return "Mình đã ghi nhận câu hỏi. Bạn thử hỏi theo từ khóa: cơ cấu xã hội, liên minh giai cấp, công nhân, nông dân, trí thức.";
  };

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
      const botMessage: Message = {
        id: Date.now() + 1,
        text: response?.answer ? response.answer : findResponse(trimmed),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: findResponse(trimmed),
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

          <div className="px-4 py-2 border-b border-gray-100 text-xs text-gray-600">
            Gợi ý: {botHints.join(" • ")}
          </div>

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
                  <p>{message.text}</p>
                  <p className={`text-[10px] mt-1 ${message.sender === "user" ? "text-blue-100" : "text-gray-400"}`}>
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
