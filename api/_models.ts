export type Role = "admin" | "user" | "viewer";

export interface KvUser {
  id: string;
  email: string;
  fullName?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isDisabled: boolean;
  createdAt: string;
  updatedAt: string;
  passwordSalt: string;
  passwordHash: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

