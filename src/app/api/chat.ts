import { apiRequest } from "./http";
import type { ChatHistoryResponse, ChatSendRequest, ChatSendResponse } from "./types";

export function sendMessage(payload: ChatSendRequest) {
  return apiRequest<ChatSendResponse>("/api/chat", { method: "POST", json: payload });
}

export function getHistory(page = 1, pageSize = 50) {
  return apiRequest<ChatHistoryResponse>("/api/chat/history", { method: "GET", query: { page, pageSize } });
}

