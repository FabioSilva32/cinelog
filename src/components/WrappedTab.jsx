import React, { useState, useMemo, useEffect, useRef } from "react";

const GENRE_EMOJI = {
  "action": "💥", "adventure": "🗺️", "animation": "🎨", "comedy": "😂",
  "crime": "🔫", "documentary": "📹", "drama": "🎭", "fantasy": "🧙",
  "history": "📜", "horror": "👻", "music": "🎵", "mystery": "🔍",
  "romance": "💕", "sci-fi": "🚀", "thriller": "🔪", "war": "⚔️",
  "western": "🤠", "family": "👨‍👩‍👧", "sci-fi & fantasy": "🌌",
};

function getGenreEmoji(genre) {
  if (!genre) return "🎬";
  const lower = genre.toLowerCase();
  for (const [key, emoji] of Object.entries(GENRE_EMOJI)) {
    if (lower.includes(key)) return emoji;
  }
  return "🎬";
}

function useCountUp(target, duration = 1200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function SlideCard({ children, color, gradient, isActive }) {
  return (
    <div style={{
      width: "100%", maxWidth: "540px", margin: "0 auto",
      borderRadius: "28px", padding: "48px 40px",
      background: gradient || `linear-gradient(135deg, ${color}20, ${color}08)`,
      border: `1px solid ${color}40`,
      boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${color}15`,
      textAlign: "center",
      transform: isActive ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)",
      opacity: isActive ? 1 : 0,
      transition: "all 0.5s cubic-bezier(0.34,1.26,0.64,1)",
      minHeight: "340px", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
    }}>
      {children}
    </div>
  );
}

export default function WrappedTab({ library }) {
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [animStart, setAnimStart] = useState(false);
  const timerRef = useRef(null);

  const year = new Date().getFullYear();
  const yearLib = useMemo(() =>
    library.filter(m => {
      const added = m.date_added ? new Date(m.date_added).getFullYear() : 0;
      return added === year;
    }), [library, year]);

  const watchedThisYear = yearLib.filter(m => m.status === "watched");
  const totalRuntime = watchedThisYear.length * 100; // estimate 100min average
  const hoursWatched = Math.round(totalRuntime / 60);

  const genreCounts = useMemo(() => {
    const counts = {};
    watchedThisYear.forEach(m => (m.genres || []).forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [watchedThisYear]);

  const topGenre = genreCounts[0]?.[0] || null;

  const ratedItems = watchedThisYear.filter(m => m.rating != null && m.rating > 0);
  const avgRating = ratedItems.length > 0 ? (ratedItems.reduce((s, m) => s + m.rating, 0) / ratedItems.length).toFixed(1) : null;

  const highestRated = [...ratedItems].sort((a, b) => b.rating - a.rating)[0];

  const directorCounts = useMemo(() => {
    const counts = {};
    watchedThisYear.filter(m => m.director).forEach(m => { counts[m.director] = (counts[m.director] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [watchedThisYear]);
  const topDirector = directorCounts[0];

  const reviewsWritten = yearLib.filter(m => (m.review || "").trim().length > 20).length;

  // Slide definitions
  const slides = [
    // 0: Intro
    {
      color: "#7c6ff7",
      gradient: "linear-gradient(135deg, rgba(124,111,247,0.2), rgba(168,85,247,0.12))",
      content: ({ isActive }) => (
        <>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🎬</div>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#a78bfa", textTransform: "uppercase", marginBottom: "12px" }}>Your {year} in Film</div>
          <h2 style={{ fontSize: "36px", fontWeight: 900, lineHeight: 1.1, marginBottom: "16px", background: "linear-gradient(135deg,#a78bfa,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            CineLog Wrapped
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.6 }}>
            Every frame you watched, every star you gave, every review you wrote — all in one cinematic recap.
          </p>
        </>
      ),
    },
    // 1: Total films
    {
      color: "#34d399",
      gradient: "linear-gradient(135deg, rgba(52,211,153,0.18), rgba(16,185,129,0.08))",
      content: ({ isActive }) => {
        const count = useCountUp(watchedThisYear.length, 1000, isActive);
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
            <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#34d399", textTransform: "uppercase", marginBottom: "12px" }}>Films Watched</div>
            <div style={{ fontSize: "88px", fontWeight: 900, color: "#34d399", lineHeight: 1, marginBottom: "12px", fontFamily: "var(--font-heading)" }}>{count}</div>
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>
              {watchedThisYear.length === 0 ? "Start watching and come back!" :
               watchedThisYear.length < 10 ? "Just getting started — keep going! 🌱" :
               watchedThisYear.length < 30 ? "Solid year of watching! 🎉" :
               watchedThisYear.length < 60 ? "You're a true film fan! 🍿" : "Absolute cinema legend! 👑"}
            </p>
          </>
        );
      },
    },
    // 2: Hours
    {
      color: "#f97316",
      gradient: "linear-gradient(135deg, rgba(249,115,22,0.18), rgba(251,191,36,0.08))",
      content: ({ isActive }) => {
        const count = useCountUp(hoursWatched, 1200, isActive);
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏱️</div>
            <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#fb923c", textTransform: "uppercase", marginBottom: "12px" }}>Hours Watched</div>
            <div style={{ fontSize: "88px", fontWeight: 900, color: "#fb923c", lineHeight: 1, marginBottom: "8px" }}>{count}</div>
            <div style={{ fontSize: "13px", color: "var(--text-dim)", marginBottom: "12px" }}>hours of cinema</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {hoursWatched > 0 ? `That's ${Math.round(hoursWatched / 24)} full days in the dark! 🌑` : "No watch time yet this year."}
            </p>
          </>
        );
      },
    },
    // 3: Top Genre
    {
      color: "#e879f9",
      gradient: "linear-gradient(135deg, rgba(232,121,249,0.18), rgba(168,85,247,0.08))",
      content: ({ isActive }) => (
        <>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>{topGenre ? getGenreEmoji(topGenre) : "🎭"}</div>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#e879f9", textTransform: "uppercase", marginBottom: "12px" }}>Your Top Genre</div>
          <div style={{ fontSize: "48px", fontWeight: 900, color: "#e879f9", lineHeight: 1.1, marginBottom: "12px" }}>
            {topGenre || "No data yet"}
          </div>
          {topGenre && <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>You watched {genreCounts[0][1]} {topGenre} films</p>}
          {genreCounts.length > 1 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "16px" }}>
              {genreCounts.slice(1, 4).map(([g, c]) => (
                <span key={g} style={{ padding: "4px 14px", borderRadius: "20px", background: "rgba(232,121,249,0.12)", border: "1px solid rgba(232,121,249,0.25)", fontSize: "12px", color: "#e879f9" }}>
                  {getGenreEmoji(g)} {g} ({c})
                </span>
              ))}
            </div>
          )}
        </>
      ),
    },
    // 4: Highest Rated
    {
      color: "#fbbf24",
      gradient: "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(245,158,11,0.08))",
      content: ({ isActive }) => (
        <>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏆</div>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#fbbf24", textTransform: "uppercase", marginBottom: "12px" }}>Your Top-Rated Film</div>
          {highestRated ? (
            <>
              <div style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1.2, marginBottom: "10px", color: "#fbbf24" }}>{highestRated.title}</div>
              <div style={{ fontSize: "56px", fontWeight: 900, color: "#fbbf24" }}>{highestRated.rating}</div>
              <div style={{ fontSize: "14px", color: "var(--text-dim)", marginTop: "6px" }}>/ 10</div>
              {avgRating && <div style={{ marginTop: "14px", fontSize: "13px", color: "var(--text-muted)" }}>Your average rating this year: <strong style={{ color: "#fbbf24" }}>★ {avgRating}</strong></div>}
            </>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Start rating films to see your champion here!</p>
          )}
        </>
      ),
    },
    // 5: Top Director
    {
      color: "#60a5fa",
      gradient: "linear-gradient(135deg, rgba(96,165,250,0.18), rgba(59,130,246,0.08))",
      content: ({ isActive }) => (
        <>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#60a5fa", textTransform: "uppercase", marginBottom: "12px" }}>Favourite Director</div>
          {topDirector ? (
            <>
              <div style={{ fontSize: "36px", fontWeight: 900, color: "#60a5fa", lineHeight: 1.2, marginBottom: "10px" }}>{topDirector[0]}</div>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>You watched {topDirector[1]} of their film{topDirector[1] > 1 ? "s" : ""} this year</p>
            </>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Add films with director info to discover your taste!</p>
          )}
        </>
      ),
    },
    // 6: Reviews
    {
      color: "#f43f5e",
      gradient: "linear-gradient(135deg, rgba(244,63,94,0.18), rgba(239,68,68,0.08))",
      content: ({ isActive }) => {
        const count = useCountUp(reviewsWritten, 1000, isActive);
        return (
          <>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>✍️</div>
            <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#f43f5e", textTransform: "uppercase", marginBottom: "12px" }}>Reviews Written</div>
            <div style={{ fontSize: "88px", fontWeight: 900, color: "#f43f5e", lineHeight: 1 }}>{count}</div>
            <p style={{ color: "var(--text-muted)", fontSize: "15px", marginTop: "12px" }}>
              {reviewsWritten === 0 ? "Write your first review — share your thoughts!" :
               reviewsWritten === 1 ? "Your first review — the beginning of a critic's journey! 🌟" :
               reviewsWritten < 10 ? "Your words are shaping the community! 📝" : "A true critic! The community loves your reviews! 🎙️"}
            </p>
          </>
        );
      },
    },
    // 7: Grand Finale
    {
      color: "#7c6ff7",
      gradient: "linear-gradient(135deg, rgba(124,111,247,0.25), rgba(168,85,247,0.15), rgba(232,121,249,0.08))",
      content: ({ isActive }) => (
        <>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🌟</div>
          <div style={{ fontSize: "13px", fontWeight: 800, letterSpacing: "0.12em", color: "#a78bfa", textTransform: "uppercase", marginBottom: "16px" }}>That Is a Wrap!</div>
          <h2 style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1.2, marginBottom: "20px" }}>{year} was a great year for cinema</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", textAlign: "center" }}>
            {[
              { label: "Films Watched", val: watchedThisYear.length, color: "#34d399" },
              { label: "Hours of Cinema", val: hoursWatched, color: "#fb923c" },
              { label: "Reviews Written", val: reviewsWritten, color: "#f43f5e" },
              { label: "Avg Rating", val: avgRating ? "★ " + avgRating : "—", color: "#fbbf24" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px 10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "22px", fontWeight: 900, color: stat.color }}>{stat.val}</div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", marginTop: "4px", fontWeight: 700 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "16px" }}>See you next year 🎬</p>
        </>
      ),
    },
  ];

  const goTo = (idx) => {
    setSlide(idx);
    setAnimStart(false);
    setTimeout(() => setAnimStart(true), 60);
  };

  const next = () => { if (slide < slides.length - 1) goTo(slide + 1); };
  const prev = () => { if (slide > 0) goTo(slide - 1); };

  useEffect(() => {
    setAnimStart(false);
    setTimeout(() => setAnimStart(true), 60);
  }, [slide]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setSlide(prev => {
          if (prev >= slides.length - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 3200);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, slides.length]);

  const SlideContent = slides[slide].content;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "4px", background: "linear-gradient(135deg,#a78bfa,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          🎬 {year} Wrapped
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-dim)" }}>Your year in cinema, card by card</div>
      </div>

      {/* Progress dots */}
      <div style={{ display: "flex", gap: "6px" }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: slide === i ? "24px" : "8px", height: "8px", borderRadius: "99px", border: "none",
            background: slide === i ? "#a78bfa" : "rgba(255,255,255,0.15)",
            cursor: "pointer", transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      {/* Slide */}
      <div style={{ width: "100%", maxWidth: "540px" }}>
        <SlideCard color={slides[slide].color} gradient={slides[slide].gradient} isActive={animStart}>
          <SlideContent isActive={animStart} />
        </SlideCard>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={prev} disabled={slide === 0} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: "50%",
          width: "44px", height: "44px", color: "#fff", fontSize: "18px", cursor: slide === 0 ? "default" : "pointer",
          opacity: slide === 0 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>←</button>

        <button onClick={() => { setPlaying(p => !p); }} style={{
          background: playing ? "rgba(239,68,68,0.15)" : "linear-gradient(135deg,#7c6ff7,#a855f7)",
          border: playing ? "1px solid rgba(239,68,68,0.4)" : "none",
          borderRadius: "50px", padding: "10px 24px",
          color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer",
          transition: "all 0.2s",
        }}>
          {playing ? "⏸ Pause" : slide === slides.length - 1 ? "↩ Restart" : "▶ Play"}
        </button>

        <button onClick={next} disabled={slide === slides.length - 1} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)", borderRadius: "50%",
          width: "44px", height: "44px", color: "#fff", fontSize: "18px", cursor: slide === slides.length - 1 ? "default" : "pointer",
          opacity: slide === slides.length - 1 ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}>→</button>
      </div>

      {/* Slide counter */}
      <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{slide + 1} / {slides.length}</div>
    </div>
  );
}
