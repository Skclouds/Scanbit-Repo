/**
 * Catches unhandled errors and promise rejections. Shows friendly message for iOS RangeError (e.g. from Lottie).
 */
import { useEffect, useState } from "react";

function safeMsg(v: unknown): string {
  try {
    const err = v && typeof v === "object" && "error" in v ? (v as { error?: Error }).error : v;
    const obj = (err || v) as Error | undefined;
    if (obj && typeof obj.message === "string") return obj.message.slice(0, 500);
    if (obj && typeof obj === "object" && "message" in obj) return String((obj as Error).message).slice(0, 500);
    return String(v ?? "Unknown").slice(0, 500);
  } catch {
    return "Error";
  }
}

function safeStack(v: unknown): string | undefined {
  try {
    const err = v && typeof v === "object" && "error" in v ? (v as { error?: Error }).error : v;
    const obj = (err || v) as Error | undefined;
    if (obj && typeof obj.stack === "string") return obj.stack.slice(0, 1000);
    return undefined;
  } catch {
    return undefined;
  }
}

const RELOAD_KEY = "__scanbit_error_reload";

function isDevClientError(e: ErrorEvent | PromiseRejectionEvent): boolean {
  try {
    const msg = e instanceof ErrorEvent ? safeMsg(e.error ?? e) : safeMsg((e as PromiseRejectionEvent).reason);
    const str = String(msg || "").toLowerCase();
    if (str.includes("vite") || str.includes("hmr") || str.includes("importing a module script")) return true;
    if (str.includes("maximum call stack size exceeded") && typeof import.meta !== "undefined" && import.meta.env?.DEV) return true;
    if (e instanceof ErrorEvent && e.filename && /vite|hmr|client/.test(e.filename)) return true;
    return false;
  } catch {
    return false;
  }
}

function tryReloadOnce(): boolean {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return false;
    if (window.sessionStorage.getItem(RELOAD_KEY)) return false;
    window.sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

export function GlobalErrorOverlay() {
  const [error, setError] = useState<{ message: string; stack?: string } | null>(null);

  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      if (isDevClientError(e)) return;
      setError((prev) => {
        if (prev) return prev;
        if (tryReloadOnce()) return prev;
        return {
          message: safeMsg(e.error ?? e),
          stack: safeStack(e.error),
        };
      });
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      if (isDevClientError(e)) return;
      setError((prev) => {
        if (prev) return prev;
        if (tryReloadOnce()) return prev;
        return {
          message: safeMsg(e.reason),
          stack: safeStack(e.reason),
        };
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!error) return null;


  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fee2e2",
        color: "#991b1b",
        padding: 16,
        fontSize: 14,
        maxHeight: 320,
        overflow: "auto",
        zIndex: 99999,
        fontFamily: "-apple-system, system-ui, sans-serif",
        borderTop: "2px solid #dc2626",
      }}
    >
      <strong style={{ display: "block", marginBottom: 8 }}>Something went wrong</strong>
      <p style={{ margin: "0 0 12px", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.4 }}>
        Tap &quot;Refresh page&quot; to try again. If it keeps happening, try a new tab or private browsing.
      </p>
      <details style={{ marginBottom: 12, fontSize: 12 }}>
        <summary style={{ cursor: "pointer" }}>Technical details</summary>
        <p style={{ margin: "8px 0 0", fontSize: 11, opacity: 0.9, wordBreak: "break-all" }}>{error.message}</p>
        {error.stack && (
          <pre style={{ margin: "4px 0 0", fontSize: 10, opacity: 0.75, whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: 100, overflow: "auto" }}>
            {error.stack}
          </pre>
        )}
      </details>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            padding: "12px 20px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 600,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Refresh page
        </button>
        <button
          type="button"
          onClick={() => setError(null)}
          style={{
            padding: "12px 20px",
            background: "transparent",
            color: "#991b1b",
            border: "2px solid #dc2626",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
