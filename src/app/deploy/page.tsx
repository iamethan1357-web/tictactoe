import { Metadata } from "next";

export const metadata: Metadata = { title: "Deploy Guide", description: "Neon + Vercel deployment" };

export default function DeployGuidePage() {
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "28px 16px", paddingLeft: 66 }}>
        <div className="neo" style={{ textAlign: "center", marginBottom: 22, padding: 32 }}>
          <h1 style={{ ...tf, fontSize: 32 }}>🚀 Deploy Guide</h1>
          <p style={{ fontSize: 15, color: "var(--ink-mid)", marginTop: 4 }}>Neon + Vercel — free, 10 min</p>
        </div>

        <Step n={1} t="Create Neon Database">
          <p style={p}>Go to <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" style={a}>neon.tech</a> → Sign up → Create project → Copy connection string</p>
        </Step>
        <Step n={2} t="Push to GitHub">
          <Code v={`git init && git add . && git commit -m "init"\ngit remote add origin https://github.com/YOU/tictactoe.git\ngit push -u origin main`} />
        </Step>
        <Step n={3} t="Deploy to Vercel">
          <p style={p}>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={a}>vercel.com</a> → Import → Add env vars: <code>DATABASE_URL</code> and <code>JWT_SECRET</code> → Deploy</p>
        </Step>
        <Step n={4} t="Create Tables">
          <p style={p}>Neon SQL Editor → paste &amp; run:</p>
          <Code v={SQL} />
        </Step>
        <Step n={5} t="Done! 🎉"><p style={p}>Share the URL and play!</p></Step>

        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <a href="/" className="neo-btn-fill" style={{ display: "inline-block", padding: "12px 32px", fontSize: 17, textDecoration: "none", fontFamily: "'Patrick Hand', cursive", borderRadius: 14 }}>🎮 back to game</a>
        </div>
      </div>
    </div>
  );
}

function Step({ n, t, children }: { n: number; t: string; children: React.ReactNode }) {
  return (
    <div className="neo" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div className="neo-in" style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 16, borderRadius: 10, flexShrink: 0, color: "var(--blue)" }}>{n}</div>
        <h2 style={{ fontFamily: "'Architects Daughter', cursive", fontSize: 20 }}>{t}</h2>
      </div>
      {children}
    </div>
  );
}

function Code({ v }: { v: string }) {
  return <div className="neo-in" style={{ padding: 14, marginTop: 8, overflow: "auto", borderRadius: 12 }}><pre style={{ margin: 0, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "monospace", color: "var(--ink)" }}>{v}</pre></div>;
}

const p: React.CSSProperties = { fontSize: 15, color: "var(--ink)", lineHeight: 1.7 };
const a: React.CSSProperties = { color: "var(--blue)", fontWeight: 700 };

const SQL = `CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar VARCHAR(20) NOT NULL DEFAULT '🎮',
  wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0, current_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  friend_id UUID NOT NULL REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_x_id UUID NOT NULL REFERENCES users(id),
  player_o_id UUID REFERENCES users(id),
  board JSONB NOT NULL DEFAULT '[null,null,null,null,null,null,null,null,null]',
  current_turn VARCHAR(1) NOT NULL DEFAULT 'X',
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  winner VARCHAR(10), game_type VARCHAR(20) NOT NULL DEFAULT 'pvp',
  ai_difficulty VARCHAR(10), level INTEGER,
  is_daily BOOLEAN NOT NULL DEFAULT false, daily_date VARCHAR(10),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  game_id UUID REFERENCES games(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_date VARCHAR(10) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  won BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);`;
