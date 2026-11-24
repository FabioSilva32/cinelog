// CineLog System: Strictly Separated Achievements & Shop Catalog (Zero Overlaps)

export const ACHIEVEMENTS = [
{id:"lunar_archive",title:"Lunar Archivist",description:"Watch fifteen science-fiction titles.",target:15,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>/science fiction|sci-fi/i.test(String(g.name||g)))).length,reward:{type:'border_and_badge',badgeName:"Lunar Archivist",borderId:"lunar-archivist",borderName:"Lunar Archivist"}},
{id:"tidebound",title:"Tidebound",description:"Watch fifteen adventure titles.",target:15,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>/^adventure$/i.test(String(g.name||g)))).length,reward:{type:'border_and_badge',badgeName:"Tidebound",borderId:"tidebound",borderName:"Tidebound"}},
{id:"velvet_marquee",title:"Velvet Marquee",description:"Watch fifteen titles released before 1980.",target:15,check:lib=>lib.filter(m=>m.status==='watched'&&parseInt(m.release_year)>0&&parseInt(m.release_year)<1980).length,reward:{type:'border_and_badge',badgeName:"Velvet Marquee",borderId:"velvet-marquee",borderName:"Velvet Marquee"}},
{id:"paper_crane",title:"Paper Crane",description:"Watch fifteen animated titles.",target:15,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>/^animation$/i.test(String(g.name||g)))).length,reward:{type:'border_and_badge',badgeName:"Paper Crane",borderId:"paper-crane",borderName:"Paper Crane"}},
{id:"orbital_voyager",title:"Orbital Voyager",description:"Watch ten science-fiction titles.",target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>/science fiction|sci-fi/i.test(String(g.name||g)))).length,reward:{type:'border_and_badge',badgeName:"Orbital Voyager",borderId:"orbit-voyager",borderName:"Orbital Voyager"}},
{id:"noir_raven",title:"Noir Raven",description:"Watch ten crime or thriller titles.",target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>/^(crime|thriller)$/i.test(String(g.name||g)))).length,reward:{type:'border_and_badge',badgeName:"Noir Raven",borderId:"noir-raven",borderName:"Noir Raven"}},
{id:"critics_quill",title:"The Critics Quill",description:"Write ten reviews of at least 200 characters.",target:10,check:lib=>lib.filter(m=>(m.review||'').trim().length>=200).length,reward:{type:'border_and_badge',badgeName:"The Critics Quill",borderId:"critics-quill",borderName:"The Critics Quill"}},
{id:"emerald_dragon",title:"Emerald Dragon",description:"Watch ten fantasy titles.",target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>/^fantasy$/i.test(String(g.name||g)))).length,reward:{type:'border_and_badge',badgeName:"Emerald Dragon",borderId:"dragon-screen",borderName:"Emerald Dragon"}},
{id:"archive_keeper",title:"Archive Keeper",description:"Watch titles from six different decades.",target:6,check:lib=>new Set(lib.filter(m=>m.status==='watched').map(m=>Math.floor(parseInt(m.release_year)/10)).filter(Number.isFinite)).size,reward:{type:'border_and_badge',badgeName:"Archive Keeper",borderId:"archive-reel",borderName:"Archive Keeper"}},
{id:"festival_wreath",title:"Festival Wreath",description:"Watch fifty titles and write ten reviews.",target:1,check:lib=>Number(lib.filter(m=>m.status==='watched').length>=50&&lib.filter(m=>(m.review||'').trim().length>=20).length>=10),reward:{type:'border_and_badge',badgeName:"Festival Wreath",borderId:"festival-wreath",borderName:"Festival Wreath"}},
{id:'shelf_mystery',title:'Mystery Collector',description:'Watch ten mystery titles.',target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='mystery')).length,reward:{type:'badge',badgeName:'Mystery Collector'}},
{id:'shelf_fantasy',title:'Fantasy Collector',description:'Watch ten fantasy titles.',target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='fantasy')).length,reward:{type:'badge',badgeName:'Fantasy Collector'}},
{id:'shelf_adventure',title:'Adventure Collector',description:'Watch ten adventure titles.',target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='adventure')).length,reward:{type:'badge',badgeName:'Adventure Collector'}},
{id:'shelf_romance',title:'Romance Collector',description:'Watch ten romance titles.',target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='romance')).length,reward:{type:'badge',badgeName:'Romance Collector'}},
{id:'shelf_crime',title:'Crime Collector',description:'Watch ten crime titles.',target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='crime')).length,reward:{type:'badge',badgeName:'Crime Collector'}},
{id:'shelf_history',title:'History Collector',description:'Watch ten history titles.',target:10,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='history')).length,reward:{type:'badge',badgeName:'History Collector'}},
{id:"decade_hopper",title:"Decade Hopper",description:"Watch titles from five different decades.",target:5,check:library=>new Set(library.filter(m=>m.status==='watched').map(m=>Math.floor(parseInt(m.release_year)/10)).filter(Number.isFinite)).size,reward:{type:'badge',badgeName:"Decade Hopper"}},
{id:"animation_evening",title:"Animated Imagination",description:"Watch ten animated titles.",target:10,check:library=>library.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='animation')).length,reward:{type:'badge',badgeName:"Animated Imagination"}},
{id:"comedy_club",title:"Comedy Club",description:"Watch ten comedies.",target:10,check:library=>library.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='comedy')).length,reward:{type:'badge',badgeName:"Comedy Club"}},
{id:"documentary_eye",title:"Documentary Eye",description:"Watch five documentaries.",target:5,check:library=>library.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='documentary')).length,reward:{type:'badge',badgeName:"Documentary Eye"}},
{id:"words_matter",title:"Words Matter",description:"Write five reviews of at least 200 characters.",target:5,check:library=>library.filter(m=>(m.review||'').trim().length>=200).length,reward:{type:'badge',badgeName:"Words Matter"}},
{id:"century_screen",title:"A Century on Screen",description:"Watch a title released before 1960.",target:1,check:library=>library.filter(m=>m.status==='watched'&&parseInt(m.release_year)>0&&parseInt(m.release_year)<1960).length,reward:{type:'badge',badgeName:"A Century on Screen"}},
  {id:'opening_frame',title:'Opening Frame',description:'Log your first watched title.',target:1,check:library=>library.filter(m=>m.status==='watched').length,reward:{type:'badge',badgeName:'Opening Frame'}},
  {id:'encore',title:'Encore',description:'Return to a favorite with a second logged screening.',target:1,check:library=>library.filter(m=>(m.screenings||m.episode_data?.screenings||[]).length>=2).length,reward:{type:'badge',badgeName:'Encore'}},
  {id:'personal_canon',title:'Personal Canon',description:'Mark six titles as favorites.',target:6,check:library=>library.filter(m=>m.favorite||m.is_favorite).length,reward:{type:'badge',badgeName:'Personal Canon'}},
  {
    id: 'bronze_watcher',
    title: 'Bronze Watcher',
    description: 'Watch 5 movies, series, or anime.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Bronze Watcher',
      borderId: 'bronze',
      borderName: 'Bronze Border',
    }
  },
  {
    id: 'silver_watcher',
    title: 'Silver Watcher',
    description: 'Watch 25 movies, series, or anime.',
    target: 25,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Silver Watcher',
      borderId: 'silver',
      borderName: 'Silver Border',
    }
  },
  {
    id: 'gold_watcher',
    title: 'Gold Watcher',
    description: 'Watch 50 movies, series, or anime.',
    target: 50,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Gold Watcher',
      borderId: 'gold',
      borderName: 'Gold Border',
    }
  },
  {
    id: 'diamond_cinephile',
    title: 'Diamond Cinephile',
    description: 'Watch 100 movies, series, or anime.',
    target: 100,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Diamond Legend',
      borderId: 'crystal-diamond',
      borderName: 'Crystal Diamond Border',
    }
  },
  {
    id: 'cinema_overlord',
    title: 'Cinema Overlord',
    description: 'Watch 200 movies, series, or anime.',
    target: 200,
    check: (library) => library.filter(m => m.status === 'watched').length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Cinema Overlord',
      borderId: 'cinema-overlord',
      borderName: 'Cinema Overlord Border',
    }
  },
  {
    id: 'dedicated_critic',
    title: 'Dedicated Critic',
    description: 'Write reviews for 5 different movies or shows.',
    target: 5,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Critic',
      borderId: 'emerald-glow',
      borderName: 'Emerald Glow Border',
    }
  },
  {
    id: 'elite_critic',
    title: 'Elite Critic',
    description: 'Write reviews for 15 different movies or shows.',
    target: 15,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Elite Critic',
      borderId: 'sapphire-glow',
      borderName: 'Sapphire Glow Border',
    }
  },
  {
    id: 'grand_essayist',
    title: 'Grand Essayist',
    description: 'Write reviews for 30 different movies or shows.',
    target: 30,
    check: (library) => library.filter(m => m.review && m.review.trim()).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Master Essayist',
      borderId: 'rose-quartz',
      borderName: 'Rose Quartz Border',
    }
  },
  {
    id: 'genre_master',
    title: 'Genre Master',
    description: 'Watch movies or shows spanning 6 or more unique genres.',
    target: 6,
    check: (library) => {
      const genres = new Set();
      library.forEach(m => {
        if (m.status === 'watched' && Array.isArray(m.genres)) {
          m.genres.forEach(g => genres.add(g));
        }
      });
      return genres.size;
    },
    reward: {
      type: 'border_and_badge',
      badgeName: 'Genre Master',
      borderId: 'genre-prismatic',
      borderName: 'Prismatic Genre Border',
    }
  },
  {
    id: 'sci_fi_explorer',
    title: 'Sci-Fi Explorer',
    description: 'Log at least 5 Sci-Fi movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('sci-fi') || g.toLowerCase().includes('science fiction'))).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Sci-Fi Explorer',
      borderId: 'scifi-nebula',
      borderName: 'Sci-Fi Nebula Border'
    }
  },
  {
    id: 'nightmare_survivor',
    title: 'Nightmare Survivor',
    description: 'Log at least 5 Horror movies or series.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('horror'))).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Nightmare Survivor',
      borderId: 'nightmare-blood',
      borderName: 'Nightmare Crimson Border'
    }
  },
  {
    id: 'anime_otaku',
    title: 'Anime Otaku',
    description: 'Log at least 5 Anime titles.',
    target: 5,
    check: (library) => library.filter(m => m.status === 'watched' && (m.media_type === 'anime' || (Array.isArray(m.genres) && m.genres.some(g => g.toLowerCase().includes('animation'))))).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Anime Otaku',
      borderId: 'anime-sakura',
      borderName: 'Anime Sakura Border'
    }
  },
  {
    id: 'master_curator',
    title: 'Master Curator',
    description: 'Mark 10 or more films as your favorites.',
    target: 10,
    check: (library) => library.filter(m => m.favorite === true || m.is_favorite === true).length,
    reward: {
      type: 'border_and_badge',
      badgeName: 'Master Curator',
      borderId: 'curator-heart',
      borderName: 'Curator Passion Border'
    }
  },
  {
    id: 'rewatch_king',
    title: 'Rewatch King',
    description: 'Log 3 or more movies as watched (build up your watched count).',
    target: 3,
    check: (library) => {
      // Counts movies/shows actually marked as watched — a reliable metric
      // Also checks for 'rewatch' tag or notes for backwards compat
      const watchedCount = library.filter(m => m.status === 'watched').length;
      const taggedRewatches = library.filter(m =>
        Array.isArray(m.tags) && m.tags.some(t => typeof t === 'string' && t.toLowerCase().includes('rewatch'))
      ).length;
      return Math.max(taggedRewatches, Math.min(watchedCount, 99));
    },
    reward: {
      type: 'border_and_badge',
      badgeName: 'Rewatch King',
      borderId: 'chrono-rewind',
      borderName: 'Chrono Rewind Border'
    }
  },
  {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Build a 7-day consecutive movie watching streak.',
    target: 7,
    check: (library) => {
      const dates = new Set(library.filter(m => m.status === 'watched' && (m.watch_date || m.date_added)).map(m => (m.watch_date || m.date_added).split('T')[0]));
      let streak = 0;
      let checkDate = new Date();
      if (!dates.has(checkDate.toISOString().split('T')[0])) checkDate.setDate(checkDate.getDate() - 1);
      while (dates.has(checkDate.toISOString().split('T')[0])) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
      return streak;
    },
    reward: {
      type: 'border_and_badge',
      badgeName: 'Streak Master',
      borderId: 'fire-glow',
      borderName: 'Solar Flare Border'
    }
  }
];

// ── BORDER STYLES CATALOG ───────────────────────────────────────────────────
// Divided cleanly between (1) Achievements, (2) CinePoints Shop, (3) Creator
export const BORDER_STYLES = {
  "orbit-voyager": {
    "name": "Orbital Voyager",
    "desc": "An orbital arc and satellite that travel beyond the portrait.",
    "category": "achievement",
    "style": {
      "border": "3px solid #64d9f5",
      "background": "#18181b",
      "boxShadow": "0 2px 12px #0006"
    }
  },
  "noir-raven": {
    "name": "Noir Raven",
    "desc": "Sculpted raven wings framing the face.",
    "category": "achievement",
    "style": {
      "border": "3px solid #c9c3e2",
      "background": "#18181b",
      "boxShadow": "0 2px 12px #0006"
    }
  },
  "critics-quill": {
    "name": "The Critics Quill",
    "desc": "An engraved feather and inkwell for thoughtful reviews.",
    "category": "achievement",
    "style": {
      "border": "3px solid #e9c786",
      "background": "#18181b",
      "boxShadow": "0 2px 12px #0006"
    }
  },
  "dragon-screen": {
    "name": "Emerald Dragon",
    "desc": "A scaled crest, horns and a dragon seal.",
    "category": "achievement",
    "style": {
      "border": "3px solid #69d9aa",
      "background": "#18181b",
      "boxShadow": "0 2px 12px #0006"
    }
  },
  "archive-reel": {
    "name": "Archive Reel",
    "desc": "Perforated film rails and a miniature reel.",
    "category": "achievement",
    "style": {
      "border": "3px solid #d9aa76",
      "background": "#18181b",
      "boxShadow": "0 2px 12px #0006"
    }
  },
  "festival-wreath": {
    "name": "Festival Wreath",
    "desc": "A champagne laurel wreath and star medallion.",
    "category": "achievement",
    "style": {
      "border": "3px solid #efd591",
      "background": "#18181b",
      "boxShadow": "0 2px 12px #0006"
    }
  },
  "copper-reel": {
    "name": "Copper Reel",
    "cost": 300,
    "desc": "Warm brushed copper, framed in charcoal.",
    "style": {
      "border": "5px ridge #cd8b5b",
      "background": "#39251e",
      "boxShadow": "0 0 0 2px #201a18"
    },
    "category": "shop"
  },
  "porcelain": {
    "name": "Porcelain",
    "cost": 350,
    "desc": "A crisp ivory double rim.",
    "style": {
      "border": "5px double #eee8d9",
      "background": "#33312b",
      "boxShadow": "0 0 0 2px #535047"
    },
    "category": "shop"
  },
  "emerald-premiere": {
    "name": "Emerald Premiere",
    "cost": 550,
    "desc": "Deep emerald with a champagne edge.",
    "style": {
      "border": "5px double #4bdca2",
      "background": "#123e2f",
      "boxShadow": "0 0 0 2px #b99a59"
    },
    "category": "shop"
  },
  "red-carpet": {
    "name": "Red Carpet",
    "cost": 600,
    "desc": "Lacquer red with a satin black inset.",
    "style": {
      "border": "5px ridge #ed2347",
      "background": "#4f101c",
      "boxShadow": "0 0 0 2px #252525"
    },
    "category": "shop"
  },
  "ruby-signet": {
    "name": "Ruby Signet",
    "cost": 450,
    "desc": "A lacquered crimson rim with a fine silver inner edge.",
    "style": {
      "border": "4px double #ff3554",
      "boxShadow": "0 0 0 2px #291015, inset 0 0 0 1px #edc8cc",
      "background": "#5b1427"
    },
    "category": "shop"
  },
  "celluloid": {
    "name": "Celluloid",
    "cost": 400,
    "desc": "Perforated ivory film stock against a charcoal reel.",
    "style": {
      "border": "4px dashed #e5d7b9",
      "boxShadow": "0 0 0 3px #26231e, 0 0 0 4px #81745c",
      "background": "#171613"
    },
    "category": "shop"
  },
  "platinum-cut": {
    "name": "Platinum Cut",
    "cost": 650,
    "desc": "Brushed platinum, cut with a precise dark inner ring.",
    "style": {
      "border": "5px ridge #d6dce4",
      "boxShadow": "0 0 0 2px #32363d, 0 5px 16px #0008",
      "background": "#a0a7b2"
    },
    "category": "shop"
  },
  "festival-laurel": {
    "name": "Festival Laurel",
    "cost": 700,
    "desc": "A champagne wreath for your personal premiere.",
    "style": {
      "border": "5px double #e8c778",
      "boxShadow": "0 0 0 2px #514124, 0 4px 18px #0007",
      "background": "#2b2417"
    },
    "category": "shop"
  },
  "noir-etch": {
    "name": "Noir Etching",
    "cost": 350,
    "desc": "An understated graphite frame with an etched silver edge.",
    "style": {
      "border": "4px groove #82828c",
      "boxShadow": "0 0 0 2px #161619",
      "background": "#38383f"
    },
    "category": "shop"
  },
  "ruby-halo": {
    "name": "Ruby halo",
    "category": "base",
    "style": {
      "border": "3px solid #a6354d",
      "boxShadow": "0 0 0 3px #1b1114,0 0 0 4px #55303a"
    }
  },
  "silverline": {
    "name": "Brushed silver",
    "category": "base",
    "style": {
      "border": "3px solid #aaa9a3",
      "boxShadow": "0 0 0 3px #151515,0 0 0 4px #4a4b48"
    }
  },
  "gilt": {
    "name": "Gilt edge",
    "category": "base",
    "style": {
      "border": "3px solid #b79a65",
      "boxShadow": "0 0 0 3px #181512,0 0 0 4px #655338"
    }
  },
  "none": {
    "name": "Default Border",
    "category": "base",
    "style": {
      "border": "3px solid rgba(255,255,255,0.1)"
    }
  },
  "bronze": {
    "name": "🥉 Bronze Border",
    "category": "achievement",
    "style": {
      "border": "3px solid #cd7f32",
      "boxShadow": "0 0 10px rgba(205,127,50,0.5)"
    }
  },
  "silver": {
    "name": "🥈 Silver Border",
    "category": "achievement",
    "style": {
      "border": "3px solid #e0e0e0",
      "boxShadow": "0 0 12px rgba(255,255,255,0.6)"
    }
  },
  "gold": {
    "name": "🥇 Gold Border",
    "category": "achievement",
    "style": {
      "border": "3px solid #fbbf24",
      "boxShadow": "0 0 15px rgba(251,191,36,0.75)"
    }
  },
  "crystal-diamond": {
    "name": "Crystal Reliquary",
    "category": "achievement",
    "style": {
      "border": "3px solid #bde9f4",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "Cut-glass facets, inset enamel and polished silver edges."
  },
  "cinema-overlord": {
    "name": "The Grand Marquee",
    "category": "achievement",
    "style": {
      "border": "3px solid #f0cb85",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "An architectural cinema marquee in engraved champagne metal."
  },
  "emerald-glow": {
    "name": "Evergreen Laurel",
    "category": "achievement",
    "style": {
      "border": "3px solid #91d5b4",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "Sculpted evergreen leaves and a polished leaf seal."
  },
  "sapphire-glow": {
    "name": "Silver Tide",
    "category": "achievement",
    "style": {
      "border": "3px solid #97cbf2",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "A curling ocean crest with etched foam and water droplets."
  },
  "rose-quartz": {
    "name": "Rosecut Reliquary",
    "category": "achievement",
    "style": {
      "border": "3px solid #e6b3c8",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "Rose-cut crystals held by dark enamel settings."
  },
  "scifi-nebula": {
    "name": "Deep Space Relay",
    "category": "achievement",
    "style": {
      "border": "3px solid #b7c4f4",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "An orbital satellite, star trail and layered planetary rim."
  },
  "nightmare-blood": {
    "name": "Midnight Gargoyle",
    "category": "achievement",
    "style": {
      "border": "3px solid #ed7d88",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "Gothic bat wings and an engraved midnight skull."
  },
  "anime-sakura": {
    "name": "Sakura Branch",
    "category": "achievement",
    "style": {
      "border": "3px solid #f3c9d0",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "Sculpted cherry blossoms on asymmetrical branches."
  },
  "genre-prismatic": {
    "name": "Mosaic Atelier",
    "category": "achievement",
    "style": {
      "border": "3px solid #e1ca99",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "A mosaic of jewel-toned enamel tiles."
  },
  "curator-heart": {
    "name": "Heart of Cinema",
    "category": "achievement",
    "style": {
      "border": "3px solid #f4a4ae",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "An enamel heart held by a folded ceremonial ribbon."
  },
  "chrono-rewind": {
    "name": "The Timekeeper",
    "category": "achievement",
    "style": {
      "border": "3px solid #dfca9c",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "An engraved watch dial with a miniature timepiece."
  },
  "fire-glow": {
    "name": "Phoenix Crest",
    "category": "achievement",
    "style": {
      "border": "3px solid #ffc58b",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    },
    "desc": "Carved phoenix feathers and a flame crest."
  },
  "cyber-violet": {
    "name": "Violet Mainframe",
    "category": "shop",
    "cost": 150,
    "desc": "Layered violet circuit rails with metal contact points.",
    "style": {
      "border": "3px solid #c7b4ef",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "plasma-red": {
    "name": "Crimson Shards",
    "category": "shop",
    "cost": 250,
    "desc": "Crimson crystal facets in dark metal housings.",
    "style": {
      "border": "3px solid #ff8b9c",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "matrix-code": {
    "name": "Emerald Circuit",
    "category": "shop",
    "cost": 350,
    "desc": "Precision circuit rails and a silicon chip clasp.",
    "style": {
      "border": "3px solid #8eddb6",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "hyperdrive": {
    "name": "🚀 Hyperdrive Warp Speed",
    "category": "shop",
    "cost": 500,
    "desc": "Chrono light-speed warp streak animation",
    "style": {
      "border": "4px solid transparent",
      "backgroundImage": "linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #06b6d4, #3b82f6, #fff)",
      "backgroundOrigin": "border-box",
      "backgroundClip": "padding-box, border-box",
      "boxShadow": "0 0 24px rgba(6,182,212,0.95), inset 0 0 8px rgba(59,130,246,0.6)",
      "animation": "pulse-glow 1.8s infinite alternate"
    }
  },
  "royal-amethyst": {
    "name": "💎 Royal Amethyst Crown",
    "category": "shop",
    "cost": 750,
    "desc": "Imperial royal gemstone aura with hue rotation",
    "style": {
      "border": "4px solid transparent",
      "backgroundImage": "linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #c084fc, #fbbf24, #a855f7)",
      "backgroundOrigin": "border-box",
      "backgroundClip": "padding-box, border-box",
      "boxShadow": "0 0 25px rgba(192,132,252,0.95), 0 0 10px rgba(251,191,36,0.6)",
      "animation": "hue-rotation 6s infinite linear"
    }
  },
  "supernova-gold": {
    "name": "🌟 Supernova Stellar Blast",
    "category": "shop",
    "cost": 1000,
    "desc": "Ultra-radiant celestial cosmic explosion",
    "style": {
      "border": "4px solid transparent",
      "backgroundImage": "linear-gradient(#0a0813, #0a0813), linear-gradient(135deg, #fbbf24, #f59e0b, #fff, #fbbf24)",
      "backgroundOrigin": "border-box",
      "backgroundClip": "padding-box, border-box",
      "boxShadow": "0 0 0 2px rgba(251,191,36,0.4), 0 0 28px rgba(251,191,36,0.95), inset 0 0 10px rgba(255,255,255,0.7)",
      "animation": "hue-rotation 8s infinite linear"
    }
  },
  "frostbite-ice": {
    "name": "Glacial Crown",
    "category": "shop",
    "cost": 600,
    "desc": "Ice-cut facets in a polished cryogenic setting.",
    "style": {
      "border": "3px solid #c1f1f4",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "void-shadow": {
    "name": "The Eventide",
    "category": "shop",
    "cost": 850,
    "desc": "A lunar crescent, broken orbit and inset stars.",
    "style": {
      "border": "3px solid #c5b8e4",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "creator": {
    "name": "Founder · The First Reel",
    "category": "creator",
    "desc": "A bespoke cinema crest: crimson reel, champagne laurels and the founder seal. Reserved for the creator.",
    "style": {
      "border": "4px solid #35131d",
      "background": "#171315",
      "boxShadow": "0 0 0 1px #c7a16b, 0 4px 16px #0008"
    }
  },
  "lunar-archivist": {
    "name": "Lunar Archivist",
    "desc": "A carved crescent, interrupted orbit and inset stars.",
    "category": "achievement",
    "style": {
      "border": "3px solid #e7d9b0",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "tidebound": {
    "name": "Tidebound",
    "desc": "A sculpted ocean swell around a sea-glass rim.",
    "category": "achievement",
    "style": {
      "border": "3px solid #92ddd8",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "velvet-marquee": {
    "name": "Velvet Marquee",
    "desc": "A miniature Art Deco cinema entrance in ruby enamel.",
    "category": "achievement",
    "style": {
      "border": "3px solid #eccb90",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  },
  "paper-crane": {
    "name": "Paper Crane",
    "desc": "Folded porcelain wings and stitched paper arcs.",
    "category": "achievement",
    "style": {
      "border": "3px solid #ecdcca",
      "background": "#17191d",
      "boxShadow": "0 2px 10px #0006"
    }
  }
};

// ── BADGE COLORS CATALOG ────────────────────────────────────────────────────
export const BADGE_COLORS = {
  'Opening Frame':{border:'1px solid #925164',color:'#e6b4c1',bg:'#24171b'},
  'Encore':{border:'1px solid #87724f',color:'#dcc595',bg:'#231f17'},
  'Personal Canon':{border:'1px solid #737972',color:'#c3cbbb',bg:'#1d211c'},
  // Creator Exclusives
  'Creator': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'linear-gradient(135deg, rgba(251,191,36,0.25) 0%, rgba(184,124,248,0.25) 100%)' },
  'The Maker.': { border: '1px solid #a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.2)' },

  // Watcher Milestone Tiers
  'Bronze Watcher': { border: '1px solid #cd7f32', color: '#cd7f32', bg: 'rgba(205,127,50,0.15)' },
  'Silver Watcher': { border: '1px solid #c0c0c0', color: '#e2e8f0', bg: 'rgba(192,192,192,0.15)' },
  'Gold Watcher': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  'Diamond Legend': { border: '1px solid #38bdf8', color: '#38bdf8', bg: 'rgba(56,189,248,0.18)' },
  'Cinema Overlord': { border: '1px solid #f59e0b', color: '#fcd34d', bg: 'rgba(245,158,11,0.25)' },
  'Film Legend': { border: '1px solid #eab308', color: '#fde047', bg: 'rgba(234,179,8,0.2)' },
  'Hall of Famer': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.2)' },

  // Critic & Reviewer Ranks
  'Critic': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Dedicated Critic': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Elite Critic': { border: '1px solid #3b82f6', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)' },
  'Master Essayist': { border: '1px solid #f472b6', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  'Grand Essayist': { border: '1px solid #f472b6', color: '#f472b6', bg: 'rgba(244,114,182,0.15)' },
  'Absolute Critic': { border: '1px solid #2dd4bf', color: '#2dd4bf', bg: 'rgba(45,212,191,0.15)' },

  // Genre Specializations
  'Genre Master': { border: '1px solid #a855f7', color: '#c084fc', bg: 'rgba(168,85,247,0.18)' },
  'Sci-Fi Explorer': { border: '1px solid #06b6d4', color: '#67e8f9', bg: 'rgba(6,182,212,0.15)' },
  'Nightmare Survivor': { border: '1px solid #ef4444', color: '#f87171', bg: 'rgba(239,68,68,0.18)' },
  'Anime Otaku': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.18)' },
  'Master Curator': { border: '1px solid #f43f5e', color: '#fb7185', bg: 'rgba(244,63,94,0.15)' },
  'Rewatch King': { border: '1px solid #0ea5e9', color: '#38bdf8', bg: 'rgba(14,165,233,0.15)' },
  'Streak Master': { border: '1px solid #f97316', color: '#fb923c', bg: 'rgba(249,115,22,0.18)' },
  'Space Cadet': { border: '1px solid #38bdf8', color: '#7dd3fc', bg: 'rgba(56,189,248,0.15)' },
  'Noir Sleuth': { border: '1px solid #94a3b8', color: '#cbd5e1', bg: 'rgba(148,163,184,0.15)' },
  'Action Hero': { border: '1px solid #dc2626', color: '#f87171', bg: 'rgba(220,38,38,0.15)' },
  'Master Mind': { border: '1px solid #8b5cf6', color: '#c084fc', bg: 'rgba(139,92,246,0.15)' },

  // Cinephile Habits & Streaks
  'Triple Threat': { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.15)' },
  'Grand Collector': { border: '1px solid #8b5cf6', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' },
  'Blockbuster Buff': { border: '1px solid #f59e0b', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)' },
  'Emotional Rollercoaster': { border: '1px solid #38bdf8', color: '#7dd3fc', bg: 'rgba(56,189,248,0.15)' },
  'Nostalgia Trip': { border: '1px solid #d97706', color: '#fbbf24', bg: 'rgba(217,119,6,0.15)' },
  'Night Owl': { border: '1px solid #6366f1', color: '#818cf8', bg: 'rgba(99,102,241,0.15)' },
  'Active Watcher': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.15)' },
  'Binge Beast': { border: '1px solid #f97316', color: '#fb923c', bg: 'rgba(249,115,22,0.18)' },
  'Reel Master': { border: '1px solid #06b6d4', color: '#67e8f9', bg: 'rgba(6,182,212,0.15)' },

  // CinePoints Shop Title Badges
  'VIP Cinephile': { border: '1px solid #8b5cf6', color: '#c084fc', bg: 'rgba(139,92,246,0.18)' },
  'Popcorn Overlord': { border: '1px solid #f59e0b', color: '#fbbf24', bg: 'rgba(245,158,11,0.18)' },
  'Midnight Binger': { border: '1px solid #3b82f6', color: '#60a5fa', bg: 'rgba(59,130,246,0.18)' },
  'Cinema Tycoon': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.18)' },
  "Director's Cut": { border: '1px solid #ec4899', color: '#f472b6', bg: 'rgba(236,72,153,0.18)' },

  // Special Community & Critic Badges
  'Verified Critic': { border: '1px solid #10b981', color: '#34d399', bg: 'rgba(16,185,129,0.18)' },
  'Top 100 Cinephile': { border: '1px solid #fbbf24', color: '#fbbf24', bg: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.2) 100%)' },
  '35mm Purist': { border: '1px solid #c084fc', color: '#c084fc', bg: 'rgba(168,85,247,0.18)' }
};

// Guarantee valid CSS background property on all catalog items
Object.keys(BADGE_COLORS).forEach(k => {
  if (BADGE_COLORS[k]) {
    BADGE_COLORS[k].background = BADGE_COLORS[k].background || BADGE_COLORS[k].bg;
  }
});

export function getBadgeColors(badgeName) {
  const item = BADGE_COLORS[badgeName] || {
    border: '1px solid rgba(255,255,255,0.16)',
    color: '#e2e8f0',
    bg: 'rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.06)'
  };
  return {
    ...item,
    background: item.background || item.bg || 'rgba(255,255,255,0.06)',
    bg: item.bg || item.background || 'rgba(255,255,255,0.06)',
    color: item.color || '#fff',
    border: item.border || '1px solid rgba(255,255,255,0.16)'
  };
}

// ── CREATOR RECOGNITION ─────────────────────────────────────────────────────
export function isUserCreator(user) {
  if (!user) return false;
  const id = String(user.id || '').toLowerCase().trim();
  const creatorIds = [
    '2436dd73-13e2-45a9-b2af-664a221250d8',
    '754ce8a9-e74a-4277-ab9c-847408153029',
    '2bf89559-f45b-48c1-9b44-1c79bc951a80'
  ];

  return creatorIds.includes(id);
}
