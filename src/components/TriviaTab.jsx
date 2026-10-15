import React, { useState, useEffect, useRef } from 'react';
import { Trophy, HelpCircle, ArrowRight, Zap, RefreshCw, Award, Volume2, VolumeX, Sparkles, User, History, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from './ToastSystem';

export const ALL_TRIVIA_QUESTIONS = [
  {
    id: 1,
    question: "Who directed the 2010 mind-bending blockbuster 'Inception'?",
    options: ["Christopher Nolan", "Denis Villeneuve", "David Fincher", "Steven Spielberg"],
    answer: "Christopher Nolan",
    points: 100
  },
  {
    id: 2,
    question: "Which film won the Academy Award for Best Picture in 2020, becoming the first non-English film to do so?",
    options: ["Parasite", "1917", "Joker", "Once Upon a Time in Hollywood"],
    answer: "Parasite",
    points: 100
  },
  {
    id: 3,
    question: "In which year was Christopher Nolan's space epic 'Interstellar' released in theaters?",
    options: ["2014", "2012", "2016", "2010"],
    answer: "2014",
    points: 100
  },
  {
    id: 4,
    question: "What is the primary genre classification of the French classic 'Amélie'?",
    options: ["Comedy & Romance", "Horror & Gore", "Sci-Fi Thriller", "Historical War Drama"],
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
    question: "Which of these famous anime films is NOT produced by Studio Ghibli?",
    options: ["Your Name", "Spirited Away", "My Neighbor Totoro", "Princess Mononoke"],
    answer: "Your Name",
    points: 100
  },
  {
    id: 7,
    question: "What is the highest-rated movie of all time on IMDb's Top 250 list?",
    options: ["The Shawshank Redemption", "The Godfather", "The Dark Knight", "Pulp Fiction"],
    answer: "The Shawshank Redemption",
    points: 100
  },
  {
    id: 8,
    question: "Who directed 'Pulp Fiction', 'Reservoir Dogs', and 'Django Unchained'?",
    options: ["Quentin Tarantino", "Martin Scorsese", "Stanley Kubrick", "Alfred Hitchcock"],
    answer: "Quentin Tarantino",
    points: 100
  },
  {
    id: 9,
    question: "Which film is famously known for the line: 'Here's looking at you, kid.'?",
    options: ["Casablanca", "Citizen Kane", "Gone with the Wind", "The Wizard of Oz"],
    answer: "Casablanca",
    points: 100
  },
  {
    id: 10,
    question: "Which actor posthumously won an Oscar for playing the Joker in 'The Dark Knight' (2008)?",
    options: ["Heath Ledger", "Joaquin Phoenix", "Jared Leto", "Jack Nicholson"],
    answer: "Heath Ledger",
    points: 100
  },
  {
    id: 11,
    question: "Which film shares the record for the most Academy Award wins (11 Oscars) alongside Titanic & Ben-Hur?",
    options: ["The Lord of the Rings: The Return of the King", "La La Land", "Avatar", "West Side Story"],
    answer: "The Lord of the Rings: The Return of the King",
    points: 100
  },
  {
    id: 12,
    question: "Who directed the groundbreaking 1968 sci-fi masterpiece '2001: A Space Odyssey'?",
    options: ["Stanley Kubrick", "Ridley Scott", "George Lucas", "Andrei Tarkovsky"],
    answer: "Stanley Kubrick",
    points: 100
  },
  {
    id: 13,
    question: "What is the name of the fictional African kingdom in Marvel's 'Black Panther'?",
    options: ["Wakanda", "Zamunda", "Genovia", "Latveria"],
    answer: "Wakanda",
    points: 100
  },
  {
    id: 14,
    question: "Which legendary composer created the scores for 'Interstellar', 'Gladiator', and 'Inception'?",
    options: ["Hans Zimmer", "John Williams", "Ennio Morricone", "Howard Shore"],
    answer: "Hans Zimmer",
    points: 100
  },
  {
    id: 15,
    question: "Who starred as protagonist Travis Bickle in Martin Scorsese's 'Taxi Driver' (1976)?",
    options: ["Robert De Niro", "Al Pacino", "Joe Pesci", "Dustin Hoffman"],
    answer: "Robert De Niro",
    points: 100
  },
  {
    id: 16,
    question: "What color pill does Neo take to wake up from the simulated reality in 'The Matrix' (1999)?",
    options: ["Red Pill", "Blue Pill", "Green Pill", "Black Pill"],
    answer: "Red Pill",
    points: 100
  },
  {
    id: 17,
    question: "Which 1994 animated Disney classic features iconic songs composed by Elton John and Tim Rice?",
    options: ["The Lion King", "Aladdin", "Beauty and the Beast", "Tarzan"],
    answer: "The Lion King",
    points: 100
  },
  {
    id: 18,
    question: "Who directed the psychological thrillers 'Fight Club', 'Se7en', and 'Zodiac'?",
    options: ["David Fincher", "Christopher Nolan", "Darren Aronofsky", "Denis Villeneuve"],
    answer: "David Fincher",
    points: 100
  },
  {
    id: 19,
    question: "Which actor portrays the eccentric southern sleuth Benoit Blanc in Rian Johnson's 'Knives Out'?",
    options: ["Daniel Craig", "Chris Evans", "Edward Norton", "Michael Shannon"],
    answer: "Daniel Craig",
    points: 100
  },
  {
    id: 20,
    question: "Which classic mob film opens with the famous line: 'I believe in America.'?",
    options: ["The Godfather", "Goodfellas", "Casino", "Scarface"],
    answer: "The Godfather",
    points: 100
  },
  {
    id: 21,
    question: "What is the name of the secluded winter hotel where 'The Shining' takes place?",
    options: ["The Overlook Hotel", "The Bates Motel", "The Continental", "The Grand Budapest"],
    answer: "The Overlook Hotel",
    points: 100
  },
  {
    id: 22,
    question: "Which film won the Best Animated Feature Oscar in 2003, directed by Hayao Miyazaki?",
    options: ["Spirited Away", "Howl's Moving Castle", "Princess Mononoke", "Ponyo"],
    answer: "Spirited Away",
    points: 100
  },
  {
    id: 23,
    question: "Who portrayed the complex physicist J. Robert Oppenheimer in Christopher Nolan's 2023 biopic?",
    options: ["Cillian Murphy", "Matt Damon", "Robert Downey Jr.", "Kenneth Branagh"],
    answer: "Cillian Murphy",
    points: 100
  },
  {
    id: 24,
    question: "Which classic 1975 thriller directed by Steven Spielberg popularized the modern summer blockbuster?",
    options: ["Jaws", "Jurassic Park", "Close Encounters", "Raiders of the Lost Ark"],
    answer: "Jaws",
    points: 100
  },
  {
    id: 25,
    question: "What is the name of the replicant hunter played by Harrison Ford in 1982's 'Blade Runner'?",
    options: ["Rick Deckard", "Roy Batty", "John Connor", "Ellen Ripley"],
    answer: "Rick Deckard",
    points: 100
  },
  {
    id: 26,
    question: "Which movie won 7 Oscars in 2023 including Best Picture and Best Actress for Michelle Yeoh?",
    options: ["Everything Everywhere All At Once", "The Banshees of Inisherin", "Tár", "Top Gun: Maverick"],
    answer: "Everything Everywhere All At Once",
    points: 100
  },
  {
    id: 27,
    question: "Who directed the visionary sci-fi epics 'Dune' (2021) and 'Blade Runner 2049'?",
    options: ["Denis Villeneuve", "Christopher Nolan", "Ridley Scott", "Alex Garland"],
    answer: "Denis Villeneuve",
    points: 100
  },
  {
    id: 28,
    question: "In 'Pulp Fiction', what is the name of the restaurant with the famous dance contest?",
    options: ["Jack Rabbit Slim's", "The Big Kahuna", "Route 66 Diner", "El Rancho"],
    answer: "Jack Rabbit Slim's",
    points: 100
  },
  {
    id: 29,
    question: "Which actress played the glamorous Holly Golightly in 'Breakfast at Tiffany's' (1961)?",
    options: ["Audrey Hepburn", "Grace Kelly", "Marilyn Monroe", "Elizabeth Taylor"],
    answer: "Audrey Hepburn",
    points: 100
  },
  {
    id: 30,
    question: "What is the name of the commercial towing vessel spaceship in Ridley Scott's 'Alien' (1979)?",
    options: ["USCSS Nostromo", "USS Sulaco", "Discovery One", "Millennium Falcon"],
    answer: "USCSS Nostromo",
    points: 100
  },
  {
    id: 31,
    question: "Who composed the iconic musical themes for 'Star Wars', 'Indiana Jones', and 'Jurassic Park'?",
    options: ["John Williams", "Hans Zimmer", "Danny Elfman", "James Horner"],
    answer: "John Williams",
    points: 100
  },
  {
    id: 32,
    question: "Which 1999 psychological thriller ends with the iconic line 'I see dead people'?",
    options: ["The Sixth Sense", "Unbreakable", "The Others", "Shutter Island"],
    answer: "The Sixth Sense",
    points: 100
  },
  {
    id: 33,
    question: "Who won Best Director for 'The Shape of Water' (2017) and also directed 'Pan's Labyrinth'?",
    options: ["Guillermo del Toro", "Alfonso Cuarón", "Alejandro G. Iñárritu", "Pedro Almodóvar"],
    answer: "Guillermo del Toro",
    points: 100
  },
  {
    id: 34,
    question: "What fictional bioengineering corporation created the dinosaurs in 'Jurassic Park'?",
    options: ["InGen", "Weyland-Yutani", "Cyberdyne Systems", "Tyrell Corporation"],
    answer: "InGen",
    points: 100
  },
  {
    id: 35,
    question: "Which actor delivered the famous improvised line 'Look at me, I'm the captain now' in 'Captain Phillips'?",
    options: ["Barkhad Abdi", "Tom Hanks", "Forest Whitaker", "Idris Elba"],
    answer: "Barkhad Abdi",
    points: 100
  },
  {
    id: 36,
    question: "Which Pixar movie features the emotional opening montage set to 'Married Life'?",
    options: ["Up", "WALL-E", "Ratatouille", "Coco"],
    answer: "Up",
    points: 100
  },
  {
    id: 37,
    question: "Who directed the high-intensity drumming drama 'Whiplash' (2014)?",
    options: ["Damien Chazelle", "Jordan Peele", "Greta Gerwig", "Barry Jenkins"],
    answer: "Damien Chazelle",
    points: 100
  },
  {
    id: 38,
    question: "Which actress starred as the titular doll in Greta Gerwig's record-setting 2023 film 'Barbie'?",
    options: ["Margot Robbie", "Emma Stone", "Florence Pugh", "Saoirse Ronan"],
    answer: "Margot Robbie",
    points: 100
  },
  {
    id: 39,
    question: "In 'The Lord of the Rings', what is the name of the volcanic mountain where the One Ring must be destroyed?",
    options: ["Mount Doom", "Erebor", "Caradhras", "Gundabad"],
    answer: "Mount Doom",
    points: 100
  },
  {
    id: 40,
    question: "What is the famous first rule of Fight Club in David Fincher's 1999 adaptation?",
    options: ["You do not talk about Fight Club", "Always wear gloves", "No weapons allowed", "Only two guys to a fight"],
    answer: "You do not talk about Fight Club",
    points: 100
  },
  {
    id: 41,
    question: "Who directed the spine-chilling 1960 shower-scene thriller 'Psycho'?",
    options: ["Alfred Hitchcock", "Stanley Kubrick", "Roman Polanski", "William Friedkin"],
    answer: "Alfred Hitchcock",
    points: 100
  },
  {
    id: 42,
    question: "Which 1985 sci-fi classic features a plutonium-powered DeLorean traveling through time?",
    options: ["Back to the Future", "Ghostbusters", "The Terminator", "Bill & Ted's Excellent Adventure"],
    answer: "Back to the Future",
    points: 100
  },
  {
    id: 43,
    question: "What profession does Jordan Belfort practice in Martin Scorsese's 'The Wolf of Wall Street'?",
    options: ["Stockbroker", "Real Estate Mogul", "Hedge Fund Analyst", "Corporate Lawyer"],
    answer: "Stockbroker",
    points: 100
  },
  {
    id: 44,
    question: "Which drama won the 2017 Best Picture Oscar after the infamous wrong envelope announcement?",
    options: ["Moonlight", "La La Land", "Manchester by the Sea", "Arrival"],
    answer: "Moonlight",
    points: 100
  },
  {
    id: 45,
    question: "Which actor played Don Vito Corleone in Francis Ford Coppola's 'The Godfather' (1972)?",
    options: ["Marlon Brando", "Robert De Niro", "Al Pacino", "James Caan"],
    answer: "Marlon Brando",
    points: 100
  },
  {
    id: 46,
    question: "In Christopher Nolan's 'Interstellar', what is the name of the witty ex-military robot companion?",
    options: ["TARS", "CASE", "HAL 9000", "K-2SO"],
    answer: "TARS",
    points: 100
  },
  {
    id: 47,
    question: "Which Pixar movie tells the story of a lonely waste-collecting robot left on a deserted Earth?",
    options: ["WALL-E", "Big Hero 6", "The Iron Giant", "Robots"],
    answer: "WALL-E",
    points: 100
  },
  {
    id: 48,
    question: "Who wrote and directed the modern horror films 'Get Out', 'Us', and 'Nope'?",
    options: ["Jordan Peele", "Ari Aster", "Ryan Coogler", "Spike Lee"],
    answer: "Jordan Peele",
    points: 100
  },
  {
    id: 49,
    question: "Which 1977 movie immortalized the cultural phrase 'May the Force be with you'?",
    options: ["Star Wars: Episode IV - A New Hope", "Star Trek: The Motion Picture", "Close Encounters of the Third Kind", "Alien"],
    answer: "Star Wars: Episode IV - A New Hope",
    points: 100
  },
  {
    id: 50,
    question: "Who won the Best Actor Oscar for his gripping performance as Arthur Fleck in 'Joker' (2019)?",
    options: ["Joaquin Phoenix", "Christian Bale", "Willem Dafoe", "Adam Driver"],
    answer: "Joaquin Phoenix",
    points: 100
  }
];

// Helper to shuffle questions & options
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const getRandomRound = (count = 10) => {
  return shuffle(ALL_TRIVIA_QUESTIONS).slice(0, count).map(q => ({
    ...q,
    options: shuffle(q.options)
  }));
};

export default function TriviaTab({ currentUser, onUpdateProfile }) {
  const toast = useToast();
  const [gameState, setGameState] = useState('start'); // 'start' | 'playing' | 'ended'
  const [activeQuestions, setActiveQuestions] = useState(() => getRandomRound(10));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(15);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [flash, setFlash] = useState(null); // 'correct' | 'wrong' | null
  const [claimed, setClaimed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Local storage personal record and play history (No fake bots)
  const [triviaStats, setTriviaStats] = useState(() => {
    try {
      const saved = localStorage.getItem('cinelog_trivia_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      highScore: 0,
      gamesPlayed: 0,
      totalPointsEarned: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      recentRuns: []
    };
  });

  const timerRef = useRef(null);

  // Audio synthesizer for retro game sound effects
  const playSound = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'tick') {
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
          handleAnswer(null, true);
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
    const roundQuestions = getRandomRound(10);
    setActiveQuestions(roundQuestions);
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
    if (selectedOption !== null) return;
    clearInterval(timerRef.current);

    const question = activeQuestions[currentIdx];
    setSelectedOption(option);

    let nextScore = score;
    let nextCorrect = correctAnswers;

    if (!isTimeout && option === question.answer) {
      const timeBonus = timer;
      const basePoints = question.points;
      const streakMultiplier = Math.min(2.0, 1.0 + (streak * 0.1));
      const addedScore = Math.round((basePoints + timeBonus) * streakMultiplier);

      nextScore = score + addedScore;
      nextCorrect = correctAnswers + 1;
      setScore(nextScore);
      setStreak(prev => prev + 1);
      setCorrectAnswers(nextCorrect);
      setFlash('correct');
      playSound('correct');
    } else {
      setStreak(0);
      setFlash('wrong');
      playSound('wrong');
    }

    // Go to next question or complete game
    setTimeout(() => {
      setFlash(null);
      setSelectedOption(null);
      if (currentIdx < activeQuestions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      } else {
        // Round Finished: Record stats to LocalStorage
        setGameState('ended');
        saveGameResult(nextScore, nextCorrect, activeQuestions.length);
      }
    }, 1800);
  };

  const saveGameResult = (finalScore, finalCorrect, totalQ) => {
    setTriviaStats(prev => {
      const newHigh = Math.max(prev.highScore || 0, finalScore);
      const newRuns = [
        {
          date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          score: finalScore,
          correct: `${finalCorrect}/${totalQ}`
        },
        ...(prev.recentRuns || [])
      ].slice(0, 5);

      const updated = {
        highScore: newHigh,
        gamesPlayed: (prev.gamesPlayed || 0) + 1,
        totalPointsEarned: prev.totalPointsEarned || 0,
        totalCorrect: (prev.totalCorrect || 0) + finalCorrect,
        totalQuestions: (prev.totalQuestions || 0) + totalQ,
        recentRuns: newRuns
      };

      try {
        localStorage.setItem('cinelog_trivia_stats', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
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

      // Update total points earned in triviaStats
      setTriviaStats(prev => {
        const updated = {
          ...prev,
          totalPointsEarned: (prev.totalPointsEarned || 0) + earnedPoints
        };
        try {
          localStorage.setItem('cinelog_trivia_stats', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      toast.success("CinePoints Claimed!", `+🪙 ${earnedPoints} CinePoints added to your profile.`);
      setClaimed(true);
    } else {
      toast.info("No Points to Claim", "Score higher in the next round to claim CinePoints!");
    }
  };

  const currentQuestion = activeQuestions[currentIdx] || activeQuestions[0];
  const accuracyPct = triviaStats.totalQuestions > 0
    ? Math.round((triviaStats.totalCorrect / triviaStats.totalQuestions) * 100)
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', minHeight: 'calc(100vh - 160px)', alignItems: 'start' }}>
      
      {/* Main Game Screen */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '36px', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '500px', transition: 'all 0.3s' }}>
        
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
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-muted)' }}>
              Pool: {ALL_TRIVIA_QUESTIONS.length} Questions
            </span>
          </div>
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', padding: '6px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>

        {/* Game State Screens */}
        {gameState === 'start' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(136,8,8,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(136,8,8,0.3)', boxShadow: '0 0 24px rgba(136,8,8,0.2)' }}>
              <Trophy size={30} color="var(--accent)" />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '8px' }}>Cinema Trivia Challenge</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', lineHeight: 1.6 }}>
                Test your movie knowledge across legendary directors, Academy Award winners, cult classics, and cinematic history. Every round is randomly selected from our 50-question vault!
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <span>⏱ 15s Per Question</span>
              <span>🔥 Answer Streaks</span>
              <span>🪙 Claim CinePoints</span>
            </div>
            <button className="btn btn-primary" onClick={handleStartGame} style={{ padding: '12px 32px', fontSize: '15px', fontWeight: 800, marginTop: '8px' }}>
              Play Challenge <ArrowRight size={16} style={{ marginLeft: '6px', display: 'inline' }} />
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* Stats row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 700 }}>
              <span>Question {currentIdx + 1} of {activeQuestions.length}</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ color: 'var(--gold)' }}>★ Score: {score}</span>
                {streak > 0 && <span style={{ color: '#ef4444' }}>🔥 Streak: {streak}x</span>}
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '28px', position: 'relative' }}>
              <div style={{ height: '100%', width: `${(timer / 15) * 100}%`, background: timer > 5 ? 'linear-gradient(to right, var(--accent), #c0392b)' : 'linear-gradient(to right, var(--red), #ef4444)', transition: 'width 1s linear', borderRadius: '3px' }} />
            </div>

            {/* Question title */}
            <h3 style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.5, marginBottom: '28px', minHeight: '54px' }}>
              {currentQuestion.question}
            </h3>

            {/* Options grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: 'auto' }}>
              {currentQuestion.options.map(option => {
                const isSelected = selectedOption === option;
                const isCorrect = option === currentQuestion.answer;
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
                        e.currentTarget.style.background = 'rgba(136,8,8,0.04)';
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
            <h2 style={{ fontSize: '22px', fontWeight: 900 }}>Round Completed!</h2>
            <div style={{ display: 'flex', gap: '24px', margin: '8px 0', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 20px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Correct</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--green)', marginTop: '2px' }}>{correctAnswers} / {activeQuestions.length}</div>
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
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
              <button disabled={claimed || Math.round(score * 0.1) === 0} className="btn btn-primary" onClick={handleClaimPoints} style={{ opacity: claimed ? 0.5 : 1, cursor: claimed ? 'default' : 'pointer' }}>
                {claimed ? "✓ Points Claimed" : "Claim CinePoints"}
              </button>
              <button className="btn btn-secondary" onClick={handleStartGame} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={14} /> New Random Round
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Real Player Record & Statistics Sidebar */}
      <div className="glass" style={{ borderRadius: 'var(--radius-xl)', padding: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* User Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }} />
          ) : (
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
              <User size={20} color="var(--text-muted)" />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '14.5px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentUser?.displayName || "Player Record"}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🪙 {currentUser?.triviaCinePoints || 0} CinePoints</span>
            </div>
          </div>
        </div>

        {/* High Score Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(136,8,8,0.15))',
          border: '1px solid rgba(234,179,8,0.3)',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Trophy size={14} color="var(--gold)" /> Personal High Score
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#ffffff' }}>
            {triviaStats.highScore || 0} <span style={{ fontSize: '14px', color: 'var(--gold)', fontWeight: 700 }}>pts</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Rounds Played</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff', marginTop: '2px' }}>{triviaStats.gamesPlayed || 0}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 12px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>Accuracy</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: 'var(--green)', marginTop: '2px' }}>{accuracyPct}%</div>
          </div>
        </div>

        {/* Recent Runs Log */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={13} /> Recent Games
            </div>
            {triviaStats.recentRuns?.length > 0 && (
              <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>Last {triviaStats.recentRuns.length}</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(!triviaStats.recentRuns || triviaStats.recentRuns.length === 0) ? (
              <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px', background: 'rgba(255,255,255,0.015)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                No games logged yet. Finish a challenge to record your first score!
              </div>
            ) : (
              triviaStats.recentRuns.map((run, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#ffffff' }}>{run.score} pts</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{run.date}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--green)', fontWeight: 800, fontSize: '11.5px' }}>
                    <CheckCircle2 size={12} /> {run.correct}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
