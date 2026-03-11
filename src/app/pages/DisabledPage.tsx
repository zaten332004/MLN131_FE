import { useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { AlertTriangle, LogIn } from "lucide-react";
import { deleteDisabledNotice, loadDisabledNotice } from "../local/db";
import { Logo } from "../components/Logo";

export function DisabledPage() {
  const navigate = useNavigate();
  const notice = useMemo(() => loadDisabledNotice(), []);

  if (!notice) {
    return <Navigate to="/" replace />;
  }

  const at = new Date(notice.at);
  const atLabel = Number.isNaN(at.getTime()) ? notice.at : at.toLocaleString("vi-VN");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={60} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tài khoản bị vô hiệu hoá</h1>
          <p className="text-gray-600">Bạn cần chọn tài khoản khác để tiếp tục sử dụng hệ thống.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
            <div className="text-sm text-red-900">
              <p>
                <strong>{notice.email}</strong> đã bị vô hiệu hoá.
              </p>
              <p className="mt-1 text-red-800">Thời điểm: {atLabel}</p>
              {notice.reason && <p className="mt-1 text-red-800">Lý do: {notice.reason}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                deleteDisabledNotice();
                navigate("/login", { replace: true });
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <LogIn size={18} />
              Đăng nhập tài khoản khác
            </button>
            <Link
              to="/"
              onClick={() => deleteDisabledNotice()}
              className="flex-1 inline-flex items-center justify-center px-4 py-3 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

