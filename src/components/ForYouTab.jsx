import {mediaLabel} from '../utils/mediaLabel';
import React, { useState, useMemo, useCallback } from "react";
import { Sparkles, RefreshCw, ExternalLink, Plus, Check } from "lucide-react";

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

const DISCOVERY_GENRES = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy'};
async function fetchFreshTmdbRecommendations(library) {
  const owned = new Set(library.map(m=>String(m.tmdb_id)));
  const ownedTitles = new Set(library.map(m=>(m.title || '').trim().toLowerCase()));
  const anchor=[...library].filter(m=>m.tmdb_id&&m.status==='watched'&&Number(m.rating)>0).sort((a,b)=>Number(b.rating)-Number(a.rating))[0];
  const counts={};for(const m of library.filter(m=>m.status==='watched'))for(const genre of m.genres || []){const label=genre==='Science Fiction'?'Sci-Fi':genre;const id=Object.keys(DISCOVERY_GENRES).find(id=>DISCOVERY_GENRES[id]===label);if(id)counts[id]=(counts[id]||0)+1;}
  const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([id])=>id);
  const sources=[{url: `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_KEY}&sort_by=vote_average.desc&vote_count.gte=250&primary_release_date.lte=${new Date().toISOString().slice(0,10)}&with_genres=${top.join('|')}&page=${1+Math.floor(Math.random()*3)}`,type:'movie',reason:top.length?`A highly rated discovery in ${top.map(id=>DISCOVERY_GENRES[id]).join(' and ')}.`:'A highly rated discovery to start with.'}];
  if(anchor){const type=anchor.media_type==='tv'?'tv':'movie';sources.unshift({url:`https://api.themoviedb.org/3/${type}/${anchor.tmdb_id}/recommendations?api_key=${TMDB_KEY}`,type,reason:`Because you rated ${anchor.title} ${Number(anchor.rating).toFixed(1)}.`});}
  const responses=await Promise.allSettled(sources.map(async source=>{const response=await fetch(source.url);if(!response.ok)throw Error('Discovery unavailable');const data=await response.json();return (data.results || []).map(m=>({...m,_source:source}));}));
  const seen=new Set();const results=responses.flatMap(r=>r.status==='fulfilled'?r.value:[]).filter(m=>{const title=(m.title||m.name||'').toLowerCase().trim();if(owned.has(String(m.id))||ownedTitles.has(title)||seen.has(m.id)||!m.poster_path)return false;seen.add(m.id);return true;});
  return results.sort(()=>Math.random()-.5).slice(0,12).map(m=>({tmdb_id:m.id,media_type:m._source.type,title:m.title||m.name,year:(m.release_date||m.first_air_date||'').slice(0,4),poster_path:m.poster_path,original_language:m.original_language,origin_country:m.origin_country,genre_ids:m.genre_ids,overview:m.overview||'',genre:(m.genre_ids||[]).map(id=>DISCOVERY_GENRES[id]).filter(Boolean).join(' / '),reason:m._source.reason}));
}

function ForYouCard({ rec, saved, onAdd, onClick }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${hover ? "rgba(136,8,8,0.4)" : "var(--border)"}`,
        borderRadius: "16px",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 12px 28px rgba(0,0,0,0.5)" : "none",
      }}
      onFocus={()=>setHover(true)}
      onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setHover(false);}}
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
            background: "linear-gradient(135deg,rgba(136,8,8,0.1),rgba(136,8,8,0.05))"
          }}>🎬</div>
        )}

        {/* Hover overlay covering the poster */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.6) 75%, transparent 100%)",
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
                  genres: (rec.genre || "").split(/\s*\/\s*/).filter(Boolean),
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
        <button className="poster-title-link" onClick={e=>{e.stopPropagation();onClick();}}>{rec.title}</button>
        <div style={{ fontSize: "11px", color: "var(--text-dim)", marginBottom: "8px" }}>
          {[rec.year,mediaLabel(rec),rec.genre].filter(Boolean).join(' · ')}
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
  const [recommendationSource,setRecommendationSource]=useState('curated');
  const [generated, setGenerated] = useState(false);
  const [lane,setLane] = useState('all');

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
        setUsingAI(true);setRecommendationSource('personal');
      } else {
        // Fetch dynamic unwatched recommendations directly from TMDB endpoints
        let dynamicRecs = await fetchFreshTmdbRecommendations(library);
        setRecommendationSource(dynamicRecs.length>=8&&tasteProfile?'taste':'mixed');

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
      setError('Personal recommendations are unavailable right now');setRecommendationSource('curated');
      
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

  const matches = lane==='all' ? recommendations : recommendations.filter(rec=>String(rec.genre || '').toLowerCase().includes(lane));
  const featured=matches[0];
  return <section className="v2-foryou"><header className="v2-recommendation-heading"><div><span className="studio-eyebrow">A LITTLE INTUITION. A LITTLE DISCOVERY.</span><h1>Your next great film<br/>is out there.</h1><p>A personal shortlist, with room for a surprise.</p></div><button className="studio-primary" onClick={generate} disabled={loading}>{loading?<RefreshCw size={17}/>:<Sparkles size={17}/>} {loading?'Finding your next story…':generated?'Deal me another hand':'Build my shortlist'}</button></header>
    <p className="workspace-context" role="status">{recommendationSource==='personal'?'Personal recommendations generated from your film taste.':recommendationSource==='taste'?'Discoveries based on your highest-rated films and genres.':recommendationSource==='mixed'?'A mix of taste-based discoveries and editorial picks.':'Editorial picks to explore. These are not personalized recommendations.'}</p><div className="v2-picks-layout"><section className="v2-picks-main">{error&&<div className="v2-picks-notice" role="status">{error}. Curated alternatives are available below.</div>}
    {featured?<article className="v2-featured-pick"><div className="v2-featured-poster">{featured.poster_path&&<img src={`https://image.tmdb.org/t/p/w500${featured.poster_path}`} alt={featured.title}/>}<span>THE FIRST PICK</span></div><div><span className="studio-eyebrow">{usingAI?'PERSONALIZED FOR YOU':tasteProfile?.totalWatched?'GUIDED BY YOUR WATCHED FILMS':'FROM THE CURATED SHORTLIST'}</span><h2>{featured.title}</h2><p className="v2-pick-meta">{featured.year} · {featured.genre}</p><blockquote>“{featured.reason}”</blockquote><p>{featured.overview}</p><button className="studio-primary" onClick={()=>onMovieClick?.(featured.tmdb_id,featured.media_type || 'movie')}>Take a closer look <ExternalLink size={15}/></button></div></article>:<div className="v2-picks-invitation"><div className="v2-hand"><i>01</i><i>02</i><i>03</i></div><span className="studio-eyebrow">SOMETHING YOU HAVEN'T SEEN COMING</span><h2>{generated?'A different mood?':'Let curiosity choose.'}</h2><p>{generated?'No picks in this lane. Try All picks or generate another shortlist.':'Start with a shortlist of films outside your library. A familiar feeling, or a completely new world.'}</p>{generated&&<button className="studio-secondary" onClick={()=>setLane('all')}>Show all picks</button>}</div>}
    <div className="v2-shortlist-header"><h2>The shortlist <span>{matches.length}</span></h2><div className="v2-pill-filters">{[['all','All picks'],['drama','Drama'],['thriller','Thriller'],['sci','Sci-fi']].map(([id,label])=><button key={id} aria-pressed={lane===id} onClick={()=>setLane(id)}>{label}</button>)}</div></div>
    {loading?<div className="v2-picks-loading" role="status">Turning over a few possibilities…</div>:<div className="v2-recommendation-grid">{matches.map((rec,i)=><div key={rec.tmdb_id || i} className="v2-recommendation-card"><span>0{i+1}</span><ForYouCard rec={rec} saved={library.some(m=>String(m.tmdb_id)===String(rec.tmdb_id))} onAdd={onAddMovie} onClick={()=>onMovieClick?.(rec.tmdb_id,rec.media_type||'movie')}/></div>)}</div>}
    </section><aside className="v2-taste-card"><span className="studio-eyebrow">THE STARTING POINT</span><h2>Your cinematic DNA.</h2><p>{tasteProfile?.totalWatched?`Built around ${tasteProfile.totalWatched} watched films.`:'Your taste takes shape with every film you log.'}</p><div className="v2-taste-tags">{(tasteProfile?.topGenres || []).slice(0,5).map(g=><span key={g}>{g}</span>)}</div><dl><dt>Your average rating</dt><dd>{tasteProfile?.avgRating?'★ '+tasteProfile.avgRating:'Still discovering'}</dd><dt>Directors you return to</dt><dd>{tasteProfile?.topDirectors?.join(', ') || 'Keep logging to find a pattern.'}</dd></dl><footer><Sparkles size={23}/><p>{usingAI?'Personalized suggestions':tasteProfile?.totalWatched?'Guided by your viewing':'Curated discoveries'}<br/>New to your saved library.</p></footer></aside></div>
  </section>;
}
