import {useState,useEffect,useMemo} from 'react';
import {Flame,CheckCircle,Clock} from 'lucide-react';

const LEVELS = [
  { level: 1,  name: "Viewer",         xpNeeded: 0,    color: "#94a3b8", icon: "★" },
  { level: 2,  name: "Film Fan",       xpNeeded: 100,  color: "#60a5fa", icon: "★" },
  { level: 3,  name: "Enthusiast",     xpNeeded: 300,  color: "#34d399", icon: "★" },
  { level: 4,  name: "Buff",           xpNeeded: 600,  color: "#fbbf24", icon: "?" },
  { level: 5,  name: "Critic",         xpNeeded: 1000, color: "#f97316", icon: "★" },
  { level: 6,  name: "Aficionado",     xpNeeded: 1500, color: "#c0392b", icon: "★" },
  { level: 7,  name: "Cinephile",      xpNeeded: 2200, color: "#c0392b", icon: "★" },
  { level: 8,  name: "Auteur",         xpNeeded: 3200, color: "#f43f5e", icon: "★" },
  { level: 9,  name: "Maestro",        xpNeeded: 4500, color: "#fb923c", icon: "?" },
  { level: 10, name: "CineLog Legend", xpNeeded: 6000, color: "#ffd700", icon: "★" },
];

export const ALL_CHALLENGES = [
{id:'journey_mystery',category:'discovery',title:"Follow the clues",description:'Watch three mystery titles.',target:3,xp:110,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='mystery')).length},
{id:'journey_fantasy',category:'discovery',title:"Beyond the ordinary",description:'Watch three fantasy titles.',target:3,xp:110,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='fantasy')).length},
{id:'journey_adventure',category:'discovery',title:"The scenic route",description:'Watch three adventure titles.',target:3,xp:110,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='adventure')).length},
{id:'journey_romance',category:'discovery',title:"Matters of the heart",description:'Watch three romance titles.',target:3,xp:110,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='romance')).length},
{id:'journey_crime',category:'discovery',title:"Underworld stories",description:'Watch three crime titles.',target:3,xp:110,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='crime')).length},
{id:'journey_history',category:'discovery',title:"Through another era",description:'Watch three history titles.',target:3,xp:110,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='history')).length},
{id:"discovery_decades",category:"discovery",title:"Across the decades",description:"Watch titles from three different decades.",target:3,xp:120,check:lib=>new Set(lib.filter(m=>m.status==='watched').map(m=>Math.floor(parseInt(m.release_year)/10)).filter(Number.isFinite)).size},
{id:"discovery_documentary",category:"discovery",title:"A different lens",description:"Watch two documentaries.",target:2,xp:100,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='documentary')).length},
{id:"discovery_comedy",category:"discovery",title:"Lighten the mood",description:"Watch three comedies.",target:3,xp:90,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='comedy')).length},
{id:"discovery_animation",category:"discovery",title:"Beyond live action",description:"Watch three animated titles.",target:3,xp:100,check:lib=>lib.filter(m=>m.status==='watched'&&(m.genres||[]).some(g=>String(g.name||g).toLowerCase()==='animation')).length},
{id:"writing_reflections",category:"writing",title:"Stay for the credits",description:"Write five reviews of at least 200 characters.",target:5,xp:180,check:lib=>lib.filter(m=>(m.review||'').trim().length>=200).length},
{id:"discovery_silent_era",category:"discovery",title:"Before the blockbuster",description:"Watch a title released before 1960.",target:1,xp:120,check:lib=>lib.filter(m=>m.status==='watched'&&parseInt(m.release_year)>0&&parseInt(m.release_year)<1960).length},
  { id: "wc1",  category: "watch",   title: "Horror Nights",       description: "Watch 2 horror films",                   xp: 80,  icon: "★", target: 2,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("horror"))).length },
  { id: "wc2",  category: "watch",   title: "Classic Buff",        description: "Watch a film from before 1980",          xp: 100, icon: "★", target: 1,  check: (lib) => lib.filter(m => m.status === "watched" && parseInt(m.release_year) < 1980).length },
  { id: "wc3",  category: "watch",   title: "Prolific Watcher",    description: "Have 5+ watched films",                  xp: 90,  icon: "★", target: 5,  check: (lib) => lib.filter(m => m.status === "watched").length },
  { id: "wc4",  category: "watch",   title: "Sci-Fi Explorer",     description: "Watch 3 Sci-Fi films",                   xp: 120, icon: "★", target: 3,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("sci"))).length },
  { id: "wc5",  category: "watch",   title: "Documentary Dive",    description: "Watch a documentary",                    xp: 70,  icon: "★", target: 1,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("documentary"))).length },
  { id: "wc6",  category: "watch",   title: "Series Addict",       description: "Add 3 TV series to your library",        xp: 110, icon: "★", target: 3,  check: (lib) => lib.filter(m => m.media_type === "tv").length },
  { id: "wc7",  category: "watch",   title: "Animation Fan",       description: "Watch 2 animated films",                 xp: 80,  icon: "★", target: 2,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("animation"))).length },
  { id: "wc8",  category: "watch",   title: "Thriller Seeker",     description: "Watch 2 thrillers",                      xp: 85,  icon: "★", target: 2,  check: (lib) => lib.filter(m => m.status === "watched" && (m.genres||[]).some(g => g.toLowerCase().includes("thriller"))).length },
  { id: "rc1",  category: "rating",  title: "Critic Mode",         description: "Rate 5 films with a score",              xp: 100, icon: "?", target: 5,  check: (lib) => lib.filter(m => m.rating != null && m.rating > 0).length },
  { id: "rc2",  category: "rating",  title: "Top Scorer",          description: "Give a 9+ rating to any title",          xp: 60,  icon: "★", target: 1,  check: (lib) => lib.filter(m => m.rating >= 9).length },
  { id: "rc3",  category: "rating",  title: "Honest Reviewer",     description: "Rate a film below 5",                    xp: 50,  icon: "★", target: 1,  check: (lib) => lib.filter(m => m.rating > 0 && m.rating < 5).length },
  { id: "rc4",  category: "rating",  title: "Rating Spree",        description: "Rate 10 films total",                    xp: 150, icon: "★", target: 10, check: (lib) => lib.filter(m => m.rating != null && m.rating > 0).length },
  { id: "lc1",  category: "library", title: "Growing Collection",  description: "Have 10 films in your library",          xp: 80,  icon: "★", target: 10, check: (lib) => lib.length },
  { id: "lc2",  category: "library", title: "Diverse Tastes",      description: "Have 5 different genres in library",     xp: 100, icon: "★", target: 5,  check: (lib) => new Set(lib.flatMap(m => m.genres || [])).size },
  { id: "lc3",  category: "library", title: "Wishlist Builder",    description: "Add 5 items to your Watchlist",          xp: 70,  icon: "★", target: 5,  check: (lib) => lib.filter(m => ["watchlist","plan_to_watch"].includes(m.status)).length },
  { id: "lc4",  category: "library", title: "Favourite Curator",   description: "Mark 3 films as Favourite",              xp: 80,  icon: "★",  target: 3,  check: (lib) => lib.filter(m => m.favorite).length },
  { id: "wt1",  category: "writing", title: "First Review",        description: "Write your first review",                xp: 75,  icon: "★",  target: 1,  check: (lib) => lib.filter(m => m.review && m.review.trim().length > 20).length },
  { id: "wt2",  category: "writing", title: "Active Reviewer",     description: "Write 3 reviews",                        xp: 120, icon: "★", target: 3,  check: (lib) => lib.filter(m => m.review && m.review.trim().length > 20).length },
  { id: "wt3",  category: "writing", title: "Long-Form Critic",    description: "Write a review longer than 200 chars",   xp: 90,  icon: "★", target: 1,  check: (lib) => lib.filter(m => (m.review||"").trim().length > 200).length },
  { id: "wt4",  category: "writing", title: "Tag Master",          description: "Add tags to 5 films",                    xp: 60,  icon: "★",  target: 5,  check: (lib) => lib.filter(m => (m.tags||[]).length > 0).length },
];

export function getWeeklyChallenges() {
  const weekNum = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  const sorted = [...ALL_CHALLENGES].sort((a, b) => {
    const seed = weekNum % 13 + 1;
    const hash=id=>Array.from(id).reduce((n,char)=>(n*31+char.charCodeAt(0))>>>0,seed);
    const ha = hash(a.id);
    const hb = hash(b.id);
    return ha - hb;
  });
  return sorted.slice(0, 6);
}

function getCurrentLevel(xp) {
  let current = LEVELS[0];
  for (const level of LEVELS) { if (xp >= level.xpNeeded) current = level; else break; }
  return current;
}
function getNextLevel(xp) {
  for (const level of LEVELS) { if (xp < level.xpNeeded) return level; }
  return null;
}

export default function ChallengesTab({ library=[], currentUser, storage=localStorage }) {
  const uid = currentUser?.id || "guest";
  const [claimedChallenges, setClaimedChallenges] = useState(() => {
    try { return JSON.parse(storage.getItem("cinelog_claimed_" + uid) || "[]"); } catch { return []; }
  });
  useEffect(()=>{try{setClaimedChallenges(JSON.parse(storage.getItem('cinelog_claimed_'+uid)||'[]'));}catch{setClaimedChallenges([]);}},[uid,storage]);
  const [view,setView]=useState('weekly'),[error,setError]=useState('');
  const [animateXp, setAnimateXp] = useState(false);
  const [celebrateLevel, setCelebrateLevel] = useState(false);
  const weeklyChallenges = useMemo(() => getWeeklyChallenges(), []);

  const baseXp = useMemo(() => {
    let t = 0;
    t += library.filter(m => m.status === "watched").length * 10;
    t += library.filter(m => m.rating != null && m.rating > 0).length * 5;
    t += library.filter(m => m.review && m.review.trim().length > 20).length * 15;
    t += library.filter(m => m.favorite).length * 3;
    return t;
  }, [library]);

  const claimedXp = useMemo(() =>
    claimedChallenges.reduce((s, id) => { const c = ALL_CHALLENGES.find(x => x.id === id); return s + (c?.xp || 0); }, 0)
  , [claimedChallenges]);

  const xp = baseXp + claimedXp;
  const currentLevel = getCurrentLevel(xp);
  const nextLevel = getNextLevel(xp);
  const progressPct = nextLevel ? Math.min(100, Math.round(((xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100)) : 100;

  const handleClaim = (challenge) => {
    if (claimedChallenges.includes(challenge.id)) return;
    const progress = Math.min(challenge.check(library), challenge.target);
    if (progress < challenge.target) return;
    const prevLvl = getCurrentLevel(xp);
    try{const next=[...claimedChallenges,challenge.id];storage.setItem('cinelog_claimed_'+uid,JSON.stringify(next));setClaimedChallenges(next);setError('');}catch{setError('Progress could not be saved on this device. Please try again.');return;}
    setAnimateXp(true); setTimeout(() => setAnimateXp(false), 600);
    const newLvl = getCurrentLevel(xp + challenge.xp);
    if (newLvl.level > prevLvl.level) { setCelebrateLevel(true); setTimeout(() => setCelebrateLevel(false), 3000); }
  };

  const claimAll=()=>{const eligible=ALL_CHALLENGES.filter(c=>!claimedChallenges.includes(c.id)&&c.check(library)>=c.target);if(!eligible.length)return;try{const next=[...new Set([...claimedChallenges,...eligible.map(c=>c.id)])];storage.setItem('cinelog_claimed_'+uid,JSON.stringify(next));setClaimedChallenges(next);setError('');}catch{setError('Rewards could not be saved. Please try again.');}};
  const ready=ALL_CHALLENGES.filter(challenge=>!claimedChallenges.includes(challenge.id)&&challenge.check(library)>=challenge.target);
  const visible=view==='weekly'?weeklyChallenges:view==='ready'?ready:view==='claimed'?ALL_CHALLENGES.filter(challenge=>claimedChallenges.includes(challenge.id)):ALL_CHALLENGES;
  return <div className="extras-page challenge-board"><header className="extras-page-heading"><div><span className="studio-eyebrow">A LITTLE MOMENTUM</span><h1>Make your next watch count.</h1><p>Small prompts. New discoveries. A few good reasons to explore beyond the familiar.</p></div><span className="extras-heading-emblem"><Flame size={32}/></span></header>{celebrateLevel&&<p className="extras-notice" role="status">Level up — you are now {currentLevel.name}.</p>}<section className="extras-feature"><div><span className="studio-eyebrow">YOUR VIEWING LEVEL</span><div className="challenge-level-title"><span>{String(currentLevel.level).padStart(2,'0')}</span><h2>{currentLevel.name}</h2></div><div className="extras-progress" role="progressbar" aria-label="Level progress" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}><i style={{width:progressPct+'%'}}/></div><p>{nextLevel?(nextLevel.xpNeeded-xp).toLocaleString()+' XP to '+nextLevel.name:'You have reached the highest level.'}</p></div><div className="extras-feature-side challenge-xp"><span className="studio-eyebrow">EXPERIENCE EARNED</span><strong data-celebrate={animateXp}>{xp.toLocaleString()} <small>XP</small></strong><p>{claimedChallenges.length} rewards claimed · {ready.length} ready to collect</p></div></section>{error&&<p className="extras-error" role="alert">{error}</p>}
 <div className="extras-two-column"><section><div className="extras-toolbar"><div className="extras-segments" role="group" aria-label="Challenge selection">{[['weekly','This week’s picks'],['all','All challenges'],['ready','Ready · '+ready.length],['claimed','Claimed']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</div></div>{ready.length>0&&<button className="studio-primary extras-claim-all" onClick={claimAll}>Claim all ({ready.length})</button>}<div className="challenge-grid">{visible.map(challenge=>{const progress=Math.min(challenge.check(library),challenge.target),pct=Math.round(progress/challenge.target*100),claimed=claimedChallenges.includes(challenge.id),complete=progress>=challenge.target;return <article className="challenge-card" key={challenge.id} data-complete={complete} data-claimed={claimed}><header><span className="extras-category">{challenge.category}</span><strong>+{challenge.xp} XP</strong></header><h3>{challenge.title}</h3><p>{challenge.description}</p><div className="extras-progress" role="progressbar" aria-label={challenge.title} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={challenge.target}><i style={{width:pct+'%'}}/></div><footer><span>{progress} / {challenge.target}</span>{claimed?<span className="extras-owned"><CheckCircle size={13}/>Claimed</span>:complete?<button className="studio-primary" onClick={()=>handleClaim(challenge)}>Claim reward</button>:<span className="extras-in-progress"><Clock size={12}/>In progress</span>}</footer></article>;})}</div>{!visible.length&&<p role="status" className="extras-empty">{view==='ready'?'No rewards ready yet. Choose a challenge and make some progress.':'Your claimed challenges will appear here.'}</p>}<p className="extras-note">Weekly picks rotate; each challenge reward is claimed once. Your claim history stays on this device for this account.</p></section>
 <aside className="extras-sidebar"><span className="studio-eyebrow">THE ROAD AHEAD</span><h2>Your next chapter.</h2><div className="challenge-roadmap">{LEVELS.map(level=><div key={level.level} data-current={level.level===currentLevel.level} data-unlocked={xp>=level.xpNeeded}><span>{String(level.level).padStart(2,'0')}</span><div><strong>{level.name}</strong><small>{level.xpNeeded.toLocaleString()} XP</small></div>{xp>=level.xpNeeded&&<CheckCircle size={14}/>}</div>)}</div><h3>How your XP grows</h3><div className="extras-earn-rules">{[['Watched title',10],['Personal rating',5],['Written review',15],['Favorite',3]].map(([label,value])=><span key={label}>{label}<strong>+{value}</strong></span>)}</div><p className="extras-note">XP tracks your level. CinePoints are a separate balance for profile extras.</p></aside></div></div>;
}
