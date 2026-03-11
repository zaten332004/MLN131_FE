import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    try {
      (window as any).__MLN131_LAST_ERROR__ = { message: error.message, stack: error.stack, at: new Date().toISOString() };
      sessionStorage.setItem(
        "mln131.lastError.v1",
        JSON.stringify({ message: error.message, stack: error.stack, at: new Date().toISOString() }),
      );
    } catch {
      // ignore
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error.message || "Unknown error";

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900">Ứng dụng gặp lỗi</h1>
          <p className="text-gray-600 mt-2 text-sm">
            Nếu bạn vẫn thấy màn hình trắng, hãy mở DevTools Console và gửi lỗi. Mình cũng lưu lỗi gần nhất vào{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">sessionStorage</code> (key{" "}
            <code className="px-1 py-0.5 bg-gray-100 rounded">mln131.lastError.v1</code>).
          </p>

          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 break-words">
            {message}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-center"
            >
              Về trang chủ
            </a>
            <button
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => this.setState({ error: null })}
            >
              Thử tiếp
            </button>
          </div>
        </div>
      </div>
    );
  }
}
