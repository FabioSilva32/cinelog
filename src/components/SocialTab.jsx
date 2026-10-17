import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { Search, UserPlus, UserMinus, UserCheck, Activity, Users } from "lucide-react";
import { TESTER_PROFILE, TESTER_LIBRARY } from "../mockData";

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}

const STATUS_EMOJI = { watched: "✅", plan_to_watch: "📋", watching: "▶️", dropped: "❌" };
const STATUS_LABEL = { watched: "watched", plan_to_watch: "added to watchlist", watching: "is watching", dropped: "dropped" };

export default function SocialTab({ currentUser, onMovieClick, onOpenUserProfile }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [following, setFollowing] = useState(new Set());
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [feed, setFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [activeTab, setActiveTab] = useState("feed"); // feed | following | discover
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [dbError, setDbError] = useState(null);


  // Load who the current user follows
  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.from("follows").select("following_id").eq("follower_id", currentUser.id)
      .then(({ data, error }) => {
        if (error) {
          console.warn("Follows table query failed:", error.message);
          setDbError("Social features require the 'follows' table in your database. Follow/feed features are unavailable.");
          return;
        }
        if (data) setFollowing(new Set(data.map(r => r.following_id)));
      })
      .catch(err => {
        console.warn("Follows query exception:", err);
        setDbError("Could not connect to social features. The database may be unavailable.");
      });
  }, [currentUser?.id]);

  // Load activity feed
  const loadFeed = useCallback(async () => {
    if (!currentUser?.id || following.size === 0) return;
    setLoadingFeed(true);
    try {
      const followingIds = [...following];
      const { data } = await supabase
        .from("library")
        .select("user_id, title, poster_path, status, rating, review, date_added, tmdb_id, media_type, profiles!library_user_id_fkey(username, display_name, avatar_url)")
        .in("user_id", followingIds)
        .order("date_added", { ascending: false })
        .limit(40);

      let combinedFeed = data || [];
      if (following.has(TESTER_PROFILE.id)) {
        const testerFeedItems = TESTER_LIBRARY.filter(m => m.review).map(m => ({
          user_id: TESTER_PROFILE.id,
          title: m.title,
          poster_path: m.poster_path,
          status: m.status,
          rating: m.rating,
          review: m.review,
          date_added: m.date_added,
          tmdb_id: m.tmdb_id,
          media_type: m.media_type,
          profiles: {
            username: TESTER_PROFILE.username,
            display_name: TESTER_PROFILE.displayName,
            avatar_url: TESTER_PROFILE.avatar
          }
        }));
        combinedFeed = [...combinedFeed, ...testerFeedItems].sort(
          (a, b) => new Date(b.date_added || 0) - new Date(a.date_added || 0)
        );
      }
      setFeed(combinedFeed);
    } catch (err) {
      console.error("Feed load error:", err);
    } finally {
      setLoadingFeed(false);
    }
  }, [currentUser?.id, following]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  // Load full profile details for people the user follows
  useEffect(() => {
    if (!currentUser?.id || following.size === 0) {
      setFollowingUsers([]);
      return;
    }
    setLoadingFollowing(true);
    const ids = [...following];
    supabase.from("profiles")
      .select("id, username, display_name, avatar_url, bio")
      .in("id", ids)
      .then(({ data, error }) => {
        if (error) console.warn("Failed to load following users from profiles:", error.message);
        
        const fetchedMap = {};
        (data || []).forEach(p => { fetchedMap[p.id] = p; });

        // Map every followed ID to either a fetched profile or a clean fallback user object
        const list = ids.map(id => {
          if (id === TESTER_PROFILE.id) {
            return {
              id: TESTER_PROFILE.id,
              username: TESTER_PROFILE.username,
              display_name: TESTER_PROFILE.displayName,
              avatar_url: TESTER_PROFILE.avatar,
              bio: TESTER_PROFILE.bio
            };
          }
          const p = fetchedMap[id];
          return {
            id,
            username: p?.username || `user_${String(id).slice(0, 6)}`,
            display_name: p?.display_name || p?.username || 'CineLog Member',
            avatar_url: p?.avatar_url || null,
            bio: p?.bio || ''
          };
        });

        setFollowingUsers(list);
      })
      .catch(err => {
        console.warn("Failed to load following users:", err);
        const fallbackList = ids.map(id => {
          if (id === TESTER_PROFILE.id) {
            return {
              id: TESTER_PROFILE.id,
              username: TESTER_PROFILE.username,
              display_name: TESTER_PROFILE.displayName,
              avatar_url: TESTER_PROFILE.avatar,
              bio: TESTER_PROFILE.bio
            };
          }
          return {
            id,
            username: `user_${String(id).slice(0, 6)}`,
            display_name: 'CineLog Member',
            avatar_url: null,
            bio: ''
          };
        });
        setFollowingUsers(fallbackList);
      })
      .finally(() => setLoadingFollowing(false));
  }, [currentUser?.id, following]);

  // Load suggested users (people not yet followed)
  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.from("profiles").select("id, username, display_name, avatar_url, bio")
      .neq("id", currentUser.id)
      .limit(12)
      .then(({ data, error }) => {
        let list = (data || []).filter(u => !following.has(u.id));
        const isCurrentTester = currentUser?.username === 'tester' || currentUser?.id === TESTER_PROFILE.id;
        const hasTester = list.some(u => u.username === 'tester' || u.id === TESTER_PROFILE.id);
        if (!hasTester && !isCurrentTester && !following.has(TESTER_PROFILE.id)) {
          list.unshift({
            id: TESTER_PROFILE.id,
            username: TESTER_PROFILE.username,
            display_name: TESTER_PROFILE.displayName,
            avatar_url: TESTER_PROFILE.avatar,
            bio: TESTER_PROFILE.bio
          });
        }
        setSuggestedUsers(list);
      })
      .catch(err => {
        console.warn("Profiles query exception:", err);
        if (!following.has(TESTER_PROFILE.id) && currentUser?.id !== TESTER_PROFILE.id) {
          setSuggestedUsers([{
            id: TESTER_PROFILE.id,
            username: TESTER_PROFILE.username,
            display_name: TESTER_PROFILE.displayName,
            avatar_url: TESTER_PROFILE.avatar,
            bio: TESTER_PROFILE.bio
          }]);
        }
      });
  }, [currentUser?.id, following]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearching(true);
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, bio")
        .ilike("username", "%" + searchQuery + "%")
        .neq("id", currentUser?.id || "")
        .limit(8);
      let results = [...(data || [])];
      const q = searchQuery.toLowerCase();
      if ('tester'.includes(q) || 'alex vance'.includes(q)) {
        if (!results.some(u => u.username === 'tester' || u.id === TESTER_PROFILE.id) && currentUser?.id !== TESTER_PROFILE.id) {
          results.unshift({
            id: TESTER_PROFILE.id,
            username: TESTER_PROFILE.username,
            display_name: TESTER_PROFILE.displayName,
            avatar_url: TESTER_PROFILE.avatar,
            bio: TESTER_PROFILE.bio
          });
        }
      }
      setSearchResults(results);
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery, currentUser?.id]);

  const handleFollow = async (userId) => {
    if (!currentUser?.id) return;
    const isFollowing = following.has(userId);
    setFollowing(prev => {
      const next = new Set(prev);
      if (isFollowing) { next.delete(userId); } else { next.add(userId); }
      return next;
    });
    try {
      if (isFollowing) {
        await supabase.from("follows").delete()
          .eq("follower_id", currentUser.id).eq("following_id", userId);
      } else {
        await supabase.from("follows").upsert({ follower_id: currentUser.id, following_id: userId }, { onConflict: "follower_id,following_id" });
      }
    } catch (err) {
      console.warn("Follow action failed:", err);
      // Revert optimistic update
      setFollowing(prev => {
        const next = new Set(prev);
        if (isFollowing) { next.add(userId); } else { next.delete(userId); }
        return next;
      });
    }
  };

  if (!currentUser) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-muted)" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>👥</div>
        <div style={{ fontSize: "20px", fontWeight: 900, marginBottom: "8px" }}>Sign in to Connect</div>
        <div style={{ fontSize: "14px", color: "var(--text-dim)" }}>Create an account to follow other film lovers and see their activity</div>
      </div>
    );
  }

  const displayUsers = searchQuery.trim() ? searchResults : suggestedUsers;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "40px" }}>
      {/* Database error banner */}
      {dbError && (
        <div style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", color: "#fbbf24", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
          <span>{dbError}</span>
        </div>
      )}
      {/* Sub-tabs */}
      <div className="social-subtabs-bar" style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "4px", width: "fit-content" }}>
        {[
          { id: "feed", label: "Activity Feed", icon: <Activity size={14} /> },
          { id: "following", label: `Following (${following.size})`, icon: <UserCheck size={14} /> },
          { id: "discover", label: "Discover People", icon: <Users size={14} /> },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? "var(--accent)" : "transparent",
            color: activeTab === t.id ? "#fff" : "var(--text-muted)",
            border: "none", borderRadius: "7px", padding: "8px 18px",
            fontSize: "13px", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "all 0.2s",
          }}>{t.icon}{t.label}</button>
        ))}
      </div>

      {/* ACTIVITY FEED TAB */}
      {activeTab === "feed" && (
        <div>
          {loadingFeed ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "32px", animation: "spin 1s linear infinite", display: "inline-block", marginBottom: "12px" }}>⟳</div>
              <div>Loading feed...</div>
            </div>
          ) : following.size === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🌐</div>
              <div style={{ fontWeight: 800, fontSize: "17px", marginBottom: "8px" }}>Your feed is empty</div>
              <div style={{ fontSize: "14px", color: "var(--text-dim)" }}>Follow other CineLog users to see what they are watching</div>
              <button onClick={() => setActiveTab("discover")} style={{ marginTop: "16px", background: "linear-gradient(135deg,#880808,#880808)", border: "none", borderRadius: "50px", padding: "10px 24px", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer" }}>
                Discover People
              </button>
            </div>
          ) : feed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎬</div>
              <div style={{ fontWeight: 700 }}>No activity yet</div>
              <div style={{ fontSize: "13px", color: "var(--text-dim)", marginTop: "6px" }}>The people you follow haven't logged anything recently</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {feed.map((item, i) => {
                const profile = item.profiles;
                const name = profile?.display_name || profile?.username || "Someone";
                const avatar = profile?.avatar_url;
                const hasReview = item.review && item.review.trim().length > 4;
                return (
                  <div key={i} style={{
                    display: "flex", gap: "14px", padding: "16px",
                    background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)",
                    borderRadius: "16px", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(136,8,8,0.05)"; e.currentTarget.style.borderColor = "rgba(136,8,8,0.25)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {/* Avatar */}
                    <div
                      onClick={() => onOpenUserProfile && onOpenUserProfile({ id: item.user_id, ...profile })}
                      style={{ width: "40px", height: "40px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(136,8,8,0.15)", border: "1px solid var(--border)", cursor: "pointer" }}
                    >
                      {avatar ? <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>👤</div>}
                    </div>

                    {/* Poster thumbnail */}
                    {item.poster_path && (
                      <div style={{ width: "36px", height: "52px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
                        onClick={() => onMovieClick && onMovieClick(item.tmdb_id, item.media_type)}>
                        <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, lineHeight: 1.4, marginBottom: "4px" }}>
                        <span
                          onClick={() => onOpenUserProfile && onOpenUserProfile({ id: item.user_id, ...profile })}
                          style={{ fontWeight: 800, color: "#c0392b", cursor: "pointer" }}
                        >
                          {name}
                        </span>{" "}
                        <span style={{ color: "var(--text-muted)" }}>{STATUS_LABEL[item.status] || "logged"}</span>{" "}
                        <span style={{ fontWeight: 800, cursor: "pointer" }}
                          onClick={() => onMovieClick && onMovieClick(item.tmdb_id, item.media_type)}>
                          {item.title}
                        </span>
                        {item.rating > 0 && (
                          <span style={{ color: "#fbbf24", marginLeft: "6px" }}>★ {item.rating}</span>
                        )}
                      </div>
                      {hasReview && (
                        <div style={{
                          margin: '6px 0 4px',
                          padding: '8px 12px',
                          background: 'rgba(136,8,8,0.06)',
                          borderLeft: '3px solid rgba(136,8,8,0.5)',
                          borderRadius: '0 8px 8px 0',
                        }}>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', lineHeight: 1.55 }}>
                            "{item.review.slice(0, 200)}{item.review.length > 200 ? '…' : ''}"
                          </div>
                          {item.review.length > 200 && (
                            <div
                              onClick={() => onMovieClick && onMovieClick(item.tmdb_id, item.media_type)}
                              style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, marginTop: '4px', cursor: 'pointer' }}
                            >
                              Read full review →
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{timeAgo(item.date_added)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FOLLOWING TAB */}
      {activeTab === "following" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            People You Follow ({following.size})
          </div>

          {loadingFollowing ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "32px", animation: "spin 1s linear infinite", display: "inline-block", marginBottom: "12px" }}>⟳</div>
              <div>Loading following list...</div>
            </div>
          ) : following.size === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
              <div style={{ fontWeight: 800, fontSize: "17px", marginBottom: "8px" }}>You aren't following anyone yet</div>
              <div style={{ fontSize: "14px", color: "var(--text-dim)" }}>Explore Discover People to find and follow film lovers on CineLog</div>
              <button onClick={() => setActiveTab("discover")} style={{ marginTop: "16px", background: "linear-gradient(135deg,#880808,#880808)", border: "none", borderRadius: "50px", padding: "10px 24px", color: "#fff", fontWeight: 800, fontSize: "14px", cursor: "pointer" }}>
                Discover People
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {followingUsers.map(user => (
                <div
                  key={user.id}
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 16px", background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--border)", borderRadius: "14px",
                    transition: "all 0.15s"
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(136,8,8,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div
                    onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                    style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(136,8,8,0.15)", border: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    {user.avatar_url ? <img src={user.avatar_url} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>}
                  </div>
                  <div
                    onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "14px" }}>{user.display_name || user.username}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>@{user.username}</div>
                    {user.bio && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.bio}</div>}
                  </div>
                  <button
                    onClick={() => handleFollow(user.id)}
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: "50px", padding: "8px 16px",
                      color: "#f87171", fontWeight: 800, fontSize: "12px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "5px",
                      transition: "all 0.2s", flexShrink: 0
                    }}
                  >
                    <UserMinus size={12} /> Unfollow
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DISCOVER PEOPLE TAB */}
      {activeTab === "discover" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)", pointerEvents: "none" }} />
            <input
              type="text" placeholder="Search by username..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
                borderRadius: "12px", padding: "11px 14px 11px 40px",
                color: "#fff", fontSize: "14px", outline: "none",
                fontFamily: "var(--font-heading)", fontWeight: 600,
              }}
              onFocus={e => e.target.style.borderColor = "rgba(136,8,8,0.5)"}
              onBlur={e => e.target.style.borderColor = "var(--border)"}
            />
            {searching && <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px", animation: "spin 0.8s linear infinite", display: "inline-block" }}>⟳</div>}
          </div>

          {!searchQuery && <div style={{ fontSize: "12px", fontWeight: 800, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested People</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {displayUsers.length === 0 && searchQuery ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)", fontSize: "14px" }}>No users found for "{searchQuery}"</div>
            ) : displayUsers.map(user => {
              const isFollowed = following.has(user.id);
              return (
                <div key={user.id} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", background: "rgba(255,255,255,0.02)",
                  border: "1px solid var(--border)", borderRadius: "14px",
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(136,8,8,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div
                    onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                    style={{ width: "44px", height: "44px", borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "rgba(136,8,8,0.15)", border: "1px solid var(--border)", cursor: "pointer" }}
                  >
                    {user.avatar_url ? <img src={user.avatar_url} alt={user.username} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> :
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>👤</div>}
                  </div>
                  <div
                    onClick={() => onOpenUserProfile && onOpenUserProfile(user)}
                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "14px" }}>{user.display_name || user.username}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>@{user.username}</div>
                    {user.bio && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.bio}</div>}
                  </div>
                  <button onClick={() => handleFollow(user.id)} style={{
                    background: isFollowed ? "rgba(239,68,68,0.1)" : "linear-gradient(135deg,#880808,#880808)",
                    border: isFollowed ? "1px solid rgba(239,68,68,0.3)" : "none",
                    borderRadius: "50px", padding: "8px 16px",
                    color: isFollowed ? "#f87171" : "#fff",
                    fontWeight: 800, fontSize: "12px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: "5px",
                    transition: "all 0.2s",
                    flexShrink: 0,
                  }}>
                    {isFollowed ? <><UserMinus size={12} /> Unfollow</> : <><UserPlus size={12} /> Follow</>}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Following count */}
          {following.size > 0 && (
            <div style={{ textAlign: "center", marginTop: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
              Following <strong style={{ color: "#c0392b" }}>{following.size}</strong> {following.size === 1 ? "person" : "people"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

