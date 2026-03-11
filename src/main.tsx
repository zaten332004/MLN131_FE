
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  window.addEventListener("error", (e) => {
    try {
      const err = e.error instanceof Error ? e.error : new Error(String(e.message || "Unknown error"));
      sessionStorage.setItem(
        "mln131.lastError.v1",
        JSON.stringify({ message: err.message, stack: err.stack, at: new Date().toISOString() }),
      );
    } catch {
      // ignore
    }
  });

  window.addEventListener("unhandledrejection", (e) => {
    try {
      const reason = (e as PromiseRejectionEvent).reason;
      const err = reason instanceof Error ? reason : new Error(typeof reason === "string" ? reason : "Unhandled rejection");
      sessionStorage.setItem(
        "mln131.lastError.v1",
        JSON.stringify({ message: err.message, stack: err.stack, at: new Date().toISOString() }),
      );
    } catch {
      // ignore
    }
  });

  createRoot(document.getElementById("root")!).render(<App />);
  
