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
  url?: string;
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