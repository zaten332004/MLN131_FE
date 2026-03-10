import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ApiError } from "../api/http";
import { login as loginApi, me as meApi, register as registerApi } from "../api/auth";
import { clearAuth, isExpired, loadAuth, saveAuthFromResponse, updatePersistedUser } from "../api/storage";
import type { Role, UserProfileResponse } from "../api/types";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "viewer";
  fullName?: string | null;
  age?: number | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  isDisabled?: boolean;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; user?: User; error?: string }>;
  updateFromProfile: (profile: UserProfileResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const persisted = loadAuth();
    return persisted ? toAuthUser(persisted.user) : null;
  });

  const persisted = loadAuth();
  const isAuthenticated =
    !!user && !!persisted?.accessToken && !isExpired(persisted.expiresAt) && user.isDisabled !== true;

  useEffect(() => {
    const persisted = loadAuth();
    if (!persisted?.accessToken) {
      return;
    }
    if (isExpired(persisted.expiresAt)) {
      clearAuth();
      setUser(null);
      return;
    }

    meApi()
      .then((profile) => {
        const nextUser = toAuthUser(profile);
        if (nextUser.isDisabled) {
          clearAuth();
          setUser(null);
          return;
        }
        updatePersistedUser(profile);
        setUser(nextUser);
      })
      .catch(() => {
        clearAuth();
        setUser(null);
      });
  }, []);

  const login = async (email: string, password: string): Promise<{ ok: boolean; user?: User; error?: string }> => {
    try {
      const response = await loginApi({ email, password });
      const nextUser = toAuthUser(response.user);
      if (nextUser.isDisabled) {
        clearAuth();
        setUser(null);
        return { ok: false, error: "Tài khoản của bạn đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên." };
      }
      saveAuthFromResponse(response);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error) {
      return { ok: false, error: toUserFacingAuthError(error) };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<{ ok: boolean; user?: User; error?: string }> => {
    try {
      const response = await registerApi({ email, password, fullName: name });
      const nextUser = toAuthUser(response.user);
      if (nextUser.isDisabled) {
        clearAuth();
        setUser(null);
        return { ok: false, error: "Tài khoản của bạn đã bị vô hiệu hoá. Vui lòng liên hệ quản trị viên." };
      }
      saveAuthFromResponse(response);
      setUser(nextUser);
      return { ok: true, user: nextUser };
    } catch (error) {
      return { ok: false, error: toUserFacingAuthError(error) };
    }
  };

  const logout = () => {
    setUser(null);
    clearAuth();
  };

  const updateFromProfile = (profile: UserProfileResponse) => {
    const nextUser = toAuthUser(profile);
    if (nextUser.isDisabled) {
      clearAuth();
      setUser(null);
      return;
    }
    updatePersistedUser(profile);
    setUser(nextUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, updateFromProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function toAuthUser(profile: UserProfileResponse): User {
  const role = normalizeRole(profile);
  return {
    id: profile.id,
    email: profile.email,
    role,
    fullName: profile.fullName ?? null,
    age: profile.age ?? null,
    phoneNumber: profile.phoneNumber ?? null,
    avatarUrl: profile.avatarUrl ?? null,
    name: (profile.fullName && profile.fullName.trim()) || profile.email,
    isDisabled: profile.isDisabled ?? false,
    updatedAt: profile.updatedAt,
  };
}

function normalizeRole(profile: UserProfileResponse): Role {
  if (profile.role === "admin" || profile.role === "user" || profile.role === "viewer") {
    return profile.role;
  }

  const roles = Array.isArray(profile.roles) ? profile.roles.map((r) => String(r).toLowerCase()) : [];
  if (roles.includes("admin")) {
    return "admin";
  }
  if (roles.includes("viewer")) {
    return "viewer";
  }
  return "user";
}

function toUserFacingAuthError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return error.message || "Tài khoản không có quyền truy cập hoặc đã bị vô hiệu hoá.";
    }
    if (error.status === 401) {
      return error.message || "Email hoặc mật khẩu không đúng.";
    }
    if (error.status === 404) {
      return `Không tìm thấy API (404). Đang gọi: ${error.url ?? "/api/..."} . Kiểm tra \`VITE_API_BASE_URL\` hoặc proxy \`/api\` trong Vite.`;
    }
    if (error.status >= 500) {
      return "Server đang lỗi. Thử lại sau hoặc kiểm tra backend logs.";
    }
    return error.message || `Đăng nhập thất bại (${error.status}).`;
  }

  if (error instanceof Error) {
    const msg = error.message || "";
    if (/failed to fetch|networkerror|load failed/i.test(msg)) {
      return "Không kết nối được backend (CORS/Network). Kiểm tra backend đang chạy và URL.";
    }
  }

  return "Không đăng nhập được. Vui lòng thử lại.";
}
