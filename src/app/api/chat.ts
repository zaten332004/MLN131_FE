import type { ChatHistoryResponse, ChatSendRequest, ChatSendResponse } from "./types";
import { ApiError, apiRequest } from "./http";
import { loadAuth } from "./storage";
import { findUserById } from "../local/db";
import { appendChatMessage, readChatHistory } from "../local/chat";

function shouldFallback(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 404 || error.status === 501 || error.status >= 500;
  }
  if (error instanceof Error) {
    return /failed to fetch|networkerror|load failed/i.test(error.message || "");
  }
  return true;
}

export async function sendMessage(payload: ChatSendRequest) {
  const trimmed = payload.message.trim();
  if (!trimmed) {
    return { answer: "" };
  }

  try {
    const data = await apiRequest<unknown>("/api/chat/send", { method: "POST", json: { message: trimmed } });
    const answer = (data as any)?.answer;
    return { answer: typeof answer === "string" ? answer : "" };
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    // Local fallback (per-browser).
    const persisted = loadAuth();
    const userId = persisted?.user?.id;
    if (!userId) throw new ApiError("Chưa đăng nhập.", 401, null);
    const user = findUserById(userId);
    if (!user) throw new ApiError("Phiên đăng nhập không hợp lệ.", 401, null);
    if (user.isDisabled) throw new ApiError("Tài khoản đã bị vô hiệu hoá.", 403, null);

    appendChatMessage(userId, "user", trimmed);

    return fetch("/api/ai/chat", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ message: trimmed, userId }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new ApiError(text || `AI request failed (${res.status})`, res.status, text, "/api/ai/chat");
        }
        return (await res.json()) as ChatSendResponse;
      })
      .catch((): ChatSendResponse => ({ answer: "" }))
      .then((response) => {
        const answer = response.answer?.trim() || "";
        if (answer) {
          appendChatMessage(userId, "assistant", answer);
        }
        return { answer };
      });
  }
}

export async function getHistory(page = 1, pageSize = 50) {
  try {
    const data = await apiRequest<unknown>("/api/chat/history", { method: "GET", query: { page, pageSize } });
    if (!data || typeof data !== "object") {
      throw new ApiError("Invalid chat history response.", 502, data);
    }
    return data as ChatHistoryResponse;
  } catch (error) {
    if (!shouldFallback(error)) {
      throw error;
    }

    const persisted = loadAuth();
    const userId = persisted?.user?.id;
    if (!userId) throw new ApiError("Chưa đăng nhập.", 401, null);

    const history = readChatHistory(userId);
    const total = history.messages.length;
    const normalizedPage = Math.max(1, Math.floor(page));
    const normalizedSize = Math.max(1, Math.min(200, Math.floor(pageSize)));
    const start = (normalizedPage - 1) * normalizedSize;
    const items = history.messages.slice().reverse().slice(start, start + normalizedSize);

    const response: ChatHistoryResponse = {
      page: normalizedPage,
      pageSize: normalizedSize,
      total,
      items,
    };
    return response;
  }
}

