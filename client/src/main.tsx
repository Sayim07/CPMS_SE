import React, { StrictMode, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CPMS React Fatal Crash:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#F5EEDB",
          padding: "32px",
          fontFamily: "monospace",
          color: "#000",
          boxSizing: "border-box"
        }}>
          <div style={{
            maxWidth: "800px",
            margin: "0 auto",
            backgroundColor: "#fff",
            border: "3px solid #000",
            boxShadow: "6px 6px 0px 0px #000",
            padding: "24px",
            borderRadius: "6px"
          }}>
            <div style={{
              display: "inline-block",
              backgroundColor: "#FF70A6",
              border: "2px solid #000",
              padding: "4px 12px",
              fontWeight: 900,
              marginBottom: "16px",
              boxShadow: "2px 2px 0px 0px #000"
            }}>
              APPLICATION RUNTIME ERROR
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: 900, margin: "0 0 12px 0" }}>
              {this.state.error?.name || "Error"}: {this.state.error?.message}
            </h1>
            <pre style={{
              backgroundColor: "#18181b",
              color: "#f43f5e",
              padding: "16px",
              borderRadius: "4px",
              overflowX: "auto",
              fontSize: "12px",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap"
            }}>
              {this.state.error?.stack || "No stack trace available"}
            </pre>
            <div style={{ marginTop: "16px" }}>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  backgroundColor: "#FFE600",
                  border: "2px solid #000",
                  padding: "8px 16px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: "3px 3px 0px 0px #000"
                }}
              >
                Clear LocalStorage & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Global unhandled error overlay
window.addEventListener("error", (event) => {
  console.error("Window Error Caught:", event.error);
  const root = document.getElementById("root");
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="min-height:100vh;background:#F5EEDB;padding:32px;font-family:monospace;color:#000;">
        <div style="max-width:800px;margin:0 auto;background:#fff;border:3px solid #000;box-shadow:6px 6px 0px 0px #000;padding:24px;border-radius:6px;">
          <div style="display:inline-block;background:#FF70A6;border:2px solid #000;padding:4px 12px;font-weight:900;margin-bottom:16px;">
            WINDOW ERROR
          </div>
          <h1 style="font-size:18px;font-weight:900;margin:0 0 12px 0;">
            ${event.message}
          </h1>
          <p style="font-size:12px;color:#666;">Source: ${event.filename}:${event.lineno}:${event.colno}</p>
          <pre style="background:#18181b;color:#f43f5e;padding:16px;border-radius:4px;overflow-x:auto;font-size:12px;">
            ${event.error?.stack || event.message}
          </pre>
        </div>
      </div>
    `;
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
