import { apiRequest } from "./http";

export function submitResponse(payload: { questionKey: string; answerText: string }) {
  return apiRequest<void>("/api/responses", { method: "POST", json: payload });
}

