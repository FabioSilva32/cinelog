import React from 'react';
import { Trophy, CheckCircle2, Lock, Sparkles, Award } from 'lucide-react';
import { ACHIEVEMENTS, BORDER_STYLES, BADGE_COLORS } from '../utils/achievements';
import AvatarWithBorder from './AvatarWithBorder';

export default function AchievementsTab({ library, currentUser, onUpdateProfile }) {
  // Compute unlocked status
  const achievementsStatus = ACHIEVEMENTS.map(ach => {
    const currentVal = ach.check(library);
    const isUnlocked = currentVal >= ach.target;
    return {
      ...ach,
      currentVal,
      isUnlocked
    };
  });

  const unlockedBorders = new Set(['none']);
  achievementsStatus.forEach(ach => {
    if (ach.isUnlocked && ach.reward.borderId) {
      unlockedBorders.add(ach.reward.borderId);
    }
  });

  const equippedBorder = currentUser?.equippedBorder || 'none';

  const handleEquipBorder = (borderId) => {
    if (!unlockedBorders.has(borderId)) return;
    onUpdateProfile({
      equippedBorder: borderId
    });
  };

  return (
    <div className="animate-fade-in stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* ── HEADER INTRO ── */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '28px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(124,111,247,0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(245,158,11,0.06) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(124,111,247,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 16px rgba(251,191,36,0.1)' }}>
            <Trophy size={30} color="var(--gold)" />
          </div>
          <div>
            <h2 style={{ fontSize: '24px', letterSpacing: '-0.3px', margin: 0 }}>CineLog Achievements & Rewards</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '600px', lineHeight: 1.5 }}>
              Unlock special badges and glowing avatar borders as you log movies, write reviews, and explore different genres. Show off your cinephile rank!
            </p>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left column: Achievements List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={18} color="var(--accent)" />
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>Available Achievements</h3>
          </div>

          {achievementsStatus.map(ach => {
            const percent = Math.min(100, Math.round((ach.currentVal / ach.target) * 100));
            return (
              <div key={ach.id} className="glass" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden', opacity: ach.isUnlocked ? 1 : 0.85, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '3px' }}>
                    {ach.isUnlocked ? (
                      <CheckCircle2 size={22} color="var(--green)" fill="rgba(16,185,129,0.1)" />
                    ) : (
                      <Lock size={20} color="var(--text-dim)" />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <h4 style={{ fontSize: '15.5px', fontWeight: 800, margin: 0, color: ach.isUnlocked ? 'var(--text)' : 'var(--text-muted)' }}>{ach.title}</h4>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: ach.isUnlocked ? 'var(--accent)' : 'var(--text-dim)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: '4px' }}>
                        {ach.currentVal} / {ach.target}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>{ach.description}</p>
                    
                    {/* Progress Bar */}
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '12px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: ach.isUnlocked ? 'var(--green)' : 'var(--accent)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                    </div>

                    {/* Reward description */}
                    {ach.reward && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '11.5px', color: 'var(--text-dim)' }}>
                        <Sparkles size={11} color="var(--gold)" />
                        <span>Reward: <strong>{ach.reward.badgeName} Badge</strong> and <strong>{ach.reward.borderName}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── BORDER REWARDS SIDEBAR ── */}
        <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} color="var(--accent)" /> Avatar Border Wardrobe
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
              Equip unlocked borders on your profile avatar.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <AvatarWithBorder
              src={currentUser?.avatar}
              username={currentUser?.username}
              borderId={equippedBorder}
              size={72}
            />
            <span style={{ fontSize: '13.5px', fontWeight: 800, marginTop: '8px' }}>{currentUser?.displayName || 'CineLog Fan'}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>Previewing: {BORDER_STYLES[equippedBorder]?.name || 'Default Border'}</span>
          </div>

          {/* Borders Selector List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
            {Object.entries(BORDER_STYLES).map(([borderId, config]) => {
              const isUnlocked = unlockedBorders.has(borderId);
              const isEquipped = equippedBorder === borderId;

              // Find unlock source
              let unlockSource = '';
              if (!isUnlocked) {
                if (borderId === 'creator') {
                  unlockSource = 'Developer & Creator Perks';
                } else if (['cyber-violet', 'plasma-red', 'matrix-code', 'hyper-drive', 'royal-amethyst'].includes(borderId)) {
                  unlockSource = 'CinePoints Shop';
                } else {
                  const sourceAch = ACHIEVEMENTS.find(ach => ach.reward.borderId === borderId);
                  if (sourceAch) unlockSource = sourceAch.title;
                  else unlockSource = 'Special Achievement';
                }
              }

              return (
                <div key={borderId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: isEquipped ? 'rgba(124,111,247,0.06)' : 'rgba(255,255,255,0.01)', opacity: isUnlocked ? 1 : 0.7 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: isUnlocked ? '#fff' : 'var(--text-dim)' }}>{config.name}</span>
                    {!isUnlocked && (
                      <span style={{ fontSize: '9.5px', color: 'var(--text-dim)' }}>Lock: Unlock <strong>{unlockSource}</strong></span>
                    )}
                  </div>

                  <div>
                    {isEquipped ? (
                      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent)', background: 'rgba(124,111,247,0.15)', padding: '4px 10px', borderRadius: '4px' }}>Equipped</span>
                    ) : isUnlocked ? (
                      <button onClick={() => handleEquipBorder(borderId)} className="btn btn-ghost" style={{ padding: '4px 10px', fontSize: '11.5px', height: 'auto' }}>
                        Equip
                      </button>
                    ) : (
                      <Lock size={12} color="var(--text-dim)" style={{ marginRight: '8px' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
