export type Role = "admin" | "user" | "viewer";

export interface UserProfileResponse {
  id: string;
  email: string;
  userName?: string;
  fullName?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  role?: Role;
  roles?: Array<Role | string>;
  avatarUrl?: string | null;
  isDisabled?: boolean;
  emailConfirmed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAt: string | number;
  user: UserProfileResponse;
}

export interface ContentPageSummary {
  slug: string;
  title: string;
  updatedAt: string;
  createdAt: string;
}

export interface ContentPageDetail {
  slug: string;
  title: string;
  bodyMarkdown: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSendRequest {
  message: string;
}

export interface ChatSendResponse {
  answer: string;
}

export interface ChatHistoryResponse<TItem = unknown> {
  page: number;
  pageSize: number;
  total: number;
  items: TItem[];
}

export interface TrackPageviewRequest {
  path: string;
  referrer?: string;
}

export interface RealtimeStatsResponse {
  asOf: string;
  visitorsOnline: number;
  loggedInOnline: number;
  distinctUsersAnsweredTotal: number;
  distinctUsersAnsweredLast24h: number;
  avgSessionDurationSecondsLast24h: number;
  totalPageviews: number;
  pageviewsLast24h: number;
  pageviewsLast5m: number;
  messagesTotal: number;
  messagesLast24h: number;
}

export interface AdminUserResponse {
  id: string;
  email: string;
  userName?: string;
  fullName?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isDisabled: boolean;
  emailConfirmed?: boolean;
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}
