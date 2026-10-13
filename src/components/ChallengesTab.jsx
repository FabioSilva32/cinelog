import React, { useState, useEffect, useMemo } from "react";
import { Zap, Trophy, Flame, Star, CheckCircle, Clock } from "lucide-react";

const LEVELS = [
  { level: 1,  name: "Viewer",         xpNeeded: 0,    color: "#94a3b8", icon: "??" },
  { level: 2,  name: "Film Fan",       xpNeeded: 100,  color: "#60a5fa", icon: "??" },
  { level: 3,  name: "Enthusiast",     xpNeeded: 300,  color: "#34d399", icon: "???" },
  { level: 4,  name: "Buff",           xpNeeded: 600,  color: "#fbbf24", icon: "?" },
  { level: 5,  name: "Critic",         xpNeeded: 1000, color: "#f97316", icon: "??" },
  { level: 6,  name: "Aficionado",     xpNeeded: 1500, color: "#c0392b", icon: "??" },
  { level: 7,  name: "Cinephile",      xpNeeded: 2200, color: "#c0392b", icon: "???" },
  { level: 8,  name: "Auteur",         xpNeeded: 3200, color: "#f43f5e", icon: "??" },
  { level: 9,  name: "Maestro",        xpNeeded: 4500, color: "#fb923c", icon: "?" },
  { level: 10, name: "CineLog Legend", xpNeeded: 6000, color: "#ffd700", icon: "??" },
];

const ALL_CHALLENGES = [
  { id: "wc1",  category: "watch",   title: "Horror Nights",       description: "Watch 2 horror films",                   xp: 80,  icon: "??", target: 2,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("horror"))).length },
  { id: "wc2",  category: "watch",   title: "Classic Buff",        description: "Watch a film from before 1980",          xp: 100, icon: "???", target: 1,  check: (lib) => lib.filter(m => m.status === "watched" && parseInt(m.release_year) < 1980).length },
  { id: "wc3",  category: "watch",   title: "Prolific Watcher",    description: "Have 5+ watched films",                  xp: 90,  icon: "??", target: 5,  check: (lib) => lib.filter(m => m.status === "watched").length },
  { id: "wc4",  category: "watch",   title: "Sci-Fi Explorer",     description: "Watch 3 Sci-Fi films",                   xp: 120, icon: "??", target: 3,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("sci"))).length },
  { id: "wc5",  category: "watch",   title: "Documentary Dive",    description: "Watch a documentary",                    xp: 70,  icon: "??", target: 1,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("documentary"))).length },
  { id: "wc6",  category: "watch",   title: "Series Addict",       description: "Add 3 TV series to your library",        xp: 110, icon: "??", target: 3,  check: (lib) => lib.filter(m => m.media_type === "tv").length },
  { id: "wc7",  category: "watch",   title: "Animation Fan",       description: "Watch 2 animated films",                 xp: 80,  icon: "??", target: 2,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("animation"))).length },
  { id: "wc8",  category: "watch",   title: "Thriller Seeker",     description: "Watch 2 thrillers",                      xp: 85,  icon: "??", target: 2,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("thriller"))).length },
  { id: "rc1",  category: "rating",  title: "Critic Mode",         description: "Rate 5 films with a score",              xp: 100, icon: "?", target: 5,  check: (lib) => lib.filter(m => m.rating != null && m.rating > 0).length },
  { id: "rc2",  category: "rating",  title: "Top Scorer",          description: "Give a 9+ rating to any title",          xp: 60,  icon: "??", target: 1,  check: (lib) => lib.filter(m => m.rating >= 9).length },
  { id: "rc3",  category: "rating",  title: "Honest Reviewer",     description: "Rate a film below 5",                    xp: 50,  icon: "??", target: 1,  check: (lib) => lib.filter(m => m.rating > 0 && m.rating < 5).length },
  { id: "rc4",  category: "rating",  title: "Rating Spree",        description: "Rate 10 films total",                    xp: 150, icon: "??", target: 10, check: (lib) => lib.filter(m => m.rating != null && m.rating > 0).length },
  { id: "lc1",  category: "library", title: "Growing Collection",  description: "Have 10 films in your library",          xp: 80,  icon: "??", target: 10, check: (lib) => lib.length },
  { id: "lc2",  category: "library", title: "Diverse Tastes",      description: "Have 5 different genres in library",     xp: 100, icon: "??", target: 5,  check: (lib) => new Set(lib.flatMap(m => m.genres || [])).size },
  { id: "lc3",  category: "library", title: "Wishlist Builder",    description: "Add 5 items to your Watchlist",          xp: 70,  icon: "??", target: 5,  check: (lib) => lib.filter(m => m.status === "plan_to_watch").length },
  { id: "lc4",  category: "library", title: "Favourite Curator",   description: "Mark 3 films as Favourite",              xp: 80,  icon: "??",  target: 3,  check: (lib) => lib.filter(m => m.favorite).length },
  { id: "wt1",  category: "writing", title: "First Review",        description: "Write your first review",                xp: 75,  icon: "??",  target: 1,  check: (lib) => lib.filter(m => m.review && m.review.trim().length > 20).length },
  { id: "wt2",  category: "writing", title: "Active Reviewer",     description: "Write 3 reviews",                        xp: 120, icon: "??", target: 3,  check: (lib) => lib.filter(m => m.review && m.review.trim().length > 20).length },
  { id: "wt3",  category: "writing", title: "Long-Form Critic",    description: "Write a review longer than 200 chars",   xp: 90,  icon: "??", target: 1,  check: (lib) => lib.filter(m => (m.review||"").trim().length > 200).length },
  { id: "wt4",  category: "writing", title: "Tag Master",          description: "Add tags to 5 films",                    xp: 60,  icon: "???",  target: 5,  check: (lib) => lib.filter(m => (m.tags||[]).length > 0).length },
];

function getWeeklyChallenges() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  const sorted = [...ALL_CHALLENGES].sort((a, b) => {
    const seed = weekNum % 13 + 1;
    const ha = (parseInt(a.id.replace(/[^0-9]/g, "")) * seed * 7) % 100;
    const hb = (parseInt(b.id.replace(/[^0-9]/g, "")) * seed * 7) % 100;
    return ha - hb;
  });
  return sorted.slice(0, 6);
}

function getCurrentLevel(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) { if (xp >= level.xpNeeded) current = level; else break; }
  return current;
}
function getNextLevel(xp) {
  for (const level of LEVELS) { if (xp < level.xpNeeded) return level; }
  return null;
}

const CAT_COLORS = {
  watch:   { bg: "rgba(136,8,8,0.12)", border: "rgba(136,8,8,0.3)", text: "#c0392b" },
  rating:  { bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.3)",  text: "#fbbf24" },
  library: { bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.3)", text: "#34d399" },
  writing: { bg: "rgba(249,115,22,0.1)",   border: "rgba(249,115,22,0.3)", text: "#fb923c" },
};

export default function ChallengesTab({ library, currentUser }) {
  const uid = currentUser?.id || "guest";
  const [claimedChallenges, setClaimedChallenges] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cinelog_claimed_" + uid) || "[]"); } catch { return []; }
  });
  const [animateXp, setAnimateXp] = useState(false);
  const [celebrateLevel, setCelebrateLevel] = useState(false);
  const weeklyChallenges = useMemo(() => getWeeklyChallenges(), []);

  const baseXp = useMemo(() => {
    let t = 0;
    t += library.filter(m => m.status === "watched").length * 10;
    t += library.filter(m => m.rating != null && m.rating > 0).length * 5;
    t += library.filter(m => m.review && m.review.trim().length > 20).length * 15;
    t += library.filter(m => m.favorite).length * 3;
    return t;
  }, [library]);

  const claimedXp = useMemo(() =>
    claimedChallenges.reduce((s, id) => { const c = ALL_CHALLENGES.find(x => x.id === id); return s + (c?.xp || 0); }, 0)
  , [claimedChallenges]);

  const xp = baseXp + claimedXp;
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progressPct = nextLevel ? Math.min(100, Math.round(((xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100)) : 100;

  const handleClaim = (challenge) => {
    if (claimedChallenges.includes(challenge.id)) return;
    const progress = Math.min(challenge.check(library), challenge.target);
    if (progress < challenge.target) return;
    const prevLvl = getCurrentLevel(xp);
    setClaimedChallenges(prev => {
      const next = [...prev, challenge.id];
      localStorage.setItem("cinelog_claimed_" + uid, JSON.stringify(next));
      return next;
    });
    setAnimateXp(true); setTimeout(() => setAnimateXp(false), 600);
    const newLvl = getCurrentLevel(xp + challenge.xp);
    if (newLvl.level > prevLvl.level) { setCelebrateLevel(true); setTimeout(() => setCelebrateLevel(false), 3000); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "40px" }}>
      {celebrateLevel && (
        <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#ffd700,#f59e0b)", color: "#0a0813", borderRadius: "50px", padding: "14px 28px", fontWeight: 900, fontSize: "16px", zIndex: 9999, boxShadow: "0 8px 32px rgba(255,215,0,0.5)", animation: "fabPanelIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
          ? Level Up! You are now {currentLevel.icon} {currentLevel.name}!
        </div>
      )}

      {/* XP Card */}
      <div style={{ background: "linear-gradient(135deg,rgba(136,8,8,0.12),rgba(136,8,8,0.08))", border: "1px solid rgba(136,8,8,0.25)", borderRadius: "20px", padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: currentLevel.color + "25", border: "2px solid " + currentLevel.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", flexShrink: 0 }}>{currentLevel.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "24px", fontWeight: 900, color: currentLevel.color }}>{currentLevel.name}</span>
              <span style={{ fontSize: "13px", color: "var(--text-dim)", fontWeight: 600 }}>Level {currentLevel.level}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Zap size={14} style={{ color: "#fbbf24" }} />
              <span style={{ fontSize: "22px", fontWeight: 900, color: "#fbbf24", transition: "transform 0.3s", transform: animateXp ? "scale(1.2)" : "scale(1)" }}>{xp.toLocaleString()}</span>
              <span style={{ fontSize: "12px", color: "var(--text-dim)" }}>XP</span>
            </div>
          </div>
          {!nextLevel && <div style={{ padding: "8px 16px", borderRadius: "50px", background: "linear-gradient(135deg,#ffd700,#f59e0b)", color: "#0a0813", fontWeight: 900, fontSize: "13px" }}>?? MAX LEVEL</div>}
        </div>
        {nextLevel && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", color: "var(--text-dim)" }}>
              <span>Progress to {nextLevel.icon} {nextLevel.name}</span>
              <span style={{ fontWeight: 700, color: currentLevel.color }}>{progressPct}%</span>
            </div>
            <div style={{ height: "8px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: "99px", background: "linear-gradient(90deg," + currentLevel.color + "," + nextLevel.color + ")", width: progressPct + "%", transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "var(--text-dim)" }}>
              <span>{(xp - currentLevel.xpNeeded).toLocaleString()} XP this level</span>
              <span>{(nextLevel.xpNeeded - xp).toLocaleString()} XP to go</span>
            </div>
          </div>
        )}
      </div>

      {/* XP Sources */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "12px" }}>
        {[
          { icon: "?", label: "Films Watched", value: library.filter(m => m.status === "watched").length, xpEach: 10, color: "#34d399" },
          { icon: "?", label: "Ratings Given",  value: library.filter(m => m.rating != null && m.rating > 0).length, xpEach: 5, color: "#fbbf24" },
          { icon: "??", label: "Reviews",        value: library.filter(m => (m.review||"").trim().length > 20).length, xpEach: 15, color: "#fb923c" },
          { icon: "??", label: "Favourites",     value: library.filter(m => m.favorite).length, xpEach: 3, color: "#f43f5e" },
        ].map(item => (
          <div key={item.label} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px" }}>
            <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
            <div style={{ fontWeight: 800, fontSize: "20px", color: item.color }}>{item.value}</div>
            <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>{item.label}</div>
            <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "4px" }}>+{item.xpEach} XP each</div>
          </div>
        ))}
      </div>

      {/* Weekly Challenges */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
              <Flame size={20} style={{ color: "#f97316" }} /> Weekly Challenges
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              Resets every 7 days � {weeklyChallenges.filter(c => claimedChallenges.includes(c.id)).length}/{weeklyChallenges.length} claimed
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {weeklyChallenges.map(challenge => {
            const progress = Math.min(challenge.check(library), challenge.target);
            const pct = Math.round((progress / challenge.target) * 100);
            const isClaimed = claimedChallenges.includes(challenge.id);
            const isComplete = progress >= challenge.target;
            const cat = CAT_COLORS[challenge.category];
            return (
              <div key={challenge.id} style={{ background: isClaimed ? "rgba(16,185,129,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid " + (isClaimed ? "rgba(16,185,129,0.25)" : "var(--border)"), borderRadius: "14px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "12px", flexShrink: 0, background: cat.bg, border: "1px solid " + cat.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                    {isClaimed ? "?" : challenge.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                      <span style={{ fontWeight: 800, fontSize: "14px" }}>{challenge.title}</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: cat.bg, border: "1px solid " + cat.border, color: cat.text, textTransform: "capitalize" }}>{challenge.category}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>{challenge.description}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: "99px", background: isClaimed ? "#34d399" : isComplete ? "#c0392b" : cat.text, width: pct + "%", transition: "width 0.6s ease" }} />
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--text-dim)", flexShrink: 0 }}>{progress}/{challenge.target}</span>
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "13px", fontWeight: 800, color: "#fbbf24" }}>
                      <Zap size={13} />+{challenge.xp}
                    </div>
                    {isClaimed ? (
                      <div style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle size={12} /> Claimed</div>
                    ) : isComplete ? (
                      <button onClick={() => handleClaim(challenge)} style={{ background: "linear-gradient(135deg,#880808,#880808)", border: "none", borderRadius: "8px", padding: "6px 14px", color: "#fff", fontWeight: 800, fontSize: "12px", cursor: "pointer" }}>Claim!</button>
                    ) : (
                      <div style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}><Clock size={11} /> In Progress</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level Roadmap */}
      <div>
        <div style={{ fontSize: "16px", fontWeight: 900, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={18} style={{ color: "#fbbf24" }} /> Level Roadmap
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {LEVELS.map(level => {
            const isUnlocked = xp >= level.xpNeeded;
            const isCurrent = currentLevel.level === level.level;
            return (
              <div key={level.level} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 16px", borderRadius: "12px", background: isCurrent ? level.color + "12" : "rgba(255,255,255,0.01)", border: "1px solid " + (isCurrent ? level.color + "40" : "var(--border)"), opacity: isUnlocked ? 1 : 0.4 }}>
                <div style={{ fontSize: "24px", width: "36px", textAlign: "center" }}>{isUnlocked ? level.icon : "??"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: "14px", color: isUnlocked ? level.color : "var(--text-dim)" }}>Level {level.level} � {level.name}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "2px" }}>{level.xpNeeded.toLocaleString()} XP required</div>
                </div>
                {isCurrent && <div style={{ padding: "4px 10px", borderRadius: "20px", background: level.color + "20", border: "1px solid " + level.color + "50", color: level.color, fontWeight: 800, fontSize: "11px" }}>Current</div>}
                {isUnlocked && !isCurrent && <Star size={16} style={{ color: "#fbbf24" }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

