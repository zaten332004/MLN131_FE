import { type ComponentType, useCallback, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router";
import { Activity, Clock, RefreshCcw, Search, Shield, UserCheck, UserX, Users } from "lucide-react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { useAuth } from "../contexts/AuthContext";
import { getRealtimeStats, listUsers, setUserDisabled } from "../api/admin";
import type { AdminUserResponse, RealtimeStatsResponse } from "../api/types";
import { onLocalEvent } from "../local/events";

function formatShortDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function normalizeRoles(roles?: string[]) {
  const list = Array.isArray(roles) ? roles.map((r) => String(r).toLowerCase()) : [];
  if (!list.length) {
    return ["user"];
  }
  return Array.from(new Set(list));
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<RealtimeStatsResponse | null>(null);
  const [statsError, setStatsError] = useState<string>("");
  const [statsLoading, setStatsLoading] = useState(false);

  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string>("");

  const refreshStats = useCallback(async () => {
    if (!user || user.role !== "admin") {
      return;
    }

    setStatsLoading(true);
    try {
      const next = await getRealtimeStats();
      setStatsError("");
      setStats(next);
    } catch (e) {
      setStatsError(e instanceof Error ? e.message : "Không tải được realtime stats.");
    } finally {
      setStatsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    refreshStats();
    const offPresence = onLocalEvent("presence-updated", () => refreshStats());
    const offPageview = onLocalEvent("pageview", () => refreshStats());
    const offChat = onLocalEvent("chat-updated", () => refreshStats());
    const interval = window.setInterval(() => refreshStats(), 5_000);

    return () => {
      offPresence();
      offPageview();
      offChat();
      window.clearInterval(interval);
    };
  }, [refreshStats]);

  const refreshUsers = useCallback(
    async (query = q) => {
      setUsersLoading(true);
      setUsersError("");
      try {
        const next = await listUsers(query.trim() ? query.trim() : undefined);
        setUsers(next);
      } catch (e) {
        setUsersError(e instanceof Error ? e.message : "Không tải được danh sách người dùng.");
      } finally {
        setUsersLoading(false);
      }
    },
    [q],
  );

  useEffect(() => {
    if (!user || user.role !== "admin") {
      return;
    }

    refreshUsers("");
    const off = onLocalEvent("users-updated", () => refreshUsers(""));
    const interval = window.setInterval(() => refreshUsers(q), 10_000);

    return () => {
      off();
      window.clearInterval(interval);
    };
  }, [q, refreshUsers, user]);

  if (!user || user.role !== "admin") {
    return <Navigate to="/knowledge" replace />;
  }

  const avgSessionMinutes = stats ? Math.round((stats.avgSessionDurationSecondsLast24h / 60) * 10) / 10 : 0;

  const usersSorted = useMemo(() => {
    const collator = new Intl.Collator("vi-VN");
    return users
      .slice()
      .sort(
        (a, b) =>
          Number(!!a.isDisabled) - Number(!!b.isDisabled) || collator.compare(a.email ?? "", b.email ?? ""),
      );
  }, [users]);

  const handleToggleDisabled = async (target: AdminUserResponse) => {
    if (target.id === user.id) {
      setUsersError("Không thể tự vô hiệu hoá chính mình.");
      return;
    }

    const currentDisabled = !!target.isDisabled;
    const nextDisabled = !currentDisabled;
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, isDisabled: nextDisabled } : u)));

    try {
      await setUserDisabled(target.id, nextDisabled);
      setUsersError("");
    } catch (e) {
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, isDisabled: currentDisabled } : u)));
      setUsersError(e instanceof Error ? e.message : "Không cập nhật được trạng thái vô hiệu hoá.");
    }
  };

  const handleChangeRole = async (target: AdminUserResponse, role: "admin" | "user" | "viewer") => {
    if (target.id === user.id) {
      setUsersError("Không thể thay đổi role của chính mình.");
      return;
    }

    const previous = normalizeRoles(target.roles)[0] as any;
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, roles: [role] } : u)));

    try {
      throw new Error("Role changes are disabled.");
      setUsersError("");
    } catch (e) {
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, roles: [previous] } : u)));
      setUsersError(e instanceof Error ? e.message : "Không cập nhật được role.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Quản trị viên</h1>
          <p className="text-gray-600 mt-2">
          
            {stats?.asOf ? ` (Cập nhật lúc ${formatShortDateTime(stats.asOf)})` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={refreshStats}
              disabled={statsLoading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCcw size={18} className={statsLoading ? "animate-spin" : ""} />
              {statsLoading ? "Refreshing..." : "Refresh stats"}
            </button>
          </div>
          {statsError && <p className="text-sm text-red-600 mt-2">{statsError}</p>}
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Activity}
            title="Tổng lượt truy cập"
            value={Number((stats as any)?.totalPageviews ?? 0).toLocaleString()}
            tone="blue"
          />
          <StatCard
            icon={Clock}
            title="Truy cập (24h)"
            value={Number((stats as any)?.pageviewsLast24h ?? 0).toLocaleString()}
            tone="cyan"
          />
          <StatCard icon={Users} title="Visitors online" value={(stats?.visitorsOnline ?? 0).toString()} tone="blue" />
          <StatCard
            icon={Activity}
            title="Logged-in online"
            value={(stats?.loggedInOnline ?? 0).toString()}
            tone="green"
          />
          <StatCard
            icon={Shield}
            title="Đã chat với AI (total)"
            value={(stats?.distinctUsersAnsweredTotal ?? 0).toLocaleString()}
            tone="purple"
          />
          <StatCard
            icon={Shield}
            title="Đã chat với AI (24h)"
            value={(stats?.distinctUsersAnsweredLast24h ?? 0).toLocaleString()}
            tone="indigo"
          />
          <StatCard icon={Clock} title="Avg session (24h, phút)" value={avgSessionMinutes.toString()} tone="amber" />
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Danh sách người dùng</h2>
              <p className="text-sm text-gray-600">Có thể tìm theo email/tên.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full sm:w-72 pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <button
                onClick={() => refreshUsers(q)}
                disabled={usersLoading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCcw size={18} />
                {usersLoading ? "Đang tải..." : "Tải"}
              </button>
            </div>
          </div>

          {usersError && <p className="text-sm text-red-600 mb-3">{usersError}</p>}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="py-2 text-sm text-gray-600 font-semibold">Họ tên</th>
                  <th className="py-2 text-sm text-gray-600 font-semibold">Email</th>
                  <th className="py-2 text-sm text-gray-600 font-semibold">Role</th>
                  <th className="py-2 text-sm text-gray-600 font-semibold">Trạng thái</th>
                  <th className="py-2 text-sm text-gray-600 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {usersSorted.map((u) => {
                  const roles = normalizeRoles(u.roles);
                  const isAdmin = roles.includes("admin");
                  const disabled = !!u.isDisabled;
                  return (
                    <tr key={u.id} className="border-b border-gray-100">
                      <td className="py-3 text-sm text-gray-800">{u.fullName || u.userName || "—"}</td>
                      <td className="py-3 text-sm text-gray-700">{u.email}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isAdmin ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {roles.join(", ")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        {disabled ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">Vô hiệu hoá</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Hoạt động</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleDisabled(u)}
                          disabled={usersLoading || u.id === user.id}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors disabled:opacity-50 ${
                            disabled
                              ? "border-green-200 text-green-700 hover:bg-green-50"
                              : "border-red-200 text-red-700 hover:bg-red-50"
                          }`}
                          title={u.id === user.id ? "Không thể tự vô hiệu hoá" : undefined}
                        >
                          {disabled ? <UserCheck size={18} /> : <UserX size={18} />}
                          {disabled ? "Kích hoạt" : "Vô hiệu hoá"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!usersSorted.length && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                      {usersLoading ? "Đang tải..." : "Không có dữ liệu."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-900">Thông tin nhóm</h2>
            <p className="text-sm text-gray-600">Thành viên, phân công và công cụ AI sử dụng.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Thành viên, MSSV, task</h3>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-sm text-gray-600 font-semibold">Thành viên</th>
                      <th className="px-4 py-3 text-sm text-gray-600 font-semibold whitespace-nowrap">MSSV</th>
                      <th className="px-4 py-3 text-sm text-gray-600 font-semibold">Task</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">Nguyễn Nhật Minh</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">SE173035</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Chuẩn bị slide, lọc nội dung, tìm kiếm hình ảnh
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">Nguyễn Mạnh Hoàng Huy</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">SE171399</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Chuẩn bị slide, trò chơi, lọc nội dung</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">Nguyễn Anh Kiệt</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">SE173510</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Lọc nội dung, chuyển thành UI, tìm hình ảnh</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">Phạm Minh Nhựt</td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">SE184520</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        Lọc nội dung, hoàn thành tính năng web, phục chế hình ảnh
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">AI sử dụng</h3>
              <div className="border border-gray-100 rounded-xl p-4">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li>
                    <span className="font-semibold text-gray-900">NotbookLM:</span> tìm nội dung chính
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">Gemini:</span> phục chế hình ảnh trắng đen thành hình ảnh
                    có màu, tóm tắt lại nội dung để đưa lên web
                  </li>
                  <li>
                    <span className="font-semibold text-gray-900">Codex:</span> hỗ trợ hoàn thiện web
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  icon: Icon,
  title,
  value,
  tone,
  live = false,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  value: string;
  tone: "blue" | "green" | "purple" | "amber" | "cyan" | "pink" | "indigo" | "emerald";
  live?: boolean;
}) {
  const toneMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
    cyan: "bg-cyan-100 text-cyan-700",
    pink: "bg-pink-100 text-pink-700",
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
  };

  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
          <Icon size={20} />
        </div>
        {live && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </article>
  );
}
