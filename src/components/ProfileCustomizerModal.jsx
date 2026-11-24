import ConfirmModal from './ConfirmModal';
import {profileDraftFingerprint} from '../utils/profileDraft';
import AppearanceStudio from './AppearanceStudio';
import { useDialogFocus } from '../hooks/useDialogFocus';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

const TMDB_KEY = '6a2fd6b9b1bb3befbb9f14c203732225';

export const CURATED_MOVIE_AVATARS = [
  { id: 'spiderman', name: 'Spider-Man (Miles Morales)', movie: 'Spider-Man: Across the Spider-Verse', category: 'Superhero', url: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', pos: 'center 16%' },
  { id: 'darth_vader', name: 'Darth Vader', movie: 'Star Wars: The Empire Strikes Back', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/w500/ebluYJHkKoYHQ1x0XXlOLWdcqoL.jpg', pos: 'center 20%' },
  { id: 'mandalorian', name: 'The Mandalorian (Din Djarin)', movie: 'The Mandalorian', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/w500/vrxpwApFKUWKK0rwcaK8be5OVWK.jpg', pos: 'center 18%' },
  { id: 'batman', name: 'Batman (The Dark Knight)', movie: 'The Batman', category: 'Superhero', url: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', pos: 'center 22%' },
  { id: 'iron_man', name: 'Iron Man (Mark VII)', movie: 'The Avengers', category: 'Superhero', url: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', pos: 'center 18%' },
  { id: 'ghostface', name: 'Ghostface', movie: 'Scream VI', category: 'Horror', url: 'https://image.tmdb.org/t/p/w500/wDWwtvkRRlgTiUr6TyLSMX8FCuZ.jpg', pos: 'center 15%' },
  { id: 'deadpool', name: 'Deadpool (Wade Wilson)', movie: 'Deadpool & Wolverine', category: 'Superhero', url: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', pos: 'center 18%' },
  { id: 'noface', name: 'No-Face (Kaonashi)', movie: 'Spirited Away', category: 'Animation', url: 'https://image.tmdb.org/t/p/w500/vUn89LJRkJQJ5QiAETXVrNzVFl0.jpg', pos: 'center 25%' },
  { id: 'mononoke', name: 'Princess Mononoke (San)', movie: 'Princess Mononoke', category: 'Animation', url: 'https://image.tmdb.org/t/p/w500/cMYCDADoLKLbB83g4WnJegaZimC.jpg', pos: 'center 22%' },
  { id: 'optimus_prime', name: 'Optimus Prime', movie: 'Transformers', category: 'Action', url: 'https://image.tmdb.org/t/p/w500/lkZ9gqCEjzX85lKR6Jjd1uGAXNp.jpg', pos: 'center 18%' },
  { id: 'black_panther', name: 'Black Panther (T\'Challa)', movie: 'Black Panther', category: 'Superhero', url: 'https://image.tmdb.org/t/p/w500/uxzzxijgPIY7slzFvMotPv8wjKA.jpg', pos: 'center 18%' },
  { id: 'v_vendetta', name: 'V (Guy Fawkes Mask)', movie: 'V for Vendetta', category: 'Action', url: 'https://image.tmdb.org/t/p/w500/1avD1JeaRiJX5M4ahPdZPypGoGN.jpg', pos: 'center 16%' },
  { id: 'jason', name: 'Jason Voorhees', movie: 'Friday the 13th', category: 'Horror', url: 'https://image.tmdb.org/t/p/w500/9kukTSlgFgXnQGdpcHvHcpTDiUc.jpg', pos: 'center 20%' },
  { id: 'walle', name: 'WALL-E', movie: 'WALL-E', category: 'Animation', url: 'https://image.tmdb.org/t/p/w500/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg', pos: 'center 20%' },
  { id: 'boba_fett', name: 'Boba Fett', movie: 'The Book of Boba Fett', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/w500/gNbdjDi1HamTCrfvM9JeA94bNi2.jpg', pos: 'center 18%' },
  { id: 'kylo_ren', name: 'Kylo Ren', movie: 'Star Wars: The Force Awakens', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/w500/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg', pos: 'center 18%' },
  { id: 'stormtrooper', name: 'Imperial Stormtrooper', movie: 'Star Wars: A New Hope', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/w500/iWEJuiNOlScWVxfNVyXiXf6lCiG.jpg', pos: 'center 18%' },
  { id: 'doctor_fate', name: 'Doctor Fate (Helm of Nabu)', movie: 'Black Adam', category: 'Superhero', url: 'https://image.tmdb.org/t/p/w500/rCtreCr4xiYEWDQTebybolIh6Xe.jpg', pos: 'center 18%' }
];

export const CINEMATIC_PRESET_BANNERS = [
  // Marvel Cinematic Universe — Authentic 4K & Master Film Scenes
  { name: 'Avengers: Infinity War: Thor Wakanda Arrival (4K)', movie: 'Avengers: Infinity War', tag: 'Bring Me Thanos! (4K Master)', category: 'Superhero', url: '/film_frames/curated/avengers_infinity_war_thor_wakanda_4k.jpg' },
  { name: 'Avengers: Infinity War: Thanos Pulling the Moon', movie: 'Avengers: Infinity War', tag: 'Titan Moon Shatter (Film Scene)', category: 'Superhero', url: '/film_frames/curated/avengers_infinity_war_thanos_moon_pull.jpg' },
  { name: 'Avengers: Infinity War: Nidavellir Star Forge', movie: 'Avengers: Infinity War', tag: 'Neutron Star Beam (Film Scene)', category: 'Superhero', url: '/film_frames/infinity044.jpg' },
  { name: 'Avengers: Infinity War: Stormbreaker Strike', movie: 'Avengers: Infinity War', tag: 'Should Have Gone For The Head', category: 'Superhero', url: '/film_frames/infinity057.jpg' },
  { name: 'Avengers: Endgame: Portals Scene', movie: 'Avengers: Endgame', tag: 'Mystic Portals Battlefield (Film Scene)', category: 'Superhero', url: '/film_frames/Avengers_Endgame_043.jpg' },
  { name: 'Avengers: Endgame: Final Battle Charge', movie: 'Avengers: Endgame', tag: 'Avengers... Assemble! (Film Scene)', category: 'Superhero', url: '/film_frames/Avengers_Endgame_044.jpg' },
  { name: 'The Avengers (2012): The Original 6 Assemble', movie: 'The Avengers', tag: 'Iconic 360 Spin (Film Scene)', category: 'Superhero', url: '/film_frames/curated/the_avengers_original_6_assemble.jpg' },
  { name: 'Thor: Ragnarok: Surtur Fire Dragon Escape', movie: 'Thor: Ragnarok', tag: 'Muspelheim Dragon Flight (Film Scene)', category: 'Superhero', url: '/film_frames/curated/thor_ragnarok_fire_dragon_escape.jpg' },
  { name: 'Avengers: Age of Ultron: Vision & Ultron Woods Talk', movie: 'Avengers: Age of Ultron', tag: 'A Thing Isn\'t Beautiful Because It Lasts', category: 'Superhero', url: '/film_frames/curated/avengers_age_of_ultron_vision_ultron_woods.jpg' },

  // DC, Superman & Batman — 4K Masters & Scope Screencaps
  { name: 'The Batman: Red Flare Rescue (4K Master)', movie: 'The Batman (2022)', tag: 'Subway Flood Guide (4K UHD)', category: 'Superhero', url: '/film_frames/curated/the_batman_red_flare_rescue_4k.png' },
  { name: 'The Batman: Batmobile Highway Pursuit (4K Master)', movie: 'The Batman (2022)', tag: 'Batmobile Fire Jump (4K UHD)', category: 'Superhero', url: '/film_frames/curated/the_batman_highway_chase_4k.png' },
  { name: 'The Batman: Shadows of Gotham (4K Master)', movie: 'The Batman (2022)', tag: 'I Am The Shadows (4K UHD)', category: 'Superhero', url: '/film_frames/curated/the_batman_shadows_4k.png' },
  { name: 'The Dark Knight: Skyscraper Apex Overlook', movie: 'The Dark Knight', tag: 'Batman Skyscraper Apex', category: 'Superhero', url: '/film_frames/stillslab/tdk_skyscraper_apex_1080p.webp' },
  { name: 'The Dark Knight: Gotham Anamorphic Night', movie: 'The Dark Knight', tag: 'Batman Night Vigil Action', category: 'Superhero', url: '/film_frames/stillslab/tdk_gotham_anamorphic.webp' },
  { name: 'Man of Steel: First Flight Sonic Boom', movie: 'Man of Steel', tag: 'Mach 3 Shockwave over Glaciers', category: 'Superhero', url: '/film_frames/mos/mos_25.jpg' },
  { name: 'Man of Steel: Orbit Soaring', movie: 'Man of Steel', tag: 'Sunlight Over Earth (Film Scene)', category: 'Superhero', url: '/film_frames/mos/mos_50.jpg' },
  { name: 'Man of Steel: Atmospheric Rise', movie: 'Man of Steel', tag: 'High Altitude Flight (Film Scene)', category: 'Superhero', url: '/film_frames/mos/mos_54.jpg' },

  // Spider-Man & Web-Slingers — 4K UHD & Master Shots
  { name: 'Spider-Man: Brand New Day: Skyline Web-Swing (4K)', movie: 'Spider-Man: Brand New Day', tag: 'Manhattan Skyline Web-Swing (4K UHD)', category: 'Superhero', url: '/film_frames/bnd/bnd_city_leap.jpg' },
  { name: 'Spider-Man: Brand New Day: Spire Apex Perch (4K)', movie: 'Spider-Man: Brand New Day', tag: 'Empire Spire Apex Perch (4K UHD)', category: 'Superhero', url: '/film_frames/bnd/bnd_spire_apex.jpg' },
  { name: 'Spider-Man: No Way Home: Moonlit Web-Swing', movie: 'Spider-Man: No Way Home', tag: 'Three Spider-Men Swing (Film Scene)', category: 'Superhero', url: '/film_frames/nwh/nwh_47.jpg' },
  { name: 'Spider-Man: No Way Home: Liberty Shield Perch', movie: 'Spider-Man: No Way Home', tag: 'Statue of Liberty Shield (Film Scene)', category: 'Superhero', url: '/film_frames/nwh/nwh_48.jpg' },
  { name: 'Spider-Verse: Inverted Skyscraper Dive', movie: 'Spider-Man: Across the Spider-Verse', tag: 'What\'s Up Danger (Film Scene)', category: 'Superhero', url: '/film_frames/atsv/atsv_30.jpg' },

  // Sci-Fi & Cosmic Odyssey — 4K & 2K Masters
  { name: 'Blade Runner 2049: Las Vegas Amber Ruins (4K)', movie: 'Blade Runner 2049', tag: 'Vegas Statues in Orange Fog (4K UHD)', category: 'Sci-Fi', url: '/film_frames/curated/blade_runner_2049_orange_vegas_4k.png' },
  { name: 'Blade Runner 2049: You Look Like a Good Joe (4K)', movie: 'Blade Runner 2049', tag: 'Purple Joi Hologram Bridge (4K UHD)', category: 'Sci-Fi', url: '/film_frames/curated/blade_runner_2049_joi_purple_4k.png' },
  { name: 'Blade Runner 2049: Tears in the Snow (4K)', movie: 'Blade Runner 2049', tag: 'Snow Stairs Dying Glow (4K UHD)', category: 'Sci-Fi', url: '/film_frames/curated/blade_runner_2049_snow_stairs_4k.png' },
  { name: 'Blade Runner 2049: Memory Facility Ascent (4K)', movie: 'Blade Runner 2049', tag: 'Facility Steps Architecture (4K UHD)', category: 'Sci-Fi', url: '/film_frames/curated/blade_runner_2049_memory_facility_4k.png' },
  { name: 'Project Hail Mary: Emerald Astrophage Cloud (4K)', movie: 'Project Hail Mary', tag: 'Deep Space Emerald Cloud (4K UHD)', category: 'Sci-Fi', url: '/film_frames/curated/project_hail_mary_emerald_astrophage_4k.jpg' },
  { name: 'Project Hail Mary: Astrophage Solar Flare (4K)', movie: 'Project Hail Mary', tag: 'Cosmic Red Nebula Horizon (4K UHD)', category: 'Sci-Fi', url: '/film_frames/curated/project_hail_mary_red_solar_flare_4k.jpg' },
  { name: 'Interstellar: Gargantua Light Bending (2K QHD)', movie: 'Interstellar', tag: 'Gargantua Accretion Disk (2K Master)', category: 'Sci-Fi', url: '/film_frames/curated/interstellar_gargantua_black_hole_2k.jpg' },
  { name: 'Dune: Part Two: Arrakis Sunset Vista (2K QHD)', movie: 'Dune: Part Two', tag: 'Arrakis Desert Twin Suns (2K Master)', category: 'Sci-Fi', url: '/film_frames/curated/dune_arrakis_desert_2k.jpg' },
  { name: 'The Matrix: Cascading Digital Green Code', movie: 'The Matrix', tag: 'Cascading Green Digital Code', category: 'Sci-Fi', url: '/film_frames/stillslab/the_matrix_green_1080p.webp' },
  { name: 'Star Wars: Binary Sunset on Tatooine', movie: 'Star Wars: A New Hope', tag: 'Twin Suns of Tatooine (Film Scene)', category: 'Sci-Fi', url: '/film_frames/starwars/binary_sunset.jpg' },
  { name: '2001: A Space Odyssey: Worlds Alignment', movie: '2001: A Space Odyssey', tag: 'Kubrick Cosmic Stargate', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/original/9yTOU2SvTfAEHDPEG5qraLoe4MI.jpg' },
  { name: 'TRON: Legacy: The Grid Neon Horizon', movie: 'TRON: Legacy', tag: 'Daft Punk Cyber Grid', category: 'Sci-Fi', url: 'https://image.tmdb.org/t/p/original/uUa6jgSr5BQpcBhhaz1PV1JhSa4.jpg' },

  // Epic Action & Crime Classics
  { name: 'Heat (1995): Downtown LA Heist (4K)', movie: 'Heat (1995)', tag: 'Michael Mann Downtown Heist (4K UHD)', category: 'Crime & Noir', url: '/film_frames/curated/heat_1995_la_heist_4k.jpg' },
  { name: 'LOTR: Return of the King: Epic Battle Vista', movie: 'The Lord of the Rings: The Return of the King', tag: '1080p StillsLab Master', category: 'Action', url: '/film_frames/stillslab/lotr_rotk_1080p.webp' },
  { name: 'LOTR: Fellowship of the Ring: Argonath', movie: 'The Lord of the Rings: The Fellowship of the Ring', tag: 'Pillars of the Kings', category: 'Action', url: '/film_frames/stillslab/lotr_fotr_1080p.webp' },
  { name: 'LOTR: Return of the King: Pelennor Fields', movie: 'The Lord of the Rings: The Return of the King', tag: 'White City Citadel', category: 'Action', url: 'https://image.tmdb.org/t/p/original/ctiw6FZK4N36LmkjSklWEbuvlq9.jpg' },
  { name: 'Mad Max: Fury Road: Citadel Chase', movie: 'Mad Max: Fury Road', tag: 'Wasteland Desolation', category: 'Action', url: 'https://image.tmdb.org/t/p/original/l0eIS009XtEO80aC6zjM3o3AkEl.jpg' },
  { name: 'Gladiator: Colosseum Glory', movie: 'Gladiator', tag: 'Roman Empire Epic', category: 'Action', url: 'https://image.tmdb.org/t/p/original/Ar7QuJ7sJEiC0oP3I8fKBKIQD9u.jpg' },

  // Auteur, Drama & Thriller (Drive 2011, Oppenheimer, Taxi Driver)
  { name: 'Drive: LA Magic Hour Night Driver', movie: 'Drive (2011)', tag: 'Refn Magic Hour', category: 'Crime & Noir', url: '/film_frames/stillslab/drive_2011_1080p.webp' },
  { name: 'Oppenheimer: 70mm Trinity Wave', movie: 'Oppenheimer', tag: '70mm IMAX Trinity Fire', category: 'Drama', url: '/film_frames/stillslab/oppenheimer_70mm_1080p.webp' },
  { name: 'Taxi Driver: 42nd Street Rain', movie: 'Taxi Driver', tag: 'Scorsese Neon Rain', category: 'Crime & Noir', url: '/film_frames/stillslab/taxi_driver_neon_1080p.webp' },
  { name: 'Drive: LA Riverbed Sunset', movie: 'Drive (2011)', tag: 'Refn Neo-Noir Magic Hour', category: 'Crime & Noir', url: 'https://image.tmdb.org/t/p/original/hoyAALgfmjMEK7O1wZ4r8wT91RP.jpg' },
  { name: 'La La Land: Griffith Park Twilight', movie: 'La La Land', tag: 'Magic Hour Twilight', category: 'Drama', url: 'https://image.tmdb.org/t/p/original/nlPCdZlHtRNcF6C9hzUH4ebmV1w.jpg' },
  { name: 'Pulp Fiction: Jack Rabbit Slims', movie: 'Pulp Fiction', tag: 'Tarantino Cult', category: 'Crime & Noir', url: 'https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg' },

  // Animation & Fantasy
  { name: 'Spirited Away: Sea Railway at Twilight', movie: 'Spirited Away', tag: 'Endless Sea Train', category: 'Animation', url: 'https://image.tmdb.org/t/p/original/6oaL4DP75yABrd5EbC4H2zq5ghc.jpg' },
  { name: 'Princess Mononoke: Ancient Spirit Forest', movie: 'Princess Mononoke', tag: 'Ghibli Mythic Wilderness', category: 'Animation', url: 'https://image.tmdb.org/t/p/original/gl0jzn4BupSbL2qMVeqrjKkF9Js.jpg' },
  { name: 'Akira: Neo-Tokyo Highway', movie: 'Akira', tag: 'Anime Legend 4K', category: 'Animation', url: 'https://image.tmdb.org/t/p/original/fK40VGYIm7hmKrLJ26fgPQU0qRG.jpg' }
];

export default function ProfileCustomizerModal({
  show,
  onClose:onDismiss,
  currentUser,
  onSave,
  watchedCount = 0,
  avgRating = null,
  unlockedBorders = new Set(),
  sortedBadges = [],
  favorites = [],
  setFavorites,
  onSelectSlot,
  focusActive = true,
  initialTab = 'banner'
}) {
  const favoritesRef=useRef(favorites);favoritesRef.current=favorites;
  const [discardOpen,setDiscardOpen]=useState(false);
  const baseline=useRef('');

  const dialogRef=useDialogFocus(show&&focusActive&&!discardOpen);
  const [publishing,setPublishing]=useState(false);
  const [publishError,setPublishError]=useState('');
  const [customizerTab, setCustomizerTab] = useState(initialTab);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [equippedBorder, setEquippedBorder] = useState('none');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerFitMode, setBannerFitMode] = useState('cover');
  const [bannerPosPercent, setBannerPosPercent] = useState(20);
  const [featuredBadges, setFeaturedBadges] = useState([]);

  // Banner studio states
  const [bannerMode, setBannerMode] = useState('presets'); // 'presets' | 'tmdb' | 'upload'
  const [presetSearchQuery, setPresetSearchQuery] = useState('');
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [searchError,setSearchError]=useState('');
  const [customUrlInput, setCustomUrlInput] = useState('');

  const onClose=useCallback(()=>{if(publishing)return;const next=profileDraftFingerprint({displayName,username,bio,avatar,equippedBorder,bannerUrl,bannerFitMode,bannerPosPercent,featuredBadges,favorites});if(next!==baseline.current)setDiscardOpen(true);else onDismiss?.();},[publishing,displayName,username,bio,avatar,equippedBorder,bannerUrl,bannerFitMode,bannerPosPercent,featuredBadges,favorites,onDismiss]);

  // Sync draft states ONLY when modal is newly opened
  useEffect(() => {
    if (show) {
      setDiscardOpen(false);
      setEquippedBorder(currentUser?.equippedBorder || 'none');
      setDisplayName(currentUser?.displayName || '');
      setUsername(currentUser?.username || '');
      setBio(currentUser?.bio || '');
      setAvatar(currentUser?.avatar || '');
      const rawBanner = currentUser?.bannerUrl ?? localStorage.getItem(`cinelog_banner_url_${currentUser?.id || 'sandbox'}`) ?? '';
      setBannerUrl(rawBanner.startsWith('animated-') ? '' : rawBanner);
      setBannerFitMode(currentUser?.bannerFitMode || localStorage.getItem(`cinelog_banner_fit_${currentUser?.id || 'sandbox'}`) || 'cover');
      const resolvedPos = currentUser?.bannerPosPercent !== undefined
        ? currentUser.bannerPosPercent
        : (localStorage.getItem(`cinelog_banner_pos_${currentUser?.id || 'sandbox'}`) !== null ? Number(localStorage.getItem(`cinelog_banner_pos_${currentUser?.id || 'sandbox'}`)) : 20);
      setBannerPosPercent(resolvedPos);
      let resolvedBadges = [];
      if (currentUser?.featuredBadges && Array.isArray(currentUser.featuredBadges)) {
        resolvedBadges = currentUser.featuredBadges;
      } else {
        try {
          const stored = localStorage.getItem(`cinelog_featured_badges_${currentUser?.id || 'sandbox'}`);
          if (stored) resolvedBadges = JSON.parse(stored);
        } catch {}
      }
      setFeaturedBadges(resolvedBadges);
      baseline.current=profileDraftFingerprint({displayName:currentUser?.displayName,username:currentUser?.username,bio:currentUser?.bio,avatar:currentUser?.avatar,equippedBorder:currentUser?.equippedBorder,bannerUrl:rawBanner.startsWith('animated-')?'':rawBanner,bannerFitMode:currentUser?.bannerFitMode||localStorage.getItem('cinelog_banner_fit_'+(currentUser?.id||'sandbox'))||'cover',bannerPosPercent:resolvedPos,featuredBadges:resolvedBadges,favorites:favoritesRef.current});
      setCustomizerTab(initialTab);
    }
  }, [show, initialTab, currentUser]);

  // Lock background window scroll when modal is open
  useBodyScrollLock(show);

  // Close modal when pressing Escape or Android back gesture
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && focusActive && !publishing && !discardOpen) onClose?.();
    };
    const handleBackEvent = (e) => {
      if(!focusActive||discardOpen)return;
      e.preventDefault();
      if(!publishing)onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('cinelog-back-handled', handleBackEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('cinelog-back-handled', handleBackEvent);
    };
  }, [show, onClose, focusActive,publishing,discardOpen]);

  // TMDB backdrop search
  const handleTmdbSearch = async (e) => {
    e?.preventDefault();
    if (!tmdbSearchQuery.trim()) return;
    setTmdbSearching(true);setSearchError('');
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(tmdbSearchQuery)}&page=1`);
      if(!res.ok)throw new Error('Backdrop search is unavailable. Please try again.');
      const data = await res.json();
      const resultsWithBackdrops = (data.results || []).filter(item => item.backdrop_path);
      setTmdbSearchResults(resultsWithBackdrops);
    } catch (err) {
      setSearchError(err.message||'Could not search film backdrops.');
    } finally {
      setTmdbSearching(false);
    }
  };

  // Avatar file upload
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setPublishError('Choose an avatar under 2 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setAvatar(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Banner file upload
  const handleBannerFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPublishError('Choose a cover under 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBannerUrl(uploadEvent.target.result);
      setBannerFitMode('cover');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if(publishing)return;
    setPublishing(true);setPublishError('');
    try{
      const result=await onSave?.({displayName,username,bio,avatar,equippedBorder,bannerUrl,bannerFitMode,bannerPosPercent,featuredBadges});
      if(result===false)throw new Error('Your banner could not be published. Please try again.');
      localStorage.setItem(`cinelog_banner_pos_${currentUser?.id || 'sandbox'}`,bannerPosPercent);
      localStorage.setItem(`cinelog_banner_fit_${currentUser?.id || 'sandbox'}`,bannerFitMode);
      localStorage.setItem(`cinelog_banner_url_${currentUser?.id || 'sandbox'}`,bannerUrl);
      localStorage.setItem(`cinelog_featured_badges_${currentUser?.id || 'sandbox'}`,JSON.stringify(featuredBadges));
      onDismiss();
    }catch(error){setPublishError(error.message||'Could not publish your profile. Please try again.');}
    finally{setPublishing(false);}
  };

  // Badges pin toggle (up to 5)
  const toggleBadgePin = (badgeName) => {
    setFeaturedBadges(prev => {
      if (prev.includes(badgeName)) {
        return prev.filter(b => b !== badgeName);
      }
      if (prev.length >= 5) {
        setPublishError('You can pin up to five badges. Unpin one to make room.');
        return prev;
      }
      return [...prev, badgeName];
    });
  };

  if (!show) return null;
  return createPortal(<><AppearanceStudio dialogRef={dialogRef} currentUser={currentUser} watchedCount={watchedCount} avgRating={avgRating} unlockedBorders={unlockedBorders} sortedBadges={sortedBadges} favorites={favorites} setFavorites={setFavorites} onSelectSlot={onSelectSlot} cinemaAvatars={CURATED_MOVIE_AVATARS} cinemaCovers={CINEMATIC_PRESET_BANNERS}
    state={{publishing,publishError,customizerTab,displayName,username,bio,avatar,equippedBorder,bannerUrl,bannerFitMode,bannerPosPercent,featuredBadges,bannerMode,presetSearchQuery,tmdbSearchQuery,tmdbSearchResults,tmdbSearching,customUrlInput,searchError}}
    actions={{onClose,setCustomizerTab,setDisplayName,setUsername,setBio,setAvatar,setEquippedBorder,setBannerUrl,setBannerFitMode,setBannerPosPercent,setFeaturedBadges,setBannerMode,setPresetSearchQuery,setTmdbSearchQuery,setCustomUrlInput,handleTmdbSearch,handleAvatarFileUpload,handleBannerFileUpload,handleSave,toggleBadgePin}}/><ConfirmModal isOpen={discardOpen} title="Discard profile changes?" message="Your saved profile stays as it is. Unsaved cover, avatar, badge and favorite-film changes will be lost." confirmText="Discard changes" cancelText="Keep editing" onCancel={()=>setDiscardOpen(false)} onConfirm={()=>{onDismiss?.();return true;}}/></>,document.body);
}
