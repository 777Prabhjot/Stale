"use client";

import { useEffect } from "react";

/** Last-resort boundary; replaces the root layout, so it can't rely on globals.css. */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f7f4",
          color: "#18201c",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <title>Something went wrong</title>
        <div>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: "2rem", margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#6b756f", marginTop: "0.75rem" }}>Reload the page to try again.</p>
          <button
            type="button"
            onClick={retry}
            style={{
              marginTop: "1.5rem",
              height: 44,
              padding: "0 1.25rem",
              borderRadius: 999,
              border: 0,
              background: "#2d4339",
              color: "#fff",
              fontSize: "0.95rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
