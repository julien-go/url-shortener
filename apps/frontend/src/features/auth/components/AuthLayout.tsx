import React from "react";
import { Link } from "react-router-dom";

export function AuthLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 420, margin: "64px auto", padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>URL Shortener</h1>
      <h2 style={{ marginTop: 0, marginBottom: 24 }}>{title}</h2>

      {children}

      <div style={{ marginTop: 16, opacity: 0.8 }}>
        <Link to="/">Back to home</Link>
      </div>
    </div>
  );
}
