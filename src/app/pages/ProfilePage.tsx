import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Save } from "lucide-react";
import { Navigate } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { AvatarCropperModal } from "../components/AvatarCropperModal";
import { Footer } from "../components/Footer";
import { Navigation } from "../components/Navigation";
import { resolveApiAssetUrl } from "../api/http";
import { updateProfile, uploadAvatar } from "../api/profile";
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
  if (!cacheKey) {
    return url;
  }
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${encodeURIComponent(cacheKey)}`;
}

export function ProfilePage() {
  const { user, isAuthenticated, updateFromProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const label = user?.fullName || user?.name || user?.email || "User";
  const initials = useMemo(() => getInitials(label) || "?", [label]);
  const avatarSrc = useMemo(
    () => withCacheBust(resolveApiAssetUrl(user?.avatarUrl), user?.updatedAt),
    [user?.avatarUrl, user?.updatedAt],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    setEmail(user.email || "");
    setFullName(user.fullName || user.name || "");
    setAge(user.age == null ? "" : String(user.age));
    setPhoneNumber(user.phoneNumber || "");
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const parsedAge = age.trim() ? Number(age) : undefined;
    if (age.trim() && (!Number.isFinite(parsedAge) || parsedAge < 0)) {
      setSaving(false);
      setError("Tuổi không hợp lệ.");
      return;
    }

    try {
      const updated = await updateProfile({
        email: email.trim() || undefined,
        fullName: fullName.trim() || undefined,
        age: parsedAge,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      updateFromProfile(updated);
      setSuccess("Đã cập nhật thông tin.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cập nhật thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPick = async (file: File) => {
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      const updated = await uploadAvatar(file);
      updateFromProfile(updated);
      setSuccess("Đã cập nhật ảnh đại diện.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ</h1>
          <p className="text-gray-600 mt-1">Cập nhật thông tin cá nhân và ảnh đại diện.</p>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 mb-4">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 mb-4">
            {success}
          </div>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-5">
            <Avatar className="size-16 border border-gray-200">
              <AvatarImage src={avatarSrc} alt={label} />
              <AvatarFallback className="text-lg text-gray-700">{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Role: {user?.role}</p>
            </div>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer">
              <Camera size={18} />
              <span className="text-sm">{uploading ? "Đang tải..." : "Đổi avatar"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  if (!next) {
                    return;
                  }
                  setCropFile(next);
                  setCropOpen(true);
                }}
              />
            </label>
          </div>
        </section>

        <AvatarCropperModal
          open={cropOpen}
          file={cropFile}
          onClose={() => {
            if (uploading) {
              return;
            }
            setCropOpen(false);
            setCropFile(null);
          }}
          onCropped={handleAvatarPick}
        />

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              type="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="fullName">
              Họ và tên
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              type="text"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="age">
                Tuổi
              </label>
              <input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                type="number"
                min={0}
                placeholder="18"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="phoneNumber">
                Số điện thoại
              </label>
              <input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                type="tel"
                placeholder="09xxxxxxxx"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
