/* ══════════════════════════════════════════════════════════════════
   CineLog V30 — Ultra Feature Pack
   - Gorgeous Explore tab (full rebuild)
   - Smart Collections with premade sets + auto-tagging
   - Trailer fix (youtube-nocookie + fallback)
   - Movie detail modal upgrade
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TMDB_KEY  = '6a2fd6b9b1bb3befbb9f14c203732225';
  const BASE_IMG  = 'https://image.tmdb.org/t/p/';
  const LIB_KEY   = 'cinelog_library_v2';
  const COLL_KEY  = 'cinelog_collections_v1';

  /* ── UTILS ───────────────────────────────────────────────────── */
  function getLib() {
    try { return JSON.parse(localStorage.getItem(LIB_KEY)) || []; } catch { return []; }
  }
  function saveLib(lib) {
    try { localStorage.setItem(LIB_KEY, JSON.stringify(lib)); } catch {}
  }
  function getColl() {
    try { return JSON.parse(localStorage.getItem(COLL_KEY)) || {}; } catch { return {}; }
  }
  function saveColl(c) {
    try { localStorage.setItem(COLL_KEY, JSON.stringify(c)); } catch {}
  }
  function tmdb(endpoint, params = {}) {
    const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', ...params });
    return fetch(`https://api.themoviedb.org/3/${endpoint}?${p}`).then(r => r.json()).then(d => d.results || d || []);
  }
  function poster(path, size = 'w300') {
    return path ? BASE_IMG + size + path : '';
  }
  function inLib(id) {
    return getLib().some(x => String(x.tmdb_id) === String(id) || String(x.id) === String(id));
  }

  /* ─────────────────────────────────────────────────────────────
     1.  INJECT STYLES
  ───────────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('cl-v30-styles')) return;
    const s = document.createElement('style');
    s.id = 'cl-v30-styles';
    s.textContent = `
/* ─── FORCE HIDE OLD CONTENT WHEN V30 TABS ACTIVE ──────────── */
/* Hide the fixed-position overlay that upgrade.js creates (z-index 900) */
body.v30-explore-active #cinelog-custom-overlay,
body.v30-coll-active #cinelog-custom-overlay {
  display: none !important;
}
body.v30-explore-active .app-main > *:not(#v30-explore-container) {
  display: none !important;
}
body.v30-explore-active #v30-explore-container {
  display: block !important;
}
body.v30-coll-active .app-main > *:not(#v30-coll-container) {
  display: none !important;
}
body.v30-coll-active #v30-coll-container {
  display: block !important;
}

/* ─── EXPLORE V30 ──────────────────────────────────────────── */
#v30-explore { padding-bottom: 80px; }
.v30-hero {
  position: relative; border-radius: 20px; overflow: hidden;
  margin-bottom: 36px; min-height: 300px; background: var(--surface);
  display: flex; align-items: flex-end;
}
.v30-hero-img {
  position: absolute; inset: 0; object-fit: cover; width: 100%; height: 100%;
  opacity: 0.45; transition: opacity 0.8s;
}
.v30-hero-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to top, #0c0c10 0%, rgba(12,12,16,0.6) 60%, transparent 100%);
}
.v30-hero-content {
  position: relative; z-index: 2; padding: 28px 28px 28px; width: 100%;
}
.v30-hero-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(124,111,247,0.18); border: 1px solid rgba(124,111,247,0.4);
  color: #a78bfa; border-radius: 20px; padding: 4px 12px;
  font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
  margin-bottom: 10px;
}
.v30-hero-title {
  font-size: 28px; font-weight: 900; letter-spacing: -0.5px;
  line-height: 1.15; margin-bottom: 8px;
}
.v30-hero-meta {
  display: flex; align-items: center; gap: 12px;
  color: rgba(232,232,244,0.6); font-size: 13px; margin-bottom: 16px;
}
.v30-hero-meta strong { color: #fbbf24; }
.v30-hero-actions { display: flex; gap: 10px; }
.v30-hero-btn {
  border: none; border-radius: 10px; padding: 10px 20px;
  font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.v30-hero-btn.primary {
  background: var(--accent); color: #fff;
}
.v30-hero-btn.primary:hover { background: #6d5fe0; transform: translateY(-1px); }
.v30-hero-btn.secondary {
  background: rgba(255,255,255,0.1); color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
}
.v30-hero-btn.secondary:hover { background: rgba(255,255,255,0.18); }

/* ─── Search ─────────────────────────────── */
.v30-search-wrap {
  display: flex; gap: 10px; margin-bottom: 32px;
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 14px; padding: 8px 8px 8px 16px; align-items: center;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.v30-search-wrap:focus-within {
  border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,111,247,0.2);
}
.v30-search-input {
  flex: 1; background: none; border: none; outline: none;
  color: var(--text); font-size: 15px; font-family: inherit;
}
.v30-search-input::placeholder { color: var(--text-dim); }
.v30-search-btn {
  background: var(--accent); color: #fff; border: none; border-radius: 10px;
  padding: 10px 20px; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.15s; white-space: nowrap;
}
.v30-search-btn:hover { background: #6d5fe0; }

/* ─── Type Pills ─────────────────────────── */
.v30-type-pills {
  display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap;
}
.v30-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; border-radius: 40px; border: 1px solid var(--border2);
  background: var(--surface2); color: var(--text-muted);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.v30-pill:hover { border-color: var(--border); color: var(--text); }
.v30-pill.active {
  background: linear-gradient(135deg, rgba(124,111,247,0.25), rgba(124,111,247,0.1));
  border-color: var(--accent); color: #a78bfa;
}

/* ─── Section ────────────────────────────── */
.v30-section { margin-bottom: 48px; }
.v30-section-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px;
}
.v30-section-title {
  font-size: 17px; font-weight: 800; letter-spacing: -0.3px;
}
.v30-see-all {
  font-size: 12px; color: var(--accent); cursor: pointer;
  background: none; border: none; font-family: inherit; font-weight: 600;
  padding: 0; display: flex; align-items: center; gap: 4px;
}
.v30-see-all:hover { text-decoration: underline; }
.v30-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 14px;
}

/* ─── Card ───────────────────────────────── */
.v30-card {
  border-radius: 12px; overflow: hidden; cursor: pointer;
  background: var(--surface); position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border);
}
.v30-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.5);
}
.v30-card-poster {
  position: relative; aspect-ratio: 2/3; overflow: hidden;
  background: var(--surface2);
}
.v30-card-poster img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.4s;
}
.v30-card:hover .v30-card-poster img { transform: scale(1.06); }
.v30-card-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(12,12,16,0.95) 0%, transparent 55%);
  opacity: 0; transition: opacity 0.25s;
  display: flex; flex-direction: column; justify-content: flex-end;
  padding: 12px;
}
.v30-card:hover .v30-card-overlay { opacity: 1; }
.v30-card-add {
  background: var(--accent); color: #fff; border: none; border-radius: 8px;
  padding: 8px 0; font-size: 12px; font-weight: 700; cursor: pointer;
  width: 100%; transition: all 0.15s; font-family: inherit;
}
.v30-card-add:hover { background: #6d5fe0; }
.v30-card-add.added { background: #22c55e; cursor: default; }
.v30-score-badge {
  position: absolute; top: 8px; right: 8px;
  background: rgba(12,12,16,0.85); backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.1); color: #fbbf24;
  border-radius: 8px; padding: 3px 8px; font-size: 11px; font-weight: 700;
}
.v30-saved-badge {
  position: absolute; top: 8px; left: 8px;
  background: #22c55e; color: #fff;
  border-radius: 6px; padding: 2px 7px; font-size: 10px; font-weight: 700;
}
.v30-type-badge {
  position: absolute; bottom: 8px; left: 8px;
  border-radius: 6px; padding: 2px 8px; font-size: 10px; font-weight: 700;
  letter-spacing: 0.3px;
}
.v30-type-badge.movie { background: rgba(99,102,241,0.85); color: #c7d2fe; }
.v30-type-badge.tv    { background: rgba(34,197,94,0.85); color: #bbf7d0; }
.v30-type-badge.anime { background: rgba(245,158,11,0.85); color: #fde68a; }
.v30-card-body { padding: 10px 10px 10px; }
.v30-card-title {
  font-size: 12px; font-weight: 700; line-height: 1.3;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.v30-card-year { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

/* ─── No-poster placeholder ──────────────── */
.v30-no-poster {
  width: 100%; height: 100%; display: flex; align-items: center;
  justify-content: center; font-size: 40px; background: var(--surface3);
}

/* ─── Loading ────────────────────────────── */
.v30-loading {
  display: flex; align-items: center; gap: 12px;
  color: var(--text-muted); font-size: 14px; padding: 40px;
  justify-content: center;
}
.v30-spinner {
  width: 20px; height: 20px; border: 2px solid var(--border2);
  border-top-color: var(--accent); border-radius: 50%;
  animation: v30-spin 0.8s linear infinite;
}
@keyframes v30-spin { to { transform: rotate(360deg); } }

/* ─── Search results ─────────────────────── */
#v30-search-results { margin-bottom: 40px; }

/* ─── Smart Recs ─────────────────────────── */
.v30-rec-form {
  display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  padding: 20px; background: var(--surface); border: 1px solid var(--border2);
  border-radius: 14px; margin-bottom: 24px;
}
.v30-rec-select {
  background: var(--surface2); border: 1px solid var(--border2); color: var(--text);
  border-radius: 10px; padding: 10px 14px; font-size: 14px; font-family: inherit;
  outline: none; cursor: pointer; transition: border-color 0.15s;
  flex: 1; min-width: 130px;
}
.v30-rec-select:focus { border-color: var(--accent); }
.v30-rec-go {
  background: var(--accent); color: #fff; border: none; border-radius: 10px;
  padding: 10px 22px; font-size: 14px; font-weight: 700; cursor: pointer;
  transition: all 0.15s; font-family: inherit; white-space: nowrap;
}
.v30-rec-go:hover { background: #6d5fe0; }
.v30-rec-go:disabled { opacity: 0.6; cursor: not-allowed; }

/* ─── Actor Section ──────────────────────── */
.v30-actor-wrap {
  display: flex; gap: 10px; align-items: center; flex-wrap: wrap;
  margin-bottom: 20px;
}
.v30-actor-input {
  flex: 1; background: var(--surface2); border: 1px solid var(--border2);
  color: var(--text); border-radius: 10px; padding: 10px 16px;
  font-size: 14px; font-family: inherit; outline: none; min-width: 200px;
  transition: border-color 0.15s;
}
.v30-actor-input:focus { border-color: var(--accent); }
.v30-actor-btn {
  background: var(--surface2); color: var(--text); border: 1px solid var(--border2);
  border-radius: 10px; padding: 10px 18px; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.15s; font-family: inherit; white-space: nowrap;
}
.v30-actor-btn:hover { border-color: var(--accent); color: var(--accent); }
.v30-actor-result {
  display: flex; align-items: center; gap: 14px;
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 12px; padding: 14px; margin-bottom: 20px;
}
.v30-actor-photo {
  width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
  background: var(--surface3); flex-shrink: 0;
}
.v30-actor-name { font-size: 16px; font-weight: 800; }
.v30-actor-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

/* ─── Divider ────────────────────────────── */
.v30-divider {
  border: none; border-top: 1px solid var(--border); margin: 48px 0 40px;
}

/* ─── COLLECTIONS V30 ──────────────────────────────────────── */
#v30-collections { padding-bottom: 80px; }
.v30-coll-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
}
.v30-coll-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
.v30-coll-subtitle { color: var(--text-muted); font-size: 14px; margin-top: 4px; }
.v30-coll-tabs {
  display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 28px;
  padding-bottom: 16px; border-bottom: 1px solid var(--border);
}
.v30-coll-tab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border2);
  background: var(--surface2); color: var(--text-muted);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s;
  white-space: nowrap;
}
.v30-coll-tab:hover { color: var(--text); border-color: var(--border); }
.v30-coll-tab.active {
  background: rgba(124,111,247,0.15); border-color: var(--accent); color: #a78bfa;
}
.v30-coll-tab .v30-coll-count {
  background: rgba(124,111,247,0.2); color: #a78bfa;
  border-radius: 10px; padding: 1px 7px; font-size: 11px;
}
.v30-coll-tab.active .v30-coll-count { background: rgba(124,111,247,0.3); }
.v30-coll-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px;
}
.v30-coll-empty {
  text-align: center; padding: 60px 20px; color: var(--text-muted);
  font-size: 14px;
}
.v30-coll-empty-icon { font-size: 48px; margin-bottom: 12px; }
.v30-coll-empty-title { font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
/* Collection card  = same as v30-card but with collection tag overlay */
.v30-coll-card { position: relative; }
.v30-coll-tags {
  position: absolute; top: 6px; left: 6px;
  display: flex; flex-direction: column; gap: 3px; z-index: 3;
}
.v30-coll-tag {
  border-radius: 5px; padding: 2px 7px; font-size: 9px; font-weight: 700;
  letter-spacing: 0.3px; white-space: nowrap;
}

/* ─── TRAILER FIX ──────────────────────────────────────────── */
.v30-trailer-wrap {
  position: relative; width: 100%; aspect-ratio: 16/9;
  border-radius: 12px; overflow: hidden; background: #000; margin-bottom: 16px;
}
.v30-trailer-wrap iframe {
  position: absolute; inset: 0; width: 100%; height: 100%; border: none;
}
.v30-trailer-fallback {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  background: var(--surface2); color: var(--text-muted); text-align: center;
  padding: 20px;
}
.v30-trailer-fallback a {
  background: #ff0000; color: #fff; border-radius: 8px; padding: 10px 20px;
  text-decoration: none; font-weight: 700; font-size: 14px;
  display: flex; align-items: center; gap: 6px;
}
.v30-trailer-fallback a:hover { background: #cc0000; }

/* ─── MOVIE DETAIL MODAL V30 ────────────────────────────────── */
.v30-modal-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center; padding: 20px;
  animation: v30-fade-in 0.25s ease;
}
@keyframes v30-fade-in { from { opacity: 0; } to { opacity: 1; } }
.v30-modal {
  background: var(--surface); border: 1px solid var(--border2);
  border-radius: 20px; max-width: 800px; width: 100%;
  max-height: 90vh; overflow-y: auto; position: relative;
  animation: v30-slide-up 0.3s ease;
}
@keyframes v30-slide-up { from { transform: translateY(30px); opacity:0; } to { transform:translateY(0); opacity:1; } }
.v30-modal-hero {
  position: relative; height: 240px; overflow: hidden; border-radius: 20px 20px 0 0;
  background: var(--surface2);
}
.v30-modal-backdrop {
  width: 100%; height: 100%; object-fit: cover; opacity: 0.55;
}
.v30-modal-hero-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to top, var(--surface) 0%, transparent 60%);
}
.v30-modal-close {
  position: absolute; top: 14px; right: 14px; z-index: 5;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.1); color: #fff;
  border-radius: 50%; width: 34px; height: 34px; font-size: 16px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.v30-modal-close:hover { background: rgba(239,68,68,0.8); }
.v30-modal-body { padding: 0 24px 28px; }
.v30-modal-poster-row {
  display: flex; gap: 20px; align-items: flex-start;
  margin-top: -60px; margin-bottom: 20px; position: relative; z-index: 2;
}
.v30-modal-poster {
  width: 110px; height: 165px; border-radius: 12px; overflow: hidden;
  border: 3px solid var(--surface); flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}
.v30-modal-poster img { width: 100%; height: 100%; object-fit: cover; }
.v30-modal-meta { padding-top: 64px; flex: 1; min-width: 0; }
.v30-modal-title {
  font-size: 22px; font-weight: 900; letter-spacing: -0.4px; line-height: 1.2;
}
.v30-modal-chips {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
}
.v30-modal-chip {
  border-radius: 6px; padding: 3px 10px; font-size: 11px; font-weight: 600;
  background: var(--surface2); color: var(--text-muted); border: 1px solid var(--border2);
}
.v30-modal-chip.accent { background: rgba(124,111,247,0.15); color: #a78bfa; border-color: rgba(124,111,247,0.3); }
.v30-modal-chip.gold { background: rgba(251,191,36,0.15); color: #fbbf24; border-color: rgba(251,191,36,0.3); }
.v30-modal-chip.green { background: rgba(34,197,94,0.15); color: #4ade80; border-color: rgba(34,197,94,0.3); }
.v30-modal-section { margin-bottom: 20px; }
.v30-modal-section-title {
  font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  color: var(--text-muted); margin-bottom: 8px;
}
.v30-modal-overview {
  font-size: 14px; line-height: 1.7; color: rgba(232,232,244,0.8);
}
.v30-modal-trailer-section { margin-bottom: 24px; }
.v30-modal-actions {
  display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px;
}
.v30-modal-action {
  flex: 1; min-width: 120px; border: none; border-radius: 10px;
  padding: 11px 16px; font-size: 13px; font-weight: 700; cursor: pointer;
  font-family: inherit; transition: all 0.15s; text-align: center;
}
.v30-modal-action.add { background: var(--accent); color: #fff; }
.v30-modal-action.add:hover { background: #6d5fe0; }
.v30-modal-action.watchlist { background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
.v30-modal-action.watchlist:hover { background: rgba(251,191,36,0.25); }
.v30-modal-action.yt {
  background: rgba(255,0,0,0.12); color: #f87171;
  border: 1px solid rgba(255,0,0,0.25); text-decoration: none;
  display: flex; align-items: center; justify-content: center; gap: 6px;
}
.v30-modal-action.yt:hover { background: rgba(255,0,0,0.22); }
.v30-cast-row {
  display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;
}
.v30-cast-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  flex-shrink: 0; width: 72px;
}
.v30-cast-photo {
  width: 56px; height: 56px; border-radius: 50%; object-fit: cover;
  background: var(--surface2); border: 2px solid var(--border2);
}
.v30-cast-name {
  font-size: 10px; font-weight: 600; text-align: center; line-height: 1.3;
  color: var(--text-muted);
}

/* ─── Animations ─────────────────────────── */
@keyframes v30-card-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.v30-card { animation: v30-card-in 0.35s ease backwards; }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────
     2.  EXPLORE TAB — FULL REBUILD
  ───────────────────────────────────────────────────────────── */
  let exType = 'all';
  let exHeroData = null;

  const GENRES_MOVIE = [
    {id:28,label:'Action',icon:'💥'},{id:35,label:'Comedy',icon:'😂'},{id:18,label:'Drama',icon:'🎭'},
    {id:27,label:'Horror',icon:'👻'},{id:878,label:'Sci-Fi',icon:'🚀'},{id:10749,label:'Romance',icon:'💕'},
    {id:53,label:'Thriller',icon:'🔪'},{id:14,label:'Fantasy',icon:'🧙'},{id:80,label:'Crime',icon:'🕵️'},
    {id:16,label:'Animation',icon:'✨'},{id:99,label:'Documentary',icon:'🎙️'},{id:12,label:'Adventure',icon:'🗺️'},
  ];

  function buildExploreUI() {
    return `
<div id="v30-explore">
  <!-- HERO (filled async) -->
  <div id="v30-hero" class="v30-hero" style="min-height:280px">
    <div class="v30-hero-grad"></div>
    <div class="v30-hero-content">
      <div style="color:var(--text-muted);font-size:14px">Loading hero…</div>
    </div>
  </div>

  <!-- SEARCH -->
  <div class="v30-search-wrap">
    <span style="font-size:18px;flex-shrink:0">🔍</span>
    <input id="v30-search" class="v30-search-input" type="text" placeholder="Search movies, series, anime…" />
    <button id="v30-search-btn" class="v30-search-btn">Search</button>
  </div>
  <div id="v30-search-results"></div>

  <!-- TYPE PILLS -->
  <div class="v30-type-pills">
    <button class="v30-pill active" data-extype="all">🌐 All</button>
    <button class="v30-pill" data-extype="movie">🎬 Movies</button>
    <button class="v30-pill" data-extype="tv">📺 Series</button>
    <button class="v30-pill" data-extype="anime">⛩️ Anime</button>
  </div>

  <!-- DYNAMIC SECTIONS -->
  <div id="v30-sections"></div>

  <hr class="v30-divider"/>

  <!-- SMART RECS -->
  <div class="v30-section">
    <div class="v30-section-head">
      <div class="v30-section-title">🎲 Smart Discovery</div>
    </div>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px;line-height:1.6">
      Set your mood, genre, and era — let the engine find your next watch.
    </p>
    <div class="v30-rec-form">
      <select class="v30-rec-select" id="v30-rec-type">
        <option value="movie">🎬 Movie</option>
        <option value="tv">📺 TV Show</option>
      </select>
      <select class="v30-rec-select" id="v30-rec-genre">
        <option value="">Any Genre</option>
        ${GENRES_MOVIE.map(g=>`<option value="${g.id}">${g.icon} ${g.label}</option>`).join('')}
      </select>
      <select class="v30-rec-select" id="v30-rec-mood">
        <option value="">Any Mood</option>
        <option value="popular">🔥 Trending Now</option>
        <option value="top_rated">⭐ Critically Acclaimed</option>
        <option value="upcoming">🆕 New Releases</option>
        <option value="hidden">💎 Hidden Gems</option>
      </select>
      <select class="v30-rec-select" id="v30-rec-decade">
        <option value="">Any Era</option>
        <option value="2020">2020s</option>
        <option value="2010">2010s</option>
        <option value="2000">2000s</option>
        <option value="1990">1990s</option>
        <option value="1980">1980s</option>
        <option value="1970">1970s</option>
      </select>
      <button class="v30-rec-go" id="v30-rec-go">🎲 Discover</button>
    </div>
    <div id="v30-rec-results"></div>
  </div>

  <hr class="v30-divider"/>

  <!-- ACTOR / DIRECTOR -->
  <div class="v30-section">
    <div class="v30-section-head">
      <div class="v30-section-title">🎭 Actor & Director Search</div>
    </div>
    <p style="color:var(--text-muted);font-size:14px;margin-bottom:16px">
      Explore any actor or director's full filmography.
    </p>
    <div class="v30-actor-wrap">
      <input id="v30-actor-input" class="v30-actor-input" type="text" placeholder="e.g. Christopher Nolan, Zendaya…" />
      <button id="v30-actor-btn" class="v30-actor-btn">🔍 Search</button>
    </div>
    <div id="v30-actor-results"></div>
  </div>
</div>
    `;
  }

  function buildCard(item, type, delay = 0) {
    const el = document.createElement('div');
    el.className = 'v30-card';
    el.style.animationDelay = delay + 'ms';
    el.dataset.tmdbId = item.id;
    el.dataset.mediaType = type;
    el.dataset.title = item.title || item.name || '';
    el.dataset.year = (item.release_date || item.first_air_date || '').slice(0,4);

    const img = poster(item.poster_path);
    const title = item.title || item.name || 'Unknown';
    const year = (item.release_date || item.first_air_date || '').slice(0,4);
    const score = item.vote_average ? item.vote_average.toFixed(1) : '—';
    const saved = inLib(item.id);
    const typeLabel = type === 'movie' ? '🎬' : type === 'anime' ? '⛩️' : '📺';

    el.innerHTML = `
      <div class="v30-card-poster">
        ${img ? `<img src="${img}" alt="" loading="lazy">` : `<div class="v30-no-poster">🎬</div>`}
        <div class="v30-score-badge">⭐ ${score}</div>
        ${saved ? '<div class="v30-saved-badge">✓</div>' : ''}
        <div class="v30-type-badge ${type}">${typeLabel} ${type === 'movie' ? 'Film' : type === 'anime' ? 'Anime' : 'Series'}</div>
        <div class="v30-card-overlay">
          <button class="v30-card-add ${saved ? 'added' : ''}" data-id="${item.id}" data-type="${type}" ${saved ? 'disabled' : ''}>${saved ? '✓ Saved' : '+ Add'}</button>
        </div>
      </div>
      <div class="v30-card-body">
        <div class="v30-card-title" title="${title}">${title.length > 28 ? title.slice(0,27) + '…' : title}</div>
        <div class="v30-card-year">${year}</div>
      </div>
    `;

    // Card click → detail modal
    el.addEventListener('click', e => {
      if (e.target.closest('.v30-card-add')) return;
      openDetailModal(item, type);
    });

    // Add button
    const addBtn = el.querySelector('.v30-card-add');
    if (addBtn && !saved) {
      addBtn.addEventListener('click', async e => {
        e.stopPropagation();
        await quickAdd(item, type, addBtn);
      });
    }

    return el;
  }

  function buildRow(title, items, type) {
    const sec = document.createElement('div');
    sec.className = 'v30-section';
    sec.innerHTML = `<div class="v30-section-head"><div class="v30-section-title">${title}</div></div>`;
    const grid = document.createElement('div');
    grid.className = 'v30-row';
    items.slice(0, 16).forEach((item, i) => grid.appendChild(buildCard(item, type, i * 25)));
    sec.appendChild(grid);
    return sec;
  }

  async function loadExploreSections(typeFilter) {
    const sec = document.getElementById('v30-sections');
    if (!sec) return;
    sec.innerHTML = '<div class="v30-loading"><div class="v30-spinner"></div> Loading…</div>';

    const isAll   = typeFilter === 'all';
    const isMov   = typeFilter === 'movie';
    const isTv    = typeFilter === 'tv';
    const isAnime = typeFilter === 'anime';

    const fetches = [];

    // Trending
    if (isAll || isMov)   fetches.push(tmdb('trending/movie/week').then(r=>({key:'trend-m',title:'🔥 Trending Movies',items:r,type:'movie'})));
    if (isAll || isTv)    fetches.push(tmdb('trending/tv/week').then(r=>({key:'trend-tv',title:'🔥 Trending Series',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));
    if (isAll || isAnime) fetches.push(tmdb('discover/tv',{with_genres:'16',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'trend-a',title:'🔥 Trending Anime',items:r,type:'anime'})));

    // Top Rated
    if (isAll || isMov)   fetches.push(tmdb('movie/top_rated').then(r=>({key:'top-m',title:'⭐ Top Rated Movies',items:r,type:'movie'})));
    if (isAll || isTv)    fetches.push(tmdb('tv/top_rated').then(r=>({key:'top-tv',title:'⭐ Top Rated Series',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));
    if (isAll || isAnime) fetches.push(tmdb('discover/tv',{with_genres:'16',with_origin_country:'JP',sort_by:'vote_average.desc','vote_count.gte':'500'}).then(r=>({key:'top-a',title:'⭐ Top Rated Anime',items:r,type:'anime'})));

    // In Cinemas / On Air
    if (isAll || isMov)   fetches.push(tmdb('movie/now_playing').then(r=>({key:'now-m',title:'🎟️ In Cinemas Now',items:r,type:'movie'})));
    if (isAll || isMov)   fetches.push(tmdb('movie/upcoming').then(r=>({key:'up-m',title:'📅 Coming Soon',items:r,type:'movie'})));
    if (isAll || isTv)    fetches.push(tmdb('tv/on_the_air').then(r=>({key:'air-tv',title:'📡 On The Air',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));

    // Genre sections
    if (isAll || isMov) {
      fetches.push(tmdb('discover/movie',{with_genres:'28',sort_by:'popularity.desc'}).then(r=>({key:'g-act-m',title:'💥 Action Movies',items:r,type:'movie'})));
      fetches.push(tmdb('discover/movie',{with_genres:'35',sort_by:'popularity.desc'}).then(r=>({key:'g-com-m',title:'😂 Comedy Movies',items:r,type:'movie'})));
      fetches.push(tmdb('discover/movie',{with_genres:'27',sort_by:'popularity.desc'}).then(r=>({key:'g-hor-m',title:'👻 Horror Movies',items:r,type:'movie'})));
      fetches.push(tmdb('discover/movie',{with_genres:'878',sort_by:'popularity.desc'}).then(r=>({key:'g-sci-m',title:'🚀 Sci-Fi Movies',items:r,type:'movie'})));
      fetches.push(tmdb('discover/movie',{with_genres:'18',sort_by:'vote_average.desc','vote_count.gte':'300'}).then(r=>({key:'g-dra-m',title:'🎭 Drama Movies',items:r,type:'movie'})));
      fetches.push(tmdb('discover/movie',{sort_by:'vote_average.desc','vote_count.gte':'50','vote_count.lte':'800','vote_average.gte':'7.5'}).then(r=>({key:'gem-m',title:'💎 Hidden Gem Movies',items:r,type:'movie'})));
    }
    if (isAll || isTv) {
      fetches.push(tmdb('discover/tv',{with_genres:'18',sort_by:'vote_average.desc','vote_count.gte':'200'}).then(r=>({key:'g-dra-tv',title:'🎭 Drama Series',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));
      fetches.push(tmdb('discover/tv',{with_genres:'35',sort_by:'popularity.desc'}).then(r=>({key:'g-com-tv',title:'😂 Comedy Series',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));
      fetches.push(tmdb('discover/tv',{with_genres:'10765',sort_by:'popularity.desc'}).then(r=>({key:'g-sci-tv',title:'🚀 Sci-Fi & Fantasy Series',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));
      fetches.push(tmdb('discover/tv',{with_genres:'9648',sort_by:'popularity.desc'}).then(r=>({key:'g-mys-tv',title:'🔍 Mystery Series',items:r.filter(x=>!isAnimeItem(x)),type:'tv'})));
    }
    if (isAll || isAnime) {
      fetches.push(tmdb('discover/tv',{with_genres:'16,28',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-act-a',title:'💥 Action Anime',items:r,type:'anime'})));
      fetches.push(tmdb('discover/tv',{with_genres:'16,10749',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-rom-a',title:'💕 Romance Anime',items:r,type:'anime'})));
      fetches.push(tmdb('discover/tv',{with_genres:'16,9648',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-mys-a',title:'🔍 Mystery Anime',items:r,type:'anime'})));
    }

    const order = ['trend-m','trend-tv','trend-a','now-m','air-tv','top-m','top-tv','top-a','up-m',
      'g-act-m','g-act-a','g-dra-m','g-dra-tv','g-com-m','g-com-tv','g-hor-m','g-sci-m','g-sci-tv',
      'g-mys-tv','g-mys-a','g-rom-a','gem-m'];

    try {
      const res = await Promise.allSettled(fetches);
      sec.innerHTML = '';
      const byKey = {};
      res.forEach(r => { if (r.status === 'fulfilled' && r.value.items?.length) byKey[r.value.key] = r.value; });
      order.forEach(k => {
        if (!byKey[k]) return;
        const {title, items, type} = byKey[k];
        sec.appendChild(buildRow(title, items, type));
        delete byKey[k];
      });
      Object.values(byKey).forEach(({title,items,type}) => sec.appendChild(buildRow(title, items, type)));
      if (!sec.children.length) {
        sec.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:60px">Nothing found. Try a different filter.</p>';
      }
    } catch(err) {
      sec.innerHTML = '<p style="color:var(--red);text-align:center;padding:40px">⚠️ Failed to load. Check your connection.</p>';
      console.error('[V30 Explore]', err);
    }
  }

  async function loadHero() {
    const heroEl = document.getElementById('v30-hero');
    if (!heroEl) return;
    try {
      if (!exHeroData) {
        const res = await tmdb('trending/movie/day');
        exHeroData = res[Math.floor(Math.random() * Math.min(res.length, 5))];
      }
      const m = exHeroData;
      if (!m) return;
      const title = m.title || m.name || '';
      const year = (m.release_date || '').slice(0,4);
      const score = m.vote_average ? m.vote_average.toFixed(1) : '—';
      const bg = m.backdrop_path ? BASE_IMG + 'w1280' + m.backdrop_path : '';
      heroEl.innerHTML = `
        ${bg ? `<img class="v30-hero-img" src="${bg}" alt="">` : ''}
        <div class="v30-hero-grad"></div>
        <div class="v30-hero-content">
          <div class="v30-hero-badge">🔥 Trending Today</div>
          <div class="v30-hero-title">${title}</div>
          <div class="v30-hero-meta">
            <strong>⭐ ${score}</strong> <span>·</span> <span>${year}</span>
          </div>
          <div class="v30-hero-actions">
            <button class="v30-hero-btn primary" id="v30-hero-detail">🎬 View Details</button>
            <button class="v30-hero-btn secondary" id="v30-hero-add">${inLib(m.id) ? '✓ In Library' : '+ Add to Library'}</button>
          </div>
        </div>
      `;
      heroEl.querySelector('#v30-hero-detail')?.addEventListener('click', () => openDetailModal(m, 'movie'));
      const addHero = heroEl.querySelector('#v30-hero-add');
      if (addHero && !inLib(m.id)) {
        addHero.addEventListener('click', async () => {
          await quickAdd(m, 'movie', addHero);
          addHero.textContent = '✓ In Library';
        });
      }
    } catch(e) { console.warn('[V30 Hero]', e); }
  }

  function isAnimeItem(item) {
    return Array.isArray(item.genre_ids) && item.genre_ids.includes(16) &&
           Array.isArray(item.origin_country) && item.origin_country.includes('JP');
  }

  async function exSearch(q) {
    const res = document.getElementById('v30-search-results');
    if (!res) return;
    if (!q.trim()) { res.innerHTML = ''; return; }
    res.innerHTML = '<div class="v30-loading"><div class="v30-spinner"></div> Searching…</div>';
    try {
      const data = await tmdb('search/multi', { query: encodeURIComponent(q), include_adult: false });
      const items = data.filter(x => x.media_type === 'movie' || x.media_type === 'tv').slice(0, 20);
      if (!items.length) { res.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">No results found.</p>'; return; }
      res.innerHTML = `<div style="font-size:13px;color:var(--text-muted);margin-bottom:14px">Found <strong style="color:var(--text)">${items.length} results</strong> for "${q}"</div>`;
      const grid = document.createElement('div'); grid.className = 'v30-row';
      items.forEach((item, i) => {
        const type = isAnimeItem(item) ? 'anime' : item.media_type;
        grid.appendChild(buildCard(item, type, i * 20));
      });
      res.appendChild(grid);
    } catch { res.innerHTML = '<p style="color:var(--red);text-align:center">⚠️ Search failed.</p>'; }
  }

  async function fetchSmartRecs() {
    const type   = document.getElementById('v30-rec-type')?.value || 'movie';
    const genre  = document.getElementById('v30-rec-genre')?.value || '';
    const mood   = document.getElementById('v30-rec-mood')?.value || '';
    const decade = document.getElementById('v30-rec-decade')?.value || '';
    const resEl  = document.getElementById('v30-rec-results');
    const goBtn  = document.getElementById('v30-rec-go');
    if (!resEl) return;
    resEl.innerHTML = '<div class="v30-loading"><div class="v30-spinner"></div> Finding perfect titles…</div>';
    if (goBtn) { goBtn.disabled = true; goBtn.textContent = '⏳ Searching…'; }

    try {
      let endpoint, params = { page: String(Math.floor(Math.random() * 5) + 1) };
      if (mood === 'top_rated') endpoint = type === 'movie' ? 'movie/top_rated' : 'tv/top_rated';
      else if (mood === 'popular') endpoint = type === 'movie' ? 'movie/popular' : 'tv/popular';
      else if (mood === 'upcoming' && type === 'movie') endpoint = 'movie/upcoming';
      else {
        endpoint = type === 'movie' ? 'discover/movie' : 'discover/tv';
        params.sort_by = mood === 'hidden' ? 'vote_average.desc' : 'popularity.desc';
        if (mood === 'hidden') { params['vote_count.gte'] = '50'; params['vote_count.lte'] = '1200'; params['vote_average.gte'] = '7'; }
      }
      if (genre) params.with_genres = genre;
      if (decade) {
        const y2 = String(parseInt(decade) + 9);
        if (type === 'movie') { params['primary_release_date.gte'] = `${decade}-01-01`; params['primary_release_date.lte'] = `${y2}-12-31`; }
        else { params['first_air_date.gte'] = `${decade}-01-01`; params['first_air_date.lte'] = `${y2}-12-31`; }
      }

      const items = (await tmdb(endpoint, params)).slice(0, 18);
      if (!items.length) { resEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:32px">No results. Try different filters!</p>'; return; }

      resEl.innerHTML = '';
      const grid = document.createElement('div'); grid.className = 'v30-row';
      items.forEach((item, i) => {
        const t = type === 'tv' && isAnimeItem(item) ? 'anime' : type;
        grid.appendChild(buildCard(item, t, i * 20));
      });
      resEl.appendChild(grid);
    } catch(e) {
      resEl.innerHTML = '<p style="color:var(--red);text-align:center">⚠️ Failed. Try again.</p>';
    } finally {
      if (goBtn) { goBtn.disabled = false; goBtn.textContent = '🎲 Discover'; }
    }
  }

  async function actorSearch(q) {
    const resEl = document.getElementById('v30-actor-results');
    if (!resEl || !q.trim()) return;
    resEl.innerHTML = '<div class="v30-loading"><div class="v30-spinner"></div> Searching…</div>';
    try {
      const data = await tmdb('search/person', { query: encodeURIComponent(q) });
      const person = data[0];
      if (!person) { resEl.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Person not found.</p>'; return; }

      const credits = await tmdb(`person/${person.id}/combined_credits`);
      const castItems = ((credits.cast || credits) instanceof Array ? (credits.cast || credits) : [])
        .filter(x => (x.media_type === 'movie' || x.media_type === 'tv') && x.vote_count > 10)
        .sort((a,b) => (b.vote_average || 0) - (a.vote_average || 0))
        .slice(0, 20);

      resEl.innerHTML = '';
      const info = document.createElement('div');
      info.className = 'v30-actor-result';
      const ph = person.profile_path ? BASE_IMG + 'w92' + person.profile_path : '';
      info.innerHTML = `
        ${ph ? `<img class="v30-actor-photo" src="${ph}" alt="">` : '<div class="v30-actor-photo" style="display:flex;align-items:center;justify-content:center;font-size:24px">🎭</div>'}
        <div>
          <div class="v30-actor-name">${person.name}</div>
          <div class="v30-actor-sub">Known for: ${person.known_for_department || '—'} · ${castItems.length} credits</div>
        </div>
      `;
      resEl.appendChild(info);

      const grid = document.createElement('div'); grid.className = 'v30-row';
      castItems.forEach((item, i) => {
        const t = isAnimeItem(item) ? 'anime' : item.media_type;
        grid.appendChild(buildCard(item, t, i * 20));
      });
      resEl.appendChild(grid);
    } catch(e) {
      resEl.innerHTML = '<p style="color:var(--red);text-align:center">⚠️ Failed.</p>';
    }
  }

  function bindExploreEvents() {
    // Search
    const si = document.getElementById('v30-search');
    const sb = document.getElementById('v30-search-btn');
    if (sb) sb.addEventListener('click', () => exSearch(si?.value || ''));
    if (si) si.addEventListener('keydown', e => { if (e.key === 'Enter') exSearch(si.value); });

    // Type pills
    document.querySelectorAll('.v30-pill[data-extype]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.v30-pill[data-extype]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        exType = btn.dataset.extype;
        loadExploreSections(exType);
      });
    });

    // Smart recs
    document.getElementById('v30-rec-go')?.addEventListener('click', fetchSmartRecs);

    // Actor
    const ai = document.getElementById('v30-actor-input');
    document.getElementById('v30-actor-btn')?.addEventListener('click', () => actorSearch(ai?.value || ''));
    if (ai) ai.addEventListener('keydown', e => { if (e.key === 'Enter') actorSearch(ai.value); });

    // Load
    loadHero();
    loadExploreSections('all');
  }

  function hideOtherAppMainChildren(keepId) {
    const appMain = document.querySelector('.app-main');
    if (!appMain) return;
    Array.from(appMain.children).forEach(child => {
      if (child.id && child.id.startsWith('v30-') && child.id !== keepId) {
        child.style.display = 'none';
        return;
      }
      if (!child.id || !child.id.startsWith('v30-')) {
        child.dataset.v30Hidden = '1';
        child.style.display = 'none';
      }
    });
  }

  function restoreAppMainChildren() {
    // Remove body active classes (CSS will restore old content)
    document.body.classList.remove('v30-explore-active', 'v30-coll-active');
    const appMain = document.querySelector('.app-main');
    if (!appMain) return;
    Array.from(appMain.children).forEach(child => {
      if (child.dataset.v30Hidden) {
        delete child.dataset.v30Hidden;
        child.style.display = '';
      }
    });
    // Hide our custom containers
    const ex = document.getElementById('v30-explore-container');
    const co = document.getElementById('v30-coll-container');
    if (ex) ex.style.display = 'none';
    if (co) co.style.display = 'none';
  }

  function mountExplore() {
    const appMain = document.querySelector('.app-main');
    if (!appMain) return;

    const activeNav = document.querySelector('.nav-btn.active');
    if (!activeNav || !activeNav.textContent.toLowerCase().includes('explore')) return;

    // Activate body class FIRST (CSS will immediately hide other content)
    document.body.classList.remove('v30-coll-active');
    document.body.classList.add('v30-explore-active');

    // Also hide via JS as backup
    hideOtherAppMainChildren('v30-explore-container');

    let container = document.getElementById('v30-explore-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'v30-explore-container';
      container.innerHTML = buildExploreUI();
      appMain.insertBefore(container, appMain.firstChild);
      bindExploreEvents();
    } else {
      container.style.display = '';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     3.  COLLECTIONS TAB — FULL REBUILD
  ───────────────────────────────────────────────────────────── */

  // Premade collection definitions with auto-detect rules
  const PREMADE_COLLECTIONS = [
    {
      id: 'favourites', label: '❤️ Favourites', color: '#ef4444',
      auto: item => item.favorite === true || item.rating >= 9,
      desc: 'Your top-rated and favourited titles',
    },
    {
      id: 'marvel', label: '🦸 Marvel', color: '#e11d48',
      keywords: ['avengers','iron man','captain america','thor','spider-man','black panther','doctor strange','guardians of the galaxy','ant-man','captain marvel','black widow','hawkeye','loki','wandavision','the falcon','eternals','shang-chi','x-men','deadpool','wolverine','she-hulk','ms. marvel','moon knight','secret invasion','what if','daredevil','punisher','jessica jones','luke cage','iron fist'],
      tmdb_ids: [299536,299534,271110,284053,284054,284052,284055,99861,100402,245891,99861,262500,10138,271110,24428,1771,68721,1726,10195,284054,315635,618353,634649,566525,774752,616037,505642,648579,906126,82856,84958,138501,61889,62126,62127,62128,74204],
      auto: item => false,
      desc: 'The Marvel Cinematic Universe & more',
    },
    {
      id: 'dc', label: '🦇 DC', color: '#2563eb',
      keywords: ['batman','superman','wonder woman','justice league','aquaman','the flash','shazam','black adam','joker','suicide squad','birds of prey','green lantern','cyborg','peacemaker','harley quinn','gotham','supergirl','arrow','the flash','legends of tomorrow'],
      tmdb_ids: [209112,49521,297762,328111,297762,791373,339403,775996,475557,337339,495764,41154,791373,675353,565770,411,61240,1403,67744,62688],
      auto: item => false,
      desc: 'DC Extended Universe & classic DC',
    },
    {
      id: 'classics', label: '🎞️ Classics', color: '#92400e',
      auto: item => {
        const yr = parseInt(item.release_year || item.year || 0);
        return yr > 0 && yr < 1985;
      },
      desc: 'Golden age cinema (pre-1985)',
    },
    {
      id: 'scifi', label: '🚀 Sci-Fi', color: '#7c3aed',
      auto: item => (item.genres || []).some(g => typeof g === 'string'
        ? g.toLowerCase().includes('sci') || g.toLowerCase().includes('science')
        : g === 878),
      desc: 'Science fiction adventures',
    },
    {
      id: 'horror', label: '👻 Horror', color: '#1f2937',
      auto: item => (item.genres || []).some(g => typeof g === 'string'
        ? g.toLowerCase() === 'horror'
        : g === 27),
      desc: 'Horror films & series',
    },
    {
      id: 'comedy', label: '😂 Comedy', color: '#d97706',
      auto: item => (item.genres || []).some(g => typeof g === 'string'
        ? g.toLowerCase() === 'comedy'
        : g === 35),
      desc: 'Feel-good comedies',
    },
    {
      id: 'drama', label: '🎭 Drama', color: '#0891b2',
      auto: item => (item.genres || []).some(g => typeof g === 'string'
        ? g.toLowerCase() === 'drama'
        : g === 18),
      desc: 'Emotional dramatic titles',
    },
    {
      id: 'anime', label: '🌸 Anime', color: '#db2777',
      auto: item => item.media_type === 'anime' || item.type === 'anime' || item.is_anime === true,
      desc: 'Anime series & films',
    },
    {
      id: 'action', label: '💥 Action', color: '#dc2626',
      auto: item => (item.genres || []).some(g => typeof g === 'string'
        ? g.toLowerCase() === 'action'
        : g === 28),
      desc: 'Action-packed titles',
    },
    {
      id: 'watched', label: '✅ Watched', color: '#16a34a',
      auto: item => item.status === 'watched',
      desc: 'Everything you\'ve seen',
    },
    {
      id: 'watchlist', label: '🔖 Watchlist', color: '#6366f1',
      auto: item => item.status === 'want_to_watch',
      desc: 'Your watch queue',
    },
  ];

  function getCollItems(collId, lib) {
    // First check manual assignments
    const manual = getColl();
    const manualIds = new Set(manual[collId] || []);

    const coll = PREMADE_COLLECTIONS.find(c => c.id === collId);
    if (!coll) return lib.filter(item => manualIds.has(String(item.tmdb_id || item.id)));

    return lib.filter(item => {
      const itemId = String(item.tmdb_id || item.id);
      if (manualIds.has(itemId)) return true;

      // Auto-detect
      if (coll.auto && coll.auto(item)) return true;

      // Keyword match on title
      if (coll.keywords) {
        const titleLower = (item.title || '').toLowerCase();
        if (coll.keywords.some(kw => titleLower.includes(kw))) return true;
      }

      // TMDB ID list match
      if (coll.tmdb_ids) {
        const tid = parseInt(item.tmdb_id || item.id);
        if (coll.tmdb_ids.includes(tid)) return true;
      }

      return false;
    });
  }

  function addToCollection(collId, tmdbId) {
    const manual = getColl();
    if (!manual[collId]) manual[collId] = [];
    if (!manual[collId].includes(String(tmdbId))) {
      manual[collId].push(String(tmdbId));
      saveColl(manual);
    }
  }

  function removeFromCollection(collId, tmdbId) {
    const manual = getColl();
    if (manual[collId]) {
      manual[collId] = manual[collId].filter(id => id !== String(tmdbId));
      saveColl(manual);
    }
  }

  let activeCollId = 'all';

  function buildCollectionsUI() {
    return `<div id="v30-collections">
      <div class="v30-coll-header">
        <div>
          <div class="v30-coll-title">📂 Collections</div>
          <div class="v30-coll-subtitle">Smart collections — auto-sorted by genre, franchise & more</div>
        </div>
      </div>
      <div class="v30-coll-tabs" id="v30-coll-tabs"></div>
      <div id="v30-coll-grid"></div>
    </div>`;
  }

  function renderCollections(libOverride) {
    const lib = libOverride || getLib();
    const tabsEl = document.getElementById('v30-coll-tabs');
    const gridEl = document.getElementById('v30-coll-grid');
    if (!tabsEl || !gridEl) return;

    // Build tabs
    tabsEl.innerHTML = '';

    // "All" tab
    const allTab = document.createElement('button');
    allTab.className = `v30-coll-tab ${activeCollId === 'all' ? 'active' : ''}`;
    allTab.dataset.collId = 'all';
    allTab.innerHTML = `🌐 All <span class="v30-coll-count">${lib.length}</span>`;
    tabsEl.appendChild(allTab);

    PREMADE_COLLECTIONS.forEach(coll => {
      const items = getCollItems(coll.id, lib);
      if (items.length === 0) return;
      const tab = document.createElement('button');
      tab.className = `v30-coll-tab ${activeCollId === coll.id ? 'active' : ''}`;
      tab.dataset.collId = coll.id;
      tab.innerHTML = `${coll.label} <span class="v30-coll-count">${items.length}</span>`;
      tabsEl.appendChild(tab);
    });

    tabsEl.querySelectorAll('.v30-coll-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCollId = btn.dataset.collId;
        renderCollGrid(lib);
        tabsEl.querySelectorAll('.v30-coll-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    renderCollGrid(lib);
  }

  function renderCollGrid(lib) {
    const gridEl = document.getElementById('v30-coll-grid');
    if (!gridEl) return;

    let items = activeCollId === 'all' ? lib : getCollItems(activeCollId, lib);

    if (!items.length) {
      gridEl.innerHTML = `<div class="v30-coll-empty">
        <div class="v30-coll-empty-icon">🎬</div>
        <div class="v30-coll-empty-title">Nothing here yet</div>
        <div>Add movies to your library and they'll appear here automatically</div>
      </div>`;
      return;
    }

    gridEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'v30-coll-grid';

    items.forEach((item, idx) => {
      const tmdbId = item.tmdb_id || item.id;
      const mediaType = item.media_type || item.type || 'movie';
      const img = poster(item.poster_path);
      const title = item.title || item.name || 'Unknown';
      const year = item.release_year || item.year || '';
      const rating = item.rating ? `⭐ ${item.rating}` : (item.tmdb_score ? `★ ${item.tmdb_score}` : '');
      const statusColors = {watched:'#22c55e',want_to_watch:'#6366f1',watching:'#f59e0b',dropped:'#ef4444'};
      const statusLabel = {watched:'Watched',want_to_watch:'Watchlist',watching:'Watching',dropped:'Dropped'};

      // Collect which premade collections this item belongs to
      const itemColls = PREMADE_COLLECTIONS.filter(c => {
        const ci = getCollItems(c.id, [item]);
        return ci.length > 0;
      }).slice(0,3);

      const card = document.createElement('div');
      card.className = 'v30-card v30-coll-card';
      card.style.animationDelay = (idx * 25) + 'ms';
      card.innerHTML = `
        <div class="v30-card-poster">
          ${img ? `<img src="${img}" alt="" loading="lazy">` : `<div class="v30-no-poster">🎬</div>`}
          ${rating ? `<div class="v30-score-badge">${rating}</div>` : ''}
          ${item.status ? `<div class="v30-type-badge" style="background:${statusColors[item.status]||'#6366f1'}88;color:${statusColors[item.status]||'#a5b4fc'}">${statusLabel[item.status]||item.status}</div>` : ''}
          <div class="v30-coll-tags">
            ${itemColls.slice(0,2).map(c=>`<div class="v30-coll-tag" style="background:${c.color}33;color:${c.color};border:1px solid ${c.color}55">${c.label.split(' ')[0]}</div>`).join('')}
          </div>
        </div>
        <div class="v30-card-body">
          <div class="v30-card-title" title="${title}">${title.length > 28 ? title.slice(0,27) + '…' : title}</div>
          <div class="v30-card-year">${year}</div>
        </div>
      `;

      // Click to open detail modal with library item data
      card.addEventListener('click', () => openDetailModal({
        id: tmdbId, tmdb_id: tmdbId, title, poster_path: item.poster_path,
        backdrop_path: item.backdrop_path, overview: item.overview, release_date: year + '-01-01',
        vote_average: item.tmdb_score, genre_ids: item.genres || []
      }, mediaType));

      grid.appendChild(card);
    });

    gridEl.appendChild(grid);
  }

  function mountCollections() {
    const appMain = document.querySelector('.app-main');
    if (!appMain) return;

    const activeNav = document.querySelector('.nav-btn.active');
    if (!activeNav || !activeNav.textContent.toLowerCase().includes('collection')) return;

    // Activate body class FIRST (CSS will immediately hide other content)
    document.body.classList.remove('v30-explore-active');
    document.body.classList.add('v30-coll-active');

    // Also hide via JS as backup
    hideOtherAppMainChildren('v30-coll-container');

    let container = document.getElementById('v30-coll-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'v30-coll-container';
      container.innerHTML = buildCollectionsUI();
      appMain.insertBefore(container, appMain.firstChild);
    } else {
      container.style.display = '';
    }

    renderCollections();
  }

  /* ─────────────────────────────────────────────────────────────
     4.  TRAILER FIX — youtube-nocookie + fallback
  ───────────────────────────────────────────────────────────── */
  const trailerCache = {};

  async function fetchTrailerKey(tmdbId, type) {
    const key = `${type}_${tmdbId}`;
    if (trailerCache[key] !== undefined) return trailerCache[key];
    try {
      const data = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/videos?api_key=${TMDB_KEY}`).then(r=>r.json());
      const vid = (data.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')
               || (data.results || []).find(v => v.site === 'YouTube')
               || null;
      trailerCache[key] = vid ? vid.key : null;
    } catch { trailerCache[key] = null; }
    return trailerCache[key];
  }

  function buildTrailerHTML(ytKey, title) {
    if (!ytKey) return `<div class="v30-trailer-fallback"><div>🎬</div><p>No trailer available for "${title}"</p></div>`;
    return `
      <div class="v30-trailer-wrap">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${ytKey}?autoplay=0&rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          id="trailer-iframe-${ytKey}"
        ></iframe>
        <div class="v30-trailer-fallback" id="trailer-fallback-${ytKey}" style="display:none">
          <p>Embed blocked. Watch on YouTube:</p>
          <a href="https://www.youtube.com/watch?v=${ytKey}" target="_blank" rel="noopener">▶ Watch Trailer on YouTube</a>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     5.  MOVIE DETAIL MODAL — UPGRADED
  ───────────────────────────────────────────────────────────── */
  const genreMap = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy'};

  async function openDetailModal(item, type) {
    // Remove existing modal
    document.getElementById('v30-modal-overlay')?.remove();

    // Build skeleton modal first
    const overlay = document.createElement('div');
    overlay.className = 'v30-modal-overlay';
    overlay.id = 'v30-modal-overlay';
    overlay.innerHTML = `<div class="v30-modal" id="v30-modal-inner"><div style="display:flex;align-items:center;justify-content:center;height:200px"><div class="v30-spinner" style="width:36px;height:36px;border-width:3px"></div></div></div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeDetailModal();
    });

    try {
      const [details, credits, videos] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/${type === 'anime' ? 'tv' : type}/${item.id || item.tmdb_id}?api_key=${TMDB_KEY}&language=en-US`).then(r=>r.json()).catch(()=>item),
        fetch(`https://api.themoviedb.org/3/${type === 'anime' ? 'tv' : type}/${item.id || item.tmdb_id}/credits?api_key=${TMDB_KEY}`).then(r=>r.json()).catch(()=>({})),
        fetch(`https://api.themoviedb.org/3/${type === 'anime' ? 'tv' : type}/${item.id || item.tmdb_id}/videos?api_key=${TMDB_KEY}`).then(r=>r.json()).catch(()=>({})),
      ]);

      const title = details.title || details.name || item.title || 'Unknown';
      const year = (details.release_date || details.first_air_date || '').slice(0, 4);
      const overview = details.overview || item.overview || 'No overview available.';
      const backdropUrl = details.backdrop_path ? BASE_IMG + 'w1280' + details.backdrop_path : '';
      const posterUrl = details.poster_path ? BASE_IMG + 'w342' + details.poster_path : '';
      const score = details.vote_average ? details.vote_average.toFixed(1) : '—';
      const runtime = details.runtime ? `${details.runtime}min` : (details.episode_run_time?.[0] ? `~${details.episode_run_time[0]}min/ep` : '');
      const genres = (details.genres || []).map(g => g.name).filter(Boolean);
      const status = details.status || '';
      const cast = (credits.cast || []).slice(0, 8);

      // Trailer
      const trailer = (videos.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')
                   || (videos.results || []).find(v => v.site === 'YouTube');
      const ytKey = trailer?.key || null;

      const savedInLib = inLib(item.id || item.tmdb_id);

      const modal = document.getElementById('v30-modal-inner');
      modal.innerHTML = `
        <div class="v30-modal-hero">
          ${backdropUrl ? `<img class="v30-modal-backdrop" src="${backdropUrl}" alt="" loading="lazy">` : ''}
          <div class="v30-modal-hero-grad"></div>
          <button class="v30-modal-close" id="v30-modal-close-btn">✕</button>
        </div>
        <div class="v30-modal-body">
          <div class="v30-modal-poster-row">
            ${posterUrl ? `<div class="v30-modal-poster"><img src="${posterUrl}" alt="" loading="lazy"></div>` : ''}
            <div class="v30-modal-meta">
              <div class="v30-modal-title">${title}</div>
              <div class="v30-modal-chips">
                ${year ? `<span class="v30-modal-chip">${year}</span>` : ''}
                ${score !== '—' ? `<span class="v30-modal-chip gold">⭐ ${score}</span>` : ''}
                ${runtime ? `<span class="v30-modal-chip">${runtime}</span>` : ''}
                ${status ? `<span class="v30-modal-chip green">${status}</span>` : ''}
                ${type === 'tv' ? '<span class="v30-modal-chip accent">📺 Series</span>' : type === 'anime' ? '<span class="v30-modal-chip accent">⛩️ Anime</span>' : '<span class="v30-modal-chip accent">🎬 Film</span>'}
                ${genres.slice(0,3).map(g=>`<span class="v30-modal-chip">${g}</span>`).join('')}
              </div>
            </div>
          </div>

          <!-- Trailer -->
          ${ytKey ? `
          <div class="v30-modal-trailer-section">
            <div class="v30-modal-section-title">🎬 Trailer</div>
            ${buildTrailerHTML(ytKey, title)}
          </div>` : ''}

          <!-- Overview -->
          <div class="v30-modal-section">
            <div class="v30-modal-section-title">📖 Overview</div>
            <div class="v30-modal-overview">${overview}</div>
          </div>

          <!-- Cast -->
          ${cast.length ? `
          <div class="v30-modal-section">
            <div class="v30-modal-section-title">🎭 Cast</div>
            <div class="v30-cast-row">
              ${cast.map(c => {
                const ph = c.profile_path ? BASE_IMG + 'w92' + c.profile_path : '';
                return `<div class="v30-cast-item">
                  ${ph ? `<img class="v30-cast-photo" src="${ph}" alt="" loading="lazy">` : '<div class="v30-cast-photo" style="display:flex;align-items:center;justify-content:center;font-size:20px">🎭</div>'}
                  <div class="v30-cast-name">${c.name}</div>
                </div>`;
              }).join('')}
            </div>
          </div>` : ''}

          <!-- Actions -->
          <div class="v30-modal-actions">
            <button class="v30-modal-action add" id="v30-modal-add-btn">
              ${savedInLib ? '✓ In Library' : '+ Add to Library'}
            </button>
            <button class="v30-modal-action watchlist" id="v30-modal-wl-btn">🔖 Watchlist</button>
            ${ytKey ? `<a class="v30-modal-action yt" href="https://www.youtube.com/results?search_query=${encodeURIComponent(title + ' trailer')}" target="_blank" rel="noopener">▶ YouTube</a>` : ''}
          </div>
        </div>
      `;

      // Close
      document.getElementById('v30-modal-close-btn')?.addEventListener('click', closeDetailModal);
      document.addEventListener('keydown', escHandler);

      // Add to library
      const addBtn = document.getElementById('v30-modal-add-btn');
      if (addBtn && !savedInLib) {
        addBtn.addEventListener('click', async () => {
          await quickAdd({ ...details, id: details.id || item.id }, type, addBtn);
        });
      }

      // Add to watchlist
      document.getElementById('v30-modal-wl-btn')?.addEventListener('click', async () => {
        await quickAdd({ ...details, id: details.id || item.id }, type, null, 'want_to_watch');
        window.v24Toast?.('Added to Watchlist!', 'success');
      });

    } catch(e) {
      console.error('[V30 Modal]', e);
      document.getElementById('v30-modal-inner').innerHTML = `<div style="padding:40px;text-align:center;color:var(--red)">⚠️ Failed to load details.</div><button class="v30-modal-close" style="position:static;margin:16px auto;display:block" onclick="document.getElementById('v30-modal-overlay').remove()">Close</button>`;
    }
  }

  function closeDetailModal() {
    document.getElementById('v30-modal-overlay')?.remove();
    document.removeEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') closeDetailModal();
  }

  /* ─────────────────────────────────────────────────────────────
     6.  QUICK ADD TO LIBRARY
  ───────────────────────────────────────────────────────────── */
  const GENRE_MAP_LOCAL = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy'};

  async function quickAdd(item, type, btn, statusOverride) {
    if (btn) { btn.textContent = '⏳'; btn.disabled = true; }
    try {
      const entry = {
        id: crypto.randomUUID(),
        tmdb_id: item.id,
        media_type: type === 'anime' ? 'tv' : type,
        is_anime: type === 'anime',
        title: item.title || item.name || 'Unknown',
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        overview: item.overview || '',
        release_year: (item.release_date || item.first_air_date || '').slice(0,4),
        genres: (item.genres || []).map(g => g.name || GENRE_MAP_LOCAL[g] || g).filter(Boolean),
        tmdb_score: Math.round((item.vote_average || 0) * 10) / 10,
        status: statusOverride || 'want_to_watch',
        rating: null, review: '', favorite: false,
        date_added: new Date().toISOString(),
        rewatched: 0, tags: [], episodeRatings: [],
      };

      if (window.reactSetLibrary) {
        window.reactSetLibrary(prev => {
          if (prev.some(x => x.tmdb_id === item.id && x.media_type === entry.media_type)) return prev;
          return [entry, ...prev];
        });
      } else {
        // Direct localStorage fallback
        const lib = getLib();
        if (!lib.some(x => String(x.tmdb_id) === String(item.id))) {
          lib.unshift(entry);
          saveLib(lib);
        }
      }

      if (btn) { btn.textContent = '✓ In Library'; btn.className = (btn.className || '') + ' added'; }
      window.v24Toast?.(`"${entry.title}" added!`, 'success');
    } catch(e) {
      if (btn) { btn.textContent = '+ Add'; btn.disabled = false; }
      window.v24Toast?.('Failed to add. Try again.', 'error');
    }
  }

  /* ─────────────────────────────────────────────────────────────
     7.  OBSERVER — watch for page changes
  ───────────────────────────────────────────────────────────── */
  let lastPage = '';

  function enforceV30() {
    // Called when we need to forcefully re-apply our UI even if lastPage didn't change
    if (lastPage.includes('explore')) {
      document.body.classList.add('v30-explore-active');
      document.body.classList.remove('v30-coll-active');
      hideOtherAppMainChildren('v30-explore-container');
      // Also hide the overlay directly in case CSS is slow
      const overlay = document.getElementById('cinelog-custom-overlay');
      if (overlay) overlay.style.display = 'none';
    } else if (lastPage.includes('collection')) {
      document.body.classList.add('v30-coll-active');
      document.body.classList.remove('v30-explore-active');
      hideOtherAppMainChildren('v30-coll-container');
      const overlay = document.getElementById('cinelog-custom-overlay');
      if (overlay) overlay.style.display = 'none';
    }
  }

  function checkCurrentPage() {
    const activeNav = document.querySelector('.nav-btn.active');
    if (!activeNav) return;
    const page = activeNav.textContent.trim().toLowerCase();
    const changed = page !== lastPage;
    lastPage = page;

    if (page.includes('explore')) {
      if (changed) setTimeout(mountExplore, 120);
      else enforceV30(); // same page: just re-enforce
    } else if (page.includes('collection')) {
      if (changed) setTimeout(mountCollections, 120);
      else enforceV30();
    } else {
      if (changed) restoreAppMainChildren();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     8.  SUPPRESS CRASH OVERLAY for benign errors
  ───────────────────────────────────────────────────────────── */
  function suppressBenignErrors() {
    const origOnError = window.onerror;
    window.onerror = function(msg, src, line, col, err) {
      const msgStr = String(msg || '');
      // Suppress React hydration mismatches, YouTube embed errors, extension errors
      if (
        msgStr.includes('ResizeObserver') ||
        msgStr.includes('Script error') ||
        msgStr.includes('Non-Error promise') ||
        (src || '').includes('youtube') ||
        (src || '').includes('extension') ||
        (src || '').includes('chrome-extension')
      ) {
        return true; // suppress
      }
      if (origOnError) return origOnError.apply(this, arguments);
      return false;
    };
  }

  /* ─────────────────────────────────────────────────────────────
     9.  OVERRIDE CineLogUpgrade explore (disable old one)
  ───────────────────────────────────────────────────────────── */
  function patchUpgrade() {
    const tryPatch = () => {
      if (!window.CineLogUpgrade) return;
      // Redirect explore-only methods → our V30 mountExplore.
      // DO NOT patch getCustomOverlay — it is shared by Tier List, Cinema Club, etc.
      window.CineLogUpgrade.mountExploreTab       = () => mountExplore();
      window.CineLogUpgrade.renderExploreTab      = () => mountExplore();
      window.CineLogUpgrade.setupExploreIntercept = () => {};
      // CSS (body.v30-explore-active #cinelog-custom-overlay { display:none!important })
      // + enforceV30() direct style hide are enough to suppress the overlay for explore.
    };
    tryPatch();
    setTimeout(tryPatch, 500);
    setTimeout(tryPatch, 1500);
    setTimeout(tryPatch, 4000);
  }

  function init() {
    injectStyles();
    suppressBenignErrors();
    patchUpgrade();

    // Intercept nav clicks — fire quickly + delayed to catch React re-render
    document.addEventListener('click', e => {
      const btn = e.target.closest('.nav-btn');
      if (btn) {
        setTimeout(checkCurrentPage, 80);
        setTimeout(checkCurrentPage, 400);
      }
    });

    // Observe app-main for React child changes (page switches)
    function attachMainObserver() {
      const appMain = document.querySelector('.app-main');
      if (!appMain || appMain._v30Observed) return;
      appMain._v30Observed = true;
      new MutationObserver(() => {
        const p = lastPage;
        if (p.includes('explore') || p.includes('collection')) {
          setTimeout(() => {
            enforceV30(); // Use enforceV30 instead of just hideOtherAppMainChildren
          }, 60);
        }
      }).observe(appMain, { childList: true });
    }

    // Watch body for the cinelog-custom-overlay appearing or changing display
    new MutationObserver((mutations) => {
      attachMainObserver();
      // If any added node is the upgrade.js overlay, hide it immediately
      for (const mut of mutations) {
        for (const node of mut.addedNodes) {
          if (node.id === 'cinelog-custom-overlay') {
            node.style.setProperty('display', 'none', 'important');
          }
        }
      }
      // Also catch the overlay setting display:block via style attribute changes
    }).observe(document.body, { childList: true, subtree: false, attributes: false });

    // Separate observer for the overlay's style attribute
    function watchOverlay() {
      const overlay = document.getElementById('cinelog-custom-overlay');
      if (!overlay || overlay._v30Watched) return;
      overlay._v30Watched = true;
      new MutationObserver(() => {
        if (lastPage.includes('explore') || lastPage.includes('collection')) {
          overlay.style.setProperty('display', 'none', 'important');
        }
      }).observe(overlay, { attributes: true, attributeFilter: ['style'] });
    }

    setTimeout(() => { attachMainObserver(); watchOverlay(); checkCurrentPage(); }, 700);
    setTimeout(() => { watchOverlay(); checkCurrentPage(); }, 1800);
    // Keep watch alive with interval - enforces every 1.5s while on v30 pages
    setInterval(() => {
      watchOverlay();
      if (lastPage.includes('explore') || lastPage.includes('collection')) {
        enforceV30();
      }
    }, 1500);

    console.log('%c🚀 CineLog V30 Ultra Active', 'background:linear-gradient(135deg,#7c6ff7,#ec4899);color:#fff;font-size:14px;font-weight:900;padding:6px 14px;border-radius:8px;');
  }


  // Wait for app to be ready
  if (document.querySelector('.app-header, .main-nav, .nav-btn')) {
    setTimeout(init, 600);
  } else {
    const bootObs = new MutationObserver(() => {
      if (document.querySelector('.app-header, .main-nav, .nav-btn')) {
        bootObs.disconnect();
        setTimeout(init, 600);
      }
    });
    bootObs.observe(document.body, { childList: true, subtree: true });
  }

})();

