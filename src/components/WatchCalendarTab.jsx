import React, { useMemo, useState } from 'react';
import { CalendarDays, Flame, TrendingUp, Award, ChevronLeft, ChevronRight, Film, BarChart3 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function WatchCalendarTab({ library = [], onMovieClick }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month

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
    if (count === 1) return 'rgba(136,8,8,0.28)';
    if (count === 2) return 'rgba(136,8,8,0.52)';
    if (count === 3) return 'rgba(136,8,8,0.75)';
    return 'rgba(136,8,8,1)';
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontSize: '26px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CalendarDays size={24} color="var(--accent)" />
          Watch Calendar
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13.5px' }}>
          Your personal cinema heatmap. Darker squares = more movies watched that day.
        </p>
      </div>

      {/* Stats Row */}
      <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Logged', value: stats.total, icon: <Award size={16} />, color: 'var(--accent)' },
          { label: 'Current Streak', value: `${stats.currentStreak} days`, icon: <Flame size={16} />, color: '#f97316' },
          { label: 'Best Streak', value: `${stats.bestStreak} days`, icon: <TrendingUp size={16} />, color: 'var(--green)' },
          { label: 'Busiest Month', value: stats.busiestMonth, icon: <CalendarDays size={16} />, color: 'var(--gold)' },
          { label: 'Fav Day', value: stats.favDay, icon: <Film size={16} />, color: 'var(--blue)' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '16px 18px', borderRadius: 'var(--radius)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '60px', height: '60px', background: `radial-gradient(circle, ${s.color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: s.color, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-heading)', letterSpacing: '-0.5px' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* GitHub-style Heatmap */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <BarChart3 size={16} color="var(--accent)" />
          <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Viewing Heatmap — Last 52 Weeks</h3>
        </div>

        <div className="calendar-heatmap-scroll" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
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
                          boxShadow: day.movies.length > 3 ? '0 0 6px rgba(136,8,8,0.5)' : 'none',
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
                <div key={n} style={{ width: '12px', height: '12px', borderRadius: '3px', background: getCellColor(n), border: '1px solid rgba(255,255,255,0.07)' }} />
              ))}
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Calendar Detail */}
      <div className="glass" style={{ borderRadius: 'var(--radius-lg)', padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={16} color="var(--accent)" />
            {FULL_MONTHS[monthCalendar.month]} {monthCalendar.year}
          </h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setSelectedMonthOffset(p => p - 1)}
              className="btn btn-ghost" style={{ padding: '6px 10px', borderRadius: '8px' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setSelectedMonthOffset(0)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>Today</button>
            <button
              onClick={() => setSelectedMonthOffset(p => p + 1)}
              disabled={selectedMonthOffset >= 0}
              className="btn btn-ghost" style={{ padding: '6px 10px', borderRadius: '8px', opacity: selectedMonthOffset >= 0 ? 0.4 : 1 }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: '10px', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', padding: '4px 0 10px', letterSpacing: '0.05em' }}>
              {d.slice(0, 2)}
            </div>
          ))}
          {[...Array(monthCalendar.firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
          {[...Array(monthCalendar.daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dateStr = getMonthDate(day);
            const dayMovies = dateMap[dateStr] || [];
            const isToday = dateStr === new Date().toISOString().slice(0, 10);
            const hasMovies = dayMovies.length > 0;
            return (
              <div
                key={day}
                style={{
                  borderRadius: '8px', padding: '6px 4px', minHeight: '50px', textAlign: 'center', position: 'relative', cursor: hasMovies ? 'pointer' : 'default',
                  background: isToday ? 'rgba(136,8,8,0.15)' : hasMovies ? 'rgba(136,8,8,0.07)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isToday ? 'rgba(136,8,8,0.5)' : hasMovies ? 'rgba(136,8,8,0.2)' : 'rgba(255,255,255,0.04)'}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (hasMovies) { e.currentTarget.style.background = 'rgba(136,8,8,0.15)'; setHoveredCell(dateStr); } }}
                onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(136,8,8,0.15)' : hasMovies ? 'rgba(136,8,8,0.07)' : 'rgba(255,255,255,0.02)'; setHoveredCell(null); }}
              >
                <div style={{ fontSize: '11px', fontWeight: isToday ? 900 : 600, color: isToday ? 'var(--accent)' : hasMovies ? 'var(--text)' : 'var(--text-muted)', marginBottom: '3px' }}>{day}</div>
                {dayMovies.slice(0, 2).map((m, mi) => (
                  <div key={mi} style={{ fontSize: '9px', background: 'rgba(136,8,8,0.2)', borderRadius: '3px', padding: '1px 3px', marginBottom: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#c0392b', fontWeight: 600 }}>
                    {m.title}
                  </div>
                ))}
                {dayMovies.length > 2 && (
                  <div style={{ fontSize: '8px', color: 'var(--text-dim)', fontWeight: 700 }}>+{dayMovies.length - 2} more</div>
                )}
              </div>
            );
          })}
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

