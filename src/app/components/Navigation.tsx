import { Link, useLocation, useNavigate } from "react-router";
import { BookOpen, ClipboardCheck, Gamepad2, LogOut, Settings } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { resolveApiAssetUrl } from "../api/http";
import { useAuth } from "../contexts/AuthContext";

function getInitials(text: string) {
  return text
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function withCacheBust(url: string, cacheKey?: string) {
  if (!url) {
    return "";
  }
  if (/^(data:|blob:)/i.test(url)) {
    return url;
  }
  if (!cacheKey) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(cacheKey)}`;
}

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const links = [
    { path: "/knowledge", label: "Kiến thức", icon: BookOpen },
    { path: "/games", label: "Trò chơi", icon: Gamepad2 },
    { path: "/quiz", label: "Trắc nghiệm", icon: ClipboardCheck },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const avatarLabel = user?.name || user?.email || "User";
  const initials = getInitials(avatarLabel) || "?";
  const avatarSrc = withCacheBust(resolveApiAssetUrl(user?.avatarUrl), user?.updatedAt);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/knowledge" className="flex items-center gap-3">
            <Logo size={34} />
            <span className="font-bold text-lg text-gray-900">Học tập Chính trị</span>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  location.pathname === path ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  location.pathname === "/admin" ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-purple-50"
                }`}
              >
                <Settings size={18} />
                <span>Admin</span>
              </Link>
            )}

            <div className="flex items-center gap-3 ml-2 pl-3 border-l border-gray-200">
              <Link to="/profile" className="flex items-center" title="Hồ sơ">
                <Avatar className="size-9 border border-gray-200">
                  <AvatarImage src={avatarSrc} alt={avatarLabel} />
                  <AvatarFallback className="text-xs text-gray-700">{initials}</AvatarFallback>
                </Avatar>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            {links.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`p-2 rounded-lg transition-all ${
                  location.pathname === path ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-50"
                }`}
                title={label}
              >
                <Icon size={20} />
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`p-2 rounded-lg transition-all ${
                  location.pathname === "/admin" ? "bg-purple-600 text-white" : "text-purple-700 hover:bg-purple-50"
                }`}
                title="Admin"
              >
                <Settings size={20} />
              </Link>
            )}

            <Link to="/profile" className="p-1 rounded-lg hover:bg-gray-50" title="Hồ sơ">
              <Avatar className="size-9 border border-gray-200">
                <AvatarImage src={avatarSrc} alt={avatarLabel} />
                <AvatarFallback className="text-[10px] text-gray-700">{initials}</AvatarFallback>
              </Avatar>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-red-700 hover:bg-red-50"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
