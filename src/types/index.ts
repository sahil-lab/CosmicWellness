export interface Emotion {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface VideoRecommendation {
  id: string;
  title: string;
  videoId: string;
  description: string;
  type: 'subliminal' | 'binaural' | 'meditation' | 'frequency';
  duration: string;
  thumbnail: string;
}

export interface ZodiacSign {
  id: string;
  name: string;
  symbol: string;
  element: string;
  dates: string;
  traits: string[];
}

export interface DailyReading {
  date: string;
  day: 'yesterday' | 'today' | 'tomorrow';
  prediction: string;
  luckyColor: string;
  luckyNumber: number;
  mood: string;
  advice: string;
  love: string;
  career: string;
  money: string;
  health: string;
}

export interface HoroscopeReading {
  sign: string;
  readings: DailyReading[];
  compatibility: string;
  weeklyOverview: string;
}

export interface OshoQuote {
  text: string;
  category: string;
  relevance: number;
}

export interface PremiumConsultation {
  id: string;
  question: string;
  complexity: 'simple' | 'moderate' | 'complex';
  price: number;
  response?: string;
  status: 'pending' | 'answered';
  timestamp: Date;
}

export interface AngelGuidance {
  stones: string[];
  luckyColor: string;
  luckyNumber: number;
  mantra: string;
  subliminalVideo: VideoRecommendation;
  message: string;
  lifePathNumber: number;
  lifePathMeaning: string;
}

export interface AngelGuidanceRequest {
  birthDate: string;
  birthTime?: string;
  zodiacSign: string;
  problem: string;
  lifePathNumber: number;
}

export interface UPIPayment {
  upiId: string;
  amount: number;
  description: string;
}

export interface HandReading {
  palmLines: {
    lifeLine: string;
    heartLine: string;
    headLine: string;
    fateLine: string;
  };
  mounts: {
    venus: string;
    jupiter: string;
    saturn: string;
    apollo: string;
    mercury: string;
    mars: string;
    moon: string;
  };
  fingerAnalysis: string;
  overallReading: string;
  predictions: {
    health: string;
    career: string;
    love: string;
    wealth: string;
  };
  recommendations: string[];
}

export interface PalmReadingAnalysis {
  majorLines: {
    lifeLine: string;
    heartLine: string;
    headLine: string;
    fateLine: string;
    marriageLine: string;
    travelLine: string;
    childrenLine: string;
    moneyLine: string;
  };
  mountAnalysis: {
    mountOfVenus: string;
    mountOfJupiter: string;
    mountOfSaturn: string;
    mountOfSun: string;
    mountOfMercury: string;
    mountOfMars: string;
    mountOfMoon: string;
    mountOfRahu: string;
    mountOfKetu: string;
  };
  fingerAnalysis: {
    thumb: string;
    indexFinger: string;
    middleFinger: string;
    ringFinger: string;
    littleFinger: string;
  };
  characterReading: {
    personality: string;
    strengths: string;
    challenges: string;
    talents: string;
    spiritualNature: string;
    karmaAnalysis: string;
  };
  lifePredictions: {
    career: string;
    relationships: string;
    health: string;
    wealth: string;
    family: string;
    education: string;
    spiritualJourney: string;
    karma: string;
  };
  indianAstrology: {
    rahuInfluence: string;
    ketuInfluence: string;
    vedicRemedies: string[];
    yantraRecommendations: string[];
    rudrakshaGuidance: string;
    fasting: string[];
    donations: string[];
    templeVisits: string[];
  };
  recommendations: {
    gemstones: string;
    colors: string;
    mantras: string;
    lifestyle: string;
    spiritual: string;
    vedicRituals: string;
  };
}

export interface KundliAnalysis {
  basicInfo: {
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
  };
  planetaryPositions: {
    sun: string;
    moon: string;
    mars: string;
    mercury: string;
    jupiter: string;
    venus: string;
    saturn: string;
    rahu: string;
    ketu: string;
  };
  houses: {
    [key: string]: string;
  };
  doshas: {
    manglik: boolean;
    kalSarp: boolean;
    pitruDosh: boolean;
    description: string;
  };
  predictions: {
    career: string;
    marriage: string;
    health: string;
    finance: string;
    education: string;
  };
  remedies: string[];
  gemstones: string[];
  favorableDays: string[];
  unfavorableDays: string[];
}

export interface VedicText {
  id: string;
  title: string;
  category: 'vedas' | 'puranas' | 'epics' | 'sutras' | 'mantras' | 'stotras';
  language: 'sanskrit' | 'hindi' | 'english';
  description: string;
  content: VedicChapter[];
  benefits?: string[];
  significance: string;
}

export interface VedicChapter {
  id: string;
  title: string;
  verses: VedicVerse[];
  summary?: string;
}

export interface VedicVerse {
  id: string;
  sanskrit?: string;
  transliteration?: string;
  english: string;
  hindi?: string;
  meaning: string;
  commentary?: string;
}

export interface HanumanChalisaVerse {
  id: string;
  verseNumber: number;
  hindi: string;
  transliteration: string;
  english: string;
  meaning: string;
  benefits?: string;
}

export interface Scripture {
  id: string;
  name: string;
  category: string;
  description: string;
  chapters: number;
  verses: number;
  language: string[];
  significance: string;
  benefits: string[];
}

export interface HealthProfile {
  height: string;
  weight: string;
  age: string;
  gender: string;
  medicalHistory: string[];
  currentMedications: string;
  allergies: string;
  fitnessLevel: string;
  healthGoals: string;
  dietaryRestrictions: string[];
  description: string;
}

export interface DietRecommendation {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  foods: {
    include: string[];
    avoid: string[];
  };
  mealPlan: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  recipes: {
    name: string;
    videoId: string;
    ingredients: string[];
    duration: string;
  }[];
  supplements: {
    name: string;
    dosage: string;
    benefits: string;
    amazonLink: string;
  }[];
  exercises: {
    name: string;
    videoId: string;
    duration: string;
    difficulty: string;
  }[];
  juices: {
    name: string;
    ingredients: string[];
    benefits: string;
    videoId: string;
  }[];
  yoga: {
    morningRoutine: {
      name: string;
      duration: string;
      videoId: string;
      asanas: string[];
      benefits: string;
    };
    therapeuticPoses: {
      condition: string;
      poses: string[];
      instructions: string;
      videoId: string;
    }[];
    pranayama: {
      technique: string;
      steps: string[];
      duration: string;
      benefits: string;
      videoId: string;
    };
    eveningPractice: {
      name: string;
      duration: string;
      videoId: string;
      poses: string[];
      benefits: string;
    };
  };
  meditation: {
    method: string;
    duration: string;
    mantra: string;
    benefits: string;
    videoId: string;
    instructions: string[];
  };
  timing: {
    wakeUp: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    sleep: string;
    notes: string;
  };
}