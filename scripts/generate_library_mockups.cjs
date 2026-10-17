const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const artifactDir = 'C:\\Users\\itzfa\\.gemini\\antigravity-ide\\brain\\df3ee534-cdda-49fd-b35d-c16cafd20532';
const publicDir = path.join(__dirname, '..', 'public', 'mockups');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ── CONCEPT 1: Categorized Shelves & Dedicated Sections ──
const svgConcept1 = `
<svg width="1280" height="820" viewBox="0 0 1280 820" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07060b"/>
      <stop offset="50%" stop-color="#0d0b16"/>
      <stop offset="100%" stop-color="#040307"/>
    </linearGradient>
    <linearGradient id="phoneGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="rgba(229,9,20,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <linearGradient id="moviePost1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/><stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="moviePost2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#311018"/><stop offset="100%" stop-color="#090508"/>
    </linearGradient>
    <linearGradient id="moviePost3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
    <linearGradient id="tvPost1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0369a1"/><stop offset="100%" stop-color="#082f49"/>
    </linearGradient>
    <linearGradient id="tvPost2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="tvPost3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e3a8a"/><stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="animePost1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b45309"/><stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="animePost2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="animePost3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ea580c"/><stop offset="100%" stop-color="#431407"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1280" height="820" fill="url(#bgGrad)"/>
  
  <!-- Subtle accent aura -->
  <circle cx="640" cy="80" r="380" fill="rgba(229,9,20,0.06)"/>

  <!-- Left Presentation Header -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="160" height="28" rx="14" fill="rgba(229,9,20,0.18)" stroke="rgba(229,9,20,0.4)"/>
    <text x="80" y="18" fill="#e50914" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.08em">CONCEPT 1 DESIGN</text>
    
    <text x="0" y="65" fill="#ffffff" font-size="32" font-weight="900" letter-spacing="-0.03em">Categorized Shelves &amp; Sections</text>
    <text x="0" y="96" fill="#a1a1aa" font-size="15" font-weight="500">Separates Movies, Series, and Anime into dedicated visual rows.</text>
    
    <g transform="translate(0, 140)">
      <!-- Feature 1 -->
      <circle cx="16" cy="16" r="14" fill="rgba(229,9,20,0.15)"/>
      <text x="16" y="21" fill="#e50914" font-size="13" font-weight="900" text-anchor="middle">✓</text>
      <text x="40" y="16" fill="#ffffff" font-size="14" font-weight="800">Clear Medium Segmentation</text>
      <text x="40" y="32" fill="#71717a" font-size="12">Shows movies in their own group; TV &amp; Anime never intermingle.</text>

      <!-- Feature 2 -->
      <circle cx="16" cy="66" r="14" fill="rgba(2,132,199,0.15)"/>
      <text x="16" y="71" fill="#0284c7" font-size="13" font-weight="900" text-anchor="middle">📺</text>
      <text x="40" y="66" fill="#ffffff" font-size="14" font-weight="800">Electric Blue TV Season Progress</text>
      <text x="40" y="82" fill="#71717a" font-size="12">Series show 'S2 · 8/10 ep' pills and total season badges.</text>

      <!-- Feature 3 -->
      <circle cx="16" cy="116" r="14" fill="rgba(217,119,6,0.15)"/>
      <text x="16" y="121" fill="#d97706" font-size="13" font-weight="900" text-anchor="middle">⛩️</text>
      <text x="40" y="116" fill="#ffffff" font-size="14" font-weight="800">Distinct Sunset Anime Identity</text>
      <text x="40" y="132" fill="#71717a" font-size="12">Anime series &amp; films have dedicated amber styling &amp; tags.</text>

      <!-- Feature 4 -->
      <circle cx="16" cy="166" r="14" fill="rgba(16,185,129,0.15)"/>
      <text x="16" y="171" fill="#10b981" font-size="13" font-weight="900" text-anchor="middle">⚡</text>
      <text x="40" y="166" fill="#ffffff" font-size="14" font-weight="800">Effortless Visual Flow</text>
      <text x="40" y="182" fill="#71717a" font-size="12">Jump straight to any medium via the sleek sticky top tabs.</text>
    </g>
  </g>

  <!-- Right: Phone Device Frame (390 x 740) -->
  <g transform="translate(750, 40)" filter="url(#shadow)">
    <!-- Device border -->
    <rect x="0" y="0" width="410" height="740" rx="36" fill="#0b0a10" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <rect x="5" y="5" width="400" height="730" rx="32" fill="#000000"/>
    
    <!-- Phone top notch/island -->
    <rect x="140" y="12" width="130" height="22" rx="11" fill="#18181b"/>
    
    <!-- App Header Inside Phone -->
    <g transform="translate(20, 48)">
      <text x="0" y="20" fill="#ffffff" font-size="20" font-weight="900" letter-spacing="-0.02em">Library</text>
      <rect x="76" y="6" width="58" height="18" rx="9" fill="rgba(255,255,255,0.08)"/>
      <text x="105" y="19" fill="#a1a1aa" font-size="10.5" font-weight="800" text-anchor="middle">54 titles</text>
      
      <!-- Right Action icons -->
      <rect x="270" y="0" width="30" height="28" rx="8" fill="#141416" stroke="#27272a"/>
      <text x="285" y="18" fill="#a1a1aa" font-size="12" text-anchor="middle">🔍</text>

      <rect x="306" y="0" width="58" height="28" rx="8" fill="#141416" stroke="#27272a"/>
      <rect x="308" y="2" width="28" height="24" rx="6" fill="#e50914"/>
      <text x="322" y="18" fill="#ffffff" font-size="10" font-weight="900" text-anchor="middle">Wall</text>
      <text x="348" y="18" fill="#71717a" font-size="10" font-weight="700" text-anchor="middle">Log</text>
    </g>

    <!-- Category Tabs Rail -->
    <g transform="translate(20, 92)">
      <rect x="0" y="0" width="72" height="28" rx="14" fill="#e50914"/>
      <text x="36" y="18" fill="#ffffff" font-size="11" font-weight="900" text-anchor="middle">All (54)</text>

      <rect x="78" y="0" width="94" height="28" rx="14" fill="#141416" stroke="#27272a"/>
      <text x="125" y="18" fill="#a1a1aa" font-size="11" font-weight="700" text-anchor="middle">🎬 Movies (34)</text>

      <rect x="178" y="0" width="88" height="28" rx="14" fill="#141416" stroke="#27272a"/>
      <text x="222" y="18" fill="#a1a1aa" font-size="11" font-weight="700" text-anchor="middle">📺 Series (12)</text>

      <rect x="272" y="0" width="88" height="28" rx="14" fill="#141416" stroke="#27272a"/>
      <text x="316" y="18" fill="#a1a1aa" font-size="11" font-weight="700" text-anchor="middle">⛩️ Anime (8)</text>
    </g>

    <!-- ── SECTION 1: MOVIES ── -->
    <g transform="translate(20, 136)">
      <text x="0" y="14" fill="#ffffff" font-size="12.5" font-weight="900" letter-spacing="0.04em">🎬 FEATURE FILMS</text>
      <text x="128" y="14" fill="#e50914" font-size="11" font-weight="800">34</text>
      <text x="364" y="14" fill="#71717a" font-size="11" font-weight="700" text-anchor="end">See all →</text>

      <!-- 3 Movie Posters -->
      <!-- Movie 1 -->
      <g transform="translate(0, 24)">
        <rect width="114" height="155" rx="10" fill="url(#moviePost1)" stroke="#27272a"/>
        <rect x="5" y="5" width="46" height="16" rx="4" fill="rgba(0,0,0,0.85)"/>
        <text x="28" y="17" fill="#fbbf24" font-size="9" font-weight="900" text-anchor="middle">★ 8.8</text>
        <text x="100" y="17" fill="#e50914" font-size="10" text-anchor="middle">❤️</text>
        
        <rect x="0" y="115" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="132" fill="#ffffff" font-size="10.5" font-weight="800">Interstellar</text>
        <text x="8" y="146" fill="#a1a1aa" font-size="9">2014 · 2h 49m</text>
      </g>

      <!-- Movie 2 -->
      <g transform="translate(124, 24)">
        <rect width="114" height="155" rx="10" fill="url(#moviePost2)" stroke="#27272a"/>
        <rect x="5" y="5" width="46" height="16" rx="4" fill="rgba(0,0,0,0.85)"/>
        <text x="28" y="17" fill="#fbbf24" font-size="9" font-weight="900" text-anchor="middle">★ 9.0</text>
        
        <rect x="0" y="115" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="132" fill="#ffffff" font-size="10.5" font-weight="800">The Dark Knight</text>
        <text x="8" y="146" fill="#a1a1aa" font-size="9">2008 · 2h 32m</text>
      </g>

      <!-- Movie 3 -->
      <g transform="translate(248, 24)">
        <rect width="114" height="155" rx="10" fill="url(#moviePost3)" stroke="#27272a"/>
        <rect x="5" y="5" width="46" height="16" rx="4" fill="rgba(0,0,0,0.85)"/>
        <text x="28" y="17" fill="#fbbf24" font-size="9" font-weight="900" text-anchor="middle">★ 8.5</text>
        
        <rect x="0" y="115" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="132" fill="#ffffff" font-size="10.5" font-weight="800">Dune: Part Two</text>
        <text x="8" y="146" fill="#a1a1aa" font-size="9">2024 · 2h 46m</text>
      </g>
    </g>

    <!-- ── SECTION 2: TV SERIES ── -->
    <g transform="translate(20, 332)">
      <text x="0" y="14" fill="#ffffff" font-size="12.5" font-weight="900" letter-spacing="0.04em">📺 TELEVISION SERIES</text>
      <text x="156" y="14" fill="#0284c7" font-size="11" font-weight="800">12</text>
      <text x="364" y="14" fill="#71717a" font-size="11" font-weight="700" text-anchor="end">See all →</text>

      <!-- TV 1 -->
      <g transform="translate(0, 24)">
        <rect width="114" height="155" rx="10" fill="url(#tvPost1)" stroke="rgba(2,132,199,0.3)"/>
        <rect x="5" y="5" width="56" height="16" rx="4" fill="rgba(2,132,199,0.25)" stroke="#0284c7"/>
        <text x="33" y="17" fill="#38bdf8" font-size="8.5" font-weight="900" text-anchor="middle">TV · S5</text>
        <text x="100" y="17" fill="#e50914" font-size="10" text-anchor="middle">❤️</text>
        
        <rect x="0" y="115" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="132" fill="#ffffff" font-size="10.5" font-weight="800">Breaking Bad</text>
        <text x="8" y="146" fill="#38bdf8" font-size="9" font-weight="700">5 Seasons · Done</text>
      </g>

      <!-- TV 2 -->
      <g transform="translate(124, 24)">
        <rect width="114" height="155" rx="10" fill="url(#tvPost2)" stroke="rgba(2,132,199,0.3)"/>
        <rect x="5" y="5" width="58" height="16" rx="4" fill="rgba(2,132,199,0.25)" stroke="#0284c7"/>
        <text x="34" y="17" fill="#38bdf8" font-size="8.5" font-weight="900" text-anchor="middle">TV · S2 E6</text>
        
        <rect x="0" y="115" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="132" fill="#ffffff" font-size="10.5" font-weight="800">The Bear</text>
        <text x="8" y="146" fill="#38bdf8" font-size="9" font-weight="700">Watching · S2</text>
      </g>

      <!-- TV 3 -->
      <g transform="translate(248, 24)">
        <rect width="114" height="155" rx="10" fill="url(#tvPost3)" stroke="rgba(2,132,199,0.3)"/>
        <rect x="5" y="5" width="52" height="16" rx="4" fill="rgba(2,132,199,0.25)" stroke="#0284c7"/>
        <text x="31" y="17" fill="#38bdf8" font-size="8.5" font-weight="900" text-anchor="middle">TV · S1</text>
        
        <rect x="0" y="115" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="132" fill="#ffffff" font-size="10.5" font-weight="800">Severance</text>
        <text x="8" y="146" fill="#a1a1aa" font-size="9">Season 1 · 9 eps</text>
      </g>
    </g>

    <!-- ── SECTION 3: ANIME ── -->
    <g transform="translate(20, 528)">
      <text x="0" y="14" fill="#ffffff" font-size="12.5" font-weight="900" letter-spacing="0.04em">⛩️ ANIME &amp; ANIMATION</text>
      <text x="178" y="14" fill="#d97706" font-size="11" font-weight="800">8</text>
      <text x="364" y="14" fill="#71717a" font-size="11" font-weight="700" text-anchor="end">See all →</text>

      <!-- Anime 1 -->
      <g transform="translate(0, 24)">
        <rect width="114" height="140" rx="10" fill="url(#animePost1)" stroke="rgba(217,119,6,0.35)"/>
        <rect x="5" y="5" width="62" height="16" rx="4" fill="rgba(217,119,6,0.25)" stroke="#d97706"/>
        <text x="36" y="17" fill="#fcd34d" font-size="8.5" font-weight="900" text-anchor="middle">⛩️ ANIME</text>
        <text x="100" y="17" fill="#e50914" font-size="10" text-anchor="middle">❤️</text>
        
        <rect x="0" y="102" width="114" height="38" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="119" fill="#ffffff" font-size="10.5" font-weight="800">Attack on Titan</text>
        <text x="8" y="133" fill="#fcd34d" font-size="9" font-weight="700">Completed · 89 eps</text>
      </g>

      <!-- Anime 2 -->
      <g transform="translate(124, 24)">
        <rect width="114" height="140" rx="10" fill="url(#animePost2)" stroke="rgba(217,119,6,0.35)"/>
        <rect x="5" y="5" width="62" height="16" rx="4" fill="rgba(217,119,6,0.25)" stroke="#d97706"/>
        <text x="36" y="17" fill="#fcd34d" font-size="8.5" font-weight="900" text-anchor="middle">⛩️ MOVIE</text>
        
        <rect x="0" y="102" width="114" height="38" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="119" fill="#ffffff" font-size="10.5" font-weight="800">Spirited Away</text>
        <text x="8" y="133" fill="#a1a1aa" font-size="9">Ghibli · 2h 05m</text>
      </g>

      <!-- Anime 3 -->
      <g transform="translate(248, 24)">
        <rect width="114" height="140" rx="10" fill="url(#animePost3)" stroke="rgba(217,119,6,0.35)"/>
        <rect x="5" y="5" width="62" height="16" rx="4" fill="rgba(217,119,6,0.25)" stroke="#d97706"/>
        <text x="36" y="17" fill="#fcd34d" font-size="8.5" font-weight="900" text-anchor="middle">⛩️ ANIME</text>
        
        <rect x="0" y="102" width="114" height="38" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="119" fill="#ffffff" font-size="10.5" font-weight="800">Chainsaw Man</text>
        <text x="8" y="133" fill="#fcd34d" font-size="9" font-weight="700">Season 1 · 12 eps</text>
      </g>
    </g>

    <!-- Bottom Nav Bar Inside Phone -->
    <g transform="translate(0, 680)">
      <rect width="400" height="50" fill="#09080e" stroke="#1f1d2b" rx="0"/>
      <circle cx="70" cy="22" r="4" fill="#71717a"/>
      <circle cx="140" cy="22" r="4" fill="#e50914"/>
      <circle cx="205" cy="22" r="16" fill="#e50914"/>
      <text x="205" y="27" fill="#ffffff" font-size="16" font-weight="900" text-anchor="middle">+</text>
      <circle cx="270" cy="22" r="4" fill="#71717a"/>
      <circle cx="340" cy="22" r="4" fill="#71717a"/>
    </g>
  </g>
</svg>
`;

// ── CONCEPT 2: Segmented Vault with Single Focus ──
const svgConcept2 = `
<svg width="1280" height="820" viewBox="0 0 1280 820" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050508"/>
      <stop offset="50%" stop-color="#0a0812"/>
      <stop offset="100%" stop-color="#020204"/>
    </linearGradient>
    <filter id="shadow2" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1280" height="820" fill="url(#bgGrad2)"/>
  <circle cx="640" cy="80" r="380" fill="rgba(0,112,243,0.06)"/>

  <!-- Left Header -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="160" height="28" rx="14" fill="rgba(0,112,243,0.18)" stroke="rgba(0,112,243,0.4)"/>
    <text x="80" y="18" fill="#0070f3" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.08em">CONCEPT 2 DESIGN</text>
    
    <text x="0" y="65" fill="#ffffff" font-size="32" font-weight="900" letter-spacing="-0.03em">Instant Segmented Vault</text>
    <text x="0" y="96" fill="#a1a1aa" font-size="15" font-weight="500">Pure, zero-clutter focus: only 1 media type on screen at a time.</text>
    
    <g transform="translate(0, 140)">
      <circle cx="16" cy="16" r="14" fill="rgba(229,9,20,0.15)"/>
      <text x="16" y="21" fill="#e50914" font-size="13" font-weight="900" text-anchor="middle">🎯</text>
      <text x="40" y="16" fill="#ffffff" font-size="14" font-weight="800">Prominent Top Segment Selector</text>
      <text x="40" y="32" fill="#71717a" font-size="12">Three tactile buttons: '🎬 MOVIES', '📺 TV SERIES', and '⛩️ ANIME'.</text>

      <circle cx="16" cy="66" r="14" fill="rgba(0,112,243,0.15)"/>
      <text x="16" y="71" fill="#0070f3" font-size="13" font-weight="900" text-anchor="middle">🖼️</text>
      <text x="40" y="66" fill="#ffffff" font-size="14" font-weight="800">Spacious Full-Height Grid</text>
      <text x="40" y="82" fill="#71717a" font-size="12">Enjoy maximum vertical scrolling without tiny cluttered sub-sections.</text>

      <circle cx="16" cy="116" r="14" fill="rgba(217,119,6,0.15)"/>
      <text x="16" y="121" fill="#d97706" font-size="13" font-weight="900" text-anchor="middle">🔢</text>
      <text x="40" y="116" fill="#ffffff" font-size="14" font-weight="800">Accurate Live Counts</text>
      <text x="40" y="132" fill="#71717a" font-size="12">Instantly see '34 Movies', '12 Series', and '8 Anime' at a glance.</text>
    </g>
  </g>

  <!-- Right: Phone Device Frame -->
  <g transform="translate(750, 40)" filter="url(#shadow2)">
    <rect x="0" y="0" width="410" height="740" rx="36" fill="#0b0a10" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <rect x="5" y="5" width="400" height="730" rx="32" fill="#000000"/>
    <rect x="140" y="12" width="130" height="22" rx="11" fill="#18181b"/>
    
    <!-- App Header -->
    <g transform="translate(20, 48)">
      <text x="0" y="20" fill="#ffffff" font-size="20" font-weight="900" letter-spacing="-0.02em">Vault</text>
      
      <!-- Big 3-Segment Switcher -->
      <g transform="translate(0, 36)">
        <rect width="364" height="42" rx="12" fill="#121118" stroke="#252433"/>
        
        <!-- Tab 1: Movies (Active) -->
        <rect x="4" y="4" width="116" height="34" rx="9" fill="#e50914"/>
        <text x="62" y="25" fill="#ffffff" font-size="11.5" font-weight="900" text-anchor="middle">🎬 Movies (34)</text>

        <!-- Tab 2: TV -->
        <text x="182" y="25" fill="#a1a1aa" font-size="11.5" font-weight="700" text-anchor="middle">📺 TV (12)</text>

        <!-- Tab 3: Anime -->
        <text x="304" y="25" fill="#a1a1aa" font-size="11.5" font-weight="700" text-anchor="middle">⛩️ Anime (8)</text>
      </g>
    </g>

    <!-- Sub filter chips -->
    <g transform="translate(20, 140)">
      <rect x="0" y="0" width="62" height="24" rx="12" fill="rgba(255,255,255,0.08)"/>
      <text x="31" y="16" fill="#ffffff" font-size="10.5" font-weight="800" text-anchor="middle">All (34)</text>

      <rect x="68" y="0" width="76" height="24" rx="12" fill="transparent" stroke="#27272a"/>
      <text x="106" y="16" fill="#71717a" font-size="10.5" font-weight="700" text-anchor="middle">✓ Watched</text>

      <rect x="150" y="0" width="76" height="24" rx="12" fill="transparent" stroke="#27272a"/>
      <text x="188" y="16" fill="#71717a" font-size="10.5" font-weight="700" text-anchor="middle">⏳ Watchlist</text>

      <rect x="232" y="0" width="60" height="24" rx="12" fill="transparent" stroke="#27272a"/>
      <text x="262" y="16" fill="#71717a" font-size="10.5" font-weight="700" text-anchor="middle">❤️ Favs</text>
    </g>

    <!-- 3x3 Pure Movies Wall -->
    <g transform="translate(20, 178)">
      <!-- Row 1 -->
      <g transform="translate(0, 0)">
        <rect width="114" height="152" rx="10" fill="#1e1b4b" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Interstellar</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.8</text>
      </g>
      <g transform="translate(124, 0)">
        <rect width="114" height="152" rx="10" fill="#311018" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Dark Knight</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 9.0</text>
      </g>
      <g transform="translate(248, 0)">
        <rect width="114" height="152" rx="10" fill="#451a03" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Dune 2</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.5</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 164)">
        <rect width="114" height="152" rx="10" fill="#141416" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Oppenheimer</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.9</text>
      </g>
      <g transform="translate(124, 164)">
        <rect width="114" height="152" rx="10" fill="#1a1829" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Inception</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.8</text>
      </g>
      <g transform="translate(248, 164)">
        <rect width="114" height="152" rx="10" fill="#261219" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Pulp Fiction</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.9</text>
      </g>

      <!-- Row 3 -->
      <g transform="translate(0, 328)">
        <rect width="114" height="152" rx="10" fill="#141416" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Blade Runner</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.2</text>
      </g>
      <g transform="translate(124, 328)">
        <rect width="114" height="152" rx="10" fill="#1e1820" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Fight Club</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.8</text>
      </g>
      <g transform="translate(248, 328)">
        <rect width="114" height="152" rx="10" fill="#15201b" stroke="#27272a"/>
        <text x="57" y="70" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">Parasite</text>
        <text x="57" y="90" fill="#fbbf24" font-size="11" font-weight="800" text-anchor="middle">★ 8.5</text>
      </g>
    </g>
  </g>
</svg>
`;

// ── CONCEPT 3: Unified Flow with Color-Coded Identity Badges ──
const svgConcept3 = `
<svg width="1280" height="820" viewBox="0 0 1280 820" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08070d"/>
      <stop offset="50%" stop-color="#0c0b14"/>
      <stop offset="100%" stop-color="#030306"/>
    </linearGradient>
    <filter id="shadow3" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <rect width="1280" height="820" fill="url(#bgGrad3)"/>
  <circle cx="640" cy="80" r="380" fill="rgba(245,158,11,0.06)"/>

  <!-- Left Header -->
  <g transform="translate(60, 60)">
    <rect x="0" y="0" width="160" height="28" rx="14" fill="rgba(245,158,11,0.18)" stroke="rgba(245,158,11,0.4)"/>
    <text x="80" y="18" fill="#f59e0b" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="0.08em">CONCEPT 3 DESIGN</text>
    
    <text x="0" y="65" fill="#ffffff" font-size="32" font-weight="900" letter-spacing="-0.03em">Unified Flow &amp; Vibrant Identity</text>
    <text x="0" y="96" fill="#a1a1aa" font-size="15" font-weight="500">Keep chronological order, but make every medium instantly pop.</text>
    
    <g transform="translate(0, 140)">
      <circle cx="16" cy="16" r="14" fill="rgba(229,9,20,0.18)"/>
      <text x="16" y="21" fill="#e50914" font-size="12" font-weight="900" text-anchor="middle">🎬</text>
      <text x="40" y="16" fill="#ffffff" font-size="14" font-weight="800">Crimson Movie Badges</text>
      <text x="40" y="32" fill="#71717a" font-size="12">Film cards feature '🎬 FILM' with runtime pill.</text>

      <circle cx="16" cy="66" r="14" fill="rgba(2,132,199,0.18)"/>
      <text x="16" y="71" fill="#0284c7" font-size="12" font-weight="900" text-anchor="middle">📺</text>
      <text x="40" y="66" fill="#ffffff" font-size="14" font-weight="800">Electric Blue TV Season Ribbons</text>
      <text x="40" y="82" fill="#71717a" font-size="12">Shows episode progress and current season right on the card.</text>

      <circle cx="16" cy="116" r="14" fill="rgba(217,119,6,0.18)"/>
      <text x="16" y="121" fill="#d97706" font-size="12" font-weight="900" text-anchor="middle">⛩️</text>
      <text x="40" y="116" fill="#ffffff" font-size="14" font-weight="800">Sunset Orange Anime Badges</text>
      <text x="40" y="132" fill="#71717a" font-size="12">Unmistakable Japanese animation emblems.</text>

      <circle cx="16" cy="166" r="14" fill="rgba(168,85,247,0.18)"/>
      <text x="16" y="171" fill="#a855f7" font-size="12" font-weight="900" text-anchor="middle">🔀</text>
      <text x="40" y="166" fill="#ffffff" font-size="14" font-weight="800">Grouped / Mixed Toggle</text>
      <text x="40" y="182" fill="#71717a" font-size="12">Switch between continuous flow and grouped shelves with 1 tap.</text>
    </g>
  </g>

  <!-- Right: Phone Device Frame -->
  <g transform="translate(750, 40)" filter="url(#shadow3)">
    <rect x="0" y="0" width="410" height="740" rx="36" fill="#0b0a10" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
    <rect x="5" y="5" width="400" height="730" rx="32" fill="#000000"/>
    <rect x="140" y="12" width="130" height="22" rx="11" fill="#18181b"/>
    
    <!-- App Header -->
    <g transform="translate(20, 48)">
      <text x="0" y="20" fill="#ffffff" font-size="20" font-weight="900" letter-spacing="-0.02em">Library Wall</text>
      
      <!-- Grouped Toggle -->
      <g transform="translate(230, 2)">
        <rect width="134" height="26" rx="13" fill="#141416" stroke="#27272a"/>
        <rect x="2" y="2" width="64" height="22" rx="11" fill="#e50914"/>
        <text x="34" y="17" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">Unified</text>
        <text x="99" y="17" fill="#71717a" font-size="9.5" font-weight="700" text-anchor="middle">Grouped</text>
      </g>
    </g>

    <!-- Sub filter chips -->
    <g transform="translate(20, 92)">
      <rect x="0" y="0" width="62" height="24" rx="12" fill="#e50914"/>
      <text x="31" y="16" fill="#ffffff" font-size="10.5" font-weight="800" text-anchor="middle">All (54)</text>

      <rect x="68" y="0" width="88" height="24" rx="12" fill="transparent" stroke="#27272a"/>
      <text x="112" y="16" fill="#a1a1aa" font-size="10.5" font-weight="700" text-anchor="middle">🎬 Films (34)</text>

      <rect x="162" y="0" width="84" height="24" rx="12" fill="transparent" stroke="#27272a"/>
      <text x="204" y="16" fill="#0284c7" font-size="10.5" font-weight="700" text-anchor="middle">📺 TV (12)</text>

      <rect x="252" y="0" width="84" height="24" rx="12" fill="transparent" stroke="#27272a"/>
      <text x="294" y="16" fill="#d97706" font-size="10.5" font-weight="700" text-anchor="middle">⛩️ Anime (8)</text>
    </g>

    <!-- 3x3 Unified Wall with High-Contrast Badges -->
    <g transform="translate(20, 132)">
      <!-- Row 1: Movie, TV, Anime side-by-side with unmistakable badge colors -->
      <!-- 1. MOVIE -->
      <g transform="translate(0, 0)">
        <rect width="114" height="160" rx="10" fill="#1e1b4b" stroke="rgba(229,9,20,0.3)"/>
        <rect x="5" y="5" width="56" height="16" rx="4" fill="rgba(229,9,20,0.25)" stroke="#e50914"/>
        <text x="33" y="17" fill="#f87171" font-size="8.5" font-weight="900" text-anchor="middle">🎬 MOVIE</text>
        <rect x="70" y="5" width="38" height="16" rx="4" fill="rgba(0,0,0,0.85)"/>
        <text x="89" y="17" fill="#fbbf24" font-size="8.5" font-weight="900" text-anchor="middle">★ 8.8</text>

        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Interstellar</text>
        <text x="8" y="151" fill="#a1a1aa" font-size="9">2h 49m</text>
      </g>

      <!-- 2. TV SERIES -->
      <g transform="translate(124, 0)">
        <rect width="114" height="160" rx="10" fill="#0369a1" stroke="rgba(2,132,199,0.5)"/>
        <rect x="5" y="5" width="56" height="16" rx="4" fill="rgba(2,132,199,0.25)" stroke="#0284c7"/>
        <text x="33" y="17" fill="#38bdf8" font-size="8.5" font-weight="900" text-anchor="middle">📺 TV · S5</text>
        <rect x="70" y="5" width="38" height="16" rx="4" fill="rgba(0,0,0,0.85)"/>
        <text x="89" y="17" fill="#fbbf24" font-size="8.5" font-weight="900" text-anchor="middle">★ 9.5</text>

        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Breaking Bad</text>
        <text x="8" y="151" fill="#38bdf8" font-size="9" font-weight="700">5 Seasons</text>
      </g>

      <!-- 3. ANIME -->
      <g transform="translate(248, 0)">
        <rect width="114" height="160" rx="10" fill="#b45309" stroke="rgba(217,119,6,0.5)"/>
        <rect x="5" y="5" width="58" height="16" rx="4" fill="rgba(217,119,6,0.25)" stroke="#d97706"/>
        <text x="34" y="17" fill="#fcd34d" font-size="8.5" font-weight="900" text-anchor="middle">⛩️ ANIME</text>
        <rect x="70" y="5" width="38" height="16" rx="4" fill="rgba(0,0,0,0.85)"/>
        <text x="89" y="17" fill="#fbbf24" font-size="8.5" font-weight="900" text-anchor="middle">★ 9.1</text>

        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Attack on Titan</text>
        <text x="8" y="151" fill="#fcd34d" font-size="9" font-weight="700">89 Episodes</text>
      </g>

      <!-- Row 2 -->
      <g transform="translate(0, 172)">
        <rect width="114" height="160" rx="10" fill="#0284c7" stroke="rgba(2,132,199,0.5)"/>
        <rect x="5" y="5" width="58" height="16" rx="4" fill="rgba(2,132,199,0.25)" stroke="#0284c7"/>
        <text x="34" y="17" fill="#38bdf8" font-size="8.5" font-weight="900" text-anchor="middle">📺 TV · S2</text>
        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">The Bear</text>
        <text x="8" y="151" fill="#38bdf8" font-size="9" font-weight="700">S2 · 8/10 ep</text>
      </g>
      <g transform="translate(124, 172)">
        <rect width="114" height="160" rx="10" fill="#311018" stroke="rgba(229,9,20,0.3)"/>
        <rect x="5" y="5" width="56" height="16" rx="4" fill="rgba(229,9,20,0.25)" stroke="#e50914"/>
        <text x="33" y="17" fill="#f87171" font-size="8.5" font-weight="900" text-anchor="middle">🎬 MOVIE</text>
        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Dark Knight</text>
        <text x="8" y="151" fill="#a1a1aa" font-size="9">2h 32m</text>
      </g>
      <g transform="translate(248, 172)">
        <rect width="114" height="160" rx="10" fill="#d97706" stroke="rgba(217,119,6,0.5)"/>
        <rect x="5" y="5" width="58" height="16" rx="4" fill="rgba(217,119,6,0.25)" stroke="#d97706"/>
        <text x="34" y="17" fill="#fcd34d" font-size="8.5" font-weight="900" text-anchor="middle">⛩️ FILM</text>
        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Spirited Away</text>
        <text x="8" y="151" fill="#fcd34d" font-size="9" font-weight="700">Studio Ghibli</text>
      </g>

      <!-- Row 3 -->
      <g transform="translate(0, 344)">
        <rect width="114" height="160" rx="10" fill="#ea580c" stroke="rgba(217,119,6,0.5)"/>
        <rect x="5" y="5" width="58" height="16" rx="4" fill="rgba(217,119,6,0.25)" stroke="#d97706"/>
        <text x="34" y="17" fill="#fcd34d" font-size="8.5" font-weight="900" text-anchor="middle">⛩️ ANIME</text>
        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Chainsaw Man</text>
        <text x="8" y="151" fill="#fcd34d" font-size="9" font-weight="700">12 Episodes</text>
      </g>
      <g transform="translate(124, 344)">
        <rect width="114" height="160" rx="10" fill="#1e3a8a" stroke="rgba(2,132,199,0.5)"/>
        <rect x="5" y="5" width="58" height="16" rx="4" fill="rgba(2,132,199,0.25)" stroke="#0284c7"/>
        <text x="34" y="17" fill="#38bdf8" font-size="8.5" font-weight="900" text-anchor="middle">📺 TV · S1</text>
        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Severance</text>
        <text x="8" y="151" fill="#38bdf8" font-size="9" font-weight="700">Season 1 · 9 eps</text>
      </g>
      <g transform="translate(248, 344)">
        <rect width="114" height="160" rx="10" fill="#451a03" stroke="rgba(229,9,20,0.3)"/>
        <rect x="5" y="5" width="56" height="16" rx="4" fill="rgba(229,9,20,0.25)" stroke="#e50914"/>
        <text x="33" y="17" fill="#f87171" font-size="8.5" font-weight="900" text-anchor="middle">🎬 MOVIE</text>
        <rect x="0" y="120" width="114" height="40" fill="rgba(0,0,0,0.85)" rx="0"/>
        <text x="8" y="137" fill="#ffffff" font-size="10.5" font-weight="800">Dune 2</text>
        <text x="8" y="151" fill="#a1a1aa" font-size="9">2h 46m</text>
      </g>
    </g>
  </g>
</svg>
`;

async function run() {
  const c1Artifact = path.join(artifactDir, 'concept1_categorized_shelves.png');
  const c1Public = path.join(publicDir, 'concept1_categorized_shelves.png');
  await sharp(Buffer.from(svgConcept1)).png().toFile(c1Artifact);
  await sharp(Buffer.from(svgConcept1)).png().toFile(c1Public);
  console.log('Saved Concept 1:', c1Artifact);

  const c2Artifact = path.join(artifactDir, 'concept2_segmented_vault.png');
  const c2Public = path.join(publicDir, 'concept2_segmented_vault.png');
  await sharp(Buffer.from(svgConcept2)).png().toFile(c2Artifact);
  await sharp(Buffer.from(svgConcept2)).png().toFile(c2Public);
  console.log('Saved Concept 2:', c2Artifact);

  const c3Artifact = path.join(artifactDir, 'concept3_color_coded_badges.png');
  const c3Public = path.join(publicDir, 'concept3_color_coded_badges.png');
  await sharp(Buffer.from(svgConcept3)).png().toFile(c3Artifact);
  await sharp(Buffer.from(svgConcept3)).png().toFile(c3Public);
  console.log('Saved Concept 3:', c3Artifact);
}

run().catch(console.error);
