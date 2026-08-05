import React, { useState, useMemo, useCallback } from "react";
import { Sparkles, RefreshCw, ExternalLink, Zap, Plus, Check } from "lucide-react";

const TMDB_KEY = "6a2fd6b9b1bb3befbb9f14c203732225";
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Fallback curated recommendations when no Gemini key
const FALLBACK_RECS = [
  { title: "Parasite", year: "2019", reason: "If you enjoy cerebral, genre-defying narratives", genre: "Drama/Thriller" },
  { title: "Everything Everywhere All at Once", year: "2022", reason: "A chaotic multiverse comedy with surprising heart", genre: "Sci-Fi/Comedy" },
  { title: "The Lighthouse", year: "2019", reason: "Hypnotic psychological horror for adventurous viewers", genre: "Horror/Drama" },
  { title: "Knives Out", year: "2019", reason: "A masterfully crafted modern whodunnit", genre: "Mystery/Comedy" },
  { title: "Moonlight", year: "2016", reason: "An intimate portrait of identity and belonging", genre: "Drama" },
  { title: "Mad Max: Fury Road", year: "2015", reason: "Relentless action filmmaking at its absolute peak", genre: "Action" },
  { title: "Hereditary", year: "2018", reason: "One of the most unsettling horror films of the decade", genre: "Horror" },
  { title: "The Grand Budapest Hotel", year: "2014", reason: "Wes Anderson at his most delightful and precise", genre: "Comedy/Adventure" },
  { title: "Portrait of a Lady on Fire", year: "2019", reason: "A slow-burn romance of extraordinary beauty", genre: "Romance/Drama" },
  { title: "Arrival", year: "2016", reason: "Cerebral sci-fi that will linger long after credits roll", genre: "Sci-Fi/Drama" },
  { title: "Interstellar", year: "2014", reason: "A breathtaking journey through space and time", genre: "Sci-Fi/Drama" },
  { title: "Inception", year: "2010", reason: "A mind-bending heist set within the subconscious dreamscape", genre: "Sci-Fi/Action" },
  { title: "Spirited Away", year: "2001", reason: "Hayao Miyazaki's absolute masterpiece of animation and fantasy", genre: "Animation/Fantasy" },
  { title: "Spider-Man: Into the Spider-Verse", year: "2018", reason: "A visually stunning and groundbreaking animated adventure", genre: "Animation/Action" },
  { title: "Whiplash", year: "2014", reason: "An intense, electrifying duel between student and teacher", genre: "Drama/Music" },
  { title: "La La Land", year: "2016", reason: "A vibrant, melancholic love letter to cinema and jazz", genre: "Romance/Music" },
  { title: "Dune", year: "2021", reason: "Denis Villeneuve's sweeping, epic science-fiction adaptation", genre: "Sci-Fi/Adventure" },
  { title: "Blade Runner 2049", year: "2017", reason: "A gorgeous, contemplative cyberpunk masterpiece", genre: "Sci-Fi/Drama" },
  { title: "The Dark Knight", year: "2008", reason: "The peak of comic-book cinema with an iconic antagonist", genre: "Action/Crime" },
  { title: "Get Out", year: "2017", reason: "Jordan Peele's sharp, chilling social horror masterpiece", genre: "Horror/Mystery" },
  { title: "The Matrix", year: "1999", reason: "The definitive cyberpunk action thriller that changed cinema history", genre: "Sci-Fi/Action" },
  { title: "Pulp Fiction", year: "1994", reason: "Quentin Tarantino's wildly entertaining, non-linear classic", genre: "Crime/Comedy" },
  { title: "The Truman Show", year: "1998", reason: "A heartwarming, existential critique of media and reality", genre: "Drama/Comedy" },
  { title: "Princess Mononoke", year: "1997", reason: "An epic battle between nature and industrial humanity", genre: "Animation/Fantasy" },
  { title: "Spider-Man: Across the Spider-Verse", year: "2023", reason: "An eye-popping, emotionally rich multiversal journey", genre: "Animation/Action" }
];

function buildTasteProfile(library) {
  const watched = library.filter(m => m.status === "watched");
  if (watched.length === 0) return null;

  const genreCounts = {};
  watched.forEach(m => (m.genres || []).forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));
  const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([g]) => g);

  const rated = watched.filter(m => m.rating != null && m.rating > 0);
  const avgRating = rated.length > 0 ? (rated.reduce((s, m) => s + m.rating, 0) / rated.length).toFixed(1) : null;
  const topRated = [...rated].sort((a, b) => b.rating - a.rating).slice(0, 5).map(m => m.title);

  const directorCounts = {};
  watched.filter(m => m.director).forEach(m => { directorCounts[m.director] = (directorCounts[m.director] || 0) + 1; });
  const topDirectors = Object.entries(directorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([d]) => d);

  return { topGenres, avgRating, topRated, topDirectors, totalWatched: watched.length };
}

async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 1200 },
      }),
    }
  );
  if (!res.ok) throw new Error("Gemini API error " + res.status);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function fetchTmdbPoster(title, year) {
  try {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&year=${year}`;
    const data = await fetch(url).then(r => r.json());
    const result = data.results?.[0];
    return result ? { poster_path: result.poster_path, tmdb_id: result.id, overview: result.overview } : null;
  } catch { return null; }
}

async function fetchFreshTmdbRecommendations(library) {
  try {
    const libraryTmdbIds = new Set(library.map(m => String(m.tmdb_id)));
    const libraryTitles = new Set(library.map(m => (m.title || '').toLowerCase().trim()));

    // Fetch popular/top_rated from a random page (pages 1-10) to keep recommendations dynamic & fresh
    const randomPage = Math.floor(Math.random() * 10) + 1;
    const endpoints = [
      { url: `https://api.themoviedb.org/3/movie/top_rated?api_key=${TMDB_KEY}&page=${randomPage}`, type: 'movie' },
      { url: `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_KEY}&page=${randomPage}`, type: 'movie' },
      { url: `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}&page=${randomPage}`, type: 'movie' },
      { url: `https://api.themoviedb.org/3/tv/top_rated?api_key=${TMDB_KEY}&page=${randomPage}`, type: 'tv' },
      { url: `https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_KEY}&page=${randomPage}`, type: 'tv' },
    ];
    const chosen = endpoints[Math.floor(Math.random() * endpoints.length)];

    const res = await fetch(chosen.url);
    const data = await res.json();
    const results = data.results || [];

    // STRICTLY EXCLUDE ANYTHING ALREADY IN THE LIBRARY!
    const freshOnly = results.filter(m => {
      const idStr = String(m.id);
      const titleLower = (m.title || m.name || '').toLowerCase().trim();
      return !libraryTmdbIds.has(idStr) && !libraryTitles.has(titleLower);
    });

    // Shuffle and pick 8
    const shuffled = [...freshOnly].sort(() => Math.random() - 0.5).slice(0, 8);

    return shuffled.map(m => ({
      tmdb_id: m.id,
      media_type: chosen.type,
      title: m.title || m.name,
      year: (m.release_date || m.first_air_date || '').slice(0, 4),
      poster_path: m.poster_path,
      overview: m.overview || '',
      reason: `Acclaimed pick with a ${Math.round((m.vote_average || 0) * 10) / 10}★ TMDB rating`,
      genre: chosen.type === 'tv' ? 'TV Series' : 'Movie'
    }));
  } catch (err) {
    console.error("TMDB discovery fetch error:", err);
    return [];
  }
}

function ForYouCard({ rec, saved, onAdd, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${hover ? "rgba(124,111,247,0.4)" : "var(--border)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 12px 28px rgba(0,0,0,0.5)" : "none",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Poster */}
      <div style={{ aspectRatio: "2/3", position: "relative", overflow: "hidden", background: "rgba(255,255,255,0.03)" }}>
        {rec.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
            alt={rec.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s",
              transform: hover ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
          />
        ) : (
          <div style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            background: "linear-gradient(135deg,rgba(124,111,247,0.1),rgba(168,85,247,0.05))"
          }}>🎬</div>
        )}

        {/* Hover overlay covering the poster */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(10,8,19,0.95) 0%, rgba(10,8,19,0.5) 75%, transparent 100%)",
          opacity: hover ? 1 : 0,
          transition: "opacity 0.22s",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "16px",
          boxSizing: "border-box"
        }}>
          {rec.overview && (
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.75)",
              marginBottom: "12px",
              lineHeight: 1.4,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical"
            }}>
              {rec.overview}
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!saved && onAdd) {
                onAdd({
                  tmdb_id: rec.tmdb_id,
                  title: rec.title,
                  poster_path: rec.poster_path,
                  release_year: rec.year,
                  media_type: rec.media_type || "movie",
                  overview: rec.overview || "",
                });
              }
            }}
            style={{
              width: "100%",
              background: saved ? "rgba(16,185,129,0.9)" : "var(--accent)",
              border: "none",
              color: "#fff",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "12px",
              fontWeight: 800,
              cursor: saved ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "transform 0.15s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
            }}
            onMouseEnter={e => !saved && (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "")}
          >
            {saved ? <><Check size={13} /> In Library</> : <><Plus size={13} /> Add to Library</>}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "14px" }}>
        <div style={{ fontWeight: 800, fontSize: "14px", lineHeight: 1.2, marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {rec.title}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px" }}>
          {rec.year} · {rec.genre}
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4, fontStyle: "italic" }}>
          "{rec.reason}"
        </div>
      </div>
    </div>
  );
}

export default function ForYouTab({ library, currentUser, onAddMovie, onMovieClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingAI, setUsingAI] = useState(false);
  const [generated, setGenerated] = useState(false);

  const tasteProfile = useMemo(() => buildTasteProfile(library), [library]);
  const libraryTmdbIds = useMemo(() => new Set(library.map(m => String(m.tmdb_id))), [library]);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setGenerated(false);

    try {
      let recs = [];

      if (GEMINI_KEY && tasteProfile) {
        const alreadyWatched = library.filter(m => m.status === "watched").map(m => m.title).slice(0, 20).join(", ");
        const prompt = `You are a film recommendation expert. Based on this user's taste profile, suggest 8 films or TV series they will love.

User taste profile:
- Favourite genres: ${tasteProfile.topGenres.join(", ")}
- Top-rated films: ${tasteProfile.topRated.join(", ")}
- Favourite directors: ${tasteProfile.topDirectors.length > 0 ? tasteProfile.topDirectors.join(", ") : "not determined yet"}
- Average rating they give: ${tasteProfile.avgRating || "unknown"} out of 10
- Already watched: ${alreadyWatched}

Return ONLY a JSON array (no markdown, no explanation outside JSON) like this:
[{"title":"Film Title","year":"2019","reason":"One sentence explaining why this fits their taste","genre":"Genre 1/Genre 2"}]

Rules:
- Do NOT recommend anything from the already-watched list
- Keep reasons specific and personal to their taste profile
- Mix well-known and hidden gems`;

        const text = await callGemini(prompt);
        let parsed = [];
        const match = text.match(/\[[\s\S]*\]/);
        if (match) { try { parsed = JSON.parse(match[0]); } catch {} }
        recs = parsed.slice(0, 8);
        setUsingAI(true);
      } else {
        // Fetch dynamic unwatched recommendations directly from TMDB endpoints
        let dynamicRecs = await fetchFreshTmdbRecommendations(library);

        // Fallback to FALLBACK_RECS strictly filtered against library if TMDB fetch fails
        if (dynamicRecs.length < 8) {
          const libraryTitles = new Set(library.map(m => (m.title || '').toLowerCase().trim()));
          const unsavedFallbacks = FALLBACK_RECS.filter(f => !libraryTitles.has(f.title.toLowerCase().trim()));
          
          const enrichedFallbacks = await Promise.all(unsavedFallbacks.map(async f => {
            const tmdb = await fetchTmdbPoster(f.title, f.year);
            return { ...f, ...tmdb };
          }));

          const cleanFallbacks = enrichedFallbacks.filter(r => r && !libraryTmdbIds.has(String(r.tmdb_id)));
          dynamicRecs = [...dynamicRecs, ...cleanFallbacks].slice(0, 8);
        }

        recs = dynamicRecs;
        setUsingAI(false);
      }

      // Fetch posters for any rec missing poster_path
      const enriched = await Promise.all(recs.map(async (rec) => {
        if (rec.poster_path) return rec;
        const tmdb = await fetchTmdbPoster(rec.title, rec.year);
        return { ...rec, ...tmdb };
      }));

      // STRICT FINAL FILTER: Ensure zero library movies EVER bypass
      const libraryTitles = new Set(library.map(m => (m.title || '').toLowerCase().trim()));
      const strictlyFresh = enriched.filter(r => 
        r && 
        !libraryTmdbIds.has(String(r.tmdb_id)) && 
        !libraryTitles.has((r.title || '').toLowerCase().trim())
      );

      setRecommendations(strictlyFresh);
      setGenerated(true);
    } catch (err) {
      console.error("ForYou error:", err);
      setError(err.message || "Failed to generate recommendations");
      
      const libraryTitles = new Set(library.map(m => (m.title || '').toLowerCase().trim()));
      const unsavedFallbacks = FALLBACK_RECS.filter(f => !libraryTitles.has(f.title.toLowerCase().trim()));
      
      const enriched = await Promise.all(unsavedFallbacks.slice(0, 8).map(async (rec) => {
        const tmdb = await fetchTmdbPoster(rec.title, rec.year);
        return { ...rec, ...tmdb };
      }));

      const strictlyFresh = enriched.filter(r => 
        r && 
        !libraryTmdbIds.has(String(r.tmdb_id)) && 
        !libraryTitles.has((r.title || '').toLowerCase().trim())
      );

      setRecommendations(strictlyFresh);
      setGenerated(true);
      setUsingAI(false);
    } finally {
      setLoading(false);
    }
  }, [library, tasteProfile, libraryTmdbIds]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🤖</div>
        <h2 style={{ fontSize: "26px", fontWeight: 900, marginBottom: "8px", background: "linear-gradient(135deg,#a78bfa,#e879f9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          For You
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", maxWidth: "420px", margin: "0 auto", lineHeight: 1.6 }}>
          {GEMINI_KEY
            ? "AI analyses your library taste profile and picks films you are most likely to love."
            : "Curated recommendations based on acclaimed films across every genre."}
        </p>
      </div>

      {/* Taste Profile Card */}
      {tasteProfile && (
        <div style={{ background: "rgba(124,111,247,0.08)", border: "1px solid rgba(124,111,247,0.2)", borderRadius: "16px", padding: "18px 22px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={13} /> Your Taste Profile
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
            {tasteProfile.topGenres.length > 0 && (
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "6px", fontWeight: 700 }}>TOP GENRES</div>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {tasteProfile.topGenres.slice(0, 3).map(g => (
                    <span key={g} style={{ fontSize: "11px", padding: "2px 10px", borderRadius: "20px", background: "rgba(124,111,247,0.15)", border: "1px solid rgba(124,111,247,0.25)", color: "#a78bfa" }}>{g}</span>
                  ))}
                </div>
              </div>
            )}
            {tasteProfile.avgRating && (
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "6px", fontWeight: 700 }}>AVG RATING</div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#fbbf24" }}>★ {tasteProfile.avgRating}</div>
              </div>
            )}
            {tasteProfile.topDirectors.length > 0 && (
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-dim)", marginBottom: "6px", fontWeight: 700 }}>FAV DIRECTORS</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5 }}>{tasteProfile.topDirectors.join(", ")}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generate button */}
      <div style={{ textAlign: "center" }}>
        <button onClick={generate} disabled={loading} style={{
          background: loading ? "rgba(124,111,247,0.2)" : "linear-gradient(135deg,#7c6ff7,#a855f7)",
          border: "none", borderRadius: "50px", padding: "14px 36px",
          color: "#fff", fontWeight: 800, fontSize: "15px", cursor: loading ? "default" : "pointer",
          display: "inline-flex", alignItems: "center", gap: "10px",
          boxShadow: loading ? "none" : "0 8px 24px rgba(124,111,247,0.4)",
          transition: "all 0.2s",
        }}>
          {loading ? (
            <><div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Analysing your taste…</>
          ) : generated ? (
            <><RefreshCw size={16} /> Refresh Picks</>
          ) : (
            <><Sparkles size={16} /> {GEMINI_KEY ? "Generate AI Picks" : "Get Recommendations"}</>
          )}
        </button>
        {usingAI && <div style={{ fontSize: "11px", color: "#a78bfa", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}><Zap size={11} /> Powered by Gemini AI</div>}
      </div>

      {/* Error notice */}
      {error && !generated && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#f87171", textAlign: "center" }}>
          ⚠️ {error} — showing curated picks instead
        </div>
      )}

      {/* Results grid */}
      {recommendations.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px" }}>
          {recommendations.map((rec, i) => {
            const saved = library.some(m => String(m.tmdb_id) === String(rec.tmdb_id));
            return (
              <ForYouCard
                key={i}
                rec={rec}
                saved={saved}
                onAdd={onAddMovie}
                onClick={() => onMovieClick?.(rec.tmdb_id, rec.media_type || "movie")}
              />
            );
          })}
        </div>
      )}

      {/* Empty state before generating */}
      {!generated && !loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
          <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>
            {library.length < 3 ? "Add more films to your library first!" : "Ready to discover your next favourite?"}
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-dim)" }}>
            {library.length < 3
              ? "Rate and log at least a few films to build your taste profile."
              : "Hit the button above and we will find films made for you."}
          </div>
        </div>
      )}
    </div>
  );
}
