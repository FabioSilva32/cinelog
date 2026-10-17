import React, { useMemo, useState } from 'react';
import { CalendarDays, Flame, TrendingUp, Award, ChevronLeft, ChevronRight, Film, BarChart3 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function WatchCalendarTab({ library = [], onMovieClick }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Helper: get the best date for a movie (watch_date for watched, date_added as fallback)
  const getMovieDate = (movie) => {
    if (movie.status === 'watched' && movie.watch_date) return movie.watch_date;
    return movie.date_added || null;
  };

  // Build a map of date => [movies]
  const dateMap = useMemo(() => {
    const map = {};
    library.forEach(movie => {
      const dateVal = getMovieDate(movie);
      if (!dateVal) return;
      const date = dateVal.slice(0, 10);
      if (!map[date]) map[date] = [];
      map[date].push(movie);
    });
    return map;
  }, [library]);

  // GitHub-style heatmap (52 weeks)
  const { weeks } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - 363);
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

    const weeks = [];
    let current = new Date(start);
    while (current <= today) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().slice(0, 10);
        week.push({
          date: new Date(current), dateStr,
          movies: dateMap[dateStr] || [],
          isFuture: current > today,
          isToday: current.toDateString() === today.toDateString(),
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks };
  }, [dateMap]);

  // Monthly calendar for detail view
  const monthCalendar = useMemo(() => {
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
    const year = target.getFullYear();
    const month = target.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, daysInMonth };
  }, [selectedMonthOffset]);

  // Stats
  const stats = useMemo(() => {
    const watched = library.filter(m => m.status === 'watched' && getMovieDate(m));
    const streakDays = new Set(watched.map(m => getMovieDate(m).slice(0, 10)));
    const streakArr = [...streakDays].sort();
    let best = 0, cur = 0, lastDate = null;
    for (const d of streakArr) {
      if (!lastDate) { cur = 1; }
      else {
        const diff = (new Date(d) - new Date(lastDate)) / 86400000;
        cur = diff === 1 ? cur + 1 : 1;
      }
      if (cur > best) best = cur;
      lastDate = d;
    }

    let todayStreak = 0;
    let checkDate = new Date();
    while (true) {
      const ds = checkDate.toISOString().slice(0, 10);
      if (streakDays.has(ds)) { todayStreak++; checkDate.setDate(checkDate.getDate() - 1); }
      else break;
    }

    const monthMap = {};
    watched.forEach(m => {
      const mo = getMovieDate(m).slice(0, 7);
      monthMap[mo] = (monthMap[mo] || 0) + 1;
    });
    let busiestMonth = '—', busiestCount = 0;
    Object.entries(monthMap).forEach(([m, c]) => { if (c > busiestCount) { busiestCount = c; busiestMonth = m; } });
    const [y, mo] = busiestMonth.split('-');
    const busiestLabel = busiestMonth !== '—' ? `${MONTHS[parseInt(mo) - 1]} ${y}` : '—';

    // Most watched day of week
    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    watched.forEach(m => dayCount[new Date(getMovieDate(m)).getDay()]++);
    const maxDay = dayCount.indexOf(Math.max(...dayCount));

    return { total: watched.length, currentStreak: todayStreak, bestStreak: best, busiestMonth: busiestLabel, favDay: DAYS[maxDay] };
  }, [library]);

  const getCellColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.04)';
    if (count === 1) return 'rgba(229,9,20,0.35)';
    if (count === 2) return 'rgba(229,9,20,0.6)';
    if (count === 3) return 'rgba(229,9,20,0.85)';
    return 'rgba(229,9,20,1)';
  };

  // Month labels for heatmap
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const month = week[0].date.getMonth();
      if (month !== lastMonth) { labels.push({ col: wi, label: MONTHS[month] }); lastMonth = month; }
    });
    return labels;
  }, [weeks]);

  const CELL = 13;
  const GAP = 3;

  // Monthly calendar date
  const getMonthDate = (day) => {
    const { year, month } = monthCalendar;
    if (!day) return '';
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Selected date's movies
  const selectedMovies = dateMap[selectedDate] || [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarDays size={24} color="var(--accent)" />
          Watch Calendar
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>
          Your personal cinema diary heatmap & monthly screening log.
        </p>
      </div>

      {/* Stats Row (Responsive Grid) */}
      <div className="calendar-stats-grid" style={{ display: 'grid', gap: '10px' }}>
        {[
          { label: 'Total Logged', value: stats.total, icon: <Award size={15} />, color: 'var(--accent)' },
          { label: 'Current Streak', value: `${stats.currentStreak}d`, icon: <Flame size={15} />, color: '#f97316' },
          { label: 'Best Streak', value: `${stats.bestStreak}d`, icon: <TrendingUp size={15} />, color: 'var(--green)' },
          { label: 'Busiest Month', value: stats.busiestMonth, icon: <CalendarDays size={15} />, color: 'var(--gold)' },
          { label: 'Fav Day', value: stats.favDay, icon: <Film size={15} />, color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '12px 14px', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '50px', height: '50px', background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: s.color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: '19px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Monthly Calendar Detail (Clean, Touch-Friendly) */}
      <div className="glass calendar-glass-card" style={{ borderRadius: '16px', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <CalendarDays size={16} color="var(--accent)" />
            {FULL_MONTHS[monthCalendar.month]} {monthCalendar.year}
          </h3>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              onClick={() => setSelectedMonthOffset(p => p - 1)}
              className="btn btn-ghost"
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => {
                setSelectedMonthOffset(0);
                setSelectedDate(new Date().toISOString().slice(0, 10));
              }}
              className="btn btn-secondary"
              style={{ padding: '5px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '8px' }}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedMonthOffset(p => p + 1)}
              disabled={selectedMonthOffset >= 0}
              className="btn btn-ghost"
              style={{ width: '32px', height: '32px', padding: 0, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: selectedMonthOffset >= 0 ? 0.3 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 7-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 800, textTransform: 'uppercase', padding: '2px 0 8px', letterSpacing: '0.05em' }}>
              {d.slice(0, 2)}
            </div>
          ))}
          {[...Array(monthCalendar.firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
          {[...Array(monthCalendar.daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = getMonthDate(day);
            const dayMovies = dateMap[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            const isSelected = selectedDate === dateStr;
            const hasMovies = dayMovies.length > 0;
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                style={{
                  borderRadius: '8px',
                  padding: '5px 2px',
                  minHeight: '42px',
                  textAlign: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                  background: isSelected
                    ? 'rgba(229,9,20,0.22)'
                    : isToday
                      ? 'rgba(229,9,20,0.1)'
                      : hasMovies
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(255,255,255,0.015)',
                  border: isSelected
                    ? '1.5px solid var(--accent)'
                    : isToday
                      ? '1px solid rgba(229,9,20,0.5)'
                      : hasMovies
                        ? '1px solid rgba(255,255,255,0.12)'
                        : '1px solid rgba(255,255,255,0.03)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{
                  fontSize: '11px',
                  fontWeight: isSelected || isToday ? 900 : 600,
                  color: isSelected || isToday ? '#FFFFFF' : hasMovies ? '#FFFFFF' : 'var(--text-muted)'
                }}>
                  {day}
                </div>

                {/* Mobile & Desktop Dots / Badge Indicator (Never overflows!) */}
                {hasMovies && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', marginTop: '2px' }}>
                    {dayMovies.length <= 3 ? (
                      dayMovies.map((_, mi) => (
                        <span
                          key={mi}
                          style={{
                            width: '4.5px',
                            height: '4.5px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            boxShadow: '0 0 5px rgba(229,9,20,0.8)'
                          }}
                        />
                      ))
                    ) : (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 900,
                        color: '#FFFFFF',
                        background: 'var(--accent)',
                        borderRadius: '6px',
                        padding: '0 4px',
                        lineHeight: '13px'
                      }}>
                        {dayMovies.length}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Day Film Details */}
        <div style={{
          marginTop: '18px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
              {selectedDate === new Date().toISOString().slice(0, 10) ? 'Today' : selectedDate}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              {selectedMovies.length} title{selectedMovies.length === 1 ? '' : 's'} logged
            </span>
          </div>

          {selectedMovies.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedMovies.map(m => (
                <div
                  key={m.id || m.tmdb_id}
                  onClick={() => onMovieClick && onMovieClick(m.tmdb_id || m.id, m.media_type || 'movie')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.025)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                >
                  {m.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${m.poster_path}`}
                      alt={m.title}
                      style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: '36px', height: '52px', borderRadius: '5px', background: '#202020', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Film size={16} color="#666" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                      {m.rating ? (
                        <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 800 }}>★ {Number(m.rating).toFixed(1)}</span>
                      ) : null}
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        {m.release_date ? m.release_date.slice(0, 4) : (m.media_type || 'Movie')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={15} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No screenings logged on this date.
            </div>
          )}
        </div>
      </div>

      {/* GitHub-style Heatmap (Touch-friendly scroller) */}
      <div className="glass calendar-glass-card" style={{ borderRadius: '16px', padding: '20px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <BarChart3 size={15} color="var(--accent)" />
          <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Yearly Activity Heatmap (52 Weeks)</h3>
        </div>

        <div className="calendar-heatmap-scroll" style={{ overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            {/* Month labels */}
            <div style={{ display: 'flex', marginLeft: '32px', marginBottom: '6px', position: 'relative', height: '16px' }}>
              {monthLabels.map(({ col, label }) => (
                <span key={`${label}-${col}`} style={{ position: 'absolute', left: `${col * (CELL + GAP)}px`, fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {label}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 0 }}>
              {/* Day labels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px`, marginRight: '8px' }}>
                {DAYS.map((d, i) => (
                  <div key={d} style={{ height: `${CELL}px`, width: '26px', fontSize: '9px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 600 }}>
                    {i % 2 === 1 ? d : ''}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ display: 'flex', gap: `${GAP}px` }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: `${GAP}px` }}>
                    {week.map(day => (
                      <div
                        key={day.dateStr}
                        onClick={() => setSelectedDate(day.dateStr)}
                        onMouseEnter={e => {
                          if (!day.isFuture && day.movies.length > 0) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({ day, x: rect.left, y: rect.top });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          width: `${CELL}px`, height: `${CELL}px`, borderRadius: '3px',
                          background: day.isFuture ? 'transparent' : getCellColor(day.movies.length),
                          border: day.isToday ? '1px solid var(--accent)' : day.isFuture ? 'none' : `1px solid rgba(255,255,255,${day.movies.length > 0 ? '0.1' : '0.03'})`,
                          cursor: day.movies.length > 0 ? 'pointer' : 'default',
                          transition: 'transform 0.1s, filter 0.1s',
                          boxShadow: day.movies.length > 3 ? '0 0 6px rgba(229,9,20,0.5)' : 'none',
                        }}
                        onMouseOver={e => { if (day.movies.length > 0) e.currentTarget.style.transform = 'scale(1.3)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = ''; }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>Less</span>
              {[0, 1, 2, 3, 4].map(n => (
                <div key={n} style={{ width: '11px', height: '11px', borderRadius: '3px', background: getCellColor(n), border: '1px solid rgba(255,255,255,0.07)' }} />
              ))}
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && tooltip.day.movies.length > 0 && (
        <div style={{
          position: 'fixed', left: `${Math.min(tooltip.x + 10, window.innerWidth - 250)}px`, top: `${tooltip.y - 10}px`,
          background: 'rgba(10,8,19,0.97)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px',
          backdropFilter: 'blur(16px)', zIndex: 900, pointerEvents: 'none', maxWidth: '260px', boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.15s ease-out',
          transform: 'translateY(-100%)',
        }}>
          <div style={{ fontWeight: 800, fontSize: '12px', color: 'var(--accent)', marginBottom: '8px' }}>
            {tooltip.day.dateStr} — {tooltip.day.movies.length} title{tooltip.day.movies.length > 1 ? 's' : ''}
          </div>
          {tooltip.day.movies.map(m => (
            <div key={m.id} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <span style={{ color: 'var(--gold)', fontWeight: 700 }}>★</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{m.title}</span>
              {m.rating && <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '11px', flexShrink: 0 }}>{Number(m.rating).toFixed(1)}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

