const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const artifactDir = 'C:\\Users\\itzfa\\.gemini\\antigravity-ide\\brain\\df3ee534-cdda-49fd-b35d-c16cafd20532';
const publicDir = path.join(__dirname, '..', 'public', 'mockups');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 1: Grand Cinematic Showcase Grid (Letterboxd Pro + Large Posters)
// ─────────────────────────────────────────────────────────────────────────────
const svgLayout1 = `
<svg width="1280" height="820" viewBox="0 0 1280 820" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08070d"/>
      <stop offset="60%" stop-color="#0d0b16"/>
      <stop offset="100%" stop-color="#050408"/>
    </linearGradient>
    <filter id="shadow1" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1280" height="820" fill="url(#bgGrad1)"/>

  <!-- Top Bar / Header Area -->
  <g transform="translate(60, 40)">
    <text x="0" y="24" fill="#ffffff" font-size="28" font-weight="900" letter-spacing="-0.5">Cine<tspan fill="#e50914">Log</tspan> · <tspan fill="#d4d4d8" font-size="22" font-weight="700">Showcase Grid</tspan></text>
    <text x="0" y="48" fill="#a1a1aa" font-size="13.5" font-weight="500">Option 1: Extra Large 200px Posters · 16px Crisp High-Contrast Typography · Spacious 5-Column Grid</text>

    <!-- Filter Segmented Tabs -->
    <g transform="translate(0, 68)">
      <rect width="124" height="38" rx="19" fill="#e50914"/>
      <text x="62" y="24" fill="#ffffff" font-size="13" font-weight="800" text-anchor="middle">All Titles (54)</text>

      <g transform="translate(132, 0)">
        <rect width="138" height="38" rx="19" fill="#181524" stroke="rgba(255,255,255,0.12)"/>
        <text x="69" y="24" fill="#d4d4d8" font-size="13" font-weight="700" text-anchor="middle">🍿 Feature Films (34)</text>
      </g>
      <g transform="translate(278, 0)">
        <rect width="132" height="38" rx="19" fill="#181524" stroke="rgba(255,255,255,0.12)"/>
        <text x="66" y="24" fill="#d4d4d8" font-size="13" font-weight="700" text-anchor="middle">📺 TV Series (12)</text>
      </g>
      <g transform="translate(418, 0)">
        <rect width="124" height="38" rx="19" fill="#181524" stroke="rgba(255,255,255,0.12)"/>
        <text x="62" y="24" fill="#d4d4d8" font-size="13" font-weight="700" text-anchor="middle">⛩️ Anime (8)</text>
      </g>
      <!-- Sort Selector on right -->
      <g transform="translate(980, 0)">
        <rect width="180" height="38" rx="19" fill="#181524" stroke="rgba(255,255,255,0.14)"/>
        <text x="90" y="24" fill="#fbbf24" font-size="12.5" font-weight="800" text-anchor="middle">★ Sorted: Highest Rated</text>
      </g>
    </g>
  </g>

  <!-- 5 Big Poster Cards Grid -->
  <g transform="translate(60, 180)">

    <!-- Card 1: Interstellar -->
    <g transform="translate(0, 0)" filter="url(#shadow1)">
      <!-- 208px wide x 312px tall poster -->
      <rect width="212" height="318" rx="14" fill="#1c192c" stroke="rgba(255,255,255,0.12)"/>
      <rect width="212" height="318" rx="14" fill="url(#bgGrad1)" opacity="0.3"/>
      <!-- Mock poster graphic with nebula effect -->
      <circle cx="106" cy="120" r="70" fill="#312e81" opacity="0.6"/>
      <circle cx="106" cy="120" r="35" fill="#f59e0b" opacity="0.4"/>
      <!-- Top Badges -->
      <rect x="10" y="10" width="62" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.2)"/>
      <text x="41" y="25" fill="#fff" font-size="10" font-weight="900" text-anchor="middle">MOVIE</text>
      <rect x="144" y="10" width="58" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
      <text x="173" y="25" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 10.0</text>
      <!-- Bottom Title Bar (BIG READABLE TEXT) -->
      <rect x="0" y="235" width="212" height="83" rx="0" fill="linear-gradient(180deg, transparent 0%, rgba(10,8,18,0.95) 40%, #0a0812 100%)"/>
      <text x="12" y="272" fill="#ffffff" font-size="16.5" font-weight="900">Interstellar</text>
      <text x="12" y="292" fill="#9ca3af" font-size="13" font-weight="600">2014 · Sci-Fi, Drama</text>
      <text x="12" y="308" fill="#22c55e" font-size="11" font-weight="800">✓ Watched 4 times</text>
    </g>

    <!-- Card 2: Blade Runner 2049 -->
    <g transform="translate(238, 0)" filter="url(#shadow1)">
      <rect width="212" height="318" rx="14" fill="#311018" stroke="rgba(229,9,20,0.35)"/>
      <circle cx="106" cy="110" r="60" fill="#e50914" opacity="0.3"/>
      <rect x="10" y="10" width="62" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.2)"/>
      <text x="41" y="25" fill="#fff" font-size="10" font-weight="900" text-anchor="middle">MOVIE</text>
      <rect x="144" y="10" width="58" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
      <text x="173" y="25" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.8</text>
      <rect x="0" y="235" width="212" height="83" fill="linear-gradient(180deg, transparent 0%, rgba(10,8,18,0.95) 40%, #0a0812 100%)"/>
      <text x="12" y="272" fill="#ffffff" font-size="16.5" font-weight="900">Blade Runner 2049</text>
      <text x="12" y="292" fill="#9ca3af" font-size="13" font-weight="600">2017 · Sci-Fi, Mystery</text>
      <text x="12" y="308" fill="#ef4444" font-size="11" font-weight="800">❤️ Favorite Title</text>
    </g>

    <!-- Card 3: Severance (TV) -->
    <g transform="translate(476, 0)" filter="url(#shadow1)">
      <rect width="212" height="318" rx="14" fill="#0c4a6e" stroke="rgba(56,189,248,0.4)"/>
      <circle cx="106" cy="110" r="55" fill="#38bdf8" opacity="0.35"/>
      <rect x="10" y="10" width="76" height="22" rx="6" fill="rgba(3,105,161,0.9)" stroke="#38bdf8"/>
      <text x="48" y="25" fill="#fff" font-size="10" font-weight="900" text-anchor="middle">📺 SERIES</text>
      <rect x="144" y="10" width="58" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
      <text x="173" y="25" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.6</text>
      <rect x="0" y="235" width="212" height="83" fill="linear-gradient(180deg, transparent 0%, rgba(10,8,18,0.95) 40%, #0a0812 100%)"/>
      <text x="12" y="272" fill="#ffffff" font-size="16.5" font-weight="900">Severance</text>
      <text x="12" y="292" fill="#38bdf8" font-size="13" font-weight="700">Season 2 · Ep 4</text>
      <text x="12" y="308" fill="#fbbf24" font-size="11" font-weight="800">▶ Up Next Tonight</text>
    </g>

    <!-- Card 4: Spirited Away (Anime) -->
    <g transform="translate(714, 0)" filter="url(#shadow1)">
      <rect width="212" height="318" rx="14" fill="#78350f" stroke="rgba(245,158,11,0.4)"/>
      <circle cx="106" cy="110" r="60" fill="#f59e0b" opacity="0.3"/>
      <rect x="10" y="10" width="70" height="22" rx="6" fill="rgba(180,83,9,0.9)" stroke="#fbbf24"/>
      <text x="45" y="25" fill="#fff" font-size="10" font-weight="900" text-anchor="middle">⛩️ ANIME</text>
      <rect x="144" y="10" width="58" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
      <text x="173" y="25" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.7</text>
      <rect x="0" y="235" width="212" height="83" fill="linear-gradient(180deg, transparent 0%, rgba(10,8,18,0.95) 40%, #0a0812 100%)"/>
      <text x="12" y="272" fill="#ffffff" font-size="16.5" font-weight="900">Spirited Away</text>
      <text x="12" y="292" fill="#9ca3af" font-size="13" font-weight="600">2001 · Studio Ghibli</text>
      <text x="12" y="308" fill="#22c55e" font-size="11" font-weight="800">✓ Masterpiece</text>
    </g>

    <!-- Card 5: Oppenheimer -->
    <g transform="translate(952, 0)" filter="url(#shadow1)">
      <rect width="212" height="318" rx="14" fill="#451a03" stroke="rgba(255,255,255,0.12)"/>
      <circle cx="106" cy="110" r="55" fill="#ea580c" opacity="0.35"/>
      <rect x="10" y="10" width="62" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.2)"/>
      <text x="41" y="25" fill="#fff" font-size="10" font-weight="900" text-anchor="middle">MOVIE</text>
      <rect x="144" y="10" width="58" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
      <text x="173" y="25" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.4</text>
      <rect x="0" y="235" width="212" height="83" fill="linear-gradient(180deg, transparent 0%, rgba(10,8,18,0.95) 40%, #0a0812 100%)"/>
      <text x="12" y="272" fill="#ffffff" font-size="16.5" font-weight="900">Oppenheimer</text>
      <text x="12" y="292" fill="#9ca3af" font-size="13" font-weight="600">2023 · Biography, Drama</text>
      <text x="12" y="308" fill="#22c55e" font-size="11" font-weight="800">✓ 70mm IMAX Log</text>
    </g>

    <!-- Row 2 Partial Peek -->
    <g transform="translate(0, 342)" opacity="0.6">
      <rect width="212" height="180" rx="14" fill="#1e1b4b"/>
      <text x="12" y="160" fill="#fff" font-size="16" font-weight="900">Dune: Part Two</text>
    </g>
    <g transform="translate(238, 342)" opacity="0.6">
      <rect width="212" height="180" rx="14" fill="#042f2e"/>
      <text x="12" y="160" fill="#fff" font-size="16" font-weight="900">Arcane Season 2</text>
    </g>
    <g transform="translate(476, 342)" opacity="0.6">
      <rect width="212" height="180" rx="14" fill="#3b0764"/>
      <text x="12" y="160" fill="#fff" font-size="16" font-weight="900">The Batman</text>
    </g>
    <g transform="translate(714, 342)" opacity="0.6">
      <rect width="212" height="180" rx="14" fill="#581c87"/>
      <text x="12" y="160" fill="#fff" font-size="16" font-weight="900">Attack on Titan</text>
    </g>
    <g transform="translate(952, 342)" opacity="0.6">
      <rect width="212" height="180" rx="14" fill="#1e293b"/>
      <text x="12" y="160" fill="#fff" font-size="16" font-weight="900">Succession</text>
    </g>
  </g>
</svg>
`;

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 2: Deluxe 3-Column Studio (Independent Columns + Big Posters & Text)
// ─────────────────────────────────────────────────────────────────────────────
const svgLayout2 = `
<svg width="1280" height="820" viewBox="0 0 1280 820" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07060c"/>
      <stop offset="50%" stop-color="#0c0a15"/>
      <stop offset="100%" stop-color="#050409"/>
    </linearGradient>
    <filter id="shadow2" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.7"/>
    </filter>
  </defs>

  <rect width="1280" height="820" fill="url(#bgGrad2)"/>

  <!-- Top Title Area -->
  <g transform="translate(50, 36)">
    <text x="0" y="24" fill="#ffffff" font-size="28" font-weight="900" letter-spacing="-0.5">Cine<tspan fill="#e50914">Log</tspan> · <tspan fill="#d4d4d8" font-size="22" font-weight="700">Deluxe 3-Column Studio</tspan></text>
    <text x="0" y="48" fill="#a1a1aa" font-size="13.5" font-weight="500">Option 2: Keeps 3 Independent Scroll Columns · Upgrades Posters to 85x128px (3x Larger!) · 16px Bold Titles</text>
  </g>

  <!-- 3 Distinct Independent Columns -->
  <g transform="translate(50, 110)">

    <!-- ================= COLUMN 1: MOVIES ================= -->
    <g transform="translate(0, 0)">
      <rect width="374" height="670" rx="16" fill="#120f1d" stroke="rgba(229,9,20,0.3)"/>
      <!-- Pinned Column Header -->
      <path d="M0 16 C0 7.16 7.16 0 16 0 L358 0 C366.84 0 374 7.16 374 16 L374 54 L0 54 Z" fill="#181324"/>
      <text x="18" y="34" fill="#ffffff" font-size="17" font-weight="900">🎬 Movies</text>
      <rect x="100" y="16" width="36" height="24" rx="12" fill="rgba(229,9,20,0.18)" stroke="rgba(229,9,20,0.4)"/>
      <text x="118" y="32" fill="#ef4444" font-size="12" font-weight="900" text-anchor="middle">34</text>
      <text x="354" y="34" fill="#fbbf24" font-size="14" font-weight="900" text-anchor="end">Avg ★ 8.9</text>

      <!-- Sub-bar -->
      <rect x="0" y="54" width="374" height="28" fill="#14101e" border-bottom="1px solid rgba(255,255,255,0.06)"/>
      <text x="18" y="73" fill="#a1a1aa" font-size="11.5" font-weight="700"><tspan fill="#22c55e">28</tspan> Watched · <tspan fill="#ef4444">14</tspan> Favorites · <tspan fill="#60a5fa">6</tspan> Watchlist</text>

      <!-- Item 1: Interstellar -->
      <g transform="translate(14, 96)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#1a1628" stroke="rgba(255,255,255,0.08)"/>
        <!-- Big 76x104 poster -->
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#1e1b4b"/>
        <text x="46" y="65" fill="#f59e0b" font-size="20" text-anchor="middle">🪐</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Interstellar</text>
        <text x="96" y="52" fill="#a1a1aa" font-size="13" font-weight="600">2014 · Christopher Nolan</text>
        <rect x="96" y="64" width="60" height="20" rx="6" fill="#fbbf24"/>
        <text x="126" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 10.0</text>
        <rect x="162" y="64" width="80" height="20" rx="6" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.4)"/>
        <text x="202" y="78" fill="#22c55e" font-size="11" font-weight="800" text-anchor="middle">✓ Watched</text>
        <text x="96" y="102" fill="#71717a" font-size="11.5" font-style="italic">"Transcendent docking sequence alone is pure cinema."</text>
      </g>

      <!-- Item 2: Blade Runner 2049 -->
      <g transform="translate(14, 226)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#1a1628" stroke="rgba(255,255,255,0.08)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#451a03"/>
        <text x="46" y="65" fill="#f97316" font-size="20" text-anchor="middle">⚡</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Blade Runner 2049</text>
        <text x="96" y="52" fill="#a1a1aa" font-size="13" font-weight="600">2017 · Denis Villeneuve</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.8</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(239,68,68,0.18)" stroke="rgba(239,68,68,0.4)"/>
        <text x="198" y="78" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">❤️ Favorite</text>
        <text x="96" y="102" fill="#71717a" font-size="11.5" font-style="italic">"Hypnotic lighting and philosophical depth."</text>
      </g>

      <!-- Item 3: Oppenheimer -->
      <g transform="translate(14, 356)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#1a1628" stroke="rgba(255,255,255,0.08)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#312e81"/>
        <text x="46" y="65" fill="#e50914" font-size="20" text-anchor="middle">💣</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Oppenheimer</text>
        <text x="96" y="52" fill="#a1a1aa" font-size="13" font-weight="600">2023 · IMAX 70mm</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.4</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.4)"/>
        <text x="198" y="78" fill="#22c55e" font-size="11" font-weight="800" text-anchor="middle">✓ Watched</text>
        <text x="96" y="102" fill="#71717a" font-size="11.5" font-style="italic">"Relentless tension and masterpiece sound design."</text>
      </g>
      <!-- Scroll Indicator Track -->
      <rect x="366" y="110" width="3" height="80" rx="1.5" fill="#e50914"/>
    </g>

    <!-- ================= COLUMN 2: SERIES ================= -->
    <g transform="translate(398, 0)">
      <rect width="374" height="670" rx="16" fill="#0e1424" stroke="rgba(56,189,248,0.3)"/>
      <path d="M0 16 C0 7.16 7.16 0 16 0 L358 0 C366.84 0 374 7.16 374 16 L374 54 L0 54 Z" fill="#121b30"/>
      <text x="18" y="34" fill="#ffffff" font-size="17" font-weight="900">📺 TV Series</text>
      <rect x="126" y="16" width="36" height="24" rx="12" fill="rgba(56,189,248,0.18)" stroke="rgba(56,189,248,0.4)"/>
      <text x="144" y="32" fill="#38bdf8" font-size="12" font-weight="900" text-anchor="middle">12</text>
      <text x="354" y="34" fill="#fbbf24" font-size="14" font-weight="900" text-anchor="end">Avg ★ 9.1</text>

      <rect x="0" y="54" width="374" height="28" fill="#101728"/>
      <text x="18" y="73" fill="#a1a1aa" font-size="11.5" font-weight="700"><tspan fill="#38bdf8">4</tspan> Currently Airing · <tspan fill="#22c55e">8</tspan> Finished</text>

      <!-- Item 1: Severance -->
      <g transform="translate(14, 96)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#141f36" stroke="rgba(56,189,248,0.2)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#0284c7"/>
        <text x="46" y="65" fill="#fff" font-size="20" text-anchor="middle">💼</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Severance</text>
        <text x="96" y="52" fill="#38bdf8" font-size="13" font-weight="700">Apple TV+ · Season 2</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.6</text>
        <rect x="158" y="64" width="94" height="20" rx="6" fill="rgba(56,189,248,0.2)" stroke="#38bdf8"/>
        <text x="205" y="78" fill="#38bdf8" font-size="11" font-weight="800" text-anchor="middle">▶ S2 Ep 4 / 10</text>
        <text x="96" y="102" fill="#94a3b8" font-size="11.5" font-style="italic">"Best puzzle-box thriller since Lost."</text>
      </g>

      <!-- Item 2: Succession -->
      <g transform="translate(14, 226)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#141f36" stroke="rgba(255,255,255,0.08)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#0f172a"/>
        <text x="46" y="65" fill="#fbbf24" font-size="20" text-anchor="middle">🏢</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Succession</text>
        <text x="96" y="52" fill="#a1a1aa" font-size="13" font-weight="600">HBO · 4 Seasons Complete</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.7</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.4)"/>
        <text x="198" y="78" fill="#22c55e" font-size="11" font-weight="800" text-anchor="middle">✓ Complete</text>
        <text x="96" y="102" fill="#94a3b8" font-size="11.5" font-style="italic">"Flawless corporate Shakespeare drama."</text>
      </g>

      <!-- Item 3: The Bear -->
      <g transform="translate(14, 356)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#141f36" stroke="rgba(255,255,255,0.08)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#1e293b"/>
        <text x="46" y="65" fill="#f97316" font-size="20" text-anchor="middle">🔪</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">The Bear</text>
        <text x="96" y="52" fill="#a1a1aa" font-size="13" font-weight="600">FX · 3 Seasons</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.2</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.4)"/>
        <text x="198" y="78" fill="#22c55e" font-size="11" font-weight="800" text-anchor="middle">✓ Watched</text>
        <text x="96" y="102" fill="#94a3b8" font-size="11.5" font-style="italic">"Forks episode is one of TV's all-time greats."</text>
      </g>
      <rect x="366" y="110" width="3" height="80" rx="1.5" fill="#38bdf8"/>
    </g>

    <!-- ================= COLUMN 3: ANIME ================= -->
    <g transform="translate(796, 0)">
      <rect width="374" height="670" rx="16" fill="#1a110a" stroke="rgba(245,158,11,0.3)"/>
      <path d="M0 16 C0 7.16 7.16 0 16 0 L358 0 C366.84 0 374 7.16 374 16 L374 54 L0 54 Z" fill="#24180e"/>
      <text x="18" y="34" fill="#ffffff" font-size="17" font-weight="900">⛩️ Anime</text>
      <rect x="100" y="16" width="36" height="24" rx="12" fill="rgba(245,158,11,0.18)" stroke="rgba(245,158,11,0.4)"/>
      <text x="118" y="32" fill="#f59e0b" font-size="12" font-weight="900" text-anchor="middle">8</text>
      <text x="354" y="34" fill="#fbbf24" font-size="14" font-weight="900" text-anchor="end">Avg ★ 9.5</text>

      <rect x="0" y="54" width="374" height="28" fill="#1d130a"/>
      <text x="18" y="73" fill="#a1a1aa" font-size="11.5" font-weight="700"><tspan fill="#f59e0b">6</tspan> Series · <tspan fill="#ea580c">2</tspan> Movies</text>

      <!-- Item 1: Spirited Away -->
      <g transform="translate(14, 96)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#26170d" stroke="rgba(245,158,11,0.2)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#d97706"/>
        <text x="46" y="65" fill="#fff" font-size="20" text-anchor="middle">🐉</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Spirited Away</text>
        <text x="96" y="52" fill="#f59e0b" font-size="13" font-weight="700">Movie · Hayao Miyazaki</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.7</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.4)"/>
        <text x="198" y="78" fill="#22c55e" font-size="11" font-weight="800" text-anchor="middle">✓ Watched</text>
        <text x="96" y="102" fill="#d4d4d8" font-size="11.5" font-style="italic">"Timeless imagination and soul-stirring music."</text>
      </g>

      <!-- Item 2: Attack on Titan -->
      <g transform="translate(14, 226)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#26170d" stroke="rgba(255,255,255,0.08)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#78350f"/>
        <text x="46" y="65" fill="#ef4444" font-size="20" text-anchor="middle">⚔️</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Attack on Titan</text>
        <text x="96" y="52" fill="#a1a1aa" font-size="13" font-weight="600">Series · 88 Episodes</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.7</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(34,197,94,0.18)" stroke="rgba(34,197,94,0.4)"/>
        <text x="198" y="78" fill="#22c55e" font-size="11" font-weight="800" text-anchor="middle">✓ Complete</text>
        <text x="96" y="102" fill="#d4d4d8" font-size="11.5" font-style="italic">"Greatest narrative twists in modern fiction."</text>
      </g>

      <!-- Item 3: Arcane -->
      <g transform="translate(14, 356)" filter="url(#shadow2)">
        <rect width="346" height="120" rx="12" fill="#26170d" stroke="rgba(255,255,255,0.08)"/>
        <rect x="8" y="8" width="76" height="104" rx="8" fill="#b45309"/>
        <text x="46" y="65" fill="#38bdf8" font-size="20" text-anchor="middle">🔮</text>
        <text x="96" y="32" fill="#ffffff" font-size="17" font-weight="900">Arcane</text>
        <text x="96" y="52" fill="#f59e0b" font-size="13" font-weight="700">Series · Season 2</text>
        <rect x="96" y="64" width="56" height="20" rx="6" fill="#fbbf24"/>
        <text x="124" y="78" fill="#000" font-size="11" font-weight="900" text-anchor="middle">★ 9.8</text>
        <rect x="158" y="64" width="80" height="20" rx="6" fill="rgba(239,68,68,0.18)" stroke="rgba(239,68,68,0.4)"/>
        <text x="198" y="78" fill="#ef4444" font-size="11" font-weight="800" text-anchor="middle">❤️ Favorite</text>
        <text x="96" y="102" fill="#d4d4d8" font-size="11.5" font-style="italic">"Unrivaled animation artistry and emotional punch."</text>
      </g>
      <rect x="366" y="110" width="3" height="80" rx="1.5" fill="#f59e0b"/>
    </g>

  </g>
</svg>
`;

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT 3: Editorial Magazine Stream (Wide Cards with Reviews & Big Typography)
// ─────────────────────────────────────────────────────────────────────────────
const svgLayout3 = `
<svg width="1280" height="820" viewBox="0 0 1280 820" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09080e"/>
      <stop offset="50%" stop-color="#100d1a"/>
      <stop offset="100%" stop-color="#060509"/>
    </linearGradient>
    <filter id="shadow3" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1280" height="820" fill="url(#bgGrad3)"/>

  <!-- Top Title Area -->
  <g transform="translate(60, 40)">
    <text x="0" y="24" fill="#ffffff" font-size="28" font-weight="900" letter-spacing="-0.5">Cine<tspan fill="#e50914">Log</tspan> · <tspan fill="#d4d4d8" font-size="22" font-weight="700">Editorial Magazine Stream</tspan></text>
    <text x="0" y="48" fill="#a1a1aa" font-size="13.5" font-weight="500">Option 3: Two Wide Editorial Columns · Big 120x175px Posters · 20px Headlines · Full Review Quotes Front &amp; Center</text>
  </g>

  <!-- 2 Wide Editorial Columns Grid -->
  <g transform="translate(60, 110)">

    <!-- ================= LEFT COLUMN ================= -->
    <g transform="translate(0, 0)">

      <!-- Card 1: Interstellar -->
      <g transform="translate(0, 0)" filter="url(#shadow3)">
        <rect width="564" height="195" rx="16" fill="#141122" stroke="rgba(255,255,255,0.1)"/>
        <!-- Big 122x179px Poster on Left -->
        <rect x="8" y="8" width="122" height="179" rx="10" fill="#1e1b4b"/>
        <text x="69" y="105" fill="#fbbf24" font-size="28" text-anchor="middle">🪐</text>
        <!-- Rating Pill overlaid on poster -->
        <rect x="16" y="16" width="56" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
        <text x="44" y="31" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 10.0</text>

        <!-- Right Content Block -->
        <g transform="translate(148, 20)">
          <rect x="0" y="0" width="70" height="20" rx="6" fill="rgba(229,9,20,0.2)" stroke="#e50914"/>
          <text x="35" y="14" fill="#f87171" font-size="10.5" font-weight="900" text-anchor="middle">🎬 MOVIE</text>
          <text x="82" y="15" fill="#a1a1aa" font-size="13" font-weight="600">2014 · 2h 49m · 70mm IMAX</text>

          <text x="0" y="46" fill="#ffffff" font-size="22" font-weight="900">Interstellar</text>
          <text x="0" y="68" fill="#d4d4d8" font-size="13" font-weight="600">Dir. Christopher Nolan · Matthew McConaughey, Jessica Chastain</text>

          <!-- Quote Block -->
          <rect x="0" y="84" width="400" height="66" rx="8" fill="rgba(229,9,20,0.06)" stroke="rgba(229,9,20,0.2)"/>
          <text x="14" y="108" fill="#fca5a5" font-size="12.5" font-style="italic">"An emotional and auditory triumph. Zimmer’s organ score transcended</text>
          <text x="14" y="126" fill="#fca5a5" font-size="12.5" font-style="italic">typical sci-fi. The docking sequence alone is pure cinema."</text>
          <text x="14" y="142" fill="#71717a" font-size="11" font-weight="700">Logged on Oct 15, 2026 · ❤️ Rewatch Favorite</text>
        </g>
      </g>

      <!-- Card 2: Severance (TV) -->
      <g transform="translate(0, 218)" filter="url(#shadow3)">
        <rect width="564" height="195" rx="16" fill="#111827" stroke="rgba(56,189,248,0.3)"/>
        <rect x="8" y="8" width="122" height="179" rx="10" fill="#0369a1"/>
        <text x="69" y="105" fill="#fff" font-size="28" text-anchor="middle">💼</text>
        <rect x="16" y="16" width="56" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
        <text x="44" y="31" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.6</text>

        <g transform="translate(148, 20)">
          <rect x="0" y="0" width="84" height="20" rx="6" fill="rgba(56,189,248,0.2)" stroke="#38bdf8"/>
          <text x="42" y="14" fill="#38bdf8" font-size="10.5" font-weight="900" text-anchor="middle">📺 TV SERIES</text>
          <text x="96" y="15" fill="#a1a1aa" font-size="13" font-weight="600">Season 2 Ongoing · Apple TV+</text>

          <text x="0" y="46" fill="#ffffff" font-size="22" font-weight="900">Severance</text>
          <text x="0" y="68" fill="#d4d4d8" font-size="13" font-weight="600">Adam Scott, Britt Lower, Christopher Walken</text>

          <rect x="0" y="84" width="400" height="66" rx="8" fill="rgba(56,189,248,0.06)" stroke="rgba(56,189,248,0.2)"/>
          <text x="14" y="108" fill="#bae6fd" font-size="12.5" font-style="italic">"Unbearable cliffhangers every week. The sterile office cinematography</text>
          <text x="14" y="126" fill="#bae6fd" font-size="12.5" font-style="italic">and psychological unraveling is masterclass television."</text>
          <text x="14" y="142" fill="#71717a" font-size="11" font-weight="700">Episode 4 watched yesterday · ▶ 6 episodes left</text>
        </g>
      </g>

      <!-- Card 3: Dune 2 (Partial) -->
      <g transform="translate(0, 436)" filter="url(#shadow3)">
        <rect width="564" height="195" rx="16" fill="#141122" stroke="rgba(255,255,255,0.1)"/>
        <rect x="8" y="8" width="122" height="179" rx="10" fill="#78350f"/>
        <text x="69" y="105" fill="#fbbf24" font-size="28" text-anchor="middle">🏜️</text>
        <g transform="translate(148, 20)">
          <text x="0" y="46" fill="#ffffff" font-size="22" font-weight="900">Dune: Part Two</text>
          <text x="0" y="68" fill="#d4d4d8" font-size="13">2024 · Denis Villeneuve · ★ 9.5</text>
        </g>
      </g>
    </g>

    <!-- ================= RIGHT COLUMN ================= -->
    <g transform="translate(596, 0)">

      <!-- Card 4: Blade Runner 2049 -->
      <g transform="translate(0, 0)" filter="url(#shadow3)">
        <rect width="564" height="195" rx="16" fill="#141122" stroke="rgba(255,255,255,0.1)"/>
        <rect x="8" y="8" width="122" height="179" rx="10" fill="#311018"/>
        <text x="69" y="105" fill="#f87171" font-size="28" text-anchor="middle">⚡</text>
        <rect x="16" y="16" width="56" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
        <text x="44" y="31" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.8</text>

        <g transform="translate(148, 20)">
          <rect x="0" y="0" width="70" height="20" rx="6" fill="rgba(229,9,20,0.2)" stroke="#e50914"/>
          <text x="35" y="14" fill="#f87171" font-size="10.5" font-weight="900" text-anchor="middle">🎬 MOVIE</text>
          <text x="82" y="15" fill="#a1a1aa" font-size="13" font-weight="600">2017 · 2h 44m · Roger Deakins</text>

          <text x="0" y="46" fill="#ffffff" font-size="22" font-weight="900">Blade Runner 2049</text>
          <text x="0" y="68" fill="#d4d4d8" font-size="13" font-weight="600">Ryan Gosling, Harrison Ford, Ana de Armas</text>

          <rect x="0" y="84" width="400" height="66" rx="8" fill="rgba(229,9,20,0.06)" stroke="rgba(229,9,20,0.2)"/>
          <text x="14" y="108" fill="#fca5a5" font-size="12.5" font-style="italic">"Roger Deakins delivered arguably the greatest visual lighting in</text>
          <text x="14" y="126" fill="#fca5a5" font-size="12.5" font-style="italic">21st-century cinema. Hypnotic, philosophical, and melancholic."</text>
          <text x="14" y="142" fill="#71717a" font-size="11" font-weight="700">Logged on Oct 12, 2026 · ❤️ All-Time Top 5</text>
        </g>
      </g>

      <!-- Card 5: Spirited Away (Anime) -->
      <g transform="translate(0, 218)" filter="url(#shadow3)">
        <rect width="564" height="195" rx="16" fill="#1c1209" stroke="rgba(245,158,11,0.3)"/>
        <rect x="8" y="8" width="122" height="179" rx="10" fill="#b45309"/>
        <text x="69" y="105" fill="#fef08a" font-size="28" text-anchor="middle">⛩️</text>
        <rect x="16" y="16" width="56" height="22" rx="6" fill="rgba(0,0,0,0.85)" stroke="#fbbf24"/>
        <text x="44" y="31" fill="#fbbf24" font-size="11" font-weight="900" text-anchor="middle">★ 9.6</text>

        <g transform="translate(148, 20)">
          <rect x="0" y="0" width="76" height="20" rx="6" fill="rgba(245,158,11,0.2)" stroke="#f59e0b"/>
          <text x="38" y="14" fill="#fbbf24" font-size="10.5" font-weight="900" text-anchor="middle">⛩️ ANIME</text>
          <text x="90" y="15" fill="#a1a1aa" font-size="13" font-weight="600">Studio Ghibli · 2h 5m</text>

          <text x="0" y="46" fill="#ffffff" font-size="22" font-weight="900">Spirited Away</text>
          <text x="0" y="68" fill="#d4d4d8" font-size="13" font-weight="600">Dir. Hayao Miyazaki · Joe Hisaishi Score</text>

          <rect x="0" y="84" width="400" height="66" rx="8" fill="rgba(245,158,11,0.06)" stroke="rgba(245,158,11,0.2)"/>
          <text x="14" y="108" fill="#fde68a" font-size="12.5" font-style="italic">"A breathtaking masterpiece of childhood wonder and spirit lore.</text>
          <text x="14" y="126" fill="#fde68a" font-size="12.5" font-style="italic">The train ride across the flooded tracks remains unmatched."</text>
          <text x="14" y="142" fill="#71717a" font-size="11" font-weight="700">Logged on Oct 10, 2026 · ✓ Watched</text>
        </g>
      </g>

      <!-- Card 6: Arcane (Partial) -->
      <g transform="translate(0, 436)" filter="url(#shadow3)">
        <rect width="564" height="195" rx="16" fill="#141122" stroke="rgba(255,255,255,0.1)"/>
        <rect x="8" y="8" width="122" height="179" rx="10" fill="#042f2e"/>
        <text x="69" y="105" fill="#38bdf8" font-size="28" text-anchor="middle">🔮</text>
        <g transform="translate(148, 20)">
          <text x="0" y="46" fill="#ffffff" font-size="22" font-weight="900">Arcane: League of Legends</text>
          <text x="0" y="68" fill="#d4d4d8" font-size="13">Season 2 · Fortiche · ★ 9.8</text>
        </g>
      </g>

    </g>

  </g>
</svg>
`;

async function run() {
  const l1Artifact = path.join(artifactDir, 'layout1_showcase_grid.png');
  const l1Public = path.join(publicDir, 'layout1_showcase_grid.png');
  await sharp(Buffer.from(svgLayout1)).png().toFile(l1Artifact);
  await sharp(Buffer.from(svgLayout1)).png().toFile(l1Public);
  console.log('Saved Layout 1:', l1Artifact);

  const l2Artifact = path.join(artifactDir, 'layout2_deluxe_3col.png');
  const l2Public = path.join(publicDir, 'layout2_deluxe_3col.png');
  await sharp(Buffer.from(svgLayout2)).png().toFile(l2Artifact);
  await sharp(Buffer.from(svgLayout2)).png().toFile(l2Public);
  console.log('Saved Layout 2:', l2Artifact);

  const l3Artifact = path.join(artifactDir, 'layout3_editorial_magazine.png');
  const l3Public = path.join(publicDir, 'layout3_editorial_magazine.png');
  await sharp(Buffer.from(svgLayout3)).png().toFile(l3Artifact);
  await sharp(Buffer.from(svgLayout3)).png().toFile(l3Public);
  console.log('Saved Layout 3:', l3Artifact);
}

run().catch(console.error);
