"use client";

interface LevelsGridProps { currentLevel: number; onSelectLevel: (level: number) => void; }

export default function LevelsGrid({ currentLevel, onSelectLevel }: LevelsGridProps) {
  const getDifficultyLabel = (level: number) => { if (level <= 10) return "Beginner"; if (level <= 20) return "Easy"; if (level <= 30) return "Easy+"; if (level <= 40) return "Medium"; if (level <= 50) return "Medium+"; if (level <= 60) return "Intermediate"; if (level <= 70) return "Hard"; if (level <= 80) return "Hard+"; if (level <= 90) return "Expert"; return "Master"; };
  const getDifficultyColor = (level: number) => { if (level <= 20) return "#00b894"; if (level <= 40) return "#00cec9"; if (level <= 60) return "#fdcb6e"; if (level <= 80) return "#e17055"; return "#d63031"; };
  const getDifficultyEmoji = (level: number) => { if (level <= 10) return "🌱"; if (level <= 20) return "🌿"; if (level <= 30) return "☀️"; if (level <= 40) return "⚡"; if (level <= 50) return "🔥"; if (level <= 60) return "💪"; if (level <= 70) return "🎯"; if (level <= 80) return "⭐"; if (level <= 90) return "💎"; return "👑"; };

  const sections = Array.from({ length: 10 }, (_, i) => ({ start: i * 10 + 1, end: (i + 1) * 10, label: getDifficultyLabel(i * 10 + 5), emoji: getDifficultyEmoji(i * 10 + 5), color: getDifficultyColor(i * 10 + 5) }));

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-2 flex items-center gap-2" style={{ color: "#2d3748" }}>🏆 100 Levels</h2>
      <p className="text-sm mb-4" style={{ color: "#718096" }}>Complete each level to unlock the next. Difficulty increases as you progress!</p>
      <div className="neo-card mb-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-semibold" style={{ color: "#2d3748" }}>Progress</span><span className="text-sm font-bold" style={{ color: "#6c5ce7" }}>{Math.min(currentLevel - 1, 100)}/100</span></div><div className="w-full h-3 rounded-full" style={{ background: "#d1d9e6" }}><div className="h-3 rounded-full transition-all" style={{ width: `${Math.min(currentLevel - 1, 100)}%`, background: "linear-gradient(90deg, #6c5ce7, #a29bfe, #00b894)" }} /></div></div>
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.start} className="neo-card">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: section.color }}>{section.emoji} {section.label} (Levels {section.start}-{section.end})</h3>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, i) => { const lvl = section.start + i; const completed = lvl < currentLevel; const isCurrent = lvl === currentLevel; const locked = lvl > currentLevel;
                return (<button key={lvl} onClick={() => !locked && onSelectLevel(lvl)} disabled={locked} className={`level-badge ${completed ? "completed" : isCurrent ? "current" : "locked"}`} title={completed ? `Level ${lvl} ✅` : isCurrent ? `Level ${lvl} (Current)` : `Level ${lvl} 🔒`}>{locked ? "🔒" : lvl}</button>);
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
