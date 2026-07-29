import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Deploy Guide - Tic Tac Toe Arena",
  description: "Step-by-step guide to deploy on Neon + Vercel",
};

export default function DeployGuidePage() {
  return (
    <div
      style={{
        background: "#e0e5ec",
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px" }}>
        {/* Hero */}
        <div
          className="neo-card"
          style={{ textAlign: "center", marginBottom: 32, padding: 40 }}
        >
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: "#2d3748",
              marginBottom: 8,
            }}
          >
            Deploy Tic Tac Toe Arena
          </h1>
          <p style={{ color: "#718096", fontSize: 18, marginBottom: 16 }}>
            Neon (Free Postgres) + Vercel (Free Hosting) — 10 minute setup
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <span
              className="neo-pressed"
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: "#6c5ce7",
              }}
            >
              ✅ Free Forever Tier
            </span>
            <span
              className="neo-pressed"
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: "#00b894",
              }}
            >
              ✅ No Credit Card
            </span>
            <span
              className="neo-pressed"
              style={{
                padding: "8px 16px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: "#e17055",
              }}
            >
              ✅ Custom Domain Support
            </span>
          </div>
        </div>

        {/* Why Not InfinityFree */}
        <div className="neo-card" style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#e17055",
              marginBottom: 12,
            }}
          >
            ⚠️ Why Not InfinityFree?
          </h2>
          <div
            className="neo-pressed"
            style={{ padding: 16, borderRadius: 16, marginBottom: 12 }}
          >
            <p style={{ color: "#2d3748", lineHeight: 1.7, fontSize: 14 }}>
              InfinityFree only supports <strong>PHP + MySQL</strong> hosting.
              This app is built with <strong>Next.js (Node.js)</strong> +{" "}
              <strong>PostgreSQL</strong>, which InfinityFree cannot run.
              Instead, use <strong>Vercel</strong> (free) for hosting and{" "}
              <strong>Neon</strong> (free) for PostgreSQL — both are production-grade, faster, and have generous free tiers.
            </p>
          </div>
        </div>

        {/* STEP 1 */}
        <StepCard
          step={1}
          title="Create a Neon Database (Free)"
          emoji="🐘"
          color="#00b894"
        >
          <ol style={{ paddingLeft: 20 }}>
            <li style={liStyle}>
              Go to{" "}
              <a
                href="https://neon.tech"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                https://neon.tech
              </a>{" "}
              and click <strong>&quot;Sign Up&quot;</strong>
            </li>
            <li style={liStyle}>
              Sign up with GitHub, Google, or email (no credit card needed)
            </li>
            <li style={liStyle}>
              Click <strong>&quot;Create a project&quot;</strong>
            </li>
            <li style={liStyle}>
              Name it <code style={codeStyle}>tictactoe-arena</code>, pick region closest to you
            </li>
            <li style={liStyle}>
              After creation, you&apos;ll see a <strong>connection string</strong> like:
            </li>
          </ol>
          <CodeBlock
            code="postgresql://username:password@ep-xxx-xxx-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
          />
          <p style={{ ...noteStyle, marginTop: 12 }}>
            📋 <strong>Copy this connection string!</strong> You&apos;ll need it in Step 3.
          </p>
        </StepCard>

        {/* STEP 2 */}
        <StepCard
          step={2}
          title="Push Your Code to GitHub"
          emoji="🐙"
          color="#6c5ce7"
        >
          <p style={paraStyle}>
            Create a GitHub repository and push the project code:
          </p>
          <CodeBlock
            code={`# In your project folder, run these commands:
git init
git add .
git commit -m "Tic Tac Toe Arena - initial commit"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/tictactoe-arena.git
git branch -M main
git push -u origin main`}
          />
          <p style={noteStyle}>
            💡 Make sure <code style={codeStyle}>.env</code> is in your{" "}
            <code style={codeStyle}>.gitignore</code> so secrets aren&apos;t pushed!
          </p>
        </StepCard>

        {/* STEP 3 */}
        <StepCard
          step={3}
          title="Deploy to Vercel (Free)"
          emoji="▲"
          color="#2d3748"
        >
          <ol style={{ paddingLeft: 20 }}>
            <li style={liStyle}>
              Go to{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                https://vercel.com
              </a>{" "}
              and sign up with GitHub
            </li>
            <li style={liStyle}>
              Click <strong>&quot;Add New → Project&quot;</strong>
            </li>
            <li style={liStyle}>
              Import your <code style={codeStyle}>tictactoe-arena</code>{" "}
              repository
            </li>
            <li style={liStyle}>
              In <strong>&quot;Environment Variables&quot;</strong>, add these two:
            </li>
          </ol>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Variable Name</th>
                  <th style={thStyle}>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={tdStyle}>
                    <code style={codeStyle}>DATABASE_URL</code>
                  </td>
                  <td style={tdStyle}>
                    <code style={{ ...codeStyle, fontSize: 11 }}>
                      postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
                    </code>
                  </td>
                </tr>
                <tr>
                  <td style={tdStyle}>
                    <code style={codeStyle}>JWT_SECRET</code>
                  </td>
                  <td style={tdStyle}>
                    <code style={{ ...codeStyle, fontSize: 11 }}>
                      any-random-32-char-secret-string-here
                    </code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ol start={5} style={{ paddingLeft: 20 }}>
            <li style={liStyle}>
              Click <strong>&quot;Deploy&quot;</strong> — Vercel will build and deploy automatically
            </li>
            <li style={liStyle}>
              Your app will be live at{" "}
              <code style={codeStyle}>https://tictactoe-arena.vercel.app</code>
            </li>
          </ol>
        </StepCard>

        {/* STEP 4 */}
        <StepCard
          step={4}
          title="Create Database Tables"
          emoji="🗄️"
          color="#fdcb6e"
        >
          <p style={paraStyle}>
            After deploying, you need to push the database schema to Neon. You
            have two options:
          </p>

          <h4 style={{ fontWeight: 700, color: "#2d3748", marginBottom: 8, marginTop: 16 }}>
            Option A: From your local machine (recommended)
          </h4>
          <CodeBlock
            code={`# Set the Neon URL temporarily
export DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"

# Push schema to Neon
npx drizzle-kit push`}
          />

          <h4 style={{ fontWeight: 700, color: "#2d3748", marginBottom: 8, marginTop: 16 }}>
            Option B: Via Neon SQL Editor
          </h4>
          <p style={paraStyle}>
            Go to your Neon dashboard → SQL Editor, and run this SQL:
          </p>
          <CodeBlock
            code={`CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  avatar VARCHAR(20) NOT NULL DEFAULT '🎮',
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
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
  winner VARCHAR(10),
  game_type VARCHAR(20) NOT NULL DEFAULT 'pvp',
  ai_difficulty VARCHAR(10),
  level INTEGER,
  is_daily BOOLEAN NOT NULL DEFAULT false,
  daily_date VARCHAR(10),
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
);`}
          />
        </StepCard>

        {/* STEP 5 */}
        <StepCard
          step={5}
          title="You're Live! 🎉"
          emoji="🌐"
          color="#00b894"
        >
          <p style={paraStyle}>
            That&apos;s it! Your Tic Tac Toe Arena is now live on the internet. Here&apos;s what you can do:
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <FeatureCard emoji="👤" title="Register & Login" desc="Create accounts with unique usernames" />
            <FeatureCard emoji="🤖" title="Play vs AI" desc="Easy, Medium, Hard difficulties" />
            <FeatureCard emoji="🏆" title="100 Levels" desc="Progressive difficulty challenge" />
            <FeatureCard emoji="📅" title="Daily Challenge" desc="New puzzle every day" />
            <FeatureCard emoji="👥" title="Multiplayer" desc="Invite friends by username" />
            <FeatureCard emoji="🎨" title="Custom Profile" desc="Avatars & display names" />
          </div>
        </StepCard>

        {/* Optional: Custom Domain */}
        <StepCard
          step={6}
          title="(Optional) Add Custom Domain"
          emoji="🌍"
          color="#a29bfe"
        >
          <ol style={{ paddingLeft: 20 }}>
            <li style={liStyle}>
              In Vercel dashboard → your project → <strong>Settings → Domains</strong>
            </li>
            <li style={liStyle}>
              Add your domain (e.g., <code style={codeStyle}>tictactoe.yourdomain.com</code>)
            </li>
            <li style={liStyle}>
              Update your domain&apos;s DNS to point to Vercel (they&apos;ll show you the records)
            </li>
            <li style={liStyle}>
              SSL certificate is auto-generated by Vercel — HTTPS works out of the box!
            </li>
          </ol>
        </StepCard>

        {/* Quick Reference */}
        <div className="neo-card" style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#2d3748",
              marginBottom: 16,
            }}
          >
            📚 Quick Reference
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <RefLink
              emoji="🐘"
              title="Neon Dashboard"
              url="https://console.neon.tech"
            />
            <RefLink
              emoji="▲"
              title="Vercel Dashboard"
              url="https://vercel.com/dashboard"
            />
            <RefLink
              emoji="📖"
              title="Neon Docs"
              url="https://neon.tech/docs"
            />
            <RefLink
              emoji="📖"
              title="Vercel Docs"
              url="https://vercel.com/docs"
            />
            <RefLink
              emoji="🔧"
              title="Drizzle ORM Docs"
              url="https://orm.drizzle.team"
            />
            <RefLink
              emoji="⚡"
              title="Next.js Docs"
              url="https://nextjs.org/docs"
            />
          </div>
        </div>

        {/* Back to Game */}
        <div style={{ textAlign: "center", paddingBottom: 40 }}>
          <a
            href="/"
            className="neo-btn-accent"
            style={{
              display: "inline-block",
              padding: "16px 40px",
              borderRadius: 16,
              fontSize: 18,
              textDecoration: "none",
            }}
          >
            🎮 Back to Game
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────── */

function StepCard({
  step,
  title,
  emoji,
  color,
  children,
}: {
  step: number;
  title: string;
  emoji: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="neo-card" style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            fontWeight: 900,
            color: "white",
            background: color,
            flexShrink: 0,
          }}
        >
          {step}
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#2d3748", margin: 0 }}>
            {emoji} {title}
          </h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div
      className="neo-pressed"
      style={{
        padding: 16,
        borderRadius: 14,
        overflow: "auto",
        marginTop: 8,
        marginBottom: 8,
      }}
    >
      <pre
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          color: "#2d3748",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          fontFamily: "'SF Mono', 'Fira Code', monospace",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div
      className="neo-pressed"
      style={{ padding: 16, borderRadius: 14, textAlign: "center" }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 14, color: "#2d3748" }}>{title}</div>
      <div style={{ fontSize: 12, color: "#718096", marginTop: 2 }}>{desc}</div>
    </div>
  );
}

function RefLink({ emoji, title, url }: { emoji: string; title: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="neo-btn"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 16px",
        borderRadius: 14,
        textDecoration: "none",
        color: "#2d3748",
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      <span style={{ fontSize: 20 }}>{emoji}</span>
      {title}
    </a>
  );
}

/* ── Inline Styles ─────────────────────────────────── */

const liStyle: React.CSSProperties = {
  color: "#2d3748",
  lineHeight: 1.8,
  fontSize: 14,
  marginBottom: 4,
};

const paraStyle: React.CSSProperties = {
  color: "#2d3748",
  lineHeight: 1.7,
  fontSize: 14,
};

const noteStyle: React.CSSProperties = {
  color: "#718096",
  fontSize: 13,
  lineHeight: 1.6,
};

const linkStyle: React.CSSProperties = {
  color: "#6c5ce7",
  fontWeight: 600,
  textDecoration: "underline",
};

const codeStyle: React.CSSProperties = {
  background: "#d1d9e6",
  padding: "2px 8px",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  color: "#6c5ce7",
};

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  background: "#d1d9e6",
  color: "#2d3748",
  fontWeight: 700,
  fontSize: 13,
  borderRadius: 8,
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  color: "#2d3748",
  fontSize: 13,
  borderBottom: "1px solid #d1d9e6",
};
