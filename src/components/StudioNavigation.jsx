import {useSocialNotifications} from '../hooks/useSocial';
import {notificationText} from '../utils/socialModel';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useState, useEffect, useRef } from 'react';
import { Film, Compass, Library, Layers, Trophy, Users, BarChart3, CalendarDays, Sparkles, Search, Plus, Settings, LogOut, User, ChevronDown, X, Bell, Clapperboard, HelpCircle, Flame, Menu, ArrowUpRight } from 'lucide-react';
import { useNotifications } from '../utils/notifications';

const primary = [
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'foryou', label: 'Picked for you', icon: Sparkles },
  { id: 'library', label: 'My library', icon: Library },
  { id: 'collections', label: 'Lists & collections', icon: Layers },
  { id: 'tierlist', label: 'Tier lists', icon: Trophy },
  { id: 'social', label: 'Community', icon: Users },
];
const journal = [
  { id: 'calendar', label: 'Watch diary', icon: CalendarDays },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
];
const extras = [
  { id: 'wrapped', label: 'Year in film', icon: Clapperboard },
  { id: 'constellation', label: 'Taste map', icon: Sparkles },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'shop', label: 'Profile extras', icon: Sparkles },
  { id: 'challenges', label: 'Challenges', icon: Flame },
  { id: 'trivia', label: 'Film trivia', icon: HelpCircle },
];
const titles = { explore: 'Discover your next favorite.', library: 'A life in films.', collections: 'Good films belong together.', tierlist: 'Your taste. Your rules.', social: 'Cinema is better shared.', calendar: 'Every screening, remembered.', stats: 'Your viewing, in perspective.', profile: 'Your corner of cinema.', wrapped: 'Your year on screen.', constellation: 'Follow the shape of your taste.', achievements: 'Celebrate your curiosity.', challenges: 'A little inspiration to watch.', trivia: 'Put your film knowledge to the test.' };

export default function StudioNavigation({ activeTab, profileSubTab, setActiveTab, currentUser, onLogout, onOpenAuth, onOpenSettings, onOpenCommandCenter, onOpenQuickAdd, onOpenSocial, library = [], onMovieClick }) {
  const [collapsed,setCollapsed]=useState(()=>{try{return localStorage.getItem("cinelog_sidebar_collapsed")==="true";}catch{return false;}});
  useEffect(()=>{document.documentElement.classList.toggle("cinelog-sidebar-collapsed",collapsed);try{localStorage.setItem("cinelog_sidebar_collapsed",String(collapsed));}catch{}return ()=>document.documentElement.classList.remove("cinelog-sidebar-collapsed");},[collapsed]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useBodyScrollLock(mobileMenu);
  const navRef = useDialogFocus(compact && mobileMenu);
  useEffect(() => { const query = window.matchMedia('(max-width: 767px)'); const update = () => { setCompact(query.matches); if (!query.matches) setMobileMenu(false); }; query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  const [accountMenu, setAccountMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef(null);
  const socialNotifications=useSocialNotifications(currentUser);
  const { notifications, readIds, markAsRead, markAllAsRead } = useNotifications(library, currentUser);
  const relevant = currentUser ? notifications.filter(n => n.type !== 'release' && n.type !== 'tip') : [];
  const relevantUnread=relevant.filter(n=>!readIds.includes(n.id)).length+socialNotifications.unread;
  const navigate = id => { setActiveTab(id); setMobileMenu(false); setAccountMenu(false); window.scrollTo({ top: 0 }); };
  useEffect(() => {
    const dismiss = e => { if (e.key === 'Escape') {const anchor=e.target.closest?.('.studio-popover-anchor');anchor?.querySelector('[aria-expanded=true]')?.focus(); setMobileMenu(false); setAccountMenu(false); setShowNotifications(false); } };
    const anotherPopover = e => {if(e.detail !== 'navigation'){setAccountMenu(false);setShowNotifications(false);}};
    window.addEventListener('cinelog:popover-open', anotherPopover);
    const outside = e => { const anchor = menuRef.current?.contains(e.target) ? e.target.closest('.studio-popover-anchor') : null; if(!anchor?.querySelector('.studio-account'))setAccountMenu(false); if(!anchor?.querySelector('[aria-label="Notifications"]'))setShowNotifications(false); };
    window.addEventListener('keydown', dismiss); window.addEventListener('pointerdown', outside);window.addEventListener('focusin',outside);
    return () => { window.removeEventListener('cinelog:popover-open',anotherPopover); window.removeEventListener('keydown', dismiss); window.removeEventListener('pointerdown', outside);window.removeEventListener('focusin',outside); };
  }, []);
  const navigationTab = activeTab === 'profile' && profileSubTab === 'shop' ? 'shop' : activeTab;
  const navGroup = (items, label) => <div className="studio-nav-group"><span className="studio-nav-label">{label}</span>{items.map(({id,label: text,icon: Icon}) => <button key={id} className={`studio-nav-item ${navigationTab === id ? 'is-active' : ''}`} title={text} aria-label={text} aria-current={navigationTab === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18}/><span>{text}</span>{id === 'library' && <small>{library.length}</small>}</button>)}</div>;
  return <>
    <a className="studio-skip" href="#main-content">Skip to content</a>
    {mobileMenu && <button className="studio-nav-scrim" aria-label="Close navigation" onClick={() => setMobileMenu(false)}/>}
    <aside ref={navRef} tabIndex={-1} role={compact && mobileMenu ? "dialog" : undefined} aria-modal={compact && mobileMenu ? true : undefined} aria-hidden={compact && !mobileMenu ? true : undefined} inert={compact && !mobileMenu ? true : undefined} className={`studio-sidebar ${mobileMenu ? 'is-open' : ''}`} aria-label="Main navigation">
      <button aria-label="CineLog home" className="studio-brand" onClick={() => navigate('explore')}><span className="studio-brand-mark"><Film size={21}/></span><span>Cine<span className="brand-red">Log</span><small>A FILM JOURNAL</small></span></button>
      <button className="studio-mobile-close" aria-label="Close navigation" onClick={() => setMobileMenu(false)}><X size={20}/></button>
      <nav>{navGroup(primary,'YOUR CINEMA')}{navGroup(journal,'JOURNAL')}<details className="studio-extras" open={extras.some(item=>item.id===navigationTab)||undefined}><summary><Sparkles size={17}/> A little extra <ChevronDown size={14}/></summary>{navGroup(extras,'EXPLORE MORE')}</details></nav>
      <div className="studio-sidebar-bottom"><div className="studio-sidebar-note"><span className="studio-live-dot"/> One more great film.<p>Keep a little of every story.</p></div><button className="studio-nav-item" onClick={()=>{setMobileMenu(false);setAccountMenu(false);onOpenSettings();}}><Settings size={18}/>Preferences</button></div>
    </aside>
    <header className="studio-topbar"><button className="sidebar-collapse-control" aria-label={collapsed?"Expand sidebar":"Collapse sidebar"} aria-expanded={!collapsed} onClick={()=>setCollapsed(v=>!v)}><Menu size={19}/></button>
      <div className="studio-topbar-context"><button className="studio-hamburger" aria-label="Open navigation" onClick={() => setMobileMenu(true)}><Menu size={21}/></button><span className="studio-breadcrumb">{[...primary,...journal,...extras].find(t => t.id === activeTab)?.label || (activeTab==='search'?'Search':'Profile')}</span><span className="studio-topbar-note">{titles[activeTab]}</span></div>
      <div className="studio-utilities" ref={menuRef}>
        <button className="studio-search" aria-label="Search films and series" onClick={onOpenCommandCenter}><Search size={17}/><span>Search films & series</span><kbd>⌘ K</kbd></button>
        <button className="studio-log-button" onClick={onOpenQuickAdd}><Plus size={17}/><span>Log a film</span></button>
        <div className="studio-popover-anchor"><button className="studio-icon-button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => { window.dispatchEvent(new CustomEvent('cinelog:popover-open',{detail:'navigation'})); setShowNotifications(v => !v); setAccountMenu(false); }}><Bell size={19}/>{currentUser && relevantUnread > 0 && <i/>}</button>{showNotifications && <section className="studio-popover"><div className="studio-popover-title">Your updates<button disabled={socialNotifications.pending} onClick={async()=>{if(socialNotifications.items.length)await socialNotifications.mark();markAllAsRead();}}>Mark read</button></div>{socialNotifications.items.slice(0,6).map(n=><button className="studio-notification" data-unread={!n.read_at} key={n.id} onClick={async()=>{await socialNotifications.mark([n.id]);setShowNotifications(false);onOpenSocial?.(n.path);}}><strong>{n.person?.display_name||n.person?.username||'A CineLog member'}</strong><span>{notificationText(n)}</span></button>)}{socialNotifications.writeError&&<p role="alert">{socialNotifications.writeError}</p>}{relevant.length ? relevant.map(n => <button className="studio-notification" key={n.id} onClick={() => { markAsRead(n.id); if(n.movieId) onMovieClick?.(n.movieId,n.mediaType || 'movie'); if(n.tab) navigate(n.tab); setShowNotifications(false); }}><strong>{n.title}</strong><span>{n.body}</span></button>) : <p className="studio-menu-empty">{socialNotifications.items.length?'More updates are in your inbox.':"You're all caught up."}<span>Your replies, invitations and viewing milestones appear here.</span></p>}{onOpenSocial&&<button className="studio-text-button" onClick={()=>{setShowNotifications(false);onOpenSocial('/community/inbox');}}>Open community inbox ↗</button>}</section>}</div>
        <div className="studio-popover-anchor">{currentUser ? <button className="studio-account" aria-label="Account menu" aria-expanded={accountMenu} onClick={() => { window.dispatchEvent(new CustomEvent('cinelog:popover-open',{detail:'navigation'})); setAccountMenu(v => !v); setShowNotifications(false); }}>{currentUser.avatar ? <img src={currentUser.avatar} alt=""/> : <User size={19}/>}<ChevronDown size={13}/></button> : <button className="studio-signin studio-primary" onClick={onOpenAuth}>Sign in <ArrowUpRight size={14}/></button>}{accountMenu && <div className="studio-popover studio-account-menu"><strong>{currentUser?.displayName || currentUser?.display_name || currentUser?.username}</strong><button onClick={() => navigate('profile')}><User size={16}/>Your profile</button><button onClick={() => {setAccountMenu(false);onOpenSettings();}}><Settings size={16}/>Preferences</button><button onClick={() => {setAccountMenu(false);onLogout();}}><LogOut size={16}/>Sign out</button></div>}</div>
      </div>
    </header>
    <nav className="studio-mobile-bottom" aria-label="Mobile navigation"><button className={activeTab === 'explore' ? 'is-active' : ''} onClick={() => navigate('explore')}><Compass size={21}/><span>Explore</span></button><button className={activeTab === 'library' ? 'is-active' : ''} onClick={() => navigate('library')}><Library size={21}/><span>Library</span></button><button className="studio-mobile-log" aria-label="Log a film" onClick={onOpenQuickAdd}><Plus size={23}/><span>Log</span></button><button className={activeTab === 'social' ? 'is-active' : ''} onClick={() => navigate('social')}><Users size={21}/><span>Community</span></button><button onClick={() => setMobileMenu(true)}><Menu size={21}/><span>More</span></button></nav>
  </>;
}
