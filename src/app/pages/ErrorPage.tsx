import { isRouteErrorResponse, Link, useRouteError } from "react-router";

function formatError(err: unknown) {
  if (isRouteErrorResponse(err)) {
    return `${err.status} ${err.statusText}`;
  }
  if (err instanceof Error) {
    return err.message || "Unknown error";
  }
  return typeof err === "string" ? err : "Unknown error";
}

export function ErrorPage() {
  const error = useRouteError();
  const message = formatError(error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900">Không thể hiển thị trang</h1>
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
          <Link
            to="/"
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-center"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

