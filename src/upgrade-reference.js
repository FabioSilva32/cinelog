// CINELOG UPGRADE SCRIPT (v15 Features - Phase 2)
(function() {
  const TMDB_KEY = "6a2fd6b9b1bb3befbb9f14c203732225";
  const LIB_KEY = "cinelog_library_v2";
  const TAGS_KEY = "cinelog_tags_v1";
  const BASE_IMG = "https://image.tmdb.org/t/p/";

  window.CineLogUpgrade = {
    init() {
      console.log("🚀 CineLog Upgrades Initializing...");
      
      // Auto-repair missing genres in localStorage library
      try {
        const libKey = "cinelog_library_v2";
        const libStr = localStorage.getItem(libKey);
        if (libStr) {
          let lib = JSON.parse(libStr);
          let changed = false;
          if (Array.isArray(lib)) {
            lib.forEach(item => {
              if (!item.genres) {
                item.genres = [];
                changed = true;
              }
              if (item.tmdb_score === undefined) {
                item.tmdb_score = item.tmdb_vote || item.vote_average || 0;
                changed = true;
              }
              if (item.favorite === undefined) {
                item.favorite = false;
                changed = true;
              }
              if (item.review === undefined) {
                item.review = "";
                changed = true;
              }
            });
            if (changed) {
              localStorage.setItem(libKey, JSON.stringify(lib));
              console.log("🏥 CineLog Auto-Repair: Successfully fixed library items schema!");
            }
          }
        }
      } catch(e) {
        console.error("🏥 CineLog Auto-Repair failed:", e);
      }
      
      this.setupKeyboardShortcuts();
      
      this.createModals();
      this.createAchievementsSidebar();
      this.setupObserver();
      this.checkMilestones();
      this.loadSortable();

      try {
        this.tags = JSON.parse(localStorage.getItem(TAGS_KEY)) || {};
      } catch (e) {
        this.tags = {};
      }
    },

    getLibrary() {
      try {
        return JSON.parse(localStorage.getItem(LIB_KEY)) || [];
      } catch (e) {
        return [];
      }
    },

    // ─── 1. THEME TOGGLE (disabled - handled by new Settings dropdown) ──────
    setupThemeToggle() {
      // Theme is now managed by the ⚙️ Settings dropdown → 🎨 Theme option.
      // This stub is intentionally empty to prevent duplicate buttons.
    },

    // ─── 2. KEYBOARD SHORTCUTS ─────────────────────────────────────────────
    setupKeyboardShortcuts() {
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          const searchInput = document.querySelector('.search-input');
          if (searchInput) searchInput.focus();
        }
        if (e.key === 'Escape') {
          this.closeModals();
          this.closeAchievementsSidebar();
        }
      });
    },

    injectNavButtons() {
      const nav = document.querySelector('.main-nav');
      if (!nav || document.getElementById('cl-nav-extras-container')) return;

      const container = document.createElement('div');
      container.id = 'cl-nav-extras-container';
      container.className = 'upgrade-nav';
      container.style.cssText = 'position:relative; display:inline-block;';

      container.innerHTML = `
        <button id="cl-nav-extras" class="nav-btn">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Settings ▾</span>
        </button>
        <div id="cl-extras-dropdown" class="extras-dropdown-menu" style="display:none;">
          <button class="extras-dropdown-item" data-page-id="calendar"><span class="nav-icon">📅</span> Watch Calendar</button>
          <button class="extras-dropdown-item" data-page-id="ai-recs"><span class="nav-icon">🤖</span> AI Picks</button>
          <button class="extras-dropdown-item" data-page-id="challenges"><span class="nav-icon">🏆</span> Challenges</button>
          <button class="extras-dropdown-item" data-page-id="deep-stats"><span class="nav-icon">📈</span> Deep Stats</button>
          <button class="extras-dropdown-item" data-page-id="theme"><span class="nav-icon">🎨</span> Theme</button>
          <button class="extras-dropdown-item" data-page-id="cinetrivia"><span class="nav-icon">🎮</span> CineTrivia Game</button>
          <hr style="border:none; border-top:1px solid var(--border); margin:4px 0">
          <button class="extras-dropdown-settings-btn" onclick="window.CineLogUpgrade.showSettingsModal(); document.getElementById('cl-extras-dropdown').style.display='none';"><span class="nav-icon">📥</span> Data &amp; Export</button>
        </div>
      `;
      nav.appendChild(container);
      
      const extrasBtn = container.querySelector('#cl-nav-extras');
      const dropdown  = container.querySelector('#cl-extras-dropdown');
      
      // Move dropdown to document.body to prevent clipping by parent z-index and overflow boundaries
      document.body.appendChild(dropdown);

      // Toggle dropdown on Settings button click
      extrasBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.style.display === 'flex';
              if (isOpen) {
          dropdown.style.display = 'none';
          extrasBtn.classList.remove('dropdown-open');
        } else {
          // Position using fixed coords to escape nav overflow clip
          const rect = extrasBtn.getBoundingClientRect();
          dropdown.style.left = rect.left + 'px';
          dropdown.style.top  = (rect.bottom + 6) + 'px';
          dropdown.style.display = 'flex';
          extrasBtn.classList.add('dropdown-open');
        }
      });


      // Dropdown item clicks
      dropdown.querySelectorAll('.extras-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.style.display = 'none';
          extrasBtn.classList.remove('dropdown-open');

          const pageId = item.dataset.pageId;
          if (pageId === 'theme') {
            const panel = document.getElementById('theme-panel');
            if (panel) panel.classList.add('open');
          } else if (pageId === 'cinetrivia') {
            window.CineLogUpgrade.openCineTriviaGame();
          } else if (typeof showPage === 'function') {
            showPage(pageId);
          } else {
            // Fallback: find and call the showPage from Script 7
            const overlay = document.getElementById('cl-page-overlay');
            if (overlay) {
              const pageMap = {
                'calendar':   'cal-page',
                'ai-recs':    'airec-page',
                'challenges': 'chall-page',
                'deep-stats': 'richstats-page',
              };
              // Hide all pages
              Object.values(pageMap).forEach(pid => {
                const el = document.getElementById(pid);
                if (el) { el.style.display = 'none'; el.classList.remove('visible'); }
              });
              const targetId = pageMap[pageId];
              if (targetId) {
                overlay.style.display = 'block';
                const el = document.getElementById(targetId);
                if (el) { el.style.display = 'block'; el.classList.add('visible'); }
              }
            }
          }
        });
      });

      // Close dropdown when clicking anywhere outside the container or dropdown itself
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
          extrasBtn.classList.remove('dropdown-open');
        }
      });
    },


    // ─── 4. ACHIEVEMENTS SIDEBAR ────────────────────────────────────────────
    createAchievementsSidebar() {
      // Backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'achievements-backdrop';
      backdrop.id = 'achievements-backdrop';
      backdrop.onclick = () => this.closeAchievementsSidebar();
      document.body.appendChild(backdrop);

      // Sidebar
      const sidebar = document.createElement('div');
      sidebar.className = 'achievements-sidebar';
      sidebar.id = 'achievements-sidebar';
      sidebar.innerHTML = `
        <div class="achievements-header">
          <h2>🏆 Achievements</h2>
          <button class="close-sidebar-btn" onclick="window.CineLogUpgrade.closeAchievementsSidebar()">✕</button>
        </div>
        <div class="achievements-list" id="achievements-list"></div>
      `;
      document.body.appendChild(sidebar);

      // Inject Trophy button into header
      
    },

    openAchievementsSidebar() {
      this.renderAchievements();
      document.getElementById('achievements-sidebar').classList.add('open');
      document.getElementById('achievements-backdrop').classList.add('open');
    },

    closeAchievementsSidebar() {
      const s = document.getElementById('achievements-sidebar');
      const b = document.getElementById('achievements-backdrop');
      if (s) s.classList.remove('open');
      if (b) b.classList.remove('open');
    },

    renderAchievements() {
      const lib = this.getLibrary();
      const watched = lib.filter(x => x.status === 'watched');
      const movies = watched.filter(x => x.type === 'movie' || x.media_type === 'movie');
      const tv = watched.filter(x => x.type === 'tv' || x.media_type === 'tv');
      const anime = watched.filter(x => x.type === 'anime' || (x.media_type === 'tv' && x.is_anime));
      const rated = lib.filter(x => x.rating);
      const lowRated = rated.filter(x => x.rating <= 2);
      const highRated = rated.filter(x => x.rating >= 5);
      const totalRating = rated.reduce((a, b) => a + (b.rating || 0), 0);
      const avgRating = rated.length > 0 ? totalRating / rated.length : 0;
      const planned = lib.filter(x => x.status === 'plan_to_watch');
      const decades = new Set(lib.filter(x => x.year).map(x => Math.floor(Number(x.year) / 10) * 10));

      const ACHIEVEMENTS = [
        { id: 'first_step',   icon: '🎬', name: 'First Step',      desc: 'Add your first title to the library.',       target: 1,   current: lib.length,     unit: 'titles' },
        { id: 'cinephile10',  icon: '🍿', name: 'Movie Fan',        desc: 'Watch 10 movies.',                           target: 10,  current: movies.length,  unit: 'movies' },
        { id: 'cinephile50',  icon: '🎥', name: 'Cinephile',        desc: 'Watch 50 movies.',                           target: 50,  current: movies.length,  unit: 'movies' },
        { id: 'cinephile100', icon: '🎞️', name: 'Film Buff',        desc: 'Watch 100 movies.',                          target: 100, current: movies.length,  unit: 'movies' },
        { id: 'binge10',      icon: '📺', name: 'Binge Starter',    desc: 'Watch 10 TV shows.',                         target: 10,  current: tv.length,      unit: 'shows' },
        { id: 'binge50',      icon: '🖥️', name: 'Binge Watcher',    desc: 'Watch 50 TV shows.',                         target: 50,  current: tv.length,      unit: 'shows' },
        { id: 'otaku',        icon: '🌸', name: 'Anime Enthusiast', desc: 'Watch 10 anime series.',                     target: 10,  current: anime.length,   unit: 'anime' },
        { id: 'critic',       icon: '😤', name: 'Tough Critic',     desc: 'Give 5 ratings of 2 stars or below.',        target: 5,   current: lowRated.length, unit: 'low ratings' },
        { id: 'fan',          icon: '😍', name: 'Super Fan',        desc: 'Give 10 ratings of 5 stars.',                target: 10,  current: highRated.length, unit: 'top ratings' },
        { id: 'wishlist20',   icon: '📋', name: 'Planner',          desc: 'Add 20 titles to your watchlist.',           target: 20,  current: planned.length, unit: 'planned' },
        { id: 'decades3',     icon: '⏳', name: 'Time Traveler',    desc: 'Watch films from 3 different decades.',      target: 3,   current: decades.size,   unit: 'decades' },
        { id: 'decades5',     icon: '🕰️', name: 'Decade Hopper',    desc: 'Watch films from 5 different decades.',      target: 5,   current: decades.size,   unit: 'decades' },
        { id: 'library100',   icon: '📚', name: 'Librarian',        desc: 'Have 100 titles in your collection.',        target: 100, current: lib.length,     unit: 'titles' },
        { id: 'rated50',      icon: '⭐', name: 'Critic',           desc: 'Rate 50 titles.',                            target: 50,  current: rated.length,   unit: 'rated' },
        { id: 'alltype',      icon: '🌐', name: 'Genre Master',     desc: 'Watch a movie, a TV show, and an anime.',    target: 3,   current: [movies.length > 0, tv.length > 0, anime.length > 0].filter(Boolean).length, unit: 'types' },
      ];

      const list = document.getElementById('achievements-list');
      if (!list) return;
      list.innerHTML = '';

      // Stats summary at top
      const summary = document.createElement('div');
      summary.style.cssText = 'background:var(--surface2);border-radius:12px;padding:16px;border:1px solid var(--border2);display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:8px;';
      summary.innerHTML = `
        <div style="text-align:center"><div style="font-size:24px;font-weight:900;color:var(--accent)">${watched.length}</div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Watched</div></div>
        <div style="text-align:center"><div style="font-size:24px;font-weight:900;color:var(--accent)">${rated.length}</div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Rated</div></div>
        <div style="text-align:center"><div style="font-size:24px;font-weight:900;color:var(--accent)">${avgRating > 0 ? avgRating.toFixed(1) : '-'}</div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Avg Rating</div></div>
        <div style="text-align:center"><div style="font-size:24px;font-weight:900;color:var(--accent)">${ACHIEVEMENTS.filter(a => a.current >= a.target).length}/${ACHIEVEMENTS.length}</div><div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Unlocked</div></div>
      `;
      list.appendChild(summary);

      let achHtml = '';
      ACHIEVEMENTS.forEach(a => {
        const unlocked = a.current >= a.target;
        const pct = Math.min(100, Math.round((a.current / a.target) * 100));
        achHtml += `<div class="achievement-card ${unlocked ? '' : 'locked'}">
          <div class="achievement-icon">${a.icon}</div>
          <div class="achievement-info">
            <h4>${a.name} ${unlocked ? '<span style="color:var(--accent);font-size:12px">✓ Unlocked</span>' : ''}</h4>
            <p>${a.desc}</p>
            <p style="margin-top:4px;font-size:12px;color:var(--accent)">${Math.min(a.current, a.target)} / ${a.target} ${a.unit}</p>
            <div class="achievement-progress">
              <div class="achievement-progress-bar" style="width:${pct}%"></div>
            </div>
          </div>
        </div>`;
      });
      list.innerHTML += achHtml;
    },

    // ─── 5. EXPLORE TAB REMAKE ─────────────────────────────────────────────
    setupExploreIntercept() {
      if (this.exploreIntercepted) return;

      const nav = document.querySelector('.main-nav');
      if (!nav) return;

      // Find the Explore nav button
      const allNavBtns = nav.querySelectorAll('.nav-btn');
      let exploreBtn = null;
      allNavBtns.forEach(btn => {
        if (btn.textContent.toLowerCase().includes('explore')) {
          exploreBtn = btn;
        }
      });

      if (!exploreBtn) return;
      this.exploreIntercepted = true;

      exploreBtn.addEventListener('click', (e) => {
        // Wait a tick for React to render the explore page
        setTimeout(() => this.mountExploreTab(), 100);
      }, true);

      // If already on explore page
      if (exploreBtn.classList.contains('active')) {
        setTimeout(() => this.mountExploreTab(), 300);
      }
    },

    mountExploreTab() {
      const appMain = document.querySelector('.app-main');
      if (!appMain) return;

      // Look for and hide the old explore page content
      const explorePage = appMain.querySelector('.explore-page, [class*="explore"]');
      if (!document.getElementById('cinelog-explore-remake')) {
        // Inject our custom explore UI
        const container = document.createElement('div');
        container.id = 'cinelog-explore-remake';
        container.className = 'explore-remake';

        // Check if we're actually on the explore page by looking at active nav
        const activeNav = document.querySelector('.nav-btn.active');
        if (!activeNav || !activeNav.textContent.toLowerCase().includes('explore')) return;

        // Hide react's explore page
        if (explorePage) explorePage.style.display = 'none';

        container.innerHTML = this.buildExploreHTML();
        appMain.insertBefore(container, appMain.firstChild);

        this.bindExploreEvents();
      }
    },

    buildExploreHTML() {
      return `
        <div class="explore-v3" style="padding-bottom:60px">

          <!-- ── HEADER ───────────────────────────────────────────── -->
          <div style="margin-bottom:28px">
            <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.5px;margin-bottom:6px">🌍 Explore</h1>
            <p style="color:var(--text-muted);font-size:14px">Trending movies, series & anime — plus deep search tools</p>
          </div>

          <!-- ── SEARCH BAR ────────────────────────────────────────── -->
          <div style="display:flex;gap:10px;margin-bottom:32px;flex-wrap:wrap">
            <input id="ex-search-input" type="text" placeholder="🔍  Search any title…"
              style="flex:1;min-width:200px;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:15px;outline:none"/>
            <button id="ex-search-btn" class="btn-primary" style="padding:12px 22px;border-radius:10px;font-size:15px;white-space:nowrap">Search</button>
          </div>
          <div id="ex-search-results" style="margin-bottom:40px"></div>

          <!-- ── TYPE TABS ─────────────────────────────────────────── -->
          <div style="display:flex;gap:8px;margin-bottom:28px;flex-wrap:wrap">
            <button class="ex-type-btn active" data-type="all"  style="padding:8px 18px;border-radius:20px;border:1px solid var(--border);background:var(--accent);color:#fff;font-size:13px;font-weight:700;cursor:pointer">🌐 All</button>
            <button class="ex-type-btn" data-type="movie" style="padding:8px 18px;border-radius:20px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px;font-weight:600;cursor:pointer">🎬 Movies</button>
            <button class="ex-type-btn" data-type="tv"    style="padding:8px 18px;border-radius:20px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px;font-weight:600;cursor:pointer">📺 Series</button>
            <button class="ex-type-btn" data-type="anime" style="padding:8px 18px;border-radius:20px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:13px;font-weight:600;cursor:pointer">⛩️ Anime</button>
          </div>

          <!-- ── DYNAMIC SECTIONS (filled by JS) ───────────────────── -->
          <div id="ex-sections"></div>

          <!-- ── DIVIDER ──────────────────────────────────────────── -->
          <hr style="border:none;border-top:1px solid var(--border);margin:44px 0 36px"/>

          <!-- ── SMART RECOMMENDATIONS ────────────────────────────── -->
          <div style="margin-bottom:44px">
            <div class="explore-section-title">🤖 Smart Recommendations</div>
            <p style="color:var(--text-muted);font-size:14px;margin-bottom:18px;line-height:1.6">Filter by mood, genre, era and let the engine find your next watch.</p>
            <div class="smart-rec-form" id="smart-rec-form">
              <select class="smart-rec-select" id="rec-type" title="Media Type">
                <option value="movie">🎬 Movie</option>
                <option value="tv">📺 TV Show</option>
              </select>
              <select class="smart-rec-select" id="rec-genre" title="Genre">
                <option value="">Any Genre</option>
                <option value="28">💥 Action</option>
                <option value="35">😂 Comedy</option>
                <option value="18">🎭 Drama</option>
                <option value="27">👻 Horror</option>
                <option value="878">🚀 Sci-Fi</option>
                <option value="10749">💕 Romance</option>
                <option value="53">😰 Thriller</option>
                <option value="16">🎨 Animation</option>
                <option value="99">🎙️ Documentary</option>
                <option value="14">🧙 Fantasy</option>
                <option value="80">🔫 Crime</option>
                <option value="12">🗺️ Adventure</option>
                <option value="9648">🔍 Mystery</option>
                <option value="10751">👨‍👩‍👧 Family</option>
                <option value="36">📜 History</option>
              </select>
              <select class="smart-rec-select" id="rec-mood" title="Mood">
                <option value="">Any Mood</option>
                <option value="popular">🔥 Trending Now</option>
                <option value="top_rated">⭐ Critically Acclaimed</option>
                <option value="upcoming">🆕 New Releases</option>
                <option value="hidden">💎 Hidden Gems</option>
              </select>
              <select class="smart-rec-select" id="rec-decade" title="Era">
                <option value="">Any Era</option>
                <option value="2020">2020s</option>
                <option value="2010">2010s</option>
                <option value="2000">2000s</option>
                <option value="1990">1990s</option>
                <option value="1980">1980s</option>
                <option value="1970">1970s</option>
              </select>
              <button class="btn-primary" id="rec-go-btn" style="padding:12px 24px;font-size:15px;border-radius:10px;white-space:nowrap">
                🎲 Find Titles
              </button>
            </div>
            <div id="smart-rec-results" style="margin-top:24px"></div>
          </div>

          <!-- ── ACTOR / DIRECTOR ────────────────────────────────── -->
          <div>
            <div class="explore-section-title">🎭 Actor & Director Deep Dive</div>
            <p style="color:var(--text-muted);font-size:14px;margin-bottom:18px;line-height:1.6">Search any actor or director to explore their full filmography.</p>
            <div class="actor-search-bar">
              <input type="text" class="smart-rec-input" id="actor-search-input"
                placeholder="e.g. Christopher Nolan, Zendaya…" style="flex:1"/>
              <button class="btn-primary" id="actor-search-btn" style="padding:12px 24px;font-size:15px;border-radius:10px;white-space:nowrap">🔍 Search</button>
            </div>
            <div id="actor-results" class="actor-results"></div>
          </div>

        </div>
      `;
    },

    /* ── helpers ─────────────────────────────────────────────────── */

    _exType: 'all',   // current type tab

    async _exFetch(endpoint, params = {}) {
      const p = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', ...params });
      const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?${p}`);
      return (await res.json()).results || [];
    },

    _inLib(id) {
      const lib = this.getLibrary();
      return lib.some(x => x.tmdb_id === id);
    },

    _quickAddBtn(item, type) {
      const inLib = this._inLib(item.id);
      const btn = document.createElement('button');
      btn.className = `add-btn ${inLib ? 'added' : ''}`;
      btn.style.cssText = 'position:absolute;bottom:6px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:11px;padding:4px 10px;border-radius:6px;';
      btn.textContent = inLib ? '✓ In Library' : '+ Add';
      btn.disabled = inLib;
      if (!inLib) {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          btn.textContent = '⏳';
          btn.disabled = true;
          try {
            const genreMap = {28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',53:'Thriller',10752:'War',37:'Western',10759:'Action & Adventure',10765:'Sci-Fi & Fantasy',10764:'Reality'};
            const entry = {
              id: crypto.randomUUID(),
              tmdb_id: item.id,
              media_type: type,
              title: item.title || item.name || 'Unknown',
              poster_path: item.poster_path || null,
              backdrop_path: item.backdrop_path || null,
              overview: item.overview || '',
              release_year: (item.release_date || item.first_air_date || '').slice(0,4),
              genres: (item.genre_ids || []).map(id => genreMap[id]).filter(Boolean),
              tmdb_score: Math.round((item.vote_average || 0) * 10) / 10,
              status: 'want_to_watch',
              rating: null, review: '', favorite: false,
              date_added: new Date().toISOString(),
              rewatched: 0, tags: [], episodeRatings: []
            };
            if (window.reactSetLibrary) {
              window.reactSetLibrary(prev => {
                if (prev.some(x => x.tmdb_id === item.id && x.media_type === type)) return prev;
                return [entry, ...prev];
              });
            }
            btn.textContent = '✓ In Library';
            btn.className = 'add-btn added';
            if (window.toast) window.toast.success(`"${entry.title}" added!`);
          } catch { btn.textContent = '+ Add'; btn.disabled = false; }
        });
      }
      return btn;
    },

    _buildCard(item, type) {
      const poster = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '';
      const title = item.title || item.name || 'Unknown';
      const year = (item.release_date || item.first_air_date || '').slice(0,4);
      const score = item.vote_average ? item.vote_average.toFixed(1) : '—';
      const inLib = this._inLib(item.id);

      const card = document.createElement('div');
      card.className = 'media-card';
      card.style.cssText = 'position:relative;cursor:default;';
      card.dataset.tmdbId    = String(item.id || '');
      card.dataset.mediaType = type;
      card.dataset.title     = title;
      card.dataset.year      = year;
      card.innerHTML = `
        <div class="card-poster" style="position:relative">
          ${poster
            ? `<img src="${poster}" alt="${title.replace(/"/g,'')}" loading="lazy" style="width:100%;height:100%;object-fit:cover">`
            : `<div style="background:var(--surface3);height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">🎬</div>`}
          <div class="score-badge">⭐ ${score}</div>
          ${inLib ? '<div style="position:absolute;top:6px;left:6px;background:#22c55e;color:#fff;border-radius:5px;padding:2px 7px;font-size:10px;font-weight:700">✓ Saved</div>' : ''}
        </div>
        <div class="card-info">
          <div class="type-tag ${type}" style="margin-bottom:4px">${type==='movie'?'🎬 Movie':type==='anime'?'⛩️ Anime':'📺 Series'}</div>
          <div style="font-weight:700;font-size:12px;line-height:1.3;margin-top:4px">${title.length>28?title.slice(0,27)+'…':title}</div>
          <div style="color:var(--text-muted);font-size:11px;margin-top:2px">${year}</div>
        </div>
      `;
      const btn = this._quickAddBtn(item, type);
      card.querySelector('.card-poster').appendChild(btn);
      return card;
    },

    _buildRow(id, title, items, type) {
      const section = document.createElement('div');
      section.style.cssText = 'margin-bottom:44px';
      section.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div class="explore-section-title" style="margin-bottom:0">${title}</div>
        </div>
        <div id="${id}" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px"></div>
      `;
      const grid = section.querySelector(`#${id}`);
      items.slice(0, 14).forEach(item => grid.appendChild(this._buildCard(item, type)));
      return section;
    },

    async _loadExploreSections(typeFilter) {
      const sec = document.getElementById('ex-sections');
      if (!sec) return;
      sec.innerHTML = '<div class="loading-row"><div class="spinner"></div> Loading content…</div>';

      try {
        const fetchAll = (ep, p) => this._exFetch(ep, p);
        const isAnime = typeFilter === 'anime';
        const isMovie = typeFilter === 'movie';
        const isTv    = typeFilter === 'tv';
        const showAll = typeFilter === 'all';

        const fetches = [];

        // ── Trending ───────────────────────────────────────────────
        if (showAll || isMovie) fetches.push(fetchAll('trending/movie/week').then(r => ({key:'trend-movie', title:'🔥 Trending Movies', items:r, type:'movie'})));
        if (showAll || isTv)   fetches.push(fetchAll('trending/tv/week').then(r => ({key:'trend-tv', title:'🔥 Trending Series', items:r.filter(x=>!this._isAnime(x)), type:'tv'})));
        if (showAll || isAnime)fetches.push(fetchAll('discover/tv',{with_genres:'16',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'trend-anime',title:'🔥 Trending Anime',items:r,type:'anime'})));

        // ── Top Rated ──────────────────────────────────────────────
        if (showAll || isMovie) fetches.push(fetchAll('movie/top_rated').then(r => ({key:'top-movie', title:'⭐ Top Rated Movies', items:r, type:'movie'})));
        if (showAll || isTv)   fetches.push(fetchAll('tv/top_rated').then(r => ({key:'top-tv', title:'⭐ Top Rated Series', items:r.filter(x=>!this._isAnime(x)), type:'tv'})));
        if (showAll || isAnime)fetches.push(fetchAll('discover/tv',{with_genres:'16',with_origin_country:'JP',sort_by:'vote_average.desc','vote_count.gte':'500'}).then(r=>({key:'top-anime',title:'⭐ Top Rated Anime',items:r,type:'anime'})));

        // ── New / Upcoming ─────────────────────────────────────────
        if (showAll || isMovie) fetches.push(fetchAll('movie/now_playing').then(r => ({key:'now-movie', title:'🆕 In Cinemas Now', items:r, type:'movie'})));
        if (showAll || isMovie) fetches.push(fetchAll('movie/upcoming').then(r => ({key:'up-movie', title:'📅 Coming Soon', items:r, type:'movie'})));
        if (showAll || isTv)   fetches.push(fetchAll('tv/on_the_air').then(r=>({key:'air-tv',title:'📡 On The Air',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));

        // ── Genre rows ─────────────────────────────────────────────
        if (showAll || isMovie) {
          fetches.push(fetchAll('discover/movie',{with_genres:'28',sort_by:'popularity.desc'}).then(r=>({key:'g-action-m',title:'💥 Action Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'35',sort_by:'popularity.desc'}).then(r=>({key:'g-comedy-m',title:'😂 Comedy Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'27',sort_by:'popularity.desc'}).then(r=>({key:'g-horror-m',title:'👻 Horror Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'878',sort_by:'popularity.desc'}).then(r=>({key:'g-scifi-m',title:'🚀 Sci-Fi Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'18',sort_by:'vote_average.desc','vote_count.gte':'300'}).then(r=>({key:'g-drama-m',title:'🎭 Drama Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'14',sort_by:'popularity.desc'}).then(r=>({key:'g-fantasy-m',title:'🧙 Fantasy Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'80',sort_by:'popularity.desc'}).then(r=>({key:'g-crime-m',title:'🔫 Crime Movies',items:r,type:'movie'})));
          fetches.push(fetchAll('discover/movie',{with_genres:'99',sort_by:'vote_average.desc','vote_count.gte':'100'}).then(r=>({key:'g-doc-m',title:'🎙️ Documentaries',items:r,type:'movie'})));
          // Hidden gems
          fetches.push(fetchAll('discover/movie',{sort_by:'vote_average.desc','vote_count.gte':'50','vote_count.lte':'800','vote_average.gte':'7.5'}).then(r=>({key:'gems-m',title:'💎 Hidden Gem Movies',items:r,type:'movie'})));
        }
        if (showAll || isTv) {
          fetches.push(fetchAll('discover/tv',{with_genres:'18',sort_by:'vote_average.desc','vote_count.gte':'200'}).then(r=>({key:'g-drama-tv',title:'🎭 Drama Series',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'35',sort_by:'popularity.desc'}).then(r=>({key:'g-comedy-tv',title:'😂 Comedy Series',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'10765',sort_by:'popularity.desc'}).then(r=>({key:'g-scifi-tv',title:'🚀 Sci-Fi & Fantasy Series',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'80',sort_by:'popularity.desc'}).then(r=>({key:'g-crime-tv',title:'🔫 Crime Series',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'9648',sort_by:'popularity.desc'}).then(r=>({key:'g-mystery-tv',title:'🔍 Mystery Series',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));
          fetches.push(fetchAll('discover/tv',{sort_by:'vote_average.desc','vote_count.gte':'80','vote_count.lte':'600','vote_average.gte':'7.5'}).then(r=>({key:'gems-tv',title:'💎 Hidden Gem Series',items:r.filter(x=>!this._isAnime(x)),type:'tv'})));
        }
        if (showAll || isAnime) {
          fetches.push(fetchAll('discover/tv',{with_genres:'16,28',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-action-a',title:'💥 Action Anime',items:r,type:'anime'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'16,10749',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-romance-a',title:'💕 Romance Anime',items:r,type:'anime'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'16,14',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-fantasy-a',title:'🧙 Fantasy Anime',items:r,type:'anime'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'16,9648',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-mystery-a',title:'🔍 Mystery Anime',items:r,type:'anime'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'16,35',with_origin_country:'JP',sort_by:'popularity.desc'}).then(r=>({key:'g-comedy-a',title:'😂 Comedy Anime',items:r,type:'anime'})));
          fetches.push(fetchAll('discover/tv',{with_genres:'16',with_origin_country:'JP',sort_by:'vote_average.desc','vote_count.gte':'200'}).then(r=>({key:'gems-a',title:'💎 Hidden Gem Anime',items:r,type:'anime'})));
        }

        const results = await Promise.allSettled(fetches);
        sec.innerHTML = '';

        // Define preferred order
        const order = ['trend-movie','trend-tv','trend-anime','now-movie','air-tv','top-movie','top-tv','top-anime','up-movie',
          'g-action-m','g-action-a','g-drama-m','g-drama-tv','g-comedy-m','g-comedy-tv','g-comedy-a',
          'g-horror-m','g-scifi-m','g-scifi-tv','g-fantasy-m','g-fantasy-a','g-crime-m','g-crime-tv',
          'g-mystery-tv','g-mystery-a','g-romance-a','g-doc-m','g-drama-tv','gems-m','gems-tv','gems-a'];

        const byKey = {};
        results.forEach(r => { if (r.status === 'fulfilled' && r.value.items.length) byKey[r.value.key] = r.value; });

        order.forEach(k => {
          if (!byKey[k]) return;
          const {title, items, type, key} = byKey[k];
          sec.appendChild(this._buildRow(key+'-grid', title, items, type));
          delete byKey[k];
        });
        // Any leftovers
        Object.values(byKey).forEach(({title,items,type,key}) => {
          sec.appendChild(this._buildRow(key+'-grid', title, items, type));
        });

        if (!sec.children.length) {
          sec.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:40px">Nothing found. Try a different type filter.</p>';
        }
      } catch(err) {
        sec.innerHTML = `<p style="color:var(--red);text-align:center;padding:32px">⚠️ Failed to load content. Check your connection.</p>`;
        console.error(err);
      }
    },

    _isAnime(item) {
      return Array.isArray(item.genre_ids) && item.genre_ids.includes(16) &&
        Array.isArray(item.origin_country) && item.origin_country.includes('JP');
    },

    async _exSearch(query) {
      const res = document.getElementById('ex-search-results');
      if (!res) return;
      if (!query.trim()) { res.innerHTML = ''; return; }
      res.innerHTML = '<div class="loading-row"><div class="spinner"></div> Searching…</div>';
      try {
        const data = await this._exFetch('search/multi', { query: encodeURIComponent(query), include_adult: false });
        const items = data.filter(x => x.media_type === 'movie' || x.media_type === 'tv').slice(0, 20);
        if (!items.length) { res.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">No results found.</p>'; return; }
        res.innerHTML = `<div style="font-size:13px;color:var(--text-muted);margin-bottom:12px">Found <strong style="color:var(--text)">${items.length} results</strong> for "${query}"</div>`;
        const grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:14px';
        items.forEach(item => {
          const type = this._isAnime(item) ? 'anime' : item.media_type;
          grid.appendChild(this._buildCard(item, type));
        });
        res.appendChild(grid);
      } catch { res.innerHTML = '<p style="color:var(--red);text-align:center">⚠️ Search failed.</p>'; }
    },

    bindExploreEvents() {
      // Search
      const searchBtn = document.getElementById('ex-search-btn');
      const searchInput = document.getElementById('ex-search-input');
      if (searchBtn) searchBtn.addEventListener('click', () => this._exSearch(searchInput?.value || ''));
      if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') this._exSearch(searchInput.value); });

      // Type tabs
      document.querySelectorAll('.ex-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.ex-type-btn').forEach(b => {
            b.style.background = 'var(--surface2)';
            b.style.color = 'var(--text)';
            b.classList.remove('active');
          });
          btn.style.background = 'var(--accent)';
          btn.style.color = '#fff';
          btn.classList.add('active');
          this._exType = btn.dataset.type;
          this._loadExploreSections(this._exType);
        });
      });

      // Smart recs
      const goBtn = document.getElementById('rec-go-btn');
      if (goBtn) goBtn.addEventListener('click', () => this.fetchSmartRecs());

      // Actor search
      const actorBtn = document.getElementById('actor-search-btn');
      if (actorBtn) actorBtn.addEventListener('click', () => this.searchActor());
      const actorInput = document.getElementById('actor-search-input');
      if (actorInput) actorInput.addEventListener('keydown', e => { if (e.key === 'Enter') this.searchActor(); });

      // Auto-load sections
      setTimeout(() => this._loadExploreSections('all'), 100);
    },

    async fetchSmartRecs() {
      const type   = document.getElementById('rec-type').value;
      const genre  = document.getElementById('rec-genre').value;
      const mood   = document.getElementById('rec-mood').value;
      const decade = document.getElementById('rec-decade').value;
      const results = document.getElementById('smart-rec-results');
      const btn    = document.getElementById('rec-go-btn');

      results.innerHTML = `<div class="loading-row"><div class="spinner"></div> Finding perfect titles for you…</div>`;
      btn.disabled = true;
      btn.textContent = '⏳ Searching…';

      try {
        let endpoint = 'movie';
        let params = new URLSearchParams({ api_key: TMDB_KEY, language: 'en-US', page: 1, include_adult: false });

        if (mood === 'top_rated') {
          endpoint = type === 'movie' ? 'movie/top_rated' : 'tv/top_rated';
        } else if (mood === 'upcoming' && type === 'movie') {
          endpoint = 'movie/upcoming';
        } else if (mood === 'popular') {
          endpoint = type === 'movie' ? 'movie/popular' : 'tv/popular';
        } else {
          endpoint = type === 'movie' ? 'discover/movie' : 'discover/tv';
          params.set('sort_by', mood === 'hidden' ? 'vote_average.desc' : 'popularity.desc');
          if (mood === 'hidden') {
            params.set('vote_count.gte', '50');
            params.set('vote_count.lte', '1000');
            params.set('vote_average.gte', '7');
          }
        }

        if (genre) params.set('with_genres', genre);
        if (decade) {
          const endYear = String(parseInt(decade) + 9);
          if (type === 'movie') {
            params.set('primary_release_date.gte', `${decade}-01-01`);
            params.set('primary_release_date.lte', `${endYear}-12-31`);
          } else {
            params.set('first_air_date.gte', `${decade}-01-01`);
            params.set('first_air_date.lte', `${endYear}-12-31`);
          }
        }

        params.set('page', Math.floor(Math.random() * 5) + 1);

        const res = await fetch(`https://api.themoviedb.org/3/${endpoint}?${params}`);
        const data = await res.json();
        const items = (data.results || []).slice(0, 18);

        if (!items.length) {
          results.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px">No results found. Try different filters!</p>`;
          return;
        }

        const lib = this.getLibrary();
        const watchedIds = new Set(lib.filter(x => x.status === 'watched').map(x => String(x.tmdb_id || x.id)));

        results.innerHTML = `
          <div style="margin-bottom:16px;font-size:14px;color:var(--text-muted)">
            Found <strong style="color:var(--text)">${items.length} titles</strong> matching your mood
            ${watchedIds.size ? ` · <span style="color:var(--green)">✓ Green border</span> = already watched` : ''}
          </div>
          <div class="media-grid" id="rec-grid"></div>
        `;

        const grid = document.getElementById('rec-grid');
        items.forEach(item => {
          const title = item.title || item.name || 'Unknown';
          const year = (item.release_date || item.first_air_date || '').slice(0, 4);
          const rating = item.vote_average ? item.vote_average.toFixed(1) : '?';
          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : '';
          const alreadyWatched = watchedIds.has(String(item.id));

          const card = document.createElement('div');
          card.className = 'media-card';
          if (alreadyWatched) card.style.cssText = 'outline:2px solid var(--green);outline-offset:-2px;';
          card.style.position = 'relative';
          card.dataset.tmdbId    = String(movie.id || '');
          card.dataset.mediaType = type;
          card.dataset.title     = title;
          card.dataset.year      = year;
          card.innerHTML = `
            <div class="card-poster">
              ${poster
                ? `<img src="${poster}" alt="${title}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=background:var(--surface3);height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:32px>🎬</div>'">`
                : `<div style="background:var(--surface3);height:100%;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:32px">🎬</div>`}
              <div class="score-badge">⭐ ${rating}</div>
              ${alreadyWatched ? '<div style="position:absolute;top:8px;left:8px;background:var(--green);color:white;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700">✓ Watched</div>' : ''}
            </div>
            <div class="card-info">
              <div class="type-tag ${type}" style="margin-bottom:4px">${type === 'movie' ? 'Movie' : 'TV'}</div>
              <div style="font-weight:700;font-size:13px;line-height:1.3;margin-top:4px">${title}</div>
              <div style="color:var(--text-muted);font-size:12px;margin-top:2px">${year}</div>
            </div>
          `;
          grid.appendChild(card);
        });

      } catch (err) {
        results.innerHTML = `<p style="color:var(--red);text-align:center;padding:24px">⚠️ Failed to fetch recommendations. Check your internet connection.</p>`;
        console.error('SmartRec error:', err);
      } finally {
        btn.disabled = false;
        btn.textContent = '🎲 Find Titles';
      }
    },

    async searchActor() {
      const query = document.getElementById('actor-search-input').value.trim();
      if (!query) return;

      const results = document.getElementById('actor-results');
      const btn = document.getElementById('actor-search-btn');

      results.innerHTML = `<div class="loading-row"><div class="spinner"></div> Searching for "${query}"…</div>`;
      btn.disabled = true;

      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`);
        const data = await res.json();
        const people = (data.results || []).slice(0, 3);

        if (!people.length) {
          results.innerHTML = `<p style="color:var(--text-muted);text-align:center;padding:32px">No results found for "${query}"</p>`;
          return;
        }

        results.innerHTML = '';
        for (const person of people) {
          await this.renderPersonCard(person, results);
        }
      } catch (err) {
        results.innerHTML = `<p style="color:var(--red);text-align:center;padding:24px">⚠️ Failed to search. Check your internet connection.</p>`;
        console.error('Actor search error:', err);
      } finally {
        btn.disabled = false;
      }
    },

    async renderPersonCard(person, container) {
      const lib = this.getLibrary();
      const watchedIds = new Set(lib.filter(x => x.status === 'watched').map(x => String(x.tmdb_id || x.id)));
      const plannedIds = new Set(lib.filter(x => x.status === 'plan_to_watch').map(x => String(x.tmdb_id || x.id)));

      let credits = [];
      try {
        const res = await fetch(`https://api.themoviedb.org/3/person/${person.id}/combined_credits?api_key=${TMDB_KEY}&language=en-US`);
        const data = await res.json();
        credits = (data.cast || [])
          .filter(c => c.poster_path && (c.media_type === 'movie' || c.media_type === 'tv'))
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 24);
      } catch (e) {
        credits = [];
      }

      const watchedCount = credits.filter(c => watchedIds.has(String(c.id))).length;
      const plannedCount = credits.filter(c => plannedIds.has(String(c.id))).length;

      const avatarSrc = person.profile_path
        ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=7c6ff7&color=fff&size=100&bold=true`;

      const card = document.createElement('div');
      card.innerHTML = `
        <div class="actor-profile" style="flex-direction:column;align-items:flex-start">
          <div style="display:flex;gap:20px;align-items:center;width:100%">
            <img class="actor-avatar" src="${avatarSrc}" alt="${person.name}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=7c6ff7&color=fff&size=100&bold=true'">
            <div class="actor-info" style="flex:1">
              <h3>${person.name}</h3>
              <p style="margin-bottom:8px">${person.known_for_department || 'Acting'}</p>
              <div style="display:flex;gap:16px;flex-wrap:wrap">
                <span style="font-size:13px;color:var(--text-muted)">📽️ <strong style="color:var(--text)">${credits.length}</strong> top credits</span>
                <span style="font-size:13px;color:var(--green)">✓ <strong>${watchedCount}</strong> watched</span>
                <span style="font-size:13px;color:var(--accent)">📋 <strong>${plannedCount}</strong> in watchlist</span>
                <span style="font-size:13px;color:var(--text-muted)">👁️ <strong style="color:var(--text)">${credits.length - watchedCount - plannedCount}</strong> unseen</span>
              </div>
            </div>
          </div>

          ${credits.length > 0 ? `
          <div style="width:100%;margin-top:20px">
            <div style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--text-muted)">FILMOGRAPHY</div>
            <div class="filmography-grid">
              ${credits.map(c => {
                const title = c.title || c.name || '';
                const year = (c.release_date || c.first_air_date || '').slice(0, 4);
                const poster = c.poster_path ? `https://image.tmdb.org/t/p/w200${c.poster_path}` : '';
                const isWatched = watchedIds.has(String(c.id));
                const isPlanned = plannedIds.has(String(c.id));
                const rating = c.vote_average ? c.vote_average.toFixed(1) : '';

                let statusBadge = '';
                let cardStyle = '';
                if (isWatched) {
                  cardStyle = 'outline:2px solid var(--green);outline-offset:-2px;';
                  statusBadge = `<div class="watched-overlay" style="opacity:1"><div class="watched-check">✓</div></div>`;
                } else if (isPlanned) {
                  cardStyle = 'outline:2px solid var(--accent);outline-offset:-2px;';
                  statusBadge = `<div style="position:absolute;bottom:4px;left:4px;background:var(--accent);color:white;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700">📋</div>`;
                }

                return `
                  <div class="film-card ${isWatched ? 'watched' : ''}" style="${cardStyle}" title="${title} ${year ? '(' + year + ')' : ''}">
                    ${poster
                      ? `<img src="${poster}" alt="${title}" loading="lazy" onerror="this.style.display='none'">`
                      : `<div style="height:100%;background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:28px">🎬</div>`}
                    ${statusBadge}
                    ${rating ? `<div class="score-badge" style="font-size:10px;padding:2px 5px">⭐${rating}</div>` : ''}
                    <div style="position:absolute;bottom:0;left:0;right:0;padding:20px 6px 6px;background:linear-gradient(transparent,rgba(0,0,0,0.85));font-size:10px;font-weight:600;line-height:1.2">${title.length > 20 ? title.slice(0,20)+'…' : title}<br><span style="opacity:0.7">${year}</span></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>` : '<p style="color:var(--text-muted);margin-top:12px">No filmography found.</p>'}
        </div>
      `;
      container.appendChild(card);
    },

    // ─── 6. DASHBOARD ON STATS PAGE ────────────────────────────────────────
    
    renderDashboard(container) {
      const lib = this.getLibrary();
      const watched = lib.filter(x => x.status === 'watched');

      const genres = {};
      watched.forEach(m => { (m.genres || []).forEach(g => { genres[g] = (genres[g] || 0) + 1; }); });
      const topGenres = Object.entries(genres).sort((a,b) => b[1] - a[1]).slice(0, 5);

      const decades = {};
      watched.forEach(m => {
        if (!m.release_year) return;
        const dec = Math.floor(parseInt(m.release_year)/10)*10 + "s";
        decades[dec] = (decades[dec] || 0) + 1;
      });
      const decKeys = Object.keys(decades).sort();
      
      let cMovie = 0, cTv = 0, cAnime = 0;
      watched.forEach(m => {
        if (m.media_type === 'movie') cMovie++;
        else if (m.media_type === 'tv') cTv++;
        else if (m.media_type === 'anime') cAnime++;
      });

      const maxG = Math.max(...topGenres.map(x=>x[1]), 1);
      const maxD = Math.max(...Object.values(decades), 1);

      const rated = watched.filter(x => x.rating != null && x.rating > 0);
      const avgRating = rated.length ? (rated.reduce((s,x) => s + x.rating, 0) / rated.length).toFixed(1) : 'N/A';
      const favorites = lib.filter(x => x.favorite).length;
      const estWatchHours = Math.round(watched.reduce((s, m) => s + (m.runtime || (m.media_type === 'tv' ? 45 : 100)), 0) / 60);

      const ratingBuckets = Array(10).fill(0);
      rated.forEach(x => {
        const bucket = Math.min(Math.max(Math.floor(x.rating) - 1, 0), 9);
        ratingBuckets[bucket]++;
      });
      const maxBucket = Math.max(...ratingBuckets, 1);

      const directors = {};
      watched.forEach(m => {
        if (m.director && typeof m.director === 'string') {
          directors[m.director] = (directors[m.director] || 0) + 1;
        }
      });
      const topDirectors = Object.entries(directors).sort((a,b) => b[1]-a[1]).slice(0,5);
      
      let html = ``;

      // Hero stats row
      html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-bottom:16px;">
        <div style="background:linear-gradient(135deg,var(--accent),#a78bfa);border-radius:14px;padding:20px;text-align:center;color:#fff;">
          <div style="font-size:32px;font-weight:900;line-height:1">${watched.length}</div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;margin-top:6px;opacity:0.85">FILMS WATCHED</div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:14px;padding:20px;text-align:center;">
          <div style="font-size:32px;font-weight:900;color:var(--accent)">${avgRating}</div>
          <div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-top:6px;">AVG RATING</div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:14px;padding:20px;text-align:center;">
          <div style="font-size:32px;font-weight:900;color:#fbbf24">${favorites}</div>
          <div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-top:6px;">FAVORITES</div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:14px;padding:20px;text-align:center;">
          <div style="font-size:22px;font-weight:900;color:var(--accent)">${estWatchHours >= 1000 ? (estWatchHours/1000).toFixed(1)+'k' : estWatchHours}h</div>
          <div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-top:6px;">WATCH TIME EST.</div>
        </div>
        <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:14px;padding:20px;text-align:center;">
          <div style="font-size:22px;font-weight:900;color:var(--accent)">${lib.filter(x=>x.status==='want_to_watch'||x.status==='planned').length}</div>
          <div style="font-size:11px;color:var(--text-muted);font-weight:700;letter-spacing:1px;margin-top:6px;">WATCHLIST</div>
        </div>
      </div>`;

      html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">`;
      
      // Genres Chart
      html += `<div style="background:var(--surface);border:1px solid var(--border2);padding:22px;border-radius:14px;">
        <h3 style="margin-bottom:16px;font-size:16px;font-weight:800;">🎭 Top Genres</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">`;
      const genreColors = ['var(--accent)','#a78bfa','#34d399','#fbbf24','#f87171'];
      topGenres.forEach(([g, count], i) => {
        html += `
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:90px;font-size:12px;color:var(--text-muted);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${g}</div>
          <div style="flex:1;height:10px;background:var(--surface3);border-radius:5px;overflow:hidden;">
            <div style="width:${(count/maxG)*100}%;height:100%;background:${genreColors[i]||'var(--accent)'};border-radius:5px;"></div>
          </div>
          <div style="width:28px;font-size:13px;font-weight:800;text-align:right;">${count}</div>
        </div>`;
      });
      if (!topGenres.length) html += `<p style="color:var(--text-muted);font-size:13px;">Add watched films with genres to see data.</p>`;
      html += `</div></div>`;
      
      // Rating Distribution Histogram
      html += `<div style="background:var(--surface);border:1px solid var(--border2);padding:22px;border-radius:14px;">
        <h3 style="margin-bottom:16px;font-size:16px;font-weight:800;">⭐ Rating Distribution</h3>`;
      if (rated.length === 0) {
        html += `<p style="color:var(--text-muted);font-size:13px;">Rate some films to see distribution!</p>`;
      } else {
        html += `<div style="display:flex;align-items:flex-end;gap:4px;height:90px;padding-top:8px;">`;
        ratingBuckets.forEach((cnt, i) => {
          const pct = (cnt/maxBucket)*100;
          const hue = Math.round(220 + (i/9)*120);
          html += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;" title="${i+1}★: ${cnt} films">
            <div style="width:100%;height:78px;display:flex;align-items:flex-end;justify-content:center;">
              <div style="width:100%;background:hsl(${hue},70%,60%);border-radius:3px 3px 0 0;height:${pct}%;min-height:${cnt > 0 ? 2 : 0}px;"></div>
            </div>
            <div style="font-size:9px;color:var(--text-muted);font-weight:700">${i+1}</div>
          </div>`;
        });
        html += `</div><div style="text-align:center;font-size:11px;color:var(--text-muted);margin-top:6px;">${rated.length} films rated · avg ${avgRating}★</div>`;
      }
      html += `</div>`;
      
      // Decades Chart
      html += `<div style="background:var(--surface);border:1px solid var(--border2);padding:22px;border-radius:14px;">
        <h3 style="margin-bottom:16px;font-size:16px;font-weight:800;">📅 Release Decades</h3>`;
      if (!decKeys.length) {
        html += `<p style="color:var(--text-muted);font-size:13px;">Watch films to see decade data!</p>`;
      } else {
        html += `<div style="display:flex;align-items:flex-end;gap:6px;height:100px;padding-top:6px;">`;
        decKeys.forEach(dec => {
          html += `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;" title="${dec}: ${decades[dec]} films">
            <div style="font-size:9px;color:var(--text-muted);font-weight:700">${decades[dec]}</div>
            <div style="width:100%;height:78px;display:flex;align-items:flex-end;justify-content:center;">
              <div style="width:100%;background:linear-gradient(to top,var(--accent),#a78bfa);border-radius:4px 4px 0 0;height:${(decades[dec]/maxD)*100}%;min-height:4px;"></div>
            </div>
            <div style="font-size:9px;color:var(--text-muted);">${dec}</div>
          </div>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
      
      // Format Breakdown
      const total = watched.length || 1;
      html += `<div style="background:var(--surface);border:1px solid var(--border2);padding:22px;border-radius:14px;">
        <h3 style="margin-bottom:16px;font-size:16px;font-weight:800;">🎬 Format Breakdown</h3>
        <div style="display:flex;height:20px;border-radius:10px;overflow:hidden;gap:2px;margin-bottom:12px;">
          ${cMovie > 0 ? `<div style="width:${(cMovie/total)*100}%;background:#818cf8;" title="Movies: ${cMovie}"></div>` : ''}
          ${cTv > 0 ? `<div style="width:${(cTv/total)*100}%;background:#4ade80;" title="Series: ${cTv}"></div>` : ''}
          ${cAnime > 0 ? `<div style="width:${(cAnime/total)*100}%;background:#fbbf24;" title="Anime: ${cAnime}"></div>` : ''}
        </div>
        <div style="display:flex;gap:14px;font-size:13px;font-weight:600;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:2px;background:#818cf8"></div><span style="color:var(--text-muted)">Movies</span><strong>${cMovie}</strong><span style="color:var(--text-dim);font-size:11px">(${Math.round((cMovie/total)*100)}%)</span></div>
          <div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:2px;background:#4ade80"></div><span style="color:var(--text-muted)">Series</span><strong>${cTv}</strong><span style="color:var(--text-dim);font-size:11px">(${Math.round((cTv/total)*100)}%)</span></div>
          ${cAnime > 0 ? `<div style="display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:2px;background:#fbbf24"></div><span style="color:var(--text-muted)">Anime</span><strong>${cAnime}</strong></div>` : ''}
        </div>
      </div>`;

      html += `</div>`; // end 2-col grid

      // Directors leaderboard
      if (topDirectors.length > 0) {
        const maxDir = topDirectors[0][1];
        html += `<div style="background:var(--surface);border:1px solid var(--border2);padding:22px;border-radius:14px;margin-top:8px;">
          <h3 style="margin-bottom:14px;font-size:16px;font-weight:800;">🎬 Top Directors in Your Library</h3>
          <div style="display:flex;flex-direction:column;gap:8px;">`;
        topDirectors.forEach(([dir, cnt], i) => {
          const medals = ['🥇','🥈','🥉','4.','5.'];
          html += `<div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:15px;min-width:22px">${medals[i]||''}</span>
            <div style="flex:1;font-size:13px;font-weight:700;">${dir}</div>
            <div style="width:110px;height:6px;background:var(--surface3);border-radius:3px;overflow:hidden;">
              <div style="width:${(cnt/maxDir)*100}%;height:100%;background:var(--accent);border-radius:3px;"></div>
            </div>
            <span style="font-size:12px;color:var(--text-muted);min-width:38px;text-align:right">${cnt} film${cnt>1?'s':''}</span>
          </div>`;
        });
        html += `</div></div>`;
      }
      
      container.innerHTML += html;
    },


    // ─── 7. MODALS ─────────────────────────────────────────────────────────
    createModals() {
      const backdrop = document.createElement('div');
      backdrop.className = 'upgrade-modal-backdrop';
      backdrop.id = 'upgrade-modal-backdrop';
      backdrop.onclick = (e) => { if (e.target === backdrop) this.closeModals(); };

      const modal = document.createElement('div');
      modal.className = 'upgrade-modal';
      modal.id = 'upgrade-modal-content';

      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);
    },

    closeModals() {
      const el = document.getElementById('upgrade-modal-backdrop');
      if (el) el.classList.remove('visible');
    },

    showSettingsModal() {
      let backdrop = document.getElementById('upgrade-modal-backdrop');
      if (!backdrop) {
        this.createModals();
        backdrop = document.getElementById('upgrade-modal-backdrop');
      }
      const content = document.getElementById('upgrade-modal-content');
      content.innerHTML = `
        <div class="upgrade-modal-header">
          <div class="upgrade-modal-title">Settings &amp; Data</div>
          <button class="upgrade-modal-close" onclick="window.CineLogUpgrade.closeModals()">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:10px">
          <button class="btn-primary" onclick="window.CineLogUpgrade.exportData()">📤 Export Library (JSON)</button>
          <div style="position:relative">
            <input type="file" id="import-file" style="opacity:0;position:absolute;inset:0;cursor:pointer" onchange="window.CineLogUpgrade.importData(event)" accept=".json">
            <button class="btn-secondary" style="width:100%;pointer-events:none">📥 Import Library (JSON)</button>
          </div>
          <button class="btn-secondary" onclick="window.CineLogUpgrade.installPWA()">📱 Install App (PWA)</button>
          <hr style="border:none;border-top:1px solid var(--border)">
          <div style="font-size:13px;color:var(--text-muted)">
            <strong style="color:var(--text)">Keyboard Shortcuts</strong><br>
            <span>Ctrl+K → Focus search</span><br>
            <span>Esc → Close sidebars / modals</span>
          </div>
        </div>
      `;
      document.getElementById('upgrade-modal-backdrop').classList.add('visible');
    },

    // ─── CineMatch Spinner Wheel ───
    openCineMatchWheel() {
      let backdrop = document.getElementById('upgrade-modal-backdrop');
      if (!backdrop) {
        this.createModals();
        backdrop = document.getElementById('upgrade-modal-backdrop');
      }
      const content = document.getElementById('upgrade-modal-content');
      
      const lib = this.getLibrary();
      const watchlist = lib.filter(x => x.status === 'want_to_watch' || x.status === 'planned');
      
      content.innerHTML = `
        <div class="upgrade-modal-header">
          <div class="upgrade-modal-title">🎡 CineMatch Wheel</div>
          <button class="upgrade-modal-close" onclick="window.CineLogUpgrade.closeModals()">&times;</button>
        </div>
        <p style="color:var(--text-muted);font-size:13px;margin:-8px 0 10px">Can't decide? Let the wheel choose your next film!</p>
        
        <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
          <div style="width:100%;display:flex;gap:8px;">
            <select id="wheel-source" onchange="window.CineLogUpgrade.rebuildWheel()" style="flex:1;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:8px 12px;border-radius:10px;font-size:13px;font-weight:600;outline:none;">
              <option value="watchlist">Planned Watchlist (${watchlist.length})</option>
              <option value="popular">Popular Classics (Fallback)</option>
            </select>
            <select id="wheel-genre" onchange="window.CineLogUpgrade.rebuildWheel()" style="flex:1;background:var(--surface2);border:1px solid var(--border2);color:var(--text);padding:8px 12px;border-radius:10px;font-size:13px;font-weight:600;outline:none;">
              <option value="all">All Genres</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Comedy">Comedy</option>
              <option value="Science Fiction">Sci-Fi</option>
              <option value="Horror">Horror</option>
              <option value="Romance">Romance</option>
            </select>
          </div>

          <div style="position:relative;width:280px;height:280px;margin:10px 0;">
            <div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:20px solid var(--accent);z-index:10;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></div>
            <canvas id="wheel-canvas" width="280" height="280" style="border-radius:50%;box-shadow:0 10px 30px rgba(0,0,0,0.4);border:4px solid var(--border2);"></canvas>
          </div>

          <button id="wheel-spin-btn" onclick="window.CineLogUpgrade.spinWheel()" class="btn-primary" style="width:100%;height:44px;font-size:15px;font-weight:800;letter-spacing:0.5px;box-shadow:0 8px 20px rgba(124,111,247,0.3);">SPIN THE WHEEL</button>
          
          <div id="wheel-result-card" style="display:none;width:100%;background:linear-gradient(135deg,var(--surface2) 0%,rgba(124,111,247,0.05) 100%);border:1px solid var(--border2);border-radius:12px;padding:16px;margin-top:10px;animation:tp-drop 0.3s ease both;">
          </div>
        </div>
      `;
      
      backdrop.classList.add('visible');
      
      this.wheelCurrentAngle = 0;
      this.wheelIsSpinning = false;
      this.rebuildWheel();
    },

    rebuildWheel() {
      const source = document.getElementById('wheel-source').value;
      const genre = document.getElementById('wheel-genre').value;
      
      let items = [];
      if (source === 'watchlist') {
        const lib = this.getLibrary();
        items = lib.filter(x => x.status === 'want_to_watch' || x.status === 'planned');
      }
      
      const fallbackList = [
        { title: "Inception", genres: ["Science Fiction", "Action", "Thriller"], id: 27205, media_type: "movie", release_date: "2010-07-15", vote_average: 8.4, overview: "A thief who steals corporate secrets through the use of dream-sharing technology...", poster_path: "/ljsPI5W75l5O2V6A581xd8AW4y5.jpg" },
        { title: "The Godfather", genres: ["Crime", "Drama"], id: 238, media_type: "movie", release_date: "1972-03-14", vote_average: 8.7, overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family...", poster_path: "/3bhkrj6PMMmIHZCDx2R0yd5w3iI.jpg" },
        { title: "Pulp Fiction", genres: ["Crime", "Thriller"], id: 680, media_type: "movie", release_date: "1994-09-10", vote_average: 8.5, overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's wife and a washed-up boxer...", poster_path: "/d5iIlvFJm0UDVvq5QQWuuAWiQQm.jpg" },
        { title: "The Dark Knight", genres: ["Action", "Crime", "Drama"], id: 155, media_type: "movie", release_date: "2008-07-16", vote_average: 8.5, overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent...", poster_path: "/qJ2t4m3mmsGMNVMJG6wZ14216DF.jpg" },
        { title: "Spirited Away", genres: ["Animation", "Fantasy", "Family"], id: 129, media_type: "movie", release_date: "2001-07-20", vote_average: 8.5, overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits...", poster_path: "/39wmItIWsg5sclg2Lq5lgSjHOfi.jpg" },
        { title: "Interstellar", genres: ["Science Fiction", "Drama", "Adventure"], id: 157336, media_type: "movie", release_date: "2014-11-05", vote_average: 8.4, overview: "The adventures of a group of explorers who make use of a newly discovered wormhole...", poster_path: "/gEU2QniE6E7vNIvN86tmgG6QxxV.jpg" },
        { title: "Parasite", genres: ["Thriller", "Drama", "Comedy"], id: 496243, media_type: "movie", release_date: "2019-05-30", vote_average: 8.5, overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks...", poster_path: "/7IiTTzb0ugPv2zEMNl6vGHYcR6L.jpg" },
        { title: "Whiplash", genres: ["Drama", "Music"], id: 244786, media_type: "movie", release_date: "2014-10-10", vote_average: 8.4, overview: "Under the direction of a ruthless instructor, a talented young drummer begins to pursue perfection...", poster_path: "/e01tst7tr591tr6khtv8816kv58.jpg" },
        { title: "The Matrix", genres: ["Science Fiction", "Action"], id: 603, media_type: "movie", release_date: "1999-03-30", vote_average: 8.2, overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents...", poster_path: "/f89U3wzqrjVjZ6n57c1c1cw2c58.jpg" },
        { title: "Goodfellas", genres: ["Crime", "Drama"], id: 769, media_type: "movie", release_date: "1990-09-12", vote_average: 8.5, overview: "The true story of Henry Hill and his life in the mob, covering his relationship with his wife..." }
      ];

      if (items.length === 0) {
        items = fallbackList;
        if (source === 'watchlist') {
          const selectSource = document.getElementById('wheel-source');
          if (selectSource) {
            selectSource.innerHTML = `
              <option value="watchlist">Planned Watchlist (0)</option>
              <option value="popular" selected>Popular Classics (Fallback)</option>
            `;
          }
        }
      }

      if (genre !== 'all') {
        items = items.filter(x => {
          const itemGenres = x.genres || [];
          return itemGenres.some(g => g.toLowerCase().includes(genre.toLowerCase()));
        });
      }

      if (items.length === 0) {
        items = fallbackList.filter(x => {
          const itemGenres = x.genres || [];
          return itemGenres.some(g => g.toLowerCase().includes(genre.toLowerCase()));
        });
      }

      this.wheelItems = items.map(x => x.title || x.name).slice(0, 10);
      this.wheelFullItems = items.slice(0, 10);
      
      this.drawWheel();
    },

    drawWheel() {
      const canvas = document.getElementById('wheel-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      const r = w / 2;
      
      ctx.clearRect(0, 0, w, h);
      
      const numSegments = this.wheelItems.length;
      if (numSegments === 0) {
        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No titles match this filter', r, r);
        return;
      }
      
      const anglePerSegment = (Math.PI * 2) / numSegments;
      const colors = ['#7c6ff7', '#a78bfa', '#fbbf24', '#f87171', '#34d399', '#60a5fa', '#f472b6', '#c084fc', '#fb923c', '#2dd4bf'];
      
      const startAngle = this.wheelCurrentAngle || 0;
      
      for (let i = 0; i < numSegments; i++) {
        const segStart = startAngle + i * anglePerSegment;
        const segEnd = segStart + anglePerSegment;
        
        ctx.beginPath();
        ctx.moveTo(r, r);
        ctx.arc(r, r, r - 4, segStart, segEnd);
        ctx.closePath();
        
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.save();
        ctx.translate(r, r);
        ctx.rotate(segStart + anglePerSegment / 2);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        let title = this.wheelItems[i];
        if (title.length > 15) title = title.substring(0, 12) + '...';
        ctx.fillText(title, r - 16, 0);
        ctx.restore();
      }
      
      ctx.beginPath();
      ctx.arc(r, r, 22, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--surface)';
      ctx.fill();
      ctx.strokeStyle = 'var(--border2)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.fillStyle = 'var(--text)';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎬', r, r);
    },

    spinWheel() {
      if (this.wheelIsSpinning) return;
      this.wheelIsSpinning = true;
      
      const btn = document.getElementById('wheel-spin-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'SPINNING...';
      }
      
      const resultCard = document.getElementById('wheel-result-card');
      if (resultCard) resultCard.style.display = 'none';

      this.wheelVelocity = 0.35 + Math.random() * 0.15;
      this.wheelFriction = 0.985;
      this.wheelCurrentAngle = this.wheelCurrentAngle || 0;
      this.lastTickIndex = -1;
      
      this.animateWheel();
    },

    animateWheel() {
      if (!this.wheelIsSpinning) return;
      
      this.wheelCurrentAngle += this.wheelVelocity;
      this.wheelVelocity *= this.wheelFriction;
      
      this.drawWheel();
      
      const numSegments = this.wheelItems.length;
      const anglePerSegment = (Math.PI * 2) / numSegments;
      
      let normAngle = (2.5 * Math.PI - this.wheelCurrentAngle) % (Math.PI * 2);
      if (normAngle < 0) normAngle += Math.PI * 2;
      
      const currentSegIndex = Math.floor(normAngle / anglePerSegment) % numSegments;
      
      if (currentSegIndex !== this.lastTickIndex) {
        this.playTickSound();
        this.lastTickIndex = currentSegIndex;
      }
      
      if (this.wheelVelocity < 0.0015) {
        this.wheelIsSpinning = false;
        
        const btn = document.getElementById('wheel-spin-btn');
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'SPIN AGAIN';
        }
        
        const finalIdx = currentSegIndex;
        const winner = this.wheelFullItems[finalIdx];
        this.showWheelResult(winner);
      } else {
        requestAnimationFrame(() => this.animateWheel());
      }
    },

    playTickSound() {
      try {
        if (!this.audioCtx) {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
        
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.05);
      } catch (e) {}
    },

    showWheelResult(winner) {
      const resultCard = document.getElementById('wheel-result-card');
      if (!resultCard) return;
      
      const title = winner.title || winner.name;
      const rating = winner.rating || winner.tmdb_score || winner.vote_average || '—';
      const year = winner.year || winner.release_year || (winner.release_date ? winner.release_date.split('-')[0] : '—');
      const movieDataEsc = JSON.stringify(winner).replace(/"/g, '&quot;');
      
      const tmdbId = winner.tmdb_id || winner.id;
      const mediaType = winner.media_type || 'movie';
      
      resultCard.innerHTML = `
        <div style="font-size:11px;font-weight:800;color:var(--accent);letter-spacing:1px;margin-bottom:6px;text-transform:uppercase;">🎉 CHOSEN MATCH</div>
        <h3 style="font-size:16px;font-weight:900;margin:0 0 6px;">${title} <span style="font-size:13px;font-weight:500;color:var(--text-muted);">(${year})</span></h3>
        <p style="font-size:12px;color:var(--text-muted);margin:0 0 12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${winner.overview || "No overview available."}</p>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;font-size:12px;font-weight:700;">
          <span style="color:#fbbf24;">⭐ ${rating}</span>
          <span style="color:var(--text-muted);">|</span>
          <span style="background:rgba(124,111,247,0.15);color:var(--accent);padding:2px 8px;border-radius:4px;font-size:10px;">${(winner.genres || []).join(", ") || "General"}</span>
        </div>
        <div style="display:flex;gap:8px;">
          <button onclick="window.CineLogUpgrade.openTmdbDetailModal(${tmdbId}, '${mediaType}'); window.CineLogUpgrade.closeModals();" class="btn-primary" style="flex:1;height:32px;font-size:12px;padding:0;">ℹ️ View Info</button>
          <button onclick="window.CineLogUpgrade.addTmdbMovie(${movieDataEsc}, 'planned'); document.getElementById('wheel-result-card').style.display='none'; window.CineLogUpgrade.rebuildWheel();" class="btn-secondary" style="flex:1;height:32px;font-size:12px;padding:0;">➕ Add to List</button>
        </div>
      `;
      resultCard.style.display = 'block';
    },

    // ─── CineTrivia Movie Guessing Game ───
    openCineTriviaGame() {
      let backdrop = document.getElementById('upgrade-modal-backdrop');
      if (!backdrop) {
        this.createModals();
        backdrop = document.getElementById('upgrade-modal-backdrop');
      }
      const content = document.getElementById('upgrade-modal-content');
      
      this.triviaScore = 0;
      this.triviaStreak = parseInt(localStorage.getItem('cinelog_trivia_streak') || '0');
      this.triviaHighScore = parseInt(localStorage.getItem('cinelog_trivia_highscore') || '0');
      
      content.innerHTML = `
        <div class="upgrade-modal-header" style="border-bottom:1px solid var(--border2);padding-bottom:12px;">
          <div style="display:flex;flex-direction:column;">
            <div class="upgrade-modal-title" style="display:flex;align-items:center;gap:8px;">🎮 CineTrivia Duel</div>
            <div style="font-size:11px;color:var(--accent);font-weight:700;margin-top:2px;">
              Streak: <span id="trivia-streak">${this.triviaStreak}</span> 🔥 | High Score: <span id="trivia-highscore">${this.triviaHighScore}</span> 🏆
            </div>
          </div>
          <button class="upgrade-modal-close" onclick="window.CineLogUpgrade.closeModals()">&times;</button>
        </div>
        
        <div style="display:flex;flex-direction:column;gap:16px;margin-top:12px;position:relative;">
          <canvas id="trivia-confetti-canvas" width="450" height="420" style="position:absolute;inset:0;pointer-events:none;z-index:20;width:100%;height:100%;"></canvas>

          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;background:var(--surface2);padding:8px 12px;border-radius:10px;border:1px solid var(--border2);">
            <span style="color:var(--text-muted)">QUESTION VALUE: <span id="trivia-value" style="color:var(--text);font-size:13px;font-weight:800;">500</span> pts</span>
            <span style="color:var(--accent)">SCORE: <span id="trivia-score" style="font-size:13px;font-weight:800;">0</span></span>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;" id="trivia-clues-container">
          </div>

          <div style="display:flex;gap:8px;">
            <button id="trivia-clue-btn" onclick="window.CineLogUpgrade.revealTriviaClue()" class="btn-secondary" style="flex:1;height:36px;font-size:12px;padding:0;">👁️ Reveal Clue (-100 pts)</button>
            <button id="trivia-next-btn" onclick="window.CineLogUpgrade.loadNextTriviaQuestion()" class="btn-primary" style="flex:1;height:36px;font-size:12px;padding:0;display:none;">Next Question ➔</button>
          </div>

          <div id="trivia-options-container" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px;">
          </div>
        </div>
      `;
      
      backdrop.classList.add('visible');
      this.loadNextTriviaQuestion();
    },

    loadNextTriviaQuestion() {
      const nextBtn = document.getElementById('trivia-next-btn');
      const clueBtn = document.getElementById('trivia-clue-btn');
      if (nextBtn) nextBtn.style.display = 'none';
      if (clueBtn) {
        clueBtn.style.display = 'block';
        clueBtn.disabled = false;
        clueBtn.innerText = '👁️ Reveal Clue (-100 pts)';
      }
      
      this.triviaQuestionValue = 500;
      const valEl = document.getElementById('trivia-value');
      if (valEl) valEl.innerText = this.triviaQuestionValue;

      const triviaDb = [
        { title: "Inception", year: "2010", genres: ["Science Fiction", "Action", "Thriller"], director: "Christopher Nolan", cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"], tagline: "Your mind is the scene of the crime", plot: "A thief who steals corporate secrets through dream-sharing is given the inverse task of planting an idea into the mind of a C.E.O." },
        { title: "The Godfather", year: "1972", genres: ["Crime", "Drama"], director: "Francis Ford Coppola", cast: ["Marlon Brando", "Al Pacino", "James Caan"], tagline: "An offer you can't refuse", plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son." },
        { title: "Pulp Fiction", year: "1994", genres: ["Crime", "Thriller", "Drama"], director: "Quentin Tarantino", cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"], tagline: "Just because you are a character doesn't mean that you have character", plot: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption." },
        { title: "Interstellar", year: "2014", genres: ["Science Fiction", "Drama", "Adventure"], director: "Christopher Nolan", cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"], tagline: "Mankind was born on Earth. It was never meant to die here.", plot: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
        { title: "Parasite", year: "2019", genres: ["Thriller", "Drama", "Comedy"], director: "Bong Joon Ho", cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"], tagline: "Act like you own the place", plot: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan." },
        { title: "Spirited Away", year: "2001", genres: ["Animation", "Fantasy", "Family"], director: "Hayao Miyazaki", cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"], tagline: "Nothing that happens is ever forgotten", plot: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a spirit world where humans are turned into beasts." },
        { title: "Whiplash", year: "2014", genres: ["Drama", "Music"], director: "Damien Chazelle", cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser"], tagline: "Not quite my tempo", plot: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by a ruthless instructor." },
        { title: "The Matrix", year: "1999", genres: ["Science Fiction", "Action"], director: "Lana Wachowski", cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"], tagline: "Welcome to the real world", plot: "A computer hacker joins forces with a group of underground rebels to fight against the cyber-intelligence that controls humanity's artificial reality." },
        { title: "Jaws", year: "1975", genres: ["Thriller", "Adventure", "Horror"], director: "Steven Spielberg", cast: ["Roy Scheider", "Robert Shaw", "Richard Dreyfuss"], tagline: "Don't go in the water", plot: "When a killer shark unleashes chaos on a beach community, it's up to a local sheriff, a marine biologist, and an old seafarer to hunt it down." },
        { title: "The Dark Knight", year: "2008", genres: ["Action", "Crime", "Drama"], director: "Christopher Nolan", cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"], tagline: "Why so serious?", plot: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
        { title: "Titanic", year: "1997", genres: ["Drama", "Romance"], director: "James Cameron", cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane"], tagline: "Nothing on Earth could come between them", plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic." },
        { title: "Fight Club", year: "1999", genres: ["Drama", "Thriller"], director: "David Fincher", cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"], tagline: "Mischief. Mayhem. Soap.", plot: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more." },
        { title: "Alien", year: "1979", genres: ["Science Fiction", "Horror"], director: "Ridley Scott", cast: ["Sigourney Weaver", "Tom Skerritt", "John Hurt"], tagline: "In space, no one can hear you scream", plot: "The crew of a commercial spacecraft, Nostromo, encounters a deadly alien lifeform after investigating an unknown transmission on a distant moon." },
        { title: "Jurassic Park", year: "1993", genres: ["Science Fiction", "Adventure"], director: "Steven Spielberg", cast: ["Sam Neill", "Laura Dern", "Jeff Goldblum"], tagline: "An adventure 65 million years in the making", plot: "A pragmatic paleontologist touring an almost complete theme park on an island in Central America is tasked with protecting a couple of kids after a power failure." },
        { title: "Star Wars", year: "1977", genres: ["Science Fiction", "Action", "Adventure"], director: "George Lucas", cast: ["Mark Hamill", "Harrison Ford", "Carrie Fisher"], tagline: "A long time ago in a galaxy far, far away...", plot: "Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire's world-destroying battle station." }
      ];

      const targetIdx = Math.floor(Math.random() * triviaDb.length);
      this.triviaTargetMovie = triviaDb[targetIdx];

      const options = [this.triviaTargetMovie.title];
      while (options.length < 4) {
        const randomMovie = triviaDb[Math.floor(Math.random() * triviaDb.length)].title;
        if (!options.includes(randomMovie)) {
          options.push(randomMovie);
        }
      }
      
      this.triviaOptions = options.sort(() => Math.random() - 0.5);

      this.triviaCluesRevealed = [
        { type: "Decade & Genre", value: `${this.triviaTargetMovie.year.slice(0, 3)}0s • ${(this.triviaTargetMovie.genres || []).join(", ")}` }
      ];
      this.triviaAllClues = [
        { type: "Director", value: `Directed by: <strong>${this.triviaTargetMovie.director}</strong>` },
        { type: "Tagline", value: `Tagline: <em>"${this.triviaTargetMovie.tagline}"</em>` },
        { type: "Cast", value: `Starring: <strong>${this.triviaTargetMovie.cast.join(", ")}</strong>` },
        { type: "Plot", value: `Plot: <strong>${this.triviaTargetMovie.plot}</strong>` }
      ];

      this.triviaAnswered = false;
      this.renderTriviaClues();
      this.renderTriviaOptions();
    },

    renderTriviaClues() {
      const container = document.getElementById('trivia-clues-container');
      if (!container) return;
      
      container.innerHTML = this.triviaCluesRevealed.map((c, i) => `
        <div style="background:var(--surface3);border:1px solid var(--border2);border-radius:10px;padding:12px;animation:tp-drop 0.25s ease both;display:flex;flex-direction:column;gap:4px;">
          <div style="font-size:10px;font-weight:800;color:var(--accent);letter-spacing:0.8px;text-transform:uppercase;">CLUE ${i+1}: ${c.type}</div>
          <div style="font-size:13px;color:var(--text);line-height:1.4;">${c.value}</div>
        </div>
      `).join("");
    },

    renderTriviaOptions() {
      const container = document.getElementById('trivia-options-container');
      if (!container) return;

      container.innerHTML = this.triviaOptions.map(opt => `
        <button onclick="window.CineLogUpgrade.checkTriviaAnswer(this, '${opt.replace(/'/g, "\\'")}')" class="btn-secondary" style="height:44px;font-size:13px;font-weight:700;padding:0;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;transition:all 0.2s ease;">
          ${opt}
        </button>
      `).join("");
    },

    revealTriviaClue() {
      if (this.triviaAnswered || this.triviaAllClues.length === 0) return;
      
      const nextClue = this.triviaAllClues.shift();
      this.triviaCluesRevealed.push(nextClue);
      this.triviaQuestionValue -= 100;

      const valEl = document.getElementById('trivia-value');
      if (valEl) valEl.innerText = this.triviaQuestionValue;
      
      this.renderTriviaClues();

      if (this.triviaAllClues.length === 0) {
        const clueBtn = document.getElementById('trivia-clue-btn');
        if (clueBtn) {
          clueBtn.disabled = true;
          clueBtn.innerText = 'All Clues Revealed';
        }
      }
    },

    checkTriviaAnswer(btnElement, answerText) {
      if (this.triviaAnswered) return;
      this.triviaAnswered = true;
      
      const isCorrect = (answerText === this.triviaTargetMovie.title);
      
      const clueBtn = document.getElementById('trivia-clue-btn');
      if (clueBtn) clueBtn.style.display = 'none';
      
      const nextBtn = document.getElementById('trivia-next-btn');
      if (nextBtn) nextBtn.style.display = 'block';

      const container = document.getElementById('trivia-options-container');
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(btn => {
        const text = btn.innerText.trim();
        btn.disabled = true;
        if (text === this.triviaTargetMovie.title) {
          btn.style.background = 'var(--green)';
          btn.style.borderColor = 'var(--green)';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.4)';
        } else if (text === answerText && !isCorrect) {
          btn.style.background = 'var(--red)';
          btn.style.borderColor = 'var(--red)';
          btn.style.color = '#ffffff';
          btn.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.4)';
        } else {
          btn.style.opacity = '0.4';
        }
      });

      if (isCorrect) {
        this.playSuccessSound();
        this.triviaScore += this.triviaQuestionValue;
        this.triviaStreak++;
        if (this.triviaStreak > this.triviaHighScore) {
          this.triviaHighScore = this.triviaStreak;
          localStorage.setItem('cinelog_trivia_highscore', this.triviaHighScore);
        }
        localStorage.setItem('cinelog_trivia_streak', this.triviaStreak);
        
        const scoreEl = document.getElementById('trivia-score');
        if (scoreEl) scoreEl.innerText = this.triviaScore;
        
        const streakEl = document.getElementById('trivia-streak');
        if (streakEl) streakEl.innerText = this.triviaStreak;
        
        const highscoreEl = document.getElementById('trivia-highscore');
        if (highscoreEl) highscoreEl.innerText = this.triviaHighScore;
        
        this.playConfetti();
      } else {
        this.playFailSound();
        this.triviaStreak = 0;
        localStorage.setItem('cinelog_trivia_streak', this.triviaStreak);
        
        const streakEl = document.getElementById('trivia-streak');
        if (streakEl) streakEl.innerText = this.triviaStreak;
      }
    },

    playSuccessSound() {
      try {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const t = this.audioCtx.currentTime;
        
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.06);
          gain.gain.setValueAtTime(0.04, t + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.3);
          
          osc.start(t + idx * 0.06);
          osc.stop(t + idx * 0.06 + 0.35);
        });
      } catch (e) {}
    },

    playFailSound() {
      try {
        if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
        const t = this.audioCtx.currentTime;
        
        [140, 144].forEach(freq => {
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();
          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          
          osc.start(t);
          osc.stop(t + 0.4);
        });
      } catch (e) {}
    },

    playConfetti() {
      const canvas = document.getElementById('trivia-confetti-canvas');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const w = canvas.width;
      const h = canvas.height;
      
      const particles = [];
      const emojis = ['🎉', '🍿', '🎬', '🏆', '⭐', '✨'];
      const colors = ['#7c6ff7', '#a78bfa', '#fbbf24', '#f87171', '#34d399', '#60a5fa'];
      
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: w / 2,
          y: h / 2 - 20,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.7) * 10 - 2,
          size: 6 + Math.random() * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          emoji: Math.random() > 0.6 ? emojis[Math.floor(Math.random() * emojis.length)] : null,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          opacity: 1
        });
      }
      
      let frame = 0;
      const draw = () => {
        if (particles.length === 0 || frame > 90) {
          ctx.clearRect(0, 0, w, h);
          return;
        }
        ctx.clearRect(0, 0, w, h);
        
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.25;
          p.vx *= 0.98;
          p.rotation += p.rotationSpeed;
          p.opacity -= 0.015;
          
          if (p.opacity <= 0 || p.y > h) {
            particles.splice(i, 1);
            continue;
          }
          
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = p.opacity;
          
          if (p.emoji) {
            ctx.font = `${p.size + 10}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.emoji, 0, 0);
          } else {
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          }
          ctx.restore();
        }
        
        frame++;
        requestAnimationFrame(draw);
      };
      
      draw();
    },

    exportData() {
      const lib = this.getLibrary();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lib, null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", `cinelog_export_${new Date().toISOString().split('T')[0]}.json`);
      a.click();
    },

    importData(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (Array.isArray(data)) {
            localStorage.setItem(LIB_KEY, JSON.stringify(data));
            alert('Library imported successfully! Reloading...');
            location.reload();
          } else {
            alert('Invalid JSON format.');
          }
        } catch (err) {
          alert('Error parsing JSON file.');
        }
      };
      reader.readAsText(file);
    },

    // ─── 8. MUTATION OBSERVER ──────────────────────────────────────────────
    
    setupObserver() {
      const observer = new MutationObserver(() => {
        // Theme toggle
        const headerPills = document.querySelector('.header-pills');
        if (headerPills && !document.querySelector('.theme-toggle')) {
          this.setupThemeToggle();
        }

        // Nav buttons (Settings)
        const mainNav = document.querySelector('.main-nav');
        if (mainNav && !document.querySelector('.upgrade-nav')) {
          this.injectNavButtons();
        }

        // Trophy button (Top Right, next to settings)
        if (mainNav && !document.getElementById('trophy-btn')) {
          const trophyBtn = document.createElement('button');
          trophyBtn.className = 'nav-btn trophy-btn';
          trophyBtn.id = 'trophy-btn';
          trophyBtn.title = 'Achievements';
          trophyBtn.innerHTML = '🏆';
          trophyBtn.onclick = () => this.openAchievementsSidebar();
          mainNav.appendChild(trophyBtn);
        }

        // Old dashboard on stats page deleted

        // Custom Overlay Tab Controller
        // Exclude #cl-nav-extras (Settings) from this check — it uses 'dropdown-open' not 'active'
        const activeNav = document.querySelector('.nav-btn.active:not(#cl-nav-extras)');
        const overlay = this.getCustomOverlay();

        if (activeNav) {
          const text = activeNav.textContent.toLowerCase();
          if (text.includes('explore')) {
            overlay.style.display = 'block';
            this.renderExploreTab();
          } else if (text.includes('tier list')) {
            overlay.style.display = 'block';
            this.renderTierListTab();
          } else {
            overlay.style.display = 'none';
            this.currentActiveTab = null;
          }
        } else {
          overlay.style.display = 'none';
          this.currentActiveTab = null;
        }

        // Ambient glow on cards
        document.querySelectorAll('.media-card, .lib-card').forEach(card => {
          if (!card.querySelector('.ambient-glow')) {
            const img = card.querySelector('img');
            if (img) {
              const glow = document.createElement('div');
              glow.className = 'ambient-glow';
              card.style.position = 'relative';
              card.insertBefore(glow, card.firstChild);
            }
          }
        });
      });

      const main = document.querySelector('.app-main') || document.body;
      observer.observe(main, { childList: true, subtree: true });
    },

    // ─── 9. SORTABLE TIER LIST ─────────────────────────────────────────────
    loadSortable() {
      if (window.Sortable) return;
      const s = document.createElement('script');
      s.src = "https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js";
      document.head.appendChild(s);
    },

    initSortable() {
      // React's built-in HTML5 drag-and-drop handles the tier list.
      // SortableJS initialization is disabled to avoid blocking React's
      // onDragOver / onDrop handlers which save state to localStorage.
      this.sortableInitialized = true;
    },

    // ─── 10. MILESTONES & CONFETTI ─────────────────────────────────────────
    checkMilestones() {
      const lib = this.getLibrary();
      const watched = lib.filter(x => x.status === 'watched').length;
      const milestones = [10, 50, 100, 500, 1000];
      const lastMilestone = parseInt(localStorage.getItem('cinelog-milestone') || '0');

      for (let m of milestones.slice().reverse()) {
        if (watched >= m && lastMilestone < m) {
          localStorage.setItem('cinelog-milestone', m);
          this.fireConfetti();
          setTimeout(() => alert(`🎉 Congratulations! You've watched ${m} titles!`), 500);
          break;
        }
      }
    },

    fireConfetti() {
      const colors = ['#f44336','#e91e63','#9c27b0','#3f51b5','#2196f3','#4caf50','#ffeb3b','#ff9800','#7c6ff7'];
      for (let i = 0; i < 80; i++) {
        const conf = document.createElement('div');
        conf.style.cssText = `
          position:fixed;
          width:${6 + Math.random() * 8}px;
          height:${6 + Math.random() * 8}px;
          border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
          background:${colors[Math.floor(Math.random()*colors.length)]};
          left:${Math.random() * 100}vw;
          top:-20px;
          z-index:99999;
          pointer-events:none;
          transition:all ${2 + Math.random() * 2}s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        `;
        document.body.appendChild(conf);

        setTimeout(() => {
          conf.style.top = '110vh';
          conf.style.transform = `rotate(${Math.random()*720}deg) translateX(${Math.random()*200 - 100}px)`;
          conf.style.opacity = '0';
        }, 50 + Math.random() * 300);

        setTimeout(() => conf.remove(), 4500);
      }
    },

    // ─── 11. PWA INSTALL ───────────────────────────────────────────────────
    installPWA() {
      alert("To install as an app, click your browser's menu (⋮) and select 'Install' or 'Add to Home Screen'.");
    },

    // ─── STUB INTERCEPTORS (filled by v21 block below) ─────────────────────
    
    setupCustomListsIntercept() {
      // Stub
    },
    setupLibraryFilters() {
      // Stub
    },
    scrollTray(btn, direction) {
      const wrapper = btn.closest('.tray-wrapper');
      const tray = wrapper.querySelector('.horizontal-tray');
      if (tray) {
        const scrollAmount = tray.clientWidth * 0.75;
        tray.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' });
      }
    },
    openTierSettingsModal(tierId) {
      const tiers = this.getCustomTiers();
      const tier = tiers.find(x => x.id === tierId);
      if (!tier) return;

      let backdrop = document.getElementById('tier-settings-modal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'tier-settings-modal';
        backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(8,8,12,0.85);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s cubic-bezier(0.16,1,0.3,1);pointer-events:none';
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) window.CineLogUpgrade.closeTierSettingsModal();
        });
      }

      backdrop.style.pointerEvents = 'auto';
      backdrop.style.opacity = '1';

      backdrop.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;width:100%;max-width:380px;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:20px;transform:translateY(10px);transition:transform 0.25s cubic-bezier(0.16,1,0.3,1);" id="tsm-panel">
          <button onclick="window.CineLogUpgrade.closeTierSettingsModal()" style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--text-muted);font-size:20px;cursor:pointer;transition:color 0.2s" onmouseover="this.style.color='var(--text)'" onmouseout="this.style.color='var(--text-muted)'">✕</button>
          
          <div>
            <h3 style="font-size:18px;font-weight:800;letter-spacing:-0.4px;margin-bottom:4px">🎨 Configure Tier Row</h3>
            <p style="color:var(--text-muted);font-size:12px">Customize the naming, color accents, and ordering of this tier.</p>
          </div>
          
          <hr style="border:none;border-top:1px solid var(--border2);margin:0">
          
          <!-- Label Input -->
          <div style="display:flex;flex-direction:column;gap:6px">
            <label style="font-size:11px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:1px">Tier Label</label>
            <input type="text" id="tsm-label-input" value="${tier.label}" 
                   style="background:var(--surface2);border:1px solid var(--border2);border-radius:8px;color:var(--text);padding:10px 12px;font-size:14px;font-weight:700;outline:none;transition:border-color 0.2s" 
                   onfocus="this.style.borderColor='var(--accent)'" 
                   onblur="this.style.borderColor='var(--border2)'"
                   onchange="window.CineLogUpgrade.renameTierRow('${tier.id}', this.value)"/>
          </div>
          
          <!-- Accent Color and Row Position -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div style="display:flex;flex-direction:column;gap:6px">
              <label style="font-size:11px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:1px">Accent Color</label>
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:34px;height:34px;border-radius:8px;background:${tier.color};border:1px solid rgba(255,255,255,0.2);position:relative;overflow:hidden;cursor:pointer">
                  <input type="color" value="${this.hexColor(tier.color)}" 
                         style="position:absolute;top:-5px;left:-5px;width:44px;height:44px;border:none;padding:0;background:transparent;cursor:pointer"
                         onchange="window.CineLogUpgrade.colorTierRow('${tier.id}', this.value); window.CineLogUpgrade.updateModalColorPreview('${tier.id}', this.value)"/>
                </div>
                <span id="tsm-color-hex" style="font-family:monospace;font-size:12px;font-weight:700;color:var(--text-muted)">${tier.color.toUpperCase()}</span>
              </div>
            </div>
            
            <div style="display:flex;flex-direction:column;gap:6px">
              <label style="font-size:11px;color:var(--text-muted);font-weight:800;text-transform:uppercase;letter-spacing:1px">Move Position</label>
              <div style="display:flex;gap:8px">
                <button class="tsm-btn" onclick="window.CineLogUpgrade.moveTierRow('${tier.id}', -1); window.CineLogUpgrade.openTierSettingsModal('${tier.id}')" style="flex:1;background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:8px;padding:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s">▲ Up</button>
                <button class="tsm-btn" onclick="window.CineLogUpgrade.moveTierRow('${tier.id}', 1); window.CineLogUpgrade.openTierSettingsModal('${tier.id}')" style="flex:1;background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:8px;padding:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s">▼ Down</button>
              </div>
            </div>
          </div>
          
          <hr style="border:none;border-top:1px solid var(--border2);margin:0">
          
          <!-- Delete and Save Buttons -->
          <div style="display:flex;flex-direction:column;gap:10px">
            <button onclick="window.CineLogUpgrade.deleteTierRow('${tier.id}'); window.CineLogUpgrade.closeTierSettingsModal()" 
                    style="width:100%;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);color:var(--red);border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s"
                    onmouseover="this.style.background='var(--red)';this.style.color='#fff';this.style.borderColor='var(--red)'"
                    onmouseout="this.style.background='rgba(239,68,68,0.08)';this.style.color='var(--red)';this.style.borderColor='rgba(239,68,68,0.25)'">
              🗑️ Delete Tier Category
            </button>
            
            <button onclick="window.CineLogUpgrade.closeTierSettingsModal()" 
                    style="width:100%;background:var(--accent);border:none;color:#fff;border-radius:10px;padding:12px;font-size:13px;font-weight:700;cursor:pointer;transition:background 0.15s;box-shadow:0 8px 20px var(--accent-glow)"
                    onmouseover="this.style.background='#6558e0'"
                    onmouseout="this.style.background='var(--accent)'">
              Save changes
            </button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const panel = document.getElementById('tsm-panel');
        if (panel) panel.style.transform = 'translateY(0)';
      }, 20);
    },

    updateModalColorPreview(tierId, hexColor) {
      const colorHexSpan = document.getElementById('tsm-color-hex');
      if (colorHexSpan) colorHexSpan.textContent = hexColor.toUpperCase();
      this.openTierSettingsModal(tierId);
    },

    closeTierSettingsModal() {
      const modal = document.getElementById('tier-settings-modal');
      if (modal) {
        const panel = document.getElementById('tsm-panel');
        if (panel) panel.style.transform = 'translateY(10px)';
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
    },

    // ─── ELITE V22 CRASH-FREE SIBLING OVERLAY CONTROLLERS ───
    getCustomOverlay() {
      let overlay = document.getElementById('cinelog-custom-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'cinelog-custom-overlay';
        overlay.style.cssText = 'position:fixed;top:60px;left:0;right:0;bottom:0;z-index:900;background:var(--bg);overflow-y:auto;display:none;';
        
        const inner = document.createElement('div');
        inner.className = 'overlay-content-inner';
        overlay.appendChild(inner);
        
        document.body.appendChild(overlay);
      }
      return overlay;
    },

    renderExploreTab() {
      const overlay = this.getCustomOverlay();
      const inner = overlay.querySelector('.overlay-content-inner');
      if (this.currentActiveTab === 'explore') return;
      this.currentActiveTab = 'explore';
      inner.innerHTML = '<div class="explore-remake" id="cinelog-explore-remake"></div>';
      
      this.exploreSearchQuery = "";
      this.renderExplore();
    },

    renderCinemaClubTab() {
      const overlay = this.getCustomOverlay();
      const inner = overlay.querySelector('.overlay-content-inner');
      if (this.currentActiveTab === 'cinemaclub') return;
      this.currentActiveTab = 'cinemaclub';
      inner.innerHTML = '<div class="cinemaclub-remake" id="cinelog-cinemaclub-remake"></div>';
      this.renderCinemaClub();
    },

    renderTierListTab() {
      const overlay = this.getCustomOverlay();
      const inner = overlay.querySelector('.overlay-content-inner');
      if (this.currentActiveTab === 'tierlist') return;
      this.currentActiveTab = 'tierlist';
      inner.innerHTML = '<div class="tierlist-remake" id="cinelog-tierlist-remake"></div>';
      this.renderCustomTierList();
    },

    rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    },

    extractDominantColor(imgSrc, callback) {
      if (!imgSrc) {
        callback({ accent: 'hsl(247, 88%, 70%)', glow: 'hsla(247, 88%, 70%, 0.35)' });
        return;
      }
      const cacheKey = 'dominant_color_' + imgSrc;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          callback(JSON.parse(cached));
          return;
        } catch(e) {}
      }
      
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";
      tempImg.src = imgSrc;
      tempImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 5;
          canvas.height = 5;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(tempImg, 0, 0, 5, 5);
          const data = ctx.getImageData(0, 0, 5, 5).data;
          
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            r += data[i];
            g += data[i+1];
            b += data[i+2];
            count++;
          }
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          
          const hsl = this.rgbToHsl(r, g, b);
          hsl[1] = Math.max(hsl[1], 55); 
          hsl[2] = Math.max(30, Math.min(hsl[2], 65));
          
          const rgbStr = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
          const glowStr = `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, 0.35)`;
          const themeColors = { accent: rgbStr, glow: glowStr };
          localStorage.setItem(cacheKey, JSON.stringify(themeColors));
          callback(themeColors);
        } catch (e) {
          callback({ accent: 'hsl(247, 88%, 70%)', glow: 'hsla(247, 88%, 70%, 0.35)' });
        }
      };
      tempImg.onerror = () => {
        callback({ accent: 'hsl(247, 88%, 70%)', glow: 'hsla(247, 88%, 70%, 0.35)' });
      };
    },

    setupAdaptiveTheme(activeImageSrc) {
      this.extractDominantColor(activeImageSrc, (colors) => {
        document.documentElement.style.setProperty('--accent', colors.accent);
        document.documentElement.style.setProperty('--accent-glow', colors.glow);
      });
    },

    initCardTilt() {
      document.querySelectorAll('.media-card, .premium-card').forEach(card => {
        if (card.dataset.tiltApplied) return;
        card.dataset.tiltApplied = "true";

        if (!card.querySelector('.specular-sheen')) {
          const sheen = document.createElement('div');
          sheen.className = 'specular-sheen';
          sheen.style.cssText = 'position:absolute;inset:0;pointer-events:none;border-radius:inherit;z-index:5;mix-blend-mode:overlay;opacity:0;transition:opacity 0.3s ease;background:radial-gradient(circle at var(--sheen-x, 50%) var(--sheen-y, 50%), rgba(255,255,255,0.18) 0%, transparent 50%)';
          card.style.position = 'relative';
          card.appendChild(sheen);
        }

        const img = card.querySelector('img');
        if (img && img.src) {
          this.extractDominantColor(img.src, (colors) => {
            card.style.setProperty('--extracted-accent', colors.accent);
            card.style.setProperty('--extracted-accent-glow', colors.glow);
          });
        }

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const xc = rect.width / 2;
          const yc = rect.height / 2;
          const angleX = (yc - y) / 10;
          const angleY = (x - xc) / 10;

          card.style.transform = `perspective(500px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.03)`;
          const sheen = card.querySelector('.specular-sheen');
          if (sheen) {
            sheen.style.opacity = '1';
            card.style.setProperty('--sheen-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--sheen-y', `${(y / rect.height) * 100}%`);
          }
        });

        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1)';
          const sheen = card.querySelector('.specular-sheen');
          if (sheen) sheen.style.opacity = '0';
        });
      });
    },

    // ─── CUSTOM TIER LIST REMAKE ───
    getCustomTiers() {
      const defaultTiers = [
        {id:"S",label:"S",color:"#ff6b6b",bg:"rgba(255,107,107,0.12)"},
        {id:"A",label:"A",color:"#ffa94d",bg:"rgba(255,169,77,0.12)"},
        {id:"B",label:"B",color:"#ffd43b",bg:"rgba(255,212,59,0.12)"},
        {id:"C",label:"C",color:"#69db7c",bg:"rgba(105,219,124,0.12)"},
        {id:"D",label:"D",color:"#4dabf7",bg:"rgba(77,171,247,0.12)"},
        {id:"F",label:"F",color:"#9775fa",bg:"rgba(151,117,250,0.12)"}
      ];
      try {
        return JSON.parse(localStorage.getItem('cinelog_tiers_definition_v2')) || defaultTiers;
      } catch(e) {
        return defaultTiers;
      }
    },
    
    saveCustomTiers(tiers) {
      localStorage.setItem('cinelog_tiers_definition_v2', JSON.stringify(tiers));
    },

    hexColor(rgbOrHex) {
      if (rgbOrHex && typeof rgbOrHex === 'string' && rgbOrHex.startsWith('#')) return rgbOrHex;
      return '#a78bfa';
    },

    renderCustomTierList() {
      const remake = document.getElementById('cinelog-tierlist-remake');
      if (!remake) return;

      const tiers = this.getCustomTiers();
      const library = this.getLibrary();
      const watched = library.filter(x => x.status === "watched");

      let state = {};
      try {
        state = JSON.parse(localStorage.getItem('cinelog_tierlist_v2')) || {};
      } catch(e) {
        state = {};
      }

      const activeType = this.tlActiveType || "all";
      const rankedIds = new Set(Object.values(state).flat().map(String));
      const unranked = watched.filter(x => !rankedIds.has(String(x.id)) && !rankedIds.has(String(x.tmdb_id)))
                              .filter(x => activeType === "all" || x.media_type === activeType);

      let html = `
        <div class="tl-custom-toolbar">
          <div class="discover-type-pills">
            ${["all", "movie", "tv", "anime"].map(t => {
              const label = t === "all" ? "🌐 All" : t === "movie" ? "🎬 Movies" : t === "tv" ? "📺 Series" : "⛩️ Anime";
              return `<button class="tab-pill ${activeType === t ? 'active' : ''}" onclick="window.CineLogUpgrade.setTierFilter('${t}')">${label}</button>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:10px;align-items:center">
            <button class="tl-add-row-btn" style="padding:8px 16px;margin:0" onclick="window.CineLogUpgrade.addNewTierRow()">➕ Add Tier</button>
            <button class="tl-ctrl-btn" style="width:auto;padding:0 12px;height:36px;font-weight:700" onclick="window.CineLogUpgrade.autoFillTiersByRating()" title="Auto-fill by your personal ratings">✨ Auto-fill</button>
            <button class="tl-ctrl-btn danger" style="width:auto;padding:0 12px;height:36px;font-weight:700" onclick="window.CineLogUpgrade.clearAllTiers()">🗑️ Clear</button>
          </div>
        </div>
        
        <div class="tierlist-grid" style="display:flex;flex-direction:column;gap:14px">
      `;

      tiers.forEach((tier, index) => {
        const itemIds = state[tier.id] || [];
        const items = itemIds.map(id => watched.find(x => x.id == id || x.tmdb_id == id)).filter(Boolean)
                             .filter(x => activeType === "all" || x.media_type === activeType);

        html += `
          <div class="tl-custom-row" data-tier-id="${tier.id}">
            <div class="tl-label-wrapper" style="--tier-border-color:${tier.color}; --tier-color:${tier.color}; --tier-glow-color:${tier.bg || 'rgba(124,111,247,0.15)'}">
              <div class="tl-label-text">${tier.label}</div>
              <button class="tl-settings-btn" onclick="window.CineLogUpgrade.openTierSettingsModal('${tier.id}')" title="Configure Tier">•••</button>
            </div>
            
            <div class="tl-items-zone">
              ${items.map(m => {
                const posterSrc = m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : null;
                const scoreColor = m.rating >= 8.5 ? '#7c3aed' : m.rating >= 7 ? '#16a34a' : m.rating >= 5 ? '#ca8a04' : '#dc2626';
                return `
                  <div class="tier-poster" data-movie-id="${m.id}" onclick="window.CineLogUpgrade.openMovieCard('${m.id}')" title="${m.title} (${m.rating ? m.rating.toFixed(1) : 'No Rating'})">
                    ${posterSrc ? `<img src="${posterSrc}" alt="${m.title}" draggable="false"/>` : `<div class="tier-no-poster">${m.media_type === 'tv' ? '📺' : '🎬'}</div>`}
                    ${m.rating ? `<div class="tier-score" style="background:${scoreColor}">${m.rating.toFixed(1)}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      });

      html += `
        </div>
        
        <div class="unranked-section">
          <h3 class="unranked-title" style="font-size:16px;font-weight:700;margin-bottom:12px">Unranked Pool (${unranked.length})</h3>
          <div class="unranked-pool" style="display:flex;flex-wrap:wrap;gap:8px;padding:16px;background:var(--surface2);border-radius:12px;min-height:100px">
            ${unranked.length === 0 ? `<p class="unranked-empty-msg" style="color:var(--text-muted);font-size:14px;margin:auto">All watched titles are ranked!</p>` : ''}
            ${unranked.slice(0, 100).map(m => {
              const posterSrc = m.poster_path ? `https://image.tmdb.org/t/p/w185${m.poster_path}` : null;
              const scoreColor = m.rating >= 8.5 ? '#7c3aed' : m.rating >= 7 ? '#16a34a' : m.rating >= 5 ? '#ca8a04' : '#dc2626';
              return `
                <div class="tier-poster" data-movie-id="${m.id}" onclick="window.CineLogUpgrade.openMovieCard('${m.id}')" title="${m.title} (${m.rating ? m.rating.toFixed(1) : 'No Rating'})">
                  ${posterSrc ? `<img src="${posterSrc}" alt="${m.title}" draggable="false"/>` : `<div class="tier-no-poster">${m.media_type === 'tv' ? '📺' : '🎬'}</div>`}
                  ${m.rating ? `<div class="tier-score" style="background:${scoreColor}">${m.rating.toFixed(1)}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      remake.innerHTML = html;
      this.initCardTilt();
      this.initCustomSortable();
    },

    setTierFilter(type) {
      this.tlActiveType = type;
      this.renderCustomTierList();
    },

    addNewTierRow() {
      const tiers = this.getCustomTiers();
      const randomId = 'tier_' + Math.random().toString(36).substr(2, 9).toUpperCase();
      const newTier = {
        id: randomId,
        label: "NEW TIER",
        color: "#a78bfa",
        bg: "rgba(167, 139, 250, 0.12)"
      };
      tiers.push(newTier);
      this.saveCustomTiers(tiers);
      this.renderCustomTierList();
    },

    renameTierRow(tierId, value) {
      const tiers = this.getCustomTiers();
      const tier = tiers.find(x => x.id === tierId);
      if (tier) {
        tier.label = value.trim() || "TIER";
        this.saveCustomTiers(tiers);
      }
    },

    colorTierRow(tierId, hexColor) {
      const tiers = this.getCustomTiers();
      const tier = tiers.find(x => x.id === tierId);
      if (tier) {
        const r = parseInt(hexColor.slice(1,3), 16);
        const g = parseInt(hexColor.slice(3,5), 16);
        const b = parseInt(hexColor.slice(5,7), 16);
        tier.color = hexColor;
        tier.bg = `rgba(${r}, ${g}, ${b}, 0.12)`;
        this.saveCustomTiers(tiers);
        this.renderCustomTierList();
      }
    },

    moveTierRow(tierId, direction) {
      const tiers = this.getCustomTiers();
      const index = tiers.findIndex(x => x.id === tierId);
      if (index === -1) return;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= tiers.length) return;
      
      const temp = tiers[index];
      tiers[index] = tiers[targetIndex];
      tiers[targetIndex] = temp;

      this.saveCustomTiers(tiers);
      this.renderCustomTierList();
    },

    deleteTierRow(tierId) {
      const confirm = window.confirm("Are you sure you want to delete this tier row? Ranked items will return to the Unranked pool.");
      if (!confirm) return;

      const tiers = this.getCustomTiers().filter(x => x.id !== tierId);
      this.saveCustomTiers(tiers);

      let state = {};
      try {
        state = JSON.parse(localStorage.getItem('cinelog_tierlist_v2')) || {};
      } catch(e) {}
      
      delete state[tierId];
      localStorage.setItem('cinelog_tierlist_v2', JSON.stringify(state));

      this.renderCustomTierList();
    },

    initCustomSortable() {
      if (!window.Sortable) {
        setTimeout(() => this.initCustomSortable(), 100);
        return;
      }
      const zones = document.querySelectorAll('.tl-items-zone, .unranked-pool');
      zones.forEach(zone => {
        if (zone.dataset.sortableActive) return;
        zone.dataset.sortableActive = "true";
        window.Sortable.create(zone, {
          group: 'tierlist-group',
          animation: 180,
          draggable: '.tier-poster',
          ghostClass: 'sortable-ghost',
          chosenClass: 'sortable-chosen',
          dragClass: 'sortable-drag',
          onEnd: () => {
            this.serializeCustomTierListState();
          }
        });
      });
    },

    serializeCustomTierListState() {
      let state = {};
      const rows = document.querySelectorAll('.tl-custom-row');
      rows.forEach(row => {
        const tierId = row.dataset.tierId;
        const posters = row.querySelectorAll('.tier-poster');
        const ids = Array.from(posters).map(p => p.dataset.movieId);
        state[tierId] = ids;
      });
      localStorage.setItem('cinelog_tierlist_v2', JSON.stringify(state));
      this.updateUnrankedPoolCount();
    },

    updateUnrankedPoolCount() {
      const pool = document.querySelector('.unranked-pool');
      const countHeader = document.querySelector('.unranked-title');
      if (pool && countHeader) {
        const count = pool.querySelectorAll('.tier-poster').length;
        countHeader.textContent = `Unranked Pool (${count})`;
        
        let emptyMsg = pool.querySelector('.unranked-empty-msg');
        if (count === 0) {
          if (!emptyMsg) {
            emptyMsg = document.createElement('p');
            emptyMsg.className = 'unranked-empty-msg';
            emptyMsg.style.cssText = 'color:var(--text-muted);font-size:14px;margin:auto';
            emptyMsg.textContent = 'All watched titles are ranked!';
            pool.appendChild(emptyMsg);
          }
        } else {
          if (emptyMsg) emptyMsg.remove();
        }
      }
    },

    autoFillTiersByRating() {
      const library = this.getLibrary();
      const watched = library.filter(x => x.status === "watched");
      
      let state = { S:[], A:[], B:[], C:[], D:[], F:[] };
      
      watched.forEach(m => {
        const r = m.rating;
        if (r !== null && r !== undefined) {
          if (r >= 9.5) state.S.push(m.id);
          else if (r >= 8.5) state.A.push(m.id);
          else if (r >= 7.0) state.B.push(m.id);
          else if (r >= 5.5) state.C.push(m.id);
          else if (r >= 4.0) state.D.push(m.id);
          else state.F.push(m.id);
        }
      });

      localStorage.setItem('cinelog_tierlist_v2', JSON.stringify(state));
      this.renderCustomTierList();
      alert("🎉 Tier list auto-filled successfully based on your personal ratings!");
    },

    clearAllTiers() {
      const confirm = window.confirm("Are you sure you want to clear all tiers?");
      if (!confirm) return;
      localStorage.setItem('cinelog_tierlist_v2', JSON.stringify({}));
      this.renderCustomTierList();
    },

    openMovieCard(movieId) {
      const lib = this.getLibrary();
      const item = lib.find(x => x.id == movieId || x.tmdb_id == movieId);
      if (item) {
        this.openTmdbDetailModal(item.tmdb_id || item.id, item.media_type || "movie");
      }
    },

    // ─── REVISED UNIFIED EXPLORE TAB ───
    setupExploreIntercept() {
      // Managed completely by Sibling Overlay Tab Controller
    },

    mountExploreTab() {
      // Managed completely by Sibling Overlay Tab Controller
    },

    async renderExplore() {
      const container = document.getElementById('cinelog-explore-remake');
      if (!container) return;

      const TMDB_KEY = "6a2fd6b9b1bb3befbb9f14c203732225";
      const TMDB_BASE = "https://api.themoviedb.org/3";
      const IMG = (p, s='w342') => p ? `https://image.tmdb.org/t/p/${s}${p}` : null;

      // Preserve search field value if already rendered
      const existingSearch = document.getElementById('explore-search-field');
      const activeSearch = this.exploreSearchQuery || (existingSearch ? existingSearch.value : '');

      // Loading skeleton
      if (!this.exploreDataLoaded) {
        container.innerHTML = `<div style="display:flex;gap:16px;flex-wrap:wrap;padding:32px 0">${Array(8).fill('<div style="width:160px;height:240px;border-radius:12px;background:var(--surface2);animation:pulse 1.5s ease infinite"></div>').join('')}</div>`;
      }

      // Fetch all data in parallel
      (async () => {
        try {
          const activeFilter = this.exploreFilter || 'all';
          const activeGenre = this.exploreGenre || '';
          const activeDecade = this.exploreDecade || '';

          let results = [];

          if (activeSearch.trim()) {
            if (!this.searchLoading) {
              this.searchLoading = true;
              try {
                const q = encodeURIComponent(activeSearch.trim());
                const [movRes, tvRes] = await Promise.all([
                  fetch(`${TMDB_BASE}/search/movie?query=${q}&api_key=${TMDB_KEY}&language=en-US`),
                  fetch(`${TMDB_BASE}/search/tv?query=${q}&api_key=${TMDB_KEY}&language=en-US`)
                ]);
                const [movData, tvData] = await Promise.all([movRes.json(), tvRes.json()]);
                results = [
                  ...(movData.results||[]).map(m=>({...m,media_type:'movie'})),
                  ...(tvData.results||[]).map(m=>({...m,media_type:'tv'}))
                ].sort((a,b)=>(b.popularity||0)-(a.popularity||0)).slice(0,24);
                this.searchResults = results;
              } catch(e) { results = this.searchResults || []; }
              this.searchLoading = false;
            } else {
              results = this.searchResults || [];
            }
          }

          // Fetch trending & discover
          const trendingTypeMap = activeFilter === 'tv' ? 'tv' : activeFilter === 'anime' ? 'tv' : 'movie';
          
          const params = activeGenre ? `&with_genres=${activeGenre}` : '';
          const decadeParam = activeDecade ? `&primary_release_date.gte=${activeDecade}-01-01&primary_release_date.lte=${parseInt(activeDecade)+9}-12-31` : '';
          const animeParam = (activeFilter === 'anime') ? '&with_keywords=210024|287501' : '';
          
          let trendingRes, topRatedRes, nowPlayingRes, upcomingRes;
          try {
            [trendingRes, topRatedRes, nowPlayingRes, upcomingRes] = await Promise.all([
              fetch(`${TMDB_BASE}/trending/${trendingTypeMap}/week?api_key=${TMDB_KEY}`),
              fetch(`${TMDB_BASE}/discover/${trendingTypeMap}?api_key=${TMDB_KEY}&sort_by=vote_average.desc&vote_count.gte=500${params}${decadeParam}${animeParam}`),
              trendingTypeMap === 'movie' 
                ? fetch(`${TMDB_BASE}/movie/now_playing?api_key=${TMDB_KEY}&language=en-US`)
                : fetch(`${TMDB_BASE}/tv/on_the_air?api_key=${TMDB_KEY}&language=en-US`),
              trendingTypeMap === 'movie'
                ? fetch(`${TMDB_BASE}/movie/upcoming?api_key=${TMDB_KEY}&language=en-US`)
                : fetch(`${TMDB_BASE}/tv/popular?api_key=${TMDB_KEY}&language=en-US`)
            ]);
          } catch(e) { console.warn('Explore fetch failed', e); return; }

          const [trendingData, topRatedData, nowPlayingData, upcomingData] = await Promise.all([
            trendingRes.json(), topRatedRes.json(), nowPlayingRes.json(), upcomingRes.json()
          ]);

          const trending = (trendingData.results||[]).map(m=>({...m,media_type:m.media_type||trendingTypeMap}));
          const topRated = (topRatedData.results||[]).map(m=>({...m,media_type:trendingTypeMap}));
          const nowPlaying = (nowPlayingData.results||[]).map(m=>({...m,media_type:trendingTypeMap}));
          const upcoming = (upcomingData.results||[]).map(m=>({...m,media_type:trendingTypeMap}));

          // Spotlight = #1 trending
          const spotlight = trending[0] || topRated[0];
          const spotlightBackdrop = spotlight?.backdrop_path ? IMG(spotlight.backdrop_path,'original') : '';

          const library = this.getLibrary();
          const libIds = new Set(library.map(x=>String(x.tmdb_id||x.id)));

          // Card builder
          const mkCard = (m, size='normal') => {
            const poster = IMG(m.poster_path,'w342') || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=342';
            const title = m.title || m.name || 'Untitled';
            const year = (m.release_date||m.first_air_date||'').slice(0,4);
            const score = m.vote_average ? m.vote_average.toFixed(1) : 'N/A';
            const mtype = m.media_type || 'movie';
            const inLib = libIds.has(String(m.id));
            const typeLabel = mtype === 'tv' ? '📺 Series' : mtype === 'anime' ? '⛩️ Anime' : '🎬 Movie';
            const scoreColor = m.vote_average >= 7.5 ? '#10b981' : m.vote_average >= 6 ? '#f59e0b' : '#ef4444';
            const mJson = JSON.stringify(m).replace(/"/g,'&quot;');
            
            return `
              <div class="ex-card" onclick="window.CineLogUpgrade.openTmdbDetailModal(${m.id},'${mtype}')">
                <div class="ex-card-poster">
                  <img src="${poster}" alt="${title.replace(/"/g,'')}" loading="lazy"/>
                  <div class="ex-card-score" style="background:${scoreColor}22;color:${scoreColor};border-color:${scoreColor}44">${score}</div>
                  ${inLib ? '<div class="ex-card-inlib">✓ In Library</div>' : ''}
                  <div class="ex-card-overlay">
                    <button class="ex-add-btn" onclick="event.stopPropagation();window.CineLogUpgrade.addTmdbMovie(${mJson},'planned')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                      Watchlist
                    </button>
                    <button class="ex-add-btn ex-add-watched" onclick="event.stopPropagation();window.CineLogUpgrade.addTmdbMovie(${mJson},'watched')">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      Watched
                    </button>
                  </div>
                </div>
                <div class="ex-card-info">
                  <div class="ex-card-title">${title}</div>
                  <div class="ex-card-meta"><span class="ex-type-badge">${typeLabel}</span>${year ? `<span>${year}</span>` : ''}</div>
                </div>
              </div>`;
          };

          // Tray builder
          const mkTray = (id, title, icon, items) => {
            if (!items.length) return '';
            return `
              <section class="ex-tray">
                <div class="ex-tray-header">
                  <div class="ex-tray-title">${icon} ${title}</div>
                  <div class="ex-tray-count">${items.length} titles</div>
                </div>
                <div class="ex-tray-scroll">
                  ${items.slice(0,20).map(m=>mkCard(m)).join('')}
                </div>
              </section>`;
          };

          // Genres
          const GENRES = [
            {id:'28',name:'Action',icon:'💥'},{id:'35',name:'Comedy',icon:'😂'},
            {id:'18',name:'Drama',icon:'🎭'},{id:'27',name:'Horror',icon:'👻'},
            {id:'878',name:'Sci-Fi',icon:'🚀'},{id:'53',name:'Thriller',icon:'🔪'},
            {id:'10749',name:'Romance',icon:'💖'},{id:'16',name:'Animation',icon:'✨'},
            {id:'80',name:'Crime',icon:'🕵️'},{id:'12',name:'Adventure',icon:'🗺️'},
            {id:'14',name:'Fantasy',icon:'🧙'},{id:'99',name:'Documentary',icon:'📹'}
          ];

          // Filter pills
          const filterPills = ['all','movie','tv','anime'].map(f=>`
            <button class="ex-pill ${activeFilter===f?'active':''}" 
              onclick="window.CineLogUpgrade.setExploreFilter('${f}')">
              ${{all:'🌐 All',movie:'🎬 Movies',tv:'📺 Series',anime:'⛩️ Anime'}[f]}
            </button>`).join('');

          // Sidebar Mood List
          const moods = [
            {emoji:"🌧️",label:"Rainy Night",genre:"18",mood:"top_rated"},
            {emoji:"😂",label:"Feel-Good",genre:"35",mood:"popular"},
            {emoji:"🤯",label:"Mind-Bending",genre:"878",mood:"top_rated"},
            {emoji:"💖",label:"Date Night",genre:"10749",mood:"popular"},
            {emoji:"💥",label:"Adrenaline",genre:"28",mood:"popular"},
            {emoji:"📼",label:"Nostalgia",decade:"1980",mood:"top_rated"},
            {emoji:"👻",label:"Scary",genre:"27",mood:"popular"},
            {emoji:"🏆",label:"Award Winners",genre:"18",mood:"top_rated"},
          ];

          // Setup sidebar action functions on window context so they are callable
          window.triggerExploreMood = async (genre, decade, mood, label) => {
            this.discoverLoading = true;
            this.discoverTitle = `Vibe: ${label}`;
            this.exploreSearchQuery = "";
            const field = document.getElementById("explore-search-field");
            if (field) field.value = "";
            this.renderExplore();

            try {
              const params = {
                api_key: "6a2fd6b9b1bb3befbb9f14c203732225",
                language: "en-US",
                sort_by: mood === "top_rated" ? "vote_average.desc" : "popularity.desc",
                "vote_count.gte": "150"
              };
              if (genre) params.with_genres = genre;
              if (decade) {
                params["primary_release_date.gte"] = `${decade}-01-01`;
                params["primary_release_date.lte"] = `${parseInt(decade)+9}-12-31`;
              }
              const p = new URLSearchParams(params);
              const r = await fetch(`https://api.themoviedb.org/3/discover/movie?${p}`);
              const data = await r.json();
              this.discoverResults = (data.results || []).map(m=>({...m, media_type: 'movie'}));
            } catch(e) {
              this.discoverResults = [];
            }
            this.discoverLoading = false;
            this.renderExplore();
          };

          window.clearDiscoverResults = () => {
            this.discoverResults = null;
            this.discoverTitle = null;
            this.exploreGenre = "";
            this.exploreDecade = "";
            this.renderExplore();
          };

          window.triggerExploreDecade = (dec) => {
            this.exploreDecade = dec;
            window.triggerExploreMood("", dec, "popular", `${dec}s Classics`);
          };

          window.runSidebarDiscoveryEngine = () => {
            const tone = parseInt(document.getElementById("side-de-tone")?.value || 5);
            const pace = parseInt(document.getElementById("side-de-pace")?.value || 5);
            const era = parseInt(document.getElementById("side-de-era")?.value || 7);
            const length = parseInt(document.getElementById("side-de-length")?.value || 5);

            const lib = this.getLibrary();
            const watchlist = lib.filter(x => x.status === "want_to_watch");
            if (!watchlist.length) {
              alert("Please add some films to your Watchlist first!");
              return;
            }

            const DARK_GENRES  = new Set(["Horror","Thriller","Mystery","Crime","Drama"]);
            const LIGHT_GENRES = new Set(["Comedy","Animation","Family","Romance","Adventure"]);
            const FAST_GENRES  = new Set(["Action","Adventure","Science Fiction","Thriller"]);
            const SLOW_GENRES  = new Set(["Drama","Documentary","History","Romance","Music"]);
            const eraMin = era < 4 ? 1900 : era > 7 ? 2010 : 1990;
            const eraMax = era < 4 ? 1995 : era > 7 ? new Date().getFullYear() : 2020;
            const runtimeMin = length < 4 ? 0  : length > 7 ? 120 : 60;
            const runtimeMax = length < 4 ? 95 : length > 7 ? 300 : 180;

            function scoreFilm(film) {
              const genres = (film.genres || []).map(g => typeof g === "string" ? g : (g && g.name) || "");
              let score = 0;
              if (tone < 4) { genres.forEach(g => { if (DARK_GENRES.has(g)) score += 3; if (LIGHT_GENRES.has(g)) score -= 2; }); }
              else if (tone > 6) { genres.forEach(g => { if (LIGHT_GENRES.has(g)) score += 3; if (DARK_GENRES.has(g)) score -= 2; }); }
              else { score += 1; }
              if (pace > 6) { genres.forEach(g => { if (FAST_GENRES.has(g)) score += 2; }); }
              else if (pace < 4) { genres.forEach(g => { if (SLOW_GENRES.has(g)) score += 2; }); }
              const yr = parseInt(film.year || film.release_year || 0);
              if (yr >= eraMin && yr <= eraMax) score += 3; else if (yr > 0) score -= 1;
              const rt = film.runtime || 0;
              if (rt > 0 && rt >= runtimeMin && rt <= runtimeMax) score += 2;
              score += (film.tmdb_score || 0) / 4;
              return score;
            }

            const scored = watchlist.map(f => ({
              ...f, 
              _score: scoreFilm(f),
              // TMDB format normalization so mkCard can render watchlist items correctly
              id: f.tmdb_id || f.id,
              vote_average: f.tmdb_score || 0,
              poster_path: f.poster || f.poster_path
            })).sort((a,b) => b._score - a._score).slice(0, 12);

            this.discoverTitle = "Discovery Engine Watchlist Picks";
            this.discoverResults = scored;
            this.renderExplore();
          };

          window.findSidebarBlindSpots = async () => {
            this.discoverLoading = true;
            this.discoverTitle = "Your Library Blind Spots";
            this.renderExplore();

            try {
              const [r1, r2] = await Promise.all([
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`),
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=2`)
              ]);
              const d1 = await r1.json();
              const d2 = await r2.json();
              const all = [...(d1.results || []), ...(d2.results || [])];
              const blindSpots = all.filter(f => !libIds.has(String(f.id))).slice(0, 16);
              this.discoverResults = blindSpots.map(m=>({...m, media_type: 'movie'}));
            } catch(e) {
              this.discoverResults = [];
            }
            this.discoverLoading = false;
            this.renderExplore();
          };

          window.spinRoulette = async () => {
            const btn = document.getElementById("roulette-spin-btn");
            const resContainer = document.getElementById("roulette-result");
            if (!btn || !resContainer) return;
            btn.disabled = true;
            btn.textContent = "spinning...";

            let count = 0;
            const tempTitles = ["Interstellar", "Pulp Fiction", "Spirited Away", "Parasite", "The Dark Knight", "Whiplash", "Fight Club", "Inception"];
            const interval = setInterval(() => {
              resContainer.innerHTML = `<div style="padding:16px;text-align:center;font-weight:700;color:var(--accent);font-size:14px;animation:pulse 0.2s infinite">${tempTitles[count % tempTitles.length]}</div>`;
              count++;
            }, 100);

            try {
              const [r1, r2] = await Promise.all([
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=1`),
                fetch(`${TMDB_BASE}/movie/top_rated?api_key=${TMDB_KEY}&language=en-US&page=2`)
              ]);
              const d1 = await r1.json(), d2 = await r2.json();
              const all = [...(d1.results||[]), ...(d2.results||[])];
              const candidates = all.filter(f => !libIds.has(String(f.id)));
              
              clearInterval(interval);

              if (!candidates.length) {
                resContainer.innerHTML = `<div style="padding:12px;color:var(--text-muted);font-size:12px;text-align:center">🎉 You've logged everything!</div>`;
              } else {
                const picked = candidates[Math.floor(Math.random() * candidates.length)];
                const poster = IMG(picked.poster_path, 'w185') || '';
                
                resContainer.innerHTML = `
                  <div style="display:flex;gap:12px;background:var(--surface);border:1px solid var(--border2);border-radius:12px;padding:10px;margin-top:12px;cursor:pointer;animation:scaleUp 0.3s ease" 
                    onclick="window.CineLogUpgrade.openTmdbDetailModal(${picked.id}, 'movie')">
                    ${poster ? `<img src="${poster}" style="width:48px;height:72px;object-fit:cover;border-radius:6px"/>` : `<div style="width:48px;height:72px;background:var(--surface2);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px">🎬</div>`}
                    <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">
                      <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${picked.title}</div>
                      <div style="font-size:10px;color:var(--text-muted);margin:4px 0">${(picked.release_date || "").slice(0,4)}</div>
                      <div style="font-size:11px;color:#f59e0b;font-weight:700">⭐ ${picked.vote_average.toFixed(1)}</div>
                    </div>
                  </div>
                `;
              }
            } catch(e) {
              clearInterval(interval);
              resContainer.innerHTML = `<div style="padding:12px;color:var(--red);font-size:12px;text-align:center">Error spinning.</div>`;
            }
            btn.disabled = false;
            btn.textContent = "Spin Roulette";
          };

          // Main HTML Structure with two-column layout
          const html = `
            <style>
              #cinelog-explore-remake { padding: 0; }
              
              /* Layout */
              .ex-layout { display: flex; gap: 28px; padding: 20px 0; }
              .ex-main-feed { flex: 1; min-width: 0; }
              .ex-sidebar { width: 330px; flex-shrink: 0; display: flex; flex-direction: column; gap: 24px; }
              
              @media (max-width: 1024px) {
                .ex-layout { flex-direction: column; }
                .ex-sidebar { width: 100%; }
              }

              /* Sidebar Cards */
              .ex-sidebar-card {
                background: linear-gradient(135deg, var(--surface2) 0%, rgba(255,255,255,0.01) 100%);
                border: 1px solid var(--border2);
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                transition: border-color 0.25s, box-shadow 0.25s;
              }
              .ex-sidebar-card:hover {
                border-color: var(--accent);
                box-shadow: 0 12px 40px rgba(0,0,0,0.2);
              }
              .ex-sidebar-card-title {
                font-size: 15px;
                font-weight: 800;
                color: var(--text);
                margin-bottom: 6px;
                display: flex;
                align-items: center;
                gap: 8px;
              }
              .ex-sidebar-card-desc {
                font-size: 11px;
                color: var(--text-muted);
                margin-bottom: 16px;
                line-height: 1.4;
              }

              /* Mood Board Grid */
              .ex-mood-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
              .ex-sidebar-pill {
                padding: 9px 12px;
                border-radius: 12px;
                border: 1px solid var(--border2);
                background: var(--surface);
                color: var(--text-muted);
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
                justify-content: flex-start;
              }
              .ex-sidebar-pill:hover {
                border-color: var(--accent);
                color: var(--text);
                transform: translateY(-1px);
              }
              .ex-sidebar-pill.active {
                background: var(--accent);
                border-color: var(--accent);
                color: #fff;
                box-shadow: 0 4px 12px rgba(109,40,217,0.3);
              }

              /* Era Visual Filter Grid */
              .ex-era-pill-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }

              /* Discovery Engine Sliders */
              .de-slider-group { margin-bottom: 14px; }
              .de-slider-header { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 4px; }
              .de-slider {
                width: 100%;
                accent-color: var(--accent);
                height: 6px;
                border-radius: 3px;
                background: var(--border2);
                cursor: pointer;
              }

              /* Hero Widescreen Spotlight */
              .ex-hero {
                position: relative;
                height: 380px;
                border-radius: 20px;
                overflow: hidden;
                cursor: pointer;
                margin-bottom: 32px;
                background: var(--surface);
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
              }
              .ex-hero-bg {
                position: absolute;
                inset: 0;
                background-size: cover;
                background-position: center top;
                transition: transform 0.5s ease;
              }
              .ex-hero:hover .ex-hero-bg { transform: scale(1.02); }
              .ex-hero-fade {
                position: absolute;
                inset: 0;
                background: linear-gradient(to top, rgba(12,12,16,1) 0%, rgba(12,12,16,0.4) 60%, transparent 100%);
              }
              .ex-hero-content {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 32px;
              }
              .ex-hero-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: var(--accent);
                color: #fff;
                font-size: 10px;
                font-weight: 800;
                padding: 4px 10px;
                border-radius: 20px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-bottom: 12px;
              }
              .ex-hero-title {
                font-size: 28px;
                font-weight: 900;
                line-height: 1.15;
                color: #fff;
                margin: 0 0 8px;
                text-shadow: 0 2px 8px rgba(0,0,0,0.5);
              }
              .ex-hero-desc {
                font-size: 13px;
                color: rgba(255,255,255,0.75);
                line-height: 1.5;
                margin: 0 0 16px;
                max-width: 560px;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
              }
              .ex-hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
              .ex-hero-btn {
                display: flex;
                align-items: center;
                gap: 7px;
                padding: 8px 18px;
                border-radius: 24px;
                border: none;
                font-size: 13px;
                font-weight: 700;
                cursor: pointer;
                font-family: inherit;
                transition: all 0.2s;
              }
              .ex-hero-btn-primary { background: var(--accent); color: #fff; }
              .ex-hero-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); }
              .ex-hero-btn-secondary { background: rgba(255,255,255,0.12); color: #fff; border: 1px solid rgba(255,255,255,0.25); backdrop-filter: blur(8px); }
              .ex-hero-btn-secondary:hover { background: rgba(255,255,255,0.22); }

              /* Toolbar */
              .ex-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
              .ex-search-wrap {
                flex: 1;
                min-width: 200px;
                display: flex;
                align-items: center;
                background: var(--surface2);
                border: 1.5px solid var(--border2);
                border-radius: 14px;
                padding: 0 16px;
                gap: 10px;
                transition: border-color 0.2s;
              }
              .ex-search-wrap:focus-within { border-color: var(--accent); }
              .ex-search-wrap svg { color: var(--text-muted); flex-shrink: 0; }
              #explore-search-field {
                flex: 1;
                background: none;
                border: none;
                outline: none;
                color: var(--text);
                font-size: 14px;
                font-family: inherit;
                height: 44px;
              }
              #explore-search-field::placeholder { color: var(--text-muted); }
              .ex-search-clear {
                background: none;
                border: none;
                color: var(--text-muted);
                cursor: pointer;
                padding: 4px;
                border-radius: 50%;
                display: flex;
                align-items: center;
              }
              .ex-search-clear:hover { color: var(--text); background: var(--border2); }

              .ex-pill {
                padding: 8px 16px;
                border-radius: 20px;
                border: 1.5px solid var(--border2);
                background: var(--surface2);
                color: var(--text-muted);
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                white-space: nowrap;
                transition: all 0.2s;
              }
              .ex-pill:hover { border-color: var(--accent); color: var(--text); }
              .ex-pill.active { background: var(--accent); border-color: var(--accent); color: #fff; }

              /* Genre grid */
              .ex-genre-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; margin-bottom: 28px; }
              .ex-genre-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 4px;
                padding: 12px 8px;
                border-radius: 12px;
                border: 1.5px solid var(--border2);
                background: var(--surface2);
                cursor: pointer;
                font-family: inherit;
                transition: all 0.2s;
                color: var(--text);
              }
              .ex-genre-btn:hover, .ex-genre-btn.active {
                border-color: var(--accent);
                background: rgba(109, 40, 217, 0.12);
                transform: translateY(-1px);
              }
              .ex-genre-btn .icon { font-size: 20px; }
              .ex-genre-btn .label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

              /* Tray */
              .ex-tray { margin-bottom: 32px; }
              .ex-tray-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
              .ex-tray-title { font-size: 17px; font-weight: 800; color: var(--text); display: flex; align-items: center; gap: 8px; }
              .ex-tray-count { font-size: 11px; color: var(--text-muted); background: var(--surface2); padding: 2px 8px; border-radius: 8px; border: 1px solid var(--border2); }
              
              .ex-tray-scroll {
                display: flex;
                gap: 14px;
                overflow-x: auto;
                padding-bottom: 8px;
                scrollbar-width: thin;
                scrollbar-color: var(--border2) transparent;
              }
              .ex-tray-scroll::-webkit-scrollbar { height: 4px; }
              .ex-tray-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

              /* Cards */
              .ex-card { flex-shrink: 0; width: 140px; cursor: pointer; border-radius: 12px; overflow: hidden; background: var(--surface); border: 1px solid var(--border2); transition: transform 0.25s, box-shadow 0.25s; }
              .ex-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(0,0,0,0.3); }
              .ex-card-poster { position: relative; aspect-ratio: 2/3; overflow: hidden; }
              .ex-card-poster img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.3s; }
              .ex-card:hover .ex-card-poster img { transform: scale(1.04); }
              .ex-card-score { position: absolute; top: 6px; left: 6px; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; border: 1px solid; backdrop-filter: blur(4px); }
              .ex-card-inlib { position: absolute; top: 6px; right: 6px; font-size: 9px; font-weight: 700; background: rgba(16,185,129,0.9); color: #fff; padding: 2px 6px; border-radius: 6px; }
              .ex-card-overlay { position: absolute; inset: 0; background: rgba(12,12,16,0.85); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; opacity: 0; transition: opacity 0.2s; }
              .ex-card:hover .ex-card-overlay { opacity: 1; }
              .ex-add-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 16px; border: none; background: var(--accent); color: #fff; font-size: 11px; font-weight: 700; cursor: pointer; font-family: inherit; width: 100px; justify-content: center; transition: all 0.15s; }
              .ex-add-btn:hover { filter: brightness(1.15); transform: scale(1.02); }
              .ex-add-watched { background: #10b981; }
              .ex-card-info { padding: 8px 10px; background: var(--surface); }
              .ex-card-title { font-size: 12px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
              .ex-card-meta { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-muted); }
              .ex-type-badge { font-size: 9px; font-weight: 700; padding: 1px 4px; background: var(--surface2); border-radius: 4px; border: 1px solid var(--border2); }

              /* Search results grid */
              .ex-results-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 14px; margin-top: 8px; }
              .ex-results-grid .ex-card { width: 100%; }

              @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
              @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>

            <div class="ex-layout">
              <!-- MAIN CONTENT FEED -->
              <div class="ex-main-feed">
                ${spotlight && !activeSearch ? `
                <!-- SPOTLIGHT HERO -->
                <div class="ex-hero" onclick="window.CineLogUpgrade.openTmdbDetailModal(${spotlight.id},'${spotlight.media_type||'movie'}')">
                  ${spotlightBackdrop ? `<div class="ex-hero-bg" style="background-image:url('${spotlightBackdrop}')"></div>` : ''}
                  <div class="ex-hero-fade"></div>
                  <div class="ex-hero-content">
                    <div class="ex-hero-badge">🔥 Trending Now</div>
                    <h2 class="ex-hero-title">${spotlight.title||spotlight.name||''}</h2>
                    <p class="ex-hero-desc">${(spotlight.overview||'').slice(0,150)}${spotlight.overview?.length>150?'...':''}</p>
                    <div class="ex-hero-btns" onclick="event.stopPropagation()">
                      <button class="ex-hero-btn ex-hero-btn-primary" onclick="window.CineLogUpgrade.openTmdbDetailModal(${spotlight.id},'${spotlight.media_type||'movie'}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18a1 1 0 000-1.69L9.54 5.98A.998.998 0 008 6.82z"/></svg>
                        Watch Trailer
                      </button>
                      <button class="ex-hero-btn ex-hero-btn-secondary" onclick="window.CineLogUpgrade.addTmdbMovie(${JSON.stringify(spotlight).replace(/"/g,'&quot;')},'planned')">
                        + Add to Watchlist
                      </button>
                    </div>
                  </div>
                </div>
                ` : ''}

                <!-- TOOLBAR -->
                <div class="ex-toolbar">
                  <div class="ex-search-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <input type="text" id="explore-search-field" placeholder="Search movies, shows, directors, actors..." 
                      value="${activeSearch}" 
                      oninput="window.CineLogUpgrade.handleExploreSearch(this.value)"
                      onkeydown="if(event.key==='Escape'){window.CineLogUpgrade.clearExploreSearch();}"/>
                    ${activeSearch ? `<button class="ex-search-clear" onclick="window.CineLogUpgrade.clearExploreSearch()">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>` : ''}
                  </div>
                  ${filterPills}
                </div>

                ${activeSearch.trim() ? `
                <!-- SEARCH RESULTS -->
                <section class="ex-tray">
                  <div class="ex-tray-header">
                    <div class="ex-tray-title">🔍 Results for "${activeSearch}"</div>
                    <div class="ex-tray-count">${results.length} found</div>
                  </div>
                  ${results.length === 0 ? '<p style="text-align:center;color:var(--text-muted);padding:48px">No results found. Try a different search.</p>' : `
                  <div class="ex-results-grid">
                    ${results.map(m=>mkCard(m)).join('')}
                  </div>`}
                </section>
                ` : `
                
                <!-- DYNAMIC DISCOVER SHELF -->
                ${this.discoverTitle || this.discoverLoading ? `
                <section class="ex-tray" style="border: 1px solid var(--accent); padding: 18px; border-radius: 16px; background: rgba(109,40,217,0.03); margin-bottom: 32px; animation: scaleUp 0.3s ease">
                  <div class="ex-tray-header">
                    <div class="ex-tray-title">✨ ${this.discoverTitle || 'Discovering...'}</div>
                    <button onclick="clearDiscoverResults()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:12px; font-weight:700; display:flex; align-items:center; gap:4px">✕ Clear</button>
                  </div>
                  
                  ${this.discoverLoading ? `
                    <div style="display:flex;align-items:center;justify-content:center;gap:12px;padding:32px 0">
                      <div class="spinner"></div>
                      <span style="font-size:13px;color:var(--text-muted)">Loading your vibes...</span>
                    </div>
                  ` : `
                    ${!this.discoverResults || !this.discoverResults.length ? `
                      <p style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">Nothing found matching this selection.</p>
                    ` : `
                      <div class="ex-tray-scroll">
                        ${this.discoverResults.map(m => mkCard(m)).join('')}
                      </div>
                    `}
                  `}
                </section>
                ` : ''}

                <!-- GENRE GRID -->
                <div style="margin-bottom:24px">
                  <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Browse by Genre</div>
                  <div class="ex-genre-grid">
                    <button class="ex-genre-btn ${!activeGenre?'active':''}" onclick="window.CineLogUpgrade.setExploreGenre('')">
                      <span class="icon">🌐</span><span class="label">All</span>
                    </button>
                    ${GENRES.map(g=>`
                      <button class="ex-genre-btn ${activeGenre===g.id?'active':''}" onclick="window.CineLogUpgrade.setExploreGenre('${g.id}')">
                        <span class="icon">${g.icon}</span><span class="label">${g.name}</span>
                      </button>`).join('')}
                  </div>
                </div>

                <!-- MAIN TRAYS -->
                ${mkTray('trending','Trending This Week','🔥',trending)}
                ${mkTray('top-rated','Top Rated All Time','⭐',topRated)}
                ${mkTray('now-playing',trendingTypeMap==='movie'?'Now In Cinemas':'Currently Airing','🎬',nowPlaying)}
                ${mkTray('upcoming',trendingTypeMap==='movie'?'Coming Soon':'Popular Right Now','📅',upcoming)}
                `}
              </div>

              <!-- INTERACTIVE DISCOVERY SIDEBAR -->
              <div class="ex-sidebar">
                
                <!-- CINEPHILE ROULETTE CARD -->
                <div class="ex-sidebar-card">
                  <div class="ex-sidebar-card-title">🎲 Cinephile Roulette</div>
                  <div class="ex-sidebar-card-desc">Feeling lucky? Spin to pick a random top-rated film you haven't logged yet!</div>
                  <button id="roulette-spin-btn" onclick="spinRoulette()" class="btn-primary" style="width:100%;padding:10px 0;border-radius:10px;font-weight:700;font-size:13px">Spin Roulette</button>
                  <div id="roulette-result"></div>
                </div>

                <!-- MOOD DIAL CARD -->
                <div class="ex-sidebar-card">
                  <div class="ex-sidebar-card-title">🎭 Pick a Mood</div>
                  <div class="ex-sidebar-card-desc">Curate TMDB discover feeds instantly matching your current vibe.</div>
                  <div class="ex-mood-grid">
                    ${moods.map(m=>`
                      <button class="ex-sidebar-pill" onclick="triggerExploreMood('${m.genre||""}', '${m.decade||""}', '${m.mood}', '${m.label}')">
                        <span>${m.emoji}</span> <span>${m.label}</span>
                      </button>`).join("")}
                  </div>
                </div>

                <!-- DECADE DIAL CARD -->
                <div class="ex-sidebar-card">
                  <div class="ex-sidebar-card-title">📅 Era Dial</div>
                  <div class="ex-sidebar-card-desc">Quick filter by decade. Drag or select to discover classics.</div>
                  <div class="ex-era-pill-grid">
                    ${['1950','1960','1970','1980','1990','2000','2010','2020'].map(d=>`
                      <button class="ex-sidebar-pill ${activeDecade===d?'active':''}" onclick="triggerExploreDecade('${d}')" style="justify-content:center;padding:6px 0">
                        ${d}s
                      </button>`).join("")}
                  </div>
                </div>

                <!-- DISCOVERY ENGINE CARD (watchlist recommendation sliders) -->
                <div class="ex-sidebar-card">
                  <div class="ex-sidebar-card-title">⚙️ Discovery Engine</div>
                  <div class="ex-sidebar-card-desc">Tune the sliders to score and recommend matching items from your watchlist.</div>
                  
                  <div class="de-slider-group">
                    <div class="de-slider-header"><span>Dark</span><span>Light</span></div>
                    <input type="range" id="side-de-tone" min="0" max="10" value="5" class="de-slider">
                  </div>
                  <div class="de-slider-group">
                    <div class="de-slider-header"><span>Slow-burn</span><span>Fast-paced</span></div>
                    <input type="range" id="side-de-pace" min="0" max="10" value="5" class="de-slider">
                  </div>
                  <div class="de-slider-group">
                    <div class="de-slider-header"><span>Classic</span><span>Modern</span></div>
                    <input type="range" id="side-de-era" min="0" max="10" value="7" class="de-slider">
                  </div>
                  <div class="de-slider-group">
                    <div class="de-slider-header"><span>Short</span><span>Long</span></div>
                    <input type="range" id="side-de-length" min="0" max="10" value="5" class="de-slider">
                  </div>

                  <button onclick="runSidebarDiscoveryEngine()" class="btn-primary" style="width:100%;padding:10px 0;border-radius:10px;font-weight:700;font-size:13px;margin-top:8px">Find My Next Watch</button>
                </div>

                <!-- YOUR BLIND SPOTS CARD -->
                <div class="ex-sidebar-card">
                  <div class="ex-sidebar-card-title">👁️ Your Blind Spots</div>
                  <div class="ex-sidebar-card-desc">Reveal highly acclaimed top-rated movies that are missing from your library.</div>
                  <button onclick="findSidebarBlindSpots()" class="btn-primary" style="width:100%;padding:10px 0;border-radius:10px;font-weight:700;font-size:13px">Find Blind Spots</button>
                </div>

              </div>
            </div>
          `;

          container.innerHTML = html;
          this.initCardTilt();
          this.exploreDataLoaded = true;

        } catch(err) {
          console.error('renderExplore error:', err);
          container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-muted)">
            <div style="font-size:48px;margin-bottom:16px">📡</div>
            <div style="font-size:18px;font-weight:700;margin-bottom:8px">Could not load explore data</div>
            <div style="font-size:14px">Check your internet connection and try again.</div>
            <button class="btn-primary" style="margin-top:16px" onclick="window.CineLogUpgrade.exploreDataLoaded=false;window.CineLogUpgrade.renderExplore()">Retry</button>
          </div>`;
        }
      })();
    },


    setExploreFilter(f) {
      this.exploreFilter = f;
      this.exploreDataLoaded = false;
      this.renderExplore();
    },

    setExploreGenre(g) {
      this.exploreGenre = g;
      this.exploreDataLoaded = false;
      this.renderExplore();
    },

    setExploreDecade(d) {
      this.exploreDecade = d;
      this.exploreDataLoaded = false;
      this.renderExplore();
    },


    handleExploreSearch(val) {
      this.exploreSearchQuery = val;
      // Clear active states of mood/decade dials if typing
      if (val.trim()) {
        document.querySelectorAll(".cl-mood-btn").forEach(b => b.classList.remove("active-mood"));
        document.querySelectorAll(".cl-decade-btn").forEach(b => {
          b.classList.toggle("active", b.dataset.decade === "");
        });
        const label = document.getElementById("cl-decade-label");
        if (label) label.textContent = "All eras";
        const sec = document.getElementById("ex-sections");
        if (sec) { sec.innerHTML = ""; sec.style.display = "none"; }
      }
      clearTimeout(this.exploreSearchTimeout);
      this.exploreSearchTimeout = setTimeout(() => {
        this.renderExplore();
      }, 300);
    },

    clearExploreSearch() {
      this.exploreSearchQuery = "";
      const field = document.getElementById('explore-search-input-field');
      if (field) field.value = "";
      this.renderExplore();
    },

    addTmdbMovie(m, status, extraData) {
      const genreMap = {
        28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 
        80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family", 
        14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music", 
        9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie", 
        53: "Thriller", 10752: "War", 37: "Western", 10759: "Action & Adventure", 
        10765: "Sci-Fi & Fantasy", 10764: "Reality", 10766: "Soap", 10767: "Talk", 
        10768: "War & Politics"
      };
      const rawGenres = m.genres ? m.genres.map(g => (typeof g === 'string' ? g : g.name || '')).filter(Boolean) : (m.genre_ids ? m.genre_ids.map(id => genreMap[id]).filter(Boolean) : []);

      const movieObj = {
        id: String(m.id || Math.random().toString(36).substr(2, 9)),
        tmdb_id: Number(m.id),
        media_type: m.media_type || "movie",
        title: m.title || m.name || "Untitled",
        poster_path: m.poster_path || "",
        release_date: m.release_date || m.first_air_date || "",
        release_year: (m.release_date || m.first_air_date || "").slice(0, 4),
        genres: rawGenres,
        overview: m.overview || "",
        backdrop_path: m.backdrop_path || null,
        tmdb_score: m.vote_average || 0,
        status: status || "planned",
        rating: null,
        review: "",
        favorite: false,
        date_added: new Date().toISOString(),
        rewatched: 0,
        tags: [],
        episodeRatings: [],
        watchedDate: status === "watched" ? new Date().toISOString().slice(0, 10) : "",
        runtime: m.runtime || (m.episode_run_time && m.episode_run_time.length ? m.episode_run_time[0] : null),
        director: extraData?.director || null,
        cast: extraData?.cast || null,
        production_countries: m.production_countries || null,
        origin_country: m.origin_country || null
      };

      if (window.reactSetLibrary && window.reactLibraryState) {
        const state = window.reactLibraryState;
        if (state.find(x => x.tmdb_id === movieObj.tmdb_id && x.media_type === movieObj.media_type)) {
          if (window.v24Toast) window.v24Toast('Already in your library!', 'warning');
          return;
        }
        window.reactSetLibrary(prev => [movieObj, ...prev]);
        if (window.v24Toast) window.v24Toast(`🍿 "${movieObj.title}" added to your ${status === 'planned' ? 'Watchlist' : 'Library'}!`, 'success');
      } else {
        const lib = this.getLibrary();
        if (lib.some(x => x.tmdb_id === movieObj.tmdb_id)) {
          if (window.v24Toast) window.v24Toast('Already in your library!', 'warning');
          return;
        }
        lib.push(movieObj);
        localStorage.setItem("cinelog_library_v2", JSON.stringify(lib));
        if (window.v24Toast) window.v24Toast(`🍿 "${movieObj.title}" added to your ${status === 'planned' ? 'Watchlist' : 'Library'}!`, 'success');
      }

      this.renderExplore();
    },

    addCurrentMovie(status) {
      if (this.currentModalItem) {
        this.addTmdbMovie(this.currentModalItem, status, this.currentModalExtra);
        this.closeTmdbInfoModal();
      }
    },

    openTmdbDetailModal(id, type) {
      this.showTmdbInfoModal(id, type);
    },

    async showTmdbInfoModal(id, type) {
      const tmdbKey = "6a2fd6b9b1bb3befbb9f14c203732225";
      const tmdbBase = "https://api.themoviedb.org/3";
      
      let backdrop = document.getElementById('tmdb-info-modal');
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'tmdb-info-modal';
        backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(12,12,16,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;transition:opacity 0.25s ease;pointer-events:none;overflow-y:auto';
        document.body.appendChild(backdrop);
        
        backdrop.addEventListener('click', (e) => {
          if (e.target === backdrop) window.CineLogUpgrade.closeTmdbInfoModal();
        });
      }

      backdrop.style.pointerEvents = 'auto';
      backdrop.style.opacity = '1';
      backdrop.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:760px;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.5)">
          <div class="loading-row"><div class="spinner"></div><span>Querying cinematic registry...</span></div>
        </div>
      `;

      try {
        const [detailsRes, creditsRes, videosRes, similarRes] = await Promise.all([
          fetch(`${tmdbBase}/${type}/${id}?api_key=${tmdbKey}`),
          fetch(`${tmdbBase}/${type}/${id}/credits?api_key=${tmdbKey}`),
          fetch(`${tmdbBase}/${type}/${id}/videos?api_key=${tmdbKey}`),
          fetch(`${tmdbBase}/${type}/${id}/similar?api_key=${tmdbKey}`)
        ]);

        const [m, creds, videosData, similarData] = await Promise.all([
          detailsRes.json(),
          creditsRes.json(),
          videosRes.json(),
          similarRes.json()
        ]);
        
        const director = (creds.crew || []).find(x => x.job === 'Director')?.name || 'N/A';
        const cast = (creds.cast || []).slice(0, 5).map(x => x.name).join(', ') || 'N/A';
        const posterUrl = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=300';
        
        const videosList = videosData.results || [];
        const trailer = videosList.find(v => v.site === 'YouTube' && v.type === 'Trailer') || 
                        videosList.find(v => v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Clip'));
        const ytKey = trailer ? trailer.key : null;

        let certification = 'N/A';
        try {
          if (type === 'movie') {
            const certRes = await fetch(`${tmdbBase}/movie/${id}/release_dates?api_key=${tmdbKey}`);
            const certData = await certRes.json();
            const usRating = (certData.results || []).find(r => r.iso_3166_1 === 'US');
            if (usRating && usRating.release_dates && usRating.release_dates.length > 0) {
              certification = usRating.release_dates[0].certification || 'N/A';
            }
          } else {
            const certRes = await fetch(`${tmdbBase}/tv/${id}/content_ratings?api_key=${tmdbKey}`);
            const certData = await certRes.json();
            const usRating = (certData.results || []).find(r => r.iso_3166_1 === 'US');
            if (usRating) {
              certification = usRating.rating || 'N/A';
            }
          }
        } catch (err) {
          console.warn("Failed to fetch certification:", err);
        }

        const scoreColor = m.vote_average >= 7 ? '#10b981' : m.vote_average >= 5 ? '#f59e0b' : '#ef4444';
        const similarItems = (similarData.results || []).slice(0, 5);

        window.CineLogUpgrade.currentModalItem = m;
        window.CineLogUpgrade.currentModalExtra = { director, cast };

        backdrop.innerHTML = `
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:760px;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:20px;max-height:85vh;overflow-y:auto">
            <button class="upgrade-modal-close" onclick="window.CineLogUpgrade.closeTmdbInfoModal()" style="position:absolute;top:20px;right:20px;background:none;border:none;color:var(--text-muted);font-size:24px;cursor:pointer;z-index:20">✕</button>
            
            <div id="modal-video-container" style="display:none;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;border:1px solid var(--border2);box-shadow:0 12px 24px rgba(0,0,0,0.4);position:relative;background:#000">
              <button onclick="window.CineLogUpgrade.closeTrailerInline()" style="position:absolute;top:12px;right:12px;z-index:30;background:rgba(12,12,16,0.85);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:20px;cursor:pointer;font-size:11px;font-weight:700;backdrop-filter:blur(8px)">✕ Close Trailer</button>
              <div id="trailer-iframe-wrapper" style="width:100%;height:100%"></div>
            </div>

            <div style="display:flex;gap:28px">
              <div id="modal-poster-container" style="width:220px;height:330px;flex-shrink:0;border-radius:12px;overflow:hidden;border:1px solid var(--border2);box-shadow:0 12px 24px rgba(0,0,0,0.4);position:relative;background:var(--bg)">
                <img src="${posterUrl}" alt="${m.title || m.name}" style="width:100%;height:100%;object-fit:cover"/>
                ${ytKey ? `
                  <div class="poster-play-overlay" onclick="window.CineLogUpgrade.playTrailerInline('${ytKey}')">
                    <div style="width:64px;height:64px;border-radius:50%;background:rgba(12,12,16,0.85);backdrop-filter:blur(8px);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,0.4);transition:transform 0.2s ease">
                      <span style="font-size:28px;color:var(--text);margin-left:4px">▶</span>
                    </div>
                  </div>
                ` : ''}
              </div>
              
              <div style="flex:1;display:flex;flex-direction:column;gap:14px">
                <div>
                  <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
                    <span class="type-tag ${type}">${type === 'movie' ? '🎬 Movie' : '📺 TV Show'}</span>
                    ${certification !== 'N/A' ? `<span style="background:var(--border2);border:1px solid var(--border);border-radius:4px;padding:2px 6px;font-size:10px;font-weight:800;color:var(--text)">${certification}</span>` : ''}
                    <div style="display:flex;align-items:center;gap:6px">
                      <div style="width:28px;height:28px;border-radius:50%;border:2px solid ${scoreColor};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:var(--text);background:rgba(12,12,16,0.3)">
                        ${m.vote_average ? m.vote_average.toFixed(1) : 'N/A'}
                      </div>
                      <span style="font-size:11px;color:var(--text-muted);font-weight:700">CineScore</span>
                    </div>
                    ${m.vote_average >= 8.0 && m.vote_count >= 500 ? `<span style=\"background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#000;border-radius:4px;padding:2px 8px;font-size:10px;font-weight:800;letter-spacing:.3px\">⭐ Certified Classic</span>` : ''}
                  </div>
                  <h2 style="font-size:26px;font-weight:900;letter-spacing:-0.5px;line-height:1.2;margin:8px 0">${m.title || m.name}</h2>
                  <div style="display:flex;gap:12px;font-size:12px;color:var(--text-muted)">
                    <span>📅 ${m.release_date || m.first_air_date || 'N/A'}</span>
                    <span>⏱️ ${m.runtime ? m.runtime + 'm' : m.episode_run_time ? m.episode_run_time[0] + 'm' : 'N/A'}</span>
                  </div>
                </div>
                
                <hr style="border:none;border-top:1px solid var(--border2);margin:0">
                
                <div>
                  <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:800;margin-bottom:4px">Overview</div>
                  <p style="font-size:13px;line-height:1.6;color:var(--text);margin:0">${m.overview || 'No overview available.'}</p>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;font-size:12px">
                  <div>
                    <span style="color:var(--text-muted)">Director:</span> <strong style="color:var(--text)">${director}</strong>
                  </div>
                  <div>
                    <span style="color:var(--text-muted)">Key Cast:</span> <strong style="color:var(--text)">${cast}</strong>
                  </div>
                </div>
                
                <div style="display:flex;gap:12px;margin-top:auto;padding-top:12px;flex-wrap:wrap">
                  <button class="btn-primary" style="padding:10px 20px" onclick="window.CineLogUpgrade.addCurrentMovie('planned')">➕ Watchlist</button>
                  <button class="btn-secondary" style="padding:10px 20px;background:var(--green);border-color:var(--green);color:#fff" onclick="window.CineLogUpgrade.addCurrentMovie('watched')">✓ Watched</button>
                  ${ytKey ? `
                    <button class="btn-secondary" style="padding:10px 20px;background:var(--accent);border-color:var(--accent);color:#fff" onclick="window.CineLogUpgrade.playTrailerInline('${ytKey}')">🎬 Watch Trailer</button>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- Recommendations Slider -->
            ${similarItems.length > 0 ? `
              <hr style="border:none;border-top:1px solid var(--border2);margin:10px 0 0 0">
              <div>
                <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;font-weight:800;margin-bottom:10px">Similar Recommendations</div>
                <div style="display:flex;gap:12px;overflow-x:auto;padding-bottom:8px" class="similar-slider">
                  ${similarItems.map(sim => {
                    const simPoster = sim.poster_path ? `https://image.tmdb.org/t/p/w185${sim.poster_path}` : 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100';
                    return `
                      <div class="similar-item-hover" onclick="window.CineLogUpgrade.showTmdbInfoModal(${sim.id}, '${sim.media_type || type}')" style="width:90px;flex-shrink:0;cursor:pointer;transition:transform 0.2s ease">
                        <div style="width:90px;height:130px;border-radius:8px;overflow:hidden;border:1px solid var(--border2);margin-bottom:4px;box-shadow:0 4px 10px rgba(0,0,0,0.2)">
                          <img src="${simPoster}" style="width:100%;height:100%;object-fit:cover" alt="${sim.title || sim.name}"/>
                        </div>
                        <div style="font-size:10px;font-weight:700;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${sim.title || sim.name}">${sim.title || sim.name}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      } catch(e) {
        console.error(e);
        backdrop.innerHTML = `
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;width:100%;max-width:500px;text-align:center;position:relative">
            <button class="upgrade-modal-close" onclick="window.CineLogUpgrade.closeTmdbInfoModal()" style="position:absolute;top:16px;right:16px">✕</button>
            <p style="color:var(--red);font-weight:700">⚠️ Failed to query TMDB registry.</p>
          </div>
        `;
      }
    },

    closeTmdbInfoModal() {
      const modal = document.getElementById('tmdb-info-modal');
      if (modal) {
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
      }
    },

    playTrailerInline(ytKey) {
      const vidContainer = document.getElementById('modal-video-container');
      const iframeWrapper = document.getElementById('trailer-iframe-wrapper');
      if (vidContainer && iframeWrapper) {
        const ytUrl = 'https://www.youtube.com/watch?v=' + ytKey;
        const thumbUrl = 'https://img.youtube.com/vi/' + ytKey + '/hqdefault.jpg';

        // Helper: replace broken embed with a clickable thumbnail fallback
        const showEmbedFallback = function() {
          iframeWrapper.innerHTML =
            '<div onclick="window.open(\'' + ytUrl + '\',\'_blank\')" style="width:100%;height:100%;cursor:pointer;position:relative;background:#000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;">' +
              '<img src="' + thumbUrl + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0.45;" />' +
              '<div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;">' +
                '<div style="width:64px;height:64px;border-radius:50%;background:rgba(229,9,20,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(229,9,20,0.5);">' +
                  '<span style="font-size:26px;color:#fff;margin-left:4px;">&#9654;</span>' +
                '</div>' +
                '<div style="background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);border-radius:8px;padding:8px 16px;text-align:center;">' +
                  '<div style="color:#fff;font-size:13px;font-weight:600;">Watch on YouTube</div>' +
                  '<div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:2px;">Embed blocked by browser — click to open</div>' +
                '</div>' +
              '</div>' +
            '</div>';
        };

        // Listen for YouTube error events (e.g. Error 153 from Brave/uBlock)
        const ytErrHandler = function(evt) {
          try {
            const data = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
            if (data && (data.event === 'onError' || (data.info && data.info.error))) {
              window.removeEventListener('message', ytErrHandler);
              showEmbedFallback();
            }
          } catch(e) {}
        };
        window.addEventListener('message', ytErrHandler);

        // Also auto-fallback after 4s if YouTube never sends "onReady" (e.g. file:// origin)
        const readyTimeout = setTimeout(function() {
          window.removeEventListener('message', ytErrHandler);
        }, 8000);

        // Listen for onReady to cancel the error handler and set volume
        const ytReadyHandler = function(evt) {
          try {
            const data = typeof evt.data === 'string' ? JSON.parse(evt.data) : evt.data;
            if (data && data.event === 'onReady') {
              clearTimeout(readyTimeout);
              window.removeEventListener('message', ytErrHandler);
              window.removeEventListener('message', ytReadyHandler);
              try {
                const iframe = iframeWrapper.querySelector('iframe');
                if (iframe) iframe.contentWindow.postMessage(JSON.stringify({event:'command',func:'setVolume',args:[5]}), '*');
              } catch(e) {}
            }
          } catch(e) {}
        };
        window.addEventListener('message', ytReadyHandler);

        const params = 'autoplay=1&rel=0&modestbranding=1&enablejsapi=1';
        iframeWrapper.innerHTML =
          '<iframe id="cl-trailer-iframe" width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/' + ytKey + '?' + params + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:none;"></iframe>';

        // Hide old fallback link if present
        const oldFallback = document.getElementById('trailer-yt-fallback');
        if (oldFallback) oldFallback.style.display = 'none';

        vidContainer.style.display = 'block';
        vidContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        window.open("https://www.youtube.com/watch?v=" + ytKey, "_blank");
      }
    },

    closeTrailerInline() {
      const vidContainer = document.getElementById('modal-video-container');
      const iframeWrapper = document.getElementById('trailer-iframe-wrapper');
      if (vidContainer && iframeWrapper) {
        iframeWrapper.innerHTML = '';
        vidContainer.style.display = 'none';
      }
      const fallback = document.getElementById('trailer-yt-fallback');
      if (fallback) fallback.style.display = 'none';
    },

    // ─── CINEMA CLUB INTERCEPTS ───



  };

  // Wait for React to mount, then init
  window.CineLogUpgrade.init();
})();