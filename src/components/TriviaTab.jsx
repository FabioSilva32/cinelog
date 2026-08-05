import React, { useState, useEffect, useRef } from 'react';
import { Trophy, HelpCircle, ArrowRight, Zap, RefreshCw, Award, Volume2, VolumeX } from 'lucide-react';
import { useToast } from './ToastSystem';

const TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "Who directed the 2010 mind-bending blockbuster 'Inception'?",
    options: ["Christopher Nolan", "Denis Villeneuve", "David Fincher", "Steven Spielberg"],
    answer: "Christopher Nolan",
    points: 100
  },
  {
    id: 2,
    question: "Which film won the Academy Award for Best Picture in 2020?",
    options: ["1917", "Parasite", "Joker", "Once Upon a Time in Hollywood"],
    answer: "Parasite",
    points: 100
  },
  {
    id: 3,
    question: "In which year was Christopher Nolan's space epic 'Interstellar' released?",
    options: ["2012", "2014", "2016", "2010"],
    answer: "2014",
    points: 100
  },
  {
    id: 4,
    question: "What is the primary genre classification of the French classic 'Amélie'?",
    options: ["Horror", "Sci-Fi", "Comedy & Romance", "Documentary"],
    answer: "Comedy & Romance",
    points: 100
  },
  {
    id: 5,
    question: "Who played the lead character Dom Cobb in 'Inception'?",
    options: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Tom Hardy", "Cillian Murphy"],
    answer: "Leonardo DiCaprio",
    points: 100
  },
  {
    id: 6,
    question: "Which of these is NOT a Studio Ghibli film?",
    options: ["Spirited Away", "My Neighbor Totoro", "Your Name", "Princess Mononoke"],
    answer: "Your Name",
    points: 100
  },
  {
    id: 7,
    question: "What is the highest-rated movie on IMDb?",
    options: ["The Godfather", "The Dark Knight", "The Shawshank Redemption", "Pulp Fiction"],
    answer: "The Shawshank Redemption",
    points: 100
  },
  {
    id: 8,
    question: "Who directed 'Pulp Fiction' and 'Django Unchained'?",
    options: ["Martin Scorsese", "Quentin Tarantino", "Stanley Kubrick", "Alfred Hitchcock"],
    answer: "Quentin Tarantino",
    points: 100
  },
  {
    id: 9,
    question: "Which movie is famously known for the quote: 'Here's looking at you, kid.'?",
    options: ["Casablanca", "Citizen Kane", "Gone with the Wind", "The Wizard of Oz"],
    answer: "Casablanca",
    points: 100
  },
  {
    id: 10,
    question: "Which actor played Joker in 'The Dark Knight' (2008)?",
    options: ["Joaquin Phoenix", "Heath Ledger", "Jared Leto", "Jack Nicholson"],
    answer: "Heath Ledger",
    points: 100
  }
];

export default function TriviaTab({ currentUser, onUpdateProfile }) {
  const toast = useToast();
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'ended'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(15);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const [claimed, setClaimed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);

  // Audio synthethizer for retro game sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        // High upbeat chime
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'wrong') {
        // Low sad buzzer sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'tick') {
        // Soft clock click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      }
    } catch (e) {
      console.warn("Audio Context failed:", e);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    setTimer(15);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null, true); // Timeout
          return 0;
        }
        if (prev <= 5) {
          playSound('tick');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIdx, gameState]);

  const handleStartGame = () => {
    setGameState('playing');
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setCorrectAnswers(0);
    setSelectedOption(null);
    setFlash(null);
    setClaimed(false);
  };

  const handleAnswer = (option, isTimeout = false) => {
    if (selectedOption !== null) return; // Prevent double clicking
    clearInterval(timerRef.current);

    const question = TRIVIA_QUESTIONS[currentIdx];
    setSelectedOption(option);

    if (!isTimeout && option === question.answer) {
      const timeBonus = timer; // 1 point per remaining second
      const basePoints = question.points;
      const streakMultiplier = Math.min(2.0, 1.0 + (streak * 0.1));
      const addedScore = Math.round((basePoints + timeBonus) * streakMultiplier);

      setScore(prev => prev + addedScore);
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      setFlash('correct');
      playSound('correct');
    } else {
      setStreak(0);
      setFlash('wrong');
      playSound('wrong');
    }

    // Go to next question after delay
    setTimeout(() => {
      setFlash(null);
      setSelectedOption(null);
      if (currentIdx < TRIVIA_QUESTIONS.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setGameState('ended');
      }
    }, 1800);
  };

  const handleClaimPoints = () => {
    if (claimed) return;
    const earnedPoints = Math.round(score * 0.1);
    if (earnedPoints > 0) {
      const currentTriviaPoints = currentUser?.triviaCinePoints || 0;
      onUpdateProfile({
        ...currentUser,
        triviaCinePoints: currentTriviaPoints + earnedPoints
      });
      toast.success("CinePoints Claimed!", `+🪙 ${earnedPoints} CinePoints added to your profile.`);
      setClaimed(true);
    } else {
      toast.info("No Points to Claim", "Try to score higher in the next round!");
    }
  };

  const LEADERBOARD = [
    { name: currentUser?.displayName || "You", score: score, isUser: true, avatar: currentUser?.avatar },
    { name: "Stanislav K.", score: 980, avatar: "/avatar_cinephile.png" },
    { name: "Aria Vance", score: 850, avatar: "/avatar_critic.png" },
    { name: "Yuki Sato", score: 620, avatar: "/avatar_watcher.png" }
  ].sort((a, b) => b.score - a.score);

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', minHeight: 'calc(100vh - 160px)', alignItems: 'start' }}>
      
      {/* Main Game Screen */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '480px', transition: 'all 0.3s' }}>
        
        {/* Flash overlay for feedback */}
        {flash === 'correct' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(16,185,129,0.08)', border: '2px solid var(--green)', borderRadius: 'var(--radius-xl)', pointerEvents: 'none', zIndex: 10, animation: 'pulse 1.8s infinite' }} />
        )}
        {flash === 'wrong' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.08)', border: '2px solid var(--red)', borderRadius: 'var(--radius-xl)', pointerEvents: 'none', zIndex: 10, animation: 'shake 0.4s' }} />
        )}

        {/* Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HelpCircle size={18} color="var(--accent)" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CineLog Trivia</span>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>

        {gameState === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(124,111,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124,111,247,0.3)', marginBottom: '8px', boxShadow: '0 0 20px rgba(124,111,247,0.2)' }}>
              <Trophy size={32} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>Daily Movie Trivia Challenge</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px', maxWidth: '420px', lineHeight: 1.6 }}>
              Test your cinema knowledge across director catalogs, cast selections, and historical facts. Answer faster to build streaks and multipliers!
            </p>
            <div style={{ display: 'flex', gap: '16px', background: 'rgba(255,255,255,0.02)', padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12.5px', color: 'var(--text-dim)' }}>
              <span>⏱ 15s Per Question</span>
              <span>🔥 Answer Streaks</span>
              <span>🪙 Claim CinePoints</span>
            </div>
            <button className="btn btn-primary" onClick={handleStartGame} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', fontSize: '14.5px', marginTop: '8px' }}>
              Play Challenge <ArrowRight size={16} />
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 700 }}>
              <span>Question {currentIdx + 1} of {TRIVIA_QUESTIONS.length}</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'var(--gold)' }}>★ Score: {score}</span>
                {streak > 0 && <span style={{ color: '#ef4444' }}>🔥 Streak: {streak}x</span>}
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '32px', position: 'relative' }}>
              <div style={{ height: '100%', width: `${(timer / 15) * 100}%`, background: timer > 5 ? 'linear-gradient(to right, var(--accent), #b87cf8)' : 'linear-gradient(to right, var(--red), #ef4444)', transition: 'width 1s linear', borderRadius: '3px' }} />
            </div>

            {/* Question title */}
            <h3 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.5, marginBottom: '32px', minHeight: '54px' }}>
              {TRIVIA_QUESTIONS[currentIdx].question}
            </h3>

            {/* Options grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: 'auto' }}>
              {TRIVIA_QUESTIONS[currentIdx].options.map(option => {
                const isSelected = selectedOption === option;
                const isCorrect = option === TRIVIA_QUESTIONS[currentIdx].answer;
                const showResults = selectedOption !== null;

                let background = 'rgba(255,255,255,0.02)';
                let borderColor = 'var(--border)';
                let textColor = '#fff';

                if (showResults) {
                  if (isCorrect) {
                    background = 'rgba(16,185,129,0.12)';
                    borderColor = 'var(--green)';
                    textColor = 'var(--green)';
                  } else if (isSelected) {
                    background = 'rgba(239,68,68,0.12)';
                    borderColor = 'var(--red)';
                    textColor = 'var(--red)';
                  } else {
                    background = 'rgba(255,255,255,0.01)';
                    borderColor = 'rgba(255,255,255,0.04)';
                    textColor = 'var(--text-dim)';
                  }
                }

                return (
                  <button
                    key={option}
                    disabled={showResults}
                    onClick={() => handleAnswer(option)}
                    style={{
                      background,
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      padding: '16px 20px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: showResults ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'left',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={e => {
                      if (!showResults) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.background = 'rgba(124,111,247,0.04)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!showResults) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      }
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'ended' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)', marginBottom: '8px', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
              <Award size={28} color="var(--green)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Challenge Completed!</h2>
            <div style={{ display: 'flex', gap: '24px', margin: '8px 0' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Correct</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green)', marginTop: '2px' }}>{correctAnswers} / 10</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Final Score</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--gold)', marginTop: '2px' }}>{score}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Points Earned</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--accent)', marginTop: '2px' }}>🪙 {Math.round(score * 0.1)}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button disabled={claimed || Math.round(score * 0.1) === 0} className="btn btn-primary" onClick={handleClaimPoints} style={{ opacity: claimed ? 0.5 : 1, cursor: claimed ? 'default' : 'pointer' }}>
                {claimed ? "✓ Points Claimed" : "Claim CinePoints"}
              </button>
              <button className="btn btn-secondary" onClick={handleStartGame} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Sidebar */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
          🏆 Top Scorers
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {LEADERBOARD.map((item, idx) => (
            <div
              key={item.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: item.isUser ? 'rgba(124,111,247,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${item.isUser ? 'rgba(124,111,247,0.2)' : 'var(--border)'}`,
                borderRadius: '8px'
              }}
            >
              <span style={{ fontSize: '12.5px', fontWeight: 900, width: '18px', color: idx === 0 ? 'var(--gold)' : 'var(--text-dim)' }}>
                #{idx + 1}
              </span>
              
              {item.avatar ? (
                <img src={item.avatar} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: item.isUser ? '1.5px solid var(--accent)' : '1.5px solid var(--border)' }} />
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>👤</div>
              )}

              <span style={{ fontSize: '13px', fontWeight: item.isUser ? 800 : 600, color: item.isUser ? '#fff' : 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>

              <span style={{ fontSize: '12.5px', fontWeight: 800, color: 'var(--gold)' }}>
                {item.score} pts
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
