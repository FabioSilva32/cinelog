import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, SlidersHorizontal, Image as ImageIcon, User, Award, Heart,
  Upload, Search, Check, CheckCircle2, Trash2, Sparkles, Plus,
  Crown, ExternalLink, RefreshCw
} from 'lucide-react';
import AvatarWithBorder, { DEFAULT_GREY_AVATAR } from './AvatarWithBorder';
import { BORDER_STYLES, BADGE_COLORS } from '../utils/achievements';
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
  onClose,
  currentUser,
  onSave,
  library = [],
  watchedCount = 0,
  avgRating = null,
  cinePoints = 0,
  isCreator = false,
  unlockedBorders = new Set(),
  unlockedBadges = [],
  sortedBadges = [],
  favorites = [],
  setFavorites,
  onSelectSlot,
  initialTab = 'banner'
}) {
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
  const [presetGenreFilter, setPresetGenreFilter] = useState('All');
  const [tmdbSearchQuery, setTmdbSearchQuery] = useState('');
  const [tmdbSearchResults, setTmdbSearchResults] = useState([]);
  const [tmdbSearching, setTmdbSearching] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Immediate framing handlers that write to localStorage
  const handleBannerPosChange = (val) => {
    setBannerPosPercent(val);
    localStorage.setItem('cinelog_banner_pos', val);
    if (currentUser?.id) localStorage.setItem(`cinelog_banner_pos_${currentUser.id}`, val);
  };

  const handleBannerFitChange = (mode) => {
    setBannerFitMode(mode);
    localStorage.setItem('cinelog_banner_fit', mode);
    if (currentUser?.id) localStorage.setItem(`cinelog_banner_fit_${currentUser.id}`, mode);
  };

  // Sync draft states ONLY when modal is newly opened
  useEffect(() => {
    if (show) {
      setDisplayName(currentUser?.displayName || '');
      setUsername(currentUser?.username || '');
      setBio(currentUser?.bio || '');
      setAvatar(currentUser?.avatar || '');
      const rawBanner = currentUser?.bannerUrl || localStorage.getItem('cinelog_banner_url') || '';
      setBannerUrl(rawBanner.startsWith('animated-') ? '' : rawBanner);
      setBannerFitMode(currentUser?.bannerFitMode || localStorage.getItem('cinelog_banner_fit') || 'cover');
      const resolvedPos = currentUser?.bannerPosPercent !== undefined
        ? currentUser.bannerPosPercent
        : (localStorage.getItem('cinelog_banner_pos') !== null ? Number(localStorage.getItem('cinelog_banner_pos')) : 20);
      setBannerPosPercent(resolvedPos);
      setFeaturedBadges(
        currentUser?.featuredBadges && Array.isArray(currentUser.featuredBadges)
          ? currentUser.featuredBadges
          : []
      );
      setCustomizerTab(initialTab);
    }
  }, [show, initialTab]);

  // Lock background window scroll when modal is open
  useBodyScrollLock(show);

  // Close modal when pressing Escape
  useEffect(() => {
    if (!show) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, onClose]);

  // TMDB backdrop search
  const handleTmdbSearch = async (e) => {
    e?.preventDefault();
    if (!tmdbSearchQuery.trim()) return;
    setTmdbSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(tmdbSearchQuery)}&page=1`);
      const data = await res.json();
      const resultsWithBackdrops = (data.results || []).filter(item => item.backdrop_path);
      setTmdbSearchResults(resultsWithBackdrops);
    } catch (err) {
      console.error('TMDB Search error:', err);
    } finally {
      setTmdbSearching(false);
    }
  };

  // Avatar file upload
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large! Please choose an avatar under 2MB.");
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
      alert("Image is too large! Please choose a banner under 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setBannerUrl(uploadEvent.target.result);
      setBannerFitMode('cover');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem('cinelog_banner_pos', bannerPosPercent);
    localStorage.setItem('cinelog_banner_fit', bannerFitMode);
    localStorage.setItem('cinelog_banner_url', bannerUrl);
    if (currentUser?.id) {
      localStorage.setItem(`cinelog_banner_pos_${currentUser.id}`, bannerPosPercent);
      localStorage.setItem(`cinelog_banner_fit_${currentUser.id}`, bannerFitMode);
      localStorage.setItem(`cinelog_banner_url_${currentUser.id}`, bannerUrl);
    }
    if (onSave) {
      onSave({
        displayName,
        username,
        bio,
        avatar,
        equippedBorder,
        bannerUrl,
        bannerFitMode,
        bannerPosPercent,
        featuredBadges
      });
    }
    onClose();
  };

  // Badges pin toggle (up to 5)
  const toggleBadgePin = (badgeName) => {
    setFeaturedBadges(prev => {
      if (prev.includes(badgeName)) {
        return prev.filter(b => b !== badgeName);
      }
      if (prev.length >= 5) {
        alert("You can pin a maximum of 5 badges to your profile header!");
        return prev;
      }
      return [...prev, badgeName];
    });
  };

  if (!show) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, width: '100vw', height: '100vh',
        background: 'rgba(3,2,8,0.92)', backdropFilter: 'blur(24px)',
        zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        overscrollBehavior: 'contain'
      }}
      onClick={onClose}
      onWheel={e => e.stopPropagation()}
    >
      <div
        className="glass animate-fade-in-scale"
        style={{
          width: '96vw', maxWidth: '1440px', height: '90vh', maxHeight: '92vh',
          borderRadius: '26px', border: '1px solid rgba(255,255,255,0.14)',
          background: '#0d0b16', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 90px rgba(0,0,0,0.95)', overflow: 'hidden',
          overscrollBehavior: 'contain'
        }}
        onClick={e => e.stopPropagation()}
        onWheel={e => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)', flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'rgba(136,8,8,0.2)', border: '1px solid rgba(136,8,8,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <SlidersHorizontal size={19} color="var(--accent)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.3px' }}>
                  Profile Studio
                </h2>
                <span style={{ fontSize: '10.5px', background: 'rgba(136,8,8,0.2)', color: 'var(--accent)', border: '1px solid rgba(136,8,8,0.4)', padding: '2px 8px', borderRadius: '12px', fontWeight: 900, textTransform: 'uppercase' }}>
                  Interactive Suite
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Customize your cinematic banner, iconic mask avatar, border, badges, bio, and favorite film showcase.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-COLUMN STUDIO WORKSPACE */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>

          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: EXPANDED LIVE CARD PREVIEW & CONTROLS
              ───────────────────────────────────────────────────────────── */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
            overscrollBehavior: 'contain'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
                Live Card Preview
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', fontWeight: 700 }}>Real-Time Focus</span>
            </div>

            {/* THE LIVE PROFILE CARD */}
            <div style={{
              borderRadius: '20px',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #161324 0%, #0d0b15 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.7)',
              position: 'relative'
            }}>
              {/* Card Banner (135px tall — matches 520px profile banner aspect ratio 1:1) */}
              <div style={{
                height: '135px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: '#090810'
              }}>
                {bannerUrl && !bannerUrl.startsWith('animated-') ? (
                  <img
                    src={bannerUrl.replace('/w1280/', '/original/').replace('/w500/', '/original/')}
                    alt="Banner Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: bannerFitMode,
                      objectPosition: `center ${bannerPosPercent}%`,
                      display: 'block',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      imageRendering: 'auto',
                      backfaceVisibility: 'hidden'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(ellipse at 50% 25%, rgba(136,8,8,0.4) 0%, rgba(15,12,24,0.92) 70%, #06050a 100%)'
                  }} />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(13,11,21,0.95) 100%)', pointerEvents: 'none' }} />

                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
                  {bannerFitMode}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '0 16px 16px', position: 'relative' }}>
                {/* Avatar */}
                <div style={{
                  marginTop: '-44px',
                  position: 'relative',
                  display: 'inline-block',
                  zIndex: 10,
                  filter: isCreator ? 'drop-shadow(0 0 16px rgba(251,191,36,0.35))' : 'drop-shadow(0 8px 18px rgba(0,0,0,0.8))'
                }}>
                  <AvatarWithBorder
                    src={avatar || DEFAULT_GREY_AVATAR}
                    username={displayName || username || 'Profile'}
                    borderId={equippedBorder}
                    size={84}
                  />
                </div>

                {/* Identity */}
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '16.5px', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                      {displayName.trim() || username || 'CineLog Fan'}
                    </div>
                    {isCreator && (
                      <span style={{ fontSize: '9.5px', background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(168,85,247,0.2) 100%)', border: '1px solid rgba(251,191,36,0.5)', color: '#fbbf24', padding: '1px 6px', borderRadius: '10px', fontWeight: 900, textTransform: 'uppercase' }}>
                        👑 Creator
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 700, marginTop: '2px' }}>
                    @{username || 'cinelog_user'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.45, marginTop: '5px', fontStyle: 'italic', display: '-webkit-box', WebKitLineClamp: 2, WebKitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{bio || 'No cinema story written yet.'}"
                  </div>
                </div>

                {/* Live Pinned Badges Preview */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {(featuredBadges.length > 0 ? featuredBadges : sortedBadges.slice(0, 3)).map(b => {
                    const colors = BADGE_COLORS[b] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                    return (
                      <span key={b} style={{ fontSize: '9px', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap', ...colors }}>
                        {b}
                      </span>
                    );
                  })}
                </div>

                {/* Quick Stats Pill */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '10px', background: 'rgba(255,255,255,0.03)', padding: '7px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '8.5px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>Watched</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--green)' }}>{watchedCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '8.5px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>Avg Rate</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--gold)' }}>{avgRating || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '8.5px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>Points</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--accent)' }}>🪙 {cinePoints}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* BANNER FRAMING & FOCUS TOOLBAR */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Banner Framing & Focus
              </span>

              {/* Mode switch */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleBannerFitChange('cover')}
                  style={{
                    padding: '8px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: 800,
                    background: bannerFitMode === 'cover' ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                    color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                  }}
                >
                  Full-Bleed Cover
                </button>
                <button
                  type="button"
                  onClick={() => handleBannerFitChange('contain')}
                  style={{
                    padding: '8px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: 800,
                    background: bannerFitMode === 'contain' ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                    color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                  }}
                >
                  Letterbox Contain
                </button>
              </div>

              {/* Vertical slider with visible glowing track bar */}
              {bannerFitMode === 'cover' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>▲ Top</span>
                    <span style={{ color: '#fff', fontWeight: 800 }}>Position: {bannerPosPercent}%</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>▼ Bottom</span>
                  </div>

                  {/* Explicit visible glowing track bar behind native input */}
                  <div style={{ position: 'relative', width: '100%', height: '26px', display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.16)',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
                      pointerEvents: 'none',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${bannerPosPercent}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, #880808, #c0392b)',
                        boxShadow: '0 0 10px rgba(192, 57, 43, 0.8)'
                      }} />
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={bannerPosPercent}
                      onChange={e => handleBannerPosChange(Number(e.target.value))}
                      className="profile-banner-range-input"
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '26px',
                        margin: 0,
                        cursor: 'ew-resize',
                        background: 'transparent',
                        WebkitAppearance: 'none',
                        appearance: 'none',
                        zIndex: 2
                      }}
                    />
                  </div>

                  {/* Quick focus shortcuts */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[
                      { label: 'Top (15%)', val: 15 },
                      { label: 'Center (50%)', val: 50 },
                      { label: 'Bottom (85%)', val: 85 }
                    ].map(f => (
                      <button
                        key={f.label}
                        type="button"
                        onClick={() => handleBannerPosChange(f.val)}
                        style={{
                          flex: 1, padding: '5px 4px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700,
                          background: bannerPosPercent === f.val ? 'rgba(192,57,43,0.3)' : 'rgba(255,255,255,0.04)',
                          color: bannerPosPercent === f.val ? '#fff' : 'var(--text-dim)',
                          border: bannerPosPercent === f.val ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {bannerUrl && (
                <button
                  type="button"
                  onClick={() => setBannerUrl('')}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-dim)',
                    fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '4px', padding: '4px 0', marginTop: '2px'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <Trash2 size={12} /> Reset to Default Banner
                </button>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: TAB NAVIGATION & WORKSPACE
              ───────────────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

            {/* TAB SELECTOR HEADER */}
            <div style={{
              display: 'flex', gap: '8px', padding: '14px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.015)', overflowX: 'auto', flexShrink: 0
            }}>
              {[
                { id: 'banner', label: 'Banners Studio', icon: ImageIcon },
                { id: 'avatar', label: 'Cinema Masks & Borders', icon: User },
                { id: 'badges', label: 'Featured Badges', icon: Award },
                { id: 'info', label: 'Identity & Story', icon: SlidersHorizontal },
                { id: 'showcase', label: 'Favorite Films (6)', icon: Heart },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCustomizerTab(tab.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '25px', fontSize: '12.5px',
                    fontWeight: customizerTab === tab.id ? 900 : 700,
                    background: customizerTab === tab.id ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                    color: '#fff', border: customizerTab === tab.id ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    transition: 'all 0.15s ease', flexShrink: 0
                  }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT PANELS (Scrollable) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', overscrollBehavior: 'contain' }}>

              {/* ════ TAB 1: BANNERS STUDIO ════ */}
              {customizerTab === 'banner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Clean 3-Mode Segmented Selector */}
                  <div style={{
                    display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.03)',
                    padding: '4px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)'
                  }}>
                    {[
                      { id: 'presets', label: 'Iconic Cinema Stills', icon: Sparkles },
                      { id: 'tmdb', label: 'Search TMDB Backdrops', icon: Search },
                      { id: 'upload', label: 'Upload & Direct Link', icon: Upload }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setBannerMode(sub.id)}
                        style={{
                          flex: 1, padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px',
                          fontWeight: bannerMode === sub.id ? 800 : 600,
                          background: bannerMode === sub.id ? 'rgba(136,8,8,0.25)' : 'transparent',
                          color: bannerMode === sub.id ? '#fff' : 'var(--text-muted)',
                          border: bannerMode === sub.id ? '1px solid rgba(136,8,8,0.45)' : '1px solid transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <sub.icon size={14} color={bannerMode === sub.id ? 'var(--accent)' : 'currentColor'} />
                        {sub.label}
                      </button>
                    ))}
                  </div>

                  {/* Mode 1: Iconic Cinema Stills */}
                  {bannerMode === 'presets' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Search bar for preset backdrops */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                          <input
                            type="text"
                            placeholder="Search backdrops (e.g. Marvel, Thor, Superman, Hail Mary, Spider-Man, Batman, Dune)..."
                            value={presetSearchQuery}
                            onChange={e => setPresetSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '34px', fontSize: '12px', height: '36px' }}
                          />
                          {presetSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPresetSearchQuery('')}
                              style={{
                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex'
                              }}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick genre filter chips */}
                      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                        {['All', 'Superhero', 'Sci-Fi', 'Action', 'Drama', 'Crime & Noir', 'Animation'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setPresetGenreFilter(cat)}
                            style={{
                              padding: '4px 10px', borderRadius: '14px', fontSize: '11px', fontWeight: 700,
                              background: presetGenreFilter === cat ? 'rgba(192,57,43,0.3)' : 'rgba(255,255,255,0.04)',
                              color: presetGenreFilter === cat ? '#fff' : 'var(--text-dim)',
                              border: presetGenreFilter === cat ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease'
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Compact 3-to-4 Column Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                        {CINEMATIC_PRESET_BANNERS.filter(preset => {
                          const matchesSearch = !presetSearchQuery.trim() ||
                            preset.name.toLowerCase().includes(presetSearchQuery.toLowerCase()) ||
                            (preset.movie && preset.movie.toLowerCase().includes(presetSearchQuery.toLowerCase())) ||
                            (preset.tag && preset.tag.toLowerCase().includes(presetSearchQuery.toLowerCase())) ||
                            (preset.category && preset.category.toLowerCase().includes(presetSearchQuery.toLowerCase()));
                          const matchesGenre = presetGenreFilter === 'All' || preset.category === presetGenreFilter;
                          return matchesSearch && matchesGenre;
                        }).map(preset => {
                          const isSelected = bannerUrl === preset.url;
                          return (
                            <div
                              key={preset.name}
                              onClick={() => { setBannerUrl(preset.url); handleBannerFitChange('cover'); }}
                              style={{
                                borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                                border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: isSelected ? '0 0 16px rgba(192,57,43,0.6)' : 'none',
                                position: 'relative', background: '#120f20', transition: 'all 0.15s ease',
                                aspectRatio: '16/9'
                              }}
                              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                            >
                              <img
                                src={preset.url.replace('/original/', '/w780/').replace('/w1280/', '/w780/')}
                                alt={preset.name}
                                loading="lazy"
                                decoding="async"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)',
                                padding: '16px 8px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                              }}>
                                <div style={{ overflow: 'hidden', paddingRight: '4px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {preset.name.split(':')[0]}
                                  </div>
                                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {preset.tag}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div style={{ background: 'var(--accent)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Check size={11} color="#fff" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Search TMDB Backdrops & Library */}
                  {bannerMode === 'tmdb' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <form onSubmit={handleTmdbSearch} style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                          <input
                            type="text"
                            placeholder="Search any film (e.g. Oppenheimer, Dune, The Batman, Interstellar)..."
                            value={tmdbSearchQuery}
                            onChange={e => setTmdbSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '36px', fontSize: '13px' }}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', fontWeight: 800, fontSize: '12.5px' }}>
                          {tmdbSearching ? 'Searching...' : 'Search Backdrops'}
                        </button>
                      </form>

                      {tmdbSearchResults.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                          {tmdbSearchResults.map(m => {
                            const fullUrl = `https://image.tmdb.org/t/p/original${m.backdrop_path}`;
                            const isSelected = bannerUrl === fullUrl;
                            return (
                              <div
                                key={m.id}
                                onClick={() => { setBannerUrl(fullUrl); handleBannerFitChange('cover'); }}
                                style={{
                                  borderRadius: '10px', overflow: 'hidden', cursor: 'pointer',
                                  border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                                  boxShadow: isSelected ? '0 0 16px rgba(192,57,43,0.6)' : 'none',
                                  aspectRatio: '16/9', position: 'relative', transition: 'all 0.15s ease'
                                }}
                              >
                                <img
                                  src={`https://image.tmdb.org/t/p/w780${m.backdrop_path}`}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  loading="lazy"
                                />
                                <div style={{
                                  position: 'absolute', bottom: 0, left: 0, right: 0,
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
                                  padding: '16px 8px 6px', fontSize: '11px', fontWeight: 800, color: '#fff',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                }}>
                                  {m.title || m.name}
                                </div>
                                {isSelected && (
                                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'var(--accent)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={11} color="#fff" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-dim)', fontSize: '12.5px', background: 'rgba(255,255,255,0.015)', borderRadius: '14px', border: '1px dashed var(--border)' }}>
                          Search any title to fetch official widescreen cinema backdrops directly into your profile.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Upload & Direct URL */}
                  {bannerMode === 'upload' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '36px 20px', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center'
                      }}>
                        <Upload size={28} color="var(--accent)" />
                        <span style={{ fontSize: '14px', fontWeight: 800, marginTop: '8px' }}>Click to Upload Banner Image</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Supports PNG, JPG, WEBP, and Animated GIFs up to 5MB</span>
                        <input type="file" accept="image/*" onChange={handleBannerFileUpload} style={{ display: 'none' }} />
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>OR PASTE DIRECT IMAGE / GIF URL</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/... or https://i.imgur.com/...gif"
                            value={customUrlInput}
                            onChange={e => setCustomUrlInput(e.target.value)}
                            className="form-input"
                            style={{ flex: 1, fontSize: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customUrlInput.trim()) {
                                setBannerUrl(customUrlInput.trim());
                                setBannerFitMode('cover');
                              }
                            }}
                            className="btn btn-secondary"
                            style={{ padding: '0 18px', fontSize: '12px', fontWeight: 800 }}
                          >
                            Apply URL
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ════ TAB 2: AVATARS & BORDERS ════ */}
              {customizerTab === 'avatar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                  {/* Character Avatars Section */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <label style={{ fontSize: '12px', color: '#fff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Cinema Masks, Helmets & Artifacts ({CURATED_MOVIE_AVATARS.length})
                        </label>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Click any stylized cinema emblem or mask to equip it instantly to your profile.
                        </div>
                      </div>

                      <label
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                          background: 'rgba(136,8,8,0.18)', border: '1px solid rgba(136,8,8,0.4)',
                          borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#fff'
                        }}
                      >
                        <Upload size={13} color="var(--accent)" /> Upload Custom Photo
                        <input type="file" accept="image/*" onChange={handleAvatarFileUpload} style={{ display: 'none' }} />
                      </label>
                    </div>

                    {/* BIGGER, MORE NOTICEABLE CHARACTER CARDS GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                      {CURATED_MOVIE_AVATARS.map((char) => {
                        const isSelected = avatar === char.url;
                        return (
                          <div
                            key={char.id}
                            onClick={() => setAvatar(char.url)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 14px',
                              borderRadius: '16px', cursor: 'pointer',
                              border: isSelected ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                              background: isSelected ? 'rgba(136,8,8,0.22)' : 'rgba(255,255,255,0.03)',
                              boxShadow: isSelected ? '0 0 20px rgba(136,8,8,0.45)' : '0 4px 14px rgba(0,0,0,0.35)',
                              transition: 'transform 0.18s ease, border-color 0.18s ease'
                            }}
                            onMouseEnter={e => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }
                            }}
                            onMouseLeave={e => {
                              if (!isSelected) {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                e.currentTarget.style.transform = '';
                              }
                            }}
                          >
                            {/* LARGE 66px PORTRAIT CIRCLE */}
                            <div style={{
                              width: '66px', height: '66px', borderRadius: '50%', flexShrink: 0,
                              overflow: 'hidden', position: 'relative',
                              border: isSelected ? '2.5px solid var(--accent)' : '2px solid rgba(255,255,255,0.15)',
                              boxShadow: isSelected ? '0 0 16px rgba(136,8,8,0.6)' : 'none'
                            }}>
                              <img
                                src={char.url}
                                alt={char.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: char.pos || 'center 18%' }}
                                loading="lazy"
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {char.name}
                              </div>
                              <span style={{
                                display: 'inline-block', fontSize: '10px', color: isSelected ? 'var(--accent)' : 'var(--text-dim)',
                                background: isSelected ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.05)',
                                padding: '2px 8px', borderRadius: '8px', fontWeight: 800, marginTop: '4px',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
                              }}>
                                {char.movie}
                              </span>
                            </div>

                            {isSelected && (
                              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Check size={13} color="#fff" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Avatar Profile Borders Section */}
                  <div style={{ paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <label style={{ fontSize: '12px', color: '#fff', fontWeight: 900, textTransform: 'uppercase', marginBottom: '10px', display: 'block' }}>
                      Avatar Profile Borders
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                      {Object.entries(BORDER_STYLES).map(([id, config]) => {
                        const isUnlocked = unlockedBorders.has(id);
                        const isEquipped = equippedBorder === id;
                        return (
                          <div
                            key={id}
                            onClick={() => { if (isUnlocked) setEquippedBorder(id); }}
                            style={{
                              padding: '10px 12px', borderRadius: '12px',
                              border: isEquipped ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                              background: isEquipped ? 'rgba(136,8,8,0.22)' : isUnlocked ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.3)',
                              opacity: isUnlocked ? 1 : 0.45,
                              cursor: isUnlocked ? 'pointer' : 'not-allowed',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 800, color: isEquipped ? 'var(--accent)' : '#fff' }}>
                              {config.name}
                            </span>
                            <span style={{ fontSize: '10px', color: isEquipped ? 'var(--accent)' : isUnlocked ? 'var(--green)' : 'var(--text-dim)', fontWeight: 800 }}>
                              {isEquipped ? '✓ Active' : isUnlocked ? 'Equip' : '🔒'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ════ TAB 3: FEATURED BADGES (SELECT UP TO 5) ════ */}
              {customizerTab === 'badges' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>
                        Pin Badges to Profile Header
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, maxWidth: '540px' }}>
                        Choose up to 5 badges to proudly showcase next to your name. If none are pinned, your top 5 highest-rarity badges are shown automatically.
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 900,
                        padding: '4px 12px', borderRadius: '12px',
                        background: featuredBadges.length > 0 ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', color: featuredBadges.length > 0 ? 'var(--accent)' : 'var(--text-dim)'
                      }}>
                        {featuredBadges.length} / 5 Pinned
                      </span>

                      {featuredBadges.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setFeaturedBadges([])}
                          style={{
                            background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '11.5px',
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                          }}
                        >
                          Reset to Top Rarity
                        </button>
                      )}
                    </div>
                  </div>

                  {/* BADGES PICKER GRID */}
                  {sortedBadges.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-dim)', fontSize: '13px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎖️</div>
                      <div style={{ fontWeight: 800, color: '#fff', fontSize: '14px' }}>No Badges Unlocked Yet</div>
                      <div style={{ marginTop: '4px', fontSize: '12px' }}>Track films, write reviews, and complete milestones to unlock titles and badges that you can pin here!</div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                      {sortedBadges.map(badgeName => {
                        const isPinned = featuredBadges.includes(badgeName);
                        const colors = BADGE_COLORS[badgeName] || { border: '1px solid var(--border)', color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.03)' };
                        return (
                          <div
                            key={badgeName}
                            onClick={() => toggleBadgePin(badgeName)}
                            style={{
                              padding: '10px 14px', borderRadius: '12px', cursor: 'pointer',
                              border: isPinned ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                              background: isPinned ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.02)',
                              boxShadow: isPinned ? '0 0 16px rgba(136,8,8,0.4)' : 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{
                              fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '10px',
                              textTransform: 'uppercase', letterSpacing: '0.04em', ...colors
                            }}>
                              {badgeName}
                            </span>

                            <div style={{
                              width: '20px', height: '20px', borderRadius: '50%',
                              border: isPinned ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                              background: isPinned ? 'var(--accent)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              {isPinned && <Check size={12} color="#fff" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ════ TAB 4: PROFILE INFO ════ */}
              {customizerTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>DISPLAY NAME</label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '13px' }}
                        placeholder="e.g. Cinema Enthusiast"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>USERNAME (HANDLE)</label>
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '13px' }}
                        placeholder="e.g. cinephile"
                      />
                    </div>
                  </div>

                  {/* LOCKED BIO TEXTAREA (NO INFINITE EXPAND BUG) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 800 }}>BIO & CINEMA STORY</label>
                      <span style={{ fontSize: '11px', color: bio.length >= 240 ? 'var(--red)' : 'var(--text-dim)' }}>
                        {bio.length}/250 chars
                      </span>
                    </div>
                    <textarea
                      maxLength={250}
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder="Share your favorite directors, genres, cinema passions, or favorite movie quotes..."
                      className="form-input"
                      style={{
                        height: '115px',
                        maxHeight: '115px',
                        resize: 'none',
                        overflowY: 'auto',
                        fontSize: '13px',
                        lineHeight: 1.55
                      }}
                    />
                  </div>
                </div>
              )}

              {/* ════ TAB 5: FAVORITES SHOWCASE (6 SLOTS) ════ */}
              {customizerTab === 'showcase' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Select your top 6 favorite films to showcase prominently on your public profile header. Click any slot to choose from your watched films.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
                    {favorites.map((fav, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectSlot(idx)}
                        style={{
                          aspectRatio: '2/3',
                          borderRadius: '10px',
                          border: fav ? '1.5px solid var(--border)' : '1.5px dashed rgba(255,255,255,0.2)',
                          background: fav ? '#110e1f' : 'rgba(255,255,255,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = fav ? 'var(--border)' : 'rgba(255,255,255,0.2)'; }}
                      >
                        {fav ? (
                          <>
                            <img
                              src={`https://image.tmdb.org/t/p/w185${fav.poster_path}`}
                              alt={fav.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFavorites(prev => {
                                  const next = [...prev];
                                  next[idx] = null;
                                  return next;
                                });
                              }}
                              style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '50%',
                                width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: '#fff', cursor: 'pointer'
                              }}
                            >
                              <X size={12} />
                            </button>
                            <div style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)',
                              padding: '14px 6px 4px', fontSize: '10px', fontWeight: 800, textAlign: 'center',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }}>
                              {fav.title}
                            </div>
                          </>
                        ) : (
                          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)' }}>
                            <div style={{ fontSize: '20px', marginBottom: '2px' }}>🎬</div>
                            <div style={{ fontSize: '10px', fontWeight: 700 }}>Slot {idx + 1}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* STUDIO FOOTER ACTIONS */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 28px', borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)', flexShrink: 0
            }}>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="var(--accent)" /> Changes update in real time. Click Save Changes when finished.
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  style={{ padding: '8px 24px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 900 }}
                >
                  <CheckCircle2 size={16} /> Save Changes
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
