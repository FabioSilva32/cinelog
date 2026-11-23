import React, { useState, useEffect, useRef } from 'react';
import {Trophy,ArrowRight,RefreshCw,Volume2,VolumeX,CheckCircle2,XCircle,Clock} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useToast } from './ToastSystem';

export const ALL_TRIVIA_QUESTIONS = [
{"id":75,"question":"Who directed The Grand Budapest Hotel?","options":["Wes Anderson","Tim Burton","Terry Gilliam","Edgar Wright"],"answer":"Wes Anderson","points":100},
{"id":76,"question":"Which film features the fictional nation of Wakanda?","options":["Black Panther","Aquaman","Wonder Woman","Black Adam"],"answer":"Black Panther","points":100},
{"id":77,"question":"Who plays Furiosa in Mad Max: Fury Road?","options":["Charlize Theron","Emily Blunt","Rebecca Ferguson","Alicia Vikander"],"answer":"Charlize Theron","points":100},
{"id":78,"question":"Which film features the spaceship Nostromo?","options":["Alien","Interstellar","Solaris","Event Horizon"],"answer":"Alien","points":100},
{"id":79,"question":"What is the name of the hotel in The Shining?","options":["Overlook Hotel","Bates Motel","Grand Budapest Hotel","Hotel California"],"answer":"Overlook Hotel","points":100},
{"id":80,"question":"Which director made the original Halloween (1978)?","options":["John Carpenter","Wes Craven","George A. Romero","Tobe Hooper"],"answer":"John Carpenter","points":100},
{"id":81,"question":"Which actor plays Neo in The Matrix?","options":["Keanu Reeves","Brad Pitt","Tom Cruise","Nicolas Cage"],"answer":"Keanu Reeves","points":100},
{"id":82,"question":"Who directed Portrait of a Lady on Fire?","options":["Celine Sciamma","Agnes Varda","Claire Denis","Sofia Coppola"],"answer":"Celine Sciamma","points":100},
{"id":83,"question":"Who directed the film The Farewell (2019)?","options":["Lulu Wang","Chloe Zhao","Greta Gerwig","Mira Nair"],"answer":"Lulu Wang","points":100},
{"id":84,"question":"Which filmmaker directed A Separation?","options":["Asghar Farhadi","Abbas Kiarostami","Jafar Panahi","Majid Majidi"],"answer":"Asghar Farhadi","points":100},
{"id":85,"question":"Which film features the character Chihiro?","options":["Spirited Away","Ponyo","Howl’s Moving Castle","Kiki’s Delivery Service"],"answer":"Spirited Away","points":100},
{"id":86,"question":"Which anime features a notebook that can kill people whose names are written in it?","options":["Death Note","Monster","Erased","Psycho-Pass"],"answer":"Death Note","points":100},
{"id":87,"question":"Who is the captain of the Straw Hat Pirates?","options":["Monkey D. Luffy","Roronoa Zoro","Sanji","Shanks"],"answer":"Monkey D. Luffy","points":100},
{"id":88,"question":"Which anime centers on giant humanoid creatures called Titans?","options":["Attack on Titan","Demon Slayer","Jujutsu Kaisen","Chainsaw Man"],"answer":"Attack on Titan","points":100},
{"id":89,"question":"What is the name of the bounty hunter in The Mandalorian?","options":["Din Djarin","Cassian Andor","Poe Dameron","Cal Kestis"],"answer":"Din Djarin","points":100},
{"id":90,"question":"Which series features the Roy family?","options":["Succession","Billions","Industry","Mad Men"],"answer":"Succession","points":100},
{"id":91,"question":"What is the advertising agency at the start of Mad Men?","options":["Sterling Cooper","Dunder Mifflin","Pearson Hardman","Waystar Royco"],"answer":"Sterling Cooper","points":100},
{"id":92,"question":"Which city is the principal setting of The Wire?","options":["Baltimore","Boston","Chicago","Philadelphia"],"answer":"Baltimore","points":100},
{"id":93,"question":"Which series features a restaurant called The Original Beef of Chicagoland?","options":["The Bear","Chef’s Table","The Menu","Boiling Point"],"answer":"The Bear","points":100},
{"id":94,"question":"Which German series is set in the fictional town of Winden?","options":["Dark","1899","Babylon Berlin","Deutschland 83"],"answer":"Dark","points":100},
{"id":95,"question":"What is an establishing shot used to communicate?","options":["The setting of a scene","Only a character’s thoughts","The final credits","A camera malfunction"],"answer":"The setting of a scene","points":100},
{"id":96,"question":"What is diegetic sound?","options":["Sound originating within the story world","Only the orchestral score","All sound added after filming","Sound heard only by the audience"],"answer":"Sound originating within the story world","points":100},
{"id":97,"question":"What does a gaffer lead on a film set?","options":["The lighting department","The costume department","The casting team","The editing team"],"answer":"The lighting department","points":100},
{"id":98,"question":"What does ADR usually replace or re-record?","options":["Dialogue","Camera movements","Set construction","Costumes"],"answer":"Dialogue","points":100},
{"id":99,"question":"What is a storyboard?","options":["A sequence of drawings planning shots","A distribution contract","A sound mixing console","A finished film poster"],"answer":"A sequence of drawings planning shots","points":100},
{"id":100,"question":"Which actor played Jack Sparrow in Pirates of the Caribbean?","options":["Johnny Depp","Orlando Bloom","Geoffrey Rush","Javier Bardem"],"answer":"Johnny Depp","points":100},
{"id":101,"question":"Which musical features the songs America and Tonight?","options":["West Side Story","Chicago","Cabaret","Moulin Rouge!"],"answer":"West Side Story","points":100},
{"id":102,"question":"Who directed Singin’ in the Rain with Stanley Donen?","options":["Gene Kelly","Fred Astaire","Bob Fosse","Vincente Minnelli"],"answer":"Gene Kelly","points":100},
{"id":103,"question":"Which film features a giant robot befriended by Hogarth Hughes?","options":["The Iron Giant","WALL-E","Big Hero 6","Robots"],"answer":"The Iron Giant","points":100},
{"id":104,"question":"Which film follows a rat named Remy who loves cooking?","options":["Ratatouille","Flushed Away","The Tale of Despereaux","Fantastic Mr. Fox"],"answer":"Ratatouille","points":100},
{"id":51,"question":"Which studio produced Spirited Away?","options":["Studio Ghibli","Pixar","Laika","DreamWorks"],"answer":"Studio Ghibli","points":100},
{"id":52,"question":"Who directed the animated film Your Name?","options":["Makoto Shinkai","Hayao Miyazaki","Satoshi Kon","Mamoru Hosoda"],"answer":"Makoto Shinkai","points":100},
{"id":53,"question":"In Cowboy Bebop, what is the name of the spaceship used by the main crew?","options":["Bebop","Serenity","Nostromo","Discovery"],"answer":"Bebop","points":100},
{"id":54,"question":"Which anime follows the Elric brothers?","options":["Fullmetal Alchemist","Death Note","One Piece","Bleach"],"answer":"Fullmetal Alchemist","points":100},
{"id":55,"question":"Who plays Eleven in Stranger Things?","options":["Millie Bobby Brown","Sadie Sink","Maya Hawke","Natalia Dyer"],"answer":"Millie Bobby Brown","points":100},
{"id":56,"question":"In Breaking Bad, what subject does Walter White teach?","options":["Chemistry","Physics","Biology","Mathematics"],"answer":"Chemistry","points":100},
{"id":57,"question":"Which fictional continent is the main setting of Game of Thrones?","options":["Westeros","Middle-earth","Narnia","Arrakis"],"answer":"Westeros","points":100},
{"id":58,"question":"What is the name of the paper company in the US version of The Office?","options":["Dunder Mifflin","Sterling Cooper","Waystar Royco","Initech"],"answer":"Dunder Mifflin","points":100},
{"id":59,"question":"Which filmmaker directed Seven Samurai?","options":["Akira Kurosawa","Yasujiro Ozu","Bong Joon-ho","Wong Kar-wai"],"answer":"Akira Kurosawa","points":100},
{"id":60,"question":"Who composed the music for The Good, the Bad and the Ugly?","options":["Ennio Morricone","John Williams","Hans Zimmer","Nino Rota"],"answer":"Ennio Morricone","points":100},
{"id":61,"question":"Which film features the character Amelie Poulain?","options":["Amelie","Chocolat","A Very Long Engagement","The Artist"],"answer":"Amelie","points":100},
{"id":62,"question":"Which country produced the film Cinema Paradiso?","options":["Italy","France","Spain","Greece"],"answer":"Italy","points":100},
{"id":63,"question":"What does a Foley artist primarily create?","options":["Sound effects","Costume designs","Visual effects","Storyboards"],"answer":"Sound effects","points":100},
{"id":64,"question":"What does cinematography primarily concern?","options":["The photography of moving images","Writing dialogue","Casting actors","Distributing films"],"answer":"The photography of moving images","points":100},
{"id":65,"question":"What is a match cut?","options":["An edit linking visually or conceptually similar shots","A shot filmed without sound","A camera zoom","A lighting technique"],"answer":"An edit linking visually or conceptually similar shots","points":100},
{"id":66,"question":"What is stop-motion animation made from?","options":["Photographs of objects moved incrementally","Only hand-drawn frames","Live broadcast footage","A single long exposure"],"answer":"Photographs of objects moved incrementally","points":100},
{"id":67,"question":"Who voices Woody in the original English-language Toy Story films?","options":["Tom Hanks","Tim Allen","Billy Crystal","John Goodman"],"answer":"Tom Hanks","points":100},
{"id":68,"question":"Which film features a robot named WALL-E?","options":["WALL-E","Robots","Big Hero 6","The Iron Giant"],"answer":"WALL-E","points":100},
{"id":69,"question":"Who directed Moonlight (2016)?","options":["Barry Jenkins","Jordan Peele","Ryan Coogler","Steve McQueen"],"answer":"Barry Jenkins","points":100},
{"id":70,"question":"Which film follows a drummer named Andrew Neiman?","options":["Whiplash","Sound of Metal","La La Land","Inside Llewyn Davis"],"answer":"Whiplash","points":100},
{"id":71,"question":"Which instrument does the main character play in The Pianist?","options":["Piano","Violin","Cello","Trumpet"],"answer":"Piano","points":100},
{"id":72,"question":"Who directed Pan’s Labyrinth?","options":["Guillermo del Toro","Alfonso Cuaron","Alejandro Gonzalez Inarritu","Pedro Almodovar"],"answer":"Guillermo del Toro","points":100},
{"id":73,"question":"What is the family surname in The Simpsons?","options":["Simpson","Griffin","Belcher","Smith"],"answer":"Simpson","points":100},
{"id":74,"question":"Which series features the town of Twin Peaks?","options":["Twin Peaks","Dark","Lost","Fargo"],"answer":"Twin Peaks","points":100},
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

export default function TriviaTab({ currentUser, onUpdateProfile, onOpenAuth, storage=localStorage }) {
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
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [claimPending,setClaimPending]=useState(false),[claimError,setClaimError]=useState(''),[showExit,setShowExit]=useState(false);
  const answerLock=useRef(false),answerTimeout=useRef(null),claimBusy=useRef(false),answerHandler=useRef(null),soundHandler=useRef(null),pauseRef=useRef(false);
  useEffect(()=>()=>clearTimeout(answerTimeout.current),[]);

  // Local storage personal record and play history (No fake bots)
  const [triviaStats, setTriviaStats] = useState(() => {
    try {
      const saved = storage.getItem('cinelog_trivia_stats');
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
      osc.onended=()=>ctx.close().catch(()=>{});
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

  soundHandler.current=playSound;
  useEffect(()=>{
    if(gameState!=='playing')return;
    let deadline=Date.now()+15000,lastTick=Date.now();setTimer(15);
    timerRef.current=setInterval(()=>{const now=Date.now();if(pauseRef.current){deadline+=now-lastTick;lastTick=now;return;}lastTick=now;const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));setTimer(remaining);if(remaining===0){clearInterval(timerRef.current);answerHandler.current?.(null,true);}else if(remaining<=5)soundHandler.current?.('tick');},1000);
    return ()=>clearInterval(timerRef.current);
  },[currentIdx,gameState]);

  const handleStartGame = () => {
    clearTimeout(answerTimeout.current);clearInterval(timerRef.current);answerLock.current=false;pauseRef.current=false;setClaimError('');
    let seen=[];try{seen=JSON.parse(storage.getItem('cinelog_trivia_seen')||'[]');if(!Array.isArray(seen))seen=[];}catch{}
    const unseen=shuffle(ALL_TRIVIA_QUESTIONS.filter(q=>!seen.includes(q.id)));
    const refill=shuffle(ALL_TRIVIA_QUESTIONS.filter(q=>seen.includes(q.id)));
    const roundQuestions=[...unseen,...refill].slice(0,10).map(q=>({...q,options:shuffle(q.options)}));
    const nextSeen=unseen.length>=10?[...seen,...roundQuestions.map(q=>q.id)]:roundQuestions.map(q=>q.id);
    try{storage.setItem('cinelog_trivia_seen',JSON.stringify(nextSeen));}catch{/* Rounds still work when device storage is unavailable. */}
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
    if (answerLock.current) return;
    answerLock.current=true;
    clearInterval(timerRef.current);

    const question = activeQuestions[currentIdx];
    setSelectedOption(isTimeout?'__timeout__':option);

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
    answerTimeout.current=setTimeout(() => {
      answerLock.current=false;
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

  answerHandler.current=handleAnswer;

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
        storage.setItem('cinelog_trivia_stats', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const handleClaimPoints = async () => {
    if(claimed||claimBusy.current||!currentUser||!onUpdateProfile)return;
    const earnedPoints=Math.round(score*.1);if(earnedPoints<=0)return;
    claimBusy.current=true;setClaimPending(true);setClaimError('');
    try{
      const result=await onUpdateProfile({...currentUser,triviaCinePoints:(currentUser.triviaCinePoints||0)+earnedPoints});
      if(result===false||result?.saved===false)throw new Error(result?.error||'Your points could not be saved. Please try again.');
      setTriviaStats(previous=>{const updated={...previous,totalPointsEarned:(previous.totalPointsEarned||0)+earnedPoints};try{storage.setItem('cinelog_trivia_stats',JSON.stringify(updated));}catch{}return updated;});
      setClaimed(true);toast.success('CinePoints claimed','+'+earnedPoints+' CinePoints added to your profile.');
    }catch(error){setClaimError(error.message);}finally{claimBusy.current=false;setClaimPending(false);}
  };
  const leaveRound=()=>{clearInterval(timerRef.current);clearTimeout(answerTimeout.current);answerLock.current=false;pauseRef.current=false;setGameState('start');setShowExit(false);setFlash(null);};

  const currentQuestion = activeQuestions[currentIdx] || activeQuestions[0];
  const accuracyPct = triviaStats.totalQuestions > 0
    ? Math.round((triviaStats.totalCorrect / triviaStats.totalQuestions) * 100)
    : 0;

  return <div className="extras-page trivia-room"><header className="extras-page-heading"><div><span className="studio-eyebrow">THE SCREEN TEST</span><h1>How well do you know cinema?</h1><p>Ten questions. Fifteen seconds each. A fresh round every time.</p></div><span className="extras-heading-emblem"><Trophy size={32}/></span></header><div className="trivia-room-layout"><section className="trivia-stage" data-state={gameState}><header className="trivia-stage-header"><span>{gameState==='start'?'READY WHEN YOU ARE':gameState==='playing'?'QUESTION '+(currentIdx+1)+' / '+activeQuestions.length:'THE FINAL SCORE'}</span><div>{gameState==='playing'&&<button className="studio-text-button" disabled={selectedOption!==null} onClick={()=>{pauseRef.current=true;setShowExit(true);}}>Leave round</button>}<button className="trivia-sound-toggle" aria-label={soundEnabled?'Mute trivia sounds':'Enable trivia sounds'} aria-pressed={soundEnabled} onClick={()=>setSoundEnabled(value=>!value)}>{soundEnabled?<Volume2 size={16}/>:<VolumeX size={16}/>}</button></div></header>
 {gameState==='start'&&<div className="trivia-opening"><span className="trivia-opening-number">10<span>QUESTIONS</span></span><span className="studio-eyebrow">FROM THE OPENING SCENE TO THE FINAL CREDIT</span><h2>Your next scene<br/>is a question.</h2><p>Directors, landmark films, memorable performances, and the moments that made movie history. Can you beat your personal best?</p><div className="trivia-rules"><span><Clock size={14}/>15 seconds per question</span><span>Streaks boost your score</span><span>Earn CinePoints</span></div><button className="studio-primary" onClick={handleStartGame}>Start a round <ArrowRight size={16}/></button><small>{ALL_TRIVIA_QUESTIONS.length} questions in the vault · Sounds start muted</small></div>}
 {gameState==='playing'&&<div className="trivia-question-panel"><div className="trivia-live-score"><strong>{score}<small>POINTS</small></strong><span>{streak>0?streak+' answer streak':'Make the first one count.'}</span><span className="trivia-time" data-urgent={timer<=5}>{timer}s</span></div><div className="extras-progress trivia-timer" role="progressbar" aria-label="Time remaining" aria-valuenow={timer} aria-valuemin={0} aria-valuemax={15}><i style={{width:timer/15*100+'%'}}/></div><h2>{currentQuestion.question}</h2><div className="trivia-answer-grid">{currentQuestion.options.map((option,index)=>{const answered=selectedOption!==null,correct=option===currentQuestion.answer,chosen=selectedOption===option;return <button key={option} disabled={answered} data-result={answered?(correct?'correct':chosen?'wrong':'other'):undefined} onClick={()=>handleAnswer(option)}><span>{String.fromCharCode(65+index)}</span><strong>{option}</strong>{answered&&correct&&<CheckCircle2 size={17}/>}{answered&&chosen&&!correct&&<XCircle size={17}/>}</button>;})}</div><p className="trivia-answer-feedback" role="status">{flash?(selectedOption==='__timeout__'?'Time is up. The correct answer is highlighted.':flash==='correct'?'Correct. Keep the streak going.':'Not this time. The correct answer is highlighted.'):'Choose your answer before the clock runs out.'}</p></div>}
 {gameState==='ended'&&<div className="trivia-finale"><span className="studio-eyebrow">THAT’S A WRAP</span><h2>A round worth remembering.</h2><strong className="trivia-final-score">{score}<small>points</small></strong><div className="trivia-finale-stats"><span><strong>{correctAnswers} / {activeQuestions.length}</strong>Correct answers</span><span><strong>{Math.round(score*.1)}</strong>CinePoints earned</span></div>{claimError&&<p className="extras-error" role="alert">{claimError}</p>}<div className="trivia-final-actions">{currentUser?<button className="studio-primary" disabled={claimed||claimPending||Math.round(score*.1)===0} onClick={handleClaimPoints}>{claimPending?'Saving points…':claimed?'Points claimed':'Claim CinePoints'}</button>:<button className="studio-primary" onClick={()=>onOpenAuth?.()}>Sign in to claim points</button>}<button className="studio-secondary" disabled={claimPending} onClick={handleStartGame}><RefreshCw size={14}/>Play another round</button></div></div>}
 </section><aside className="extras-sidebar trivia-records"><span className="studio-eyebrow">YOUR PERSONAL BEST</span><div className="trivia-record-score">{triviaStats.highScore||0}<small>POINTS</small></div><div className="trivia-record-metrics"><span><strong>{triviaStats.gamesPlayed||0}</strong>Rounds</span><span><strong>{accuracyPct}%</strong>Accuracy</span></div><h3>Recent screenings of skill.</h3><div className="trivia-recent-runs">{triviaStats.recentRuns?.length?triviaStats.recentRuns.map((run,index)=><div key={index}><span><strong>{run.score} pts</strong><small>{run.date}</small></span><span>{run.correct}</span></div>):<p className="extras-note">Finish a round to record your first result.</p>}</div><p className="extras-note">Your game record is kept on this device. Claimed CinePoints are saved to your signed-in profile.</p></aside></div><ConfirmModal isOpen={showExit} title="Leave this round?" message="This unfinished round will not be added to your record." confirmText="Leave round" cancelText="Keep playing" isDanger={false} onConfirm={leaveRound} onCancel={()=>{pauseRef.current=false;setShowExit(false);}}/></div>;
}
