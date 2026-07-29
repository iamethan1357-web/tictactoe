"use client";

export default function LevelsGrid({ currentLevel, onSelectLevel }: { currentLevel: number; onSelectLevel: (l: number) => void }) {
  const tf: React.CSSProperties = { fontFamily: "'Architects Daughter', cursive" };
  const labels = ["✏️ beginner", "📝 easy", "📖 easy+", "⚡ medium", "🔥 medium+", "💪 tricky", "🎯 hard", "⭐ hard+", "💎 expert", "👑 master"];

  return (
    <div className="anim-in">
      <h2 style={{ ...tf, fontSize: 28, marginBottom: 6 }}>📝 100 Levels</h2>
      <p style={{ fontSize: 14, color: "var(--ink-light)", marginBottom: 16 }}>each page gets harder — beat them all!</p>

      <div className="neo" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>progress</span>
          <span style={{ ...tf, fontSize: 18, color: "var(--blue)" }}>{Math.min(currentLevel - 1, 100)}/100</span>
        </div>
        <div className="progress-neo">
          <div className="progress-fill" style={{ width: `${Math.min(currentLevel - 1, 100)}%` }} />
        </div>
      </div>

      {Array.from({ length: 10 }, (_, s) => {
        const start = s * 10 + 1;
        return (
          <div key={s} className="neo" style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, marginBottom: 10, color: "var(--ink-mid)" }}>
              {labels[s]} <span style={{ fontSize: 12, color: "var(--ink-light)" }}>({start}–{start + 9})</span>
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
              {Array.from({ length: 10 }, (_, i) => {
                const l = start + i;
                const done = l < currentLevel, now = l === currentLevel, lock = l > currentLevel;
                return (
                  <button key={l} onClick={() => !lock && onSelectLevel(l)} disabled={lock}
                    className={`lvl ${done ? "lvl-done" : now ? "lvl-now" : "lvl-lock"}`}
                    style={{ fontFamily: "inherit" }}>
                    {lock ? "🔒" : l}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
