"use client";

import { useState } from "react";
import type { UserData } from "@/app/page";

export default function AuthScreen({ onLogin }: { onLogin: (u: UserData) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch(mode === "login" ? "/api/auth/login" : "/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "login" ? { login: form.username, password: form.password } : form),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.error || "Error"); return; }
      const me = await (await fetch("/api/auth/me")).json();
      if (me.user) onLogin(me.user);
    } catch { setError("Network error"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="neo anim-in" style={{ width: "100%", maxWidth: 400, padding: 32 }}>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="neo-in" style={{ display: "inline-block", padding: 14, borderRadius: 16, marginBottom: 14 }}>
            <svg viewBox="0 0 60 60" width="56" height="56">
              <line x1="20" y1="0" x2="20" y2="60" stroke="var(--grid)" strokeWidth="0.8" />
              <line x1="40" y1="0" x2="40" y2="60" stroke="var(--grid)" strokeWidth="0.8" />
              <line x1="0" y1="20" x2="60" y2="20" stroke="var(--grid)" strokeWidth="0.8" />
              <line x1="0" y1="40" x2="60" y2="40" stroke="var(--grid)" strokeWidth="0.8" />
              <line x1="5" y1="5" x2="16" y2="16" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="16" y1="5" x2="5" y2="16" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="10" r="7" fill="none" stroke="var(--red)" strokeWidth="2.2" />
              <line x1="25" y1="25" x2="36" y2="36" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="36" y1="25" x2="25" y2="36" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="10" cy="50" r="7" fill="none" stroke="var(--red)" strokeWidth="2.2" />
            </svg>
          </div>
          <h1 style={{ ...tf, fontSize: 32, color: "var(--ink)" }}>Tic Tac Toe</h1>
          <p style={{ fontSize: 15, color: "var(--ink-light)", marginTop: 2 }}>on graph paper ✏️</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          {(["login", "register"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`neo-btn ${mode === m ? "pressed" : ""}`}
              style={{ flex: 1, fontSize: 16, color: mode === m ? "var(--blue)" : "var(--ink-light)", fontFamily: "inherit" }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {error && (
          <div className="neo-in" style={{ padding: "10px 14px", marginBottom: 16, color: "var(--red)", fontSize: 14, fontWeight: 700, textAlign: "center", borderRadius: 12 }}>
            ✗ {error}
          </div>
        )}

        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <Field label="Display Name" value={form.displayName} onChange={(v) => setForm({ ...form, displayName: v })} ph="your name" />
              <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} ph="email@example.com" />
            </>
          )}
          <Field label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} ph="username" />
          <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} ph="••••••" />

          <button type="submit" disabled={loading} className="neo-btn-fill"
            style={{ width: "100%", padding: 13, fontSize: 18, marginTop: 6, fontFamily: "inherit", borderRadius: 14, opacity: loading ? 0.6 : 1 }}>
            {loading ? "…" : mode === "login" ? "→ Sign In" : "→ Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a href="/deploy" style={{ fontSize: 14, color: "var(--blue)" }}>🚀 deployment guide</a>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, ph }: { label: string; type?: string; value: string; onChange: (v: string) => void; ph: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--ink-light)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</label>
      <input type={type || "text"} className="neo-input" placeholder={ph} value={value}
        onChange={(e) => onChange(e.target.value)} required minLength={type === "password" ? 6 : undefined}
        style={{ fontSize: 16, fontFamily: "inherit" }} />
    </div>
  );
}
