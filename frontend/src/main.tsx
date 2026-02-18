import "./index.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { SiteSettingsProvider } from "./context/SiteSettingsContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App";

if (typeof window !== "undefined" && (window as any).__scanbitLoadTimeout) {
  clearTimeout((window as any).__scanbitLoadTimeout);
  (window as any).__scanbitLoadTimeout = null;
}

const FallbackUI = ({ msg }: { msg: string }) => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: 24, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', textAlign: 'center',
  }}>
    <h1 style={{ fontSize: 20, marginBottom: 12, color: '#1f2937' }}>{msg}</h1>
    <button
      onClick={() => window.location.reload()}
      style={{ padding: '12px 24px', fontSize: 16, backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
    >
      Refresh
    </button>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="padding:2rem;text-align:center;font-family:system-ui">Failed to load. Please refresh.</div>';
} else {
  try {
    if (typeof window !== "undefined") {
      try { (window as any).React = React; } catch {}
    }
    // StrictMode disabled: avoids double-invoking effects/render on iOS Safari (stack pressure).
    createRoot(rootElement).render(
      <ErrorBoundary fallback={<FallbackUI msg="Something went wrong. Please refresh." />}>
        <SiteSettingsProvider>
          <App />
        </SiteSettingsProvider>
      </ErrorBoundary>
    );
    // Clear one-time reload flag after app has been up (so next visit gets one retry again)
    if (typeof window !== "undefined" && window.sessionStorage) {
      setTimeout(() => {
        try { window.sessionStorage.removeItem("__scanbit_error_reload"); } catch {}
      }, 4000);
    }
  } catch (_err) {
    rootElement.innerHTML = '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem;font-family:-apple-system,sans-serif;text-align:center"><h2 style="margin:0 0 0.5rem">Unable to load</h2><p style="color:#6b7280;margin:0 0 1rem">Please try refreshing.</p><button onclick="location.reload()" style="padding:12px 24px;background:#f97316;color:white;border:none;border-radius:8px;cursor:pointer;font-size:16px">Refresh</button></div>';
  }
}
