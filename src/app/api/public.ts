import { apiRequest } from "./http";

export function getHome() {
  return apiRequest<unknown>("/api/public/home", { method: "GET", auth: false });
}

