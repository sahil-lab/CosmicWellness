import openai from '../config/openai';
import { VideoRecommendation, HoroscopeReading, OshoQuote, DailyReading } from '../types';
import axios from 'axios';

const YOUTUBE_API_KEY = 'AIzaSyBIKUwoTZKHeQxYqhcF-FYlJbUmwDxrqpQ';

export const getVideoRecommendations = async (emotion: string, problem: string): Promise<VideoRecommendation[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in wellness, meditation, sound therapy, and healing frequencies. Provide YouTube video recommendations for subliminal videos, binaural beats, solfeggio frequencies, and therapeutic sounds based on user emotions and problems. For each, provide a real, working YouTube URL, title, description, type (subliminal/binaural/meditation/frequency), and duration. Respond ONLY with a valid JSON array, no explanations or extra text."
        },
        {
          role: "user",
          content: `I'm feeling ${emotion} and dealing with: ${problem}. Please recommend 3-4 YouTube videos (subliminal, binaural beats, solfeggio frequencies, or therapeutic sounds) that could help. For each, provide: url (real, working YouTube URL), title, description, type (subliminal/binaural/meditation/frequency), duration. Respond ONLY with a valid JSON array, no explanations or extra text.`
        }
      ],
      temperature: 0.7,
    });

    console.log('OpenAI API response:', response);
    const content = response.choices[0].message.content;
    console.log('OpenAI API content:', content);
    if (!content) return [];

    try {
      const recommendations = JSON.parse(content);
      const allowedTypes = ['subliminal', 'binaural', 'meditation', 'frequency'];
      const mapType = (type: string) => allowedTypes.includes(type) ? type : 'meditation';

      // Map and fetch videoIds (currently returns null)
      const videoPromises = recommendations.map(async (rec: any, index: number) => {
        let videoId = null;
        if (rec.url && typeof rec.url === 'string') {
          const match = rec.url.match(/[?&]v=([^&#]+)/);
          videoId = match ? match[1] : null;
        } else {
          videoId = await getYouTubeVideoId(rec.title);
        }
        return {
          id: `rec-${Date.now()}-${index}`,
          title: rec.title,
          videoId: videoId,
          url: rec.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : ''),
          description: rec.description,
          type: mapType(rec.type),
          duration: rec.duration,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
        };
      });
      return await Promise.all(videoPromises);
    } catch {
      return [];
    }
  } catch (error) {
    console.error('Error getting video recommendations:', error);
    return [];
  }
};

const getDefaultVideoId = (emotion: string, index: number): string => {
  const videoSets: Record<string, string[]> = {
    stress: ['YuQBl27UK_s', 'M5QY2_8704o', 'inpok4MKVLM', '1ZYbU82GVz4'],
    anxiety: ['T0VrMVl0h-Y', 'aEqlQvczMJQ', 'ZToicYcHIOU', 'jPpUNAFHgxM'],
    depression: ['WHPEKLQID4U', 'lFcSrYw-ARY', 'ENNKEa8JgqU', 'UfcAVejslrU'],
    insomnia: ['M5QY2_8704o', 'YuQBl27UK_s', 'jPpUNAFHgxM', 'T0VrMVl0h-Y'],
    focus: ['WPni755-Krg', 'jPpUNAFHgxM', 'ZToicYcHIOU', 'aEqlQvczMJQ'],
    healing: ['YuQBl27UK_s', 'WHPEKLQID4U', 'ENNKEa8JgqU', 'UfcAVejslrU'],
    chakra: ['lFcSrYw-ARY', 'WHPEKLQID4U', 'YuQBl27UK_s', 'ENNKEa8JgqU'],
    meditation: ['inpok4MKVLM', 'jPpUNAFHgxM', 'T0VrMVl0h-Y', 'ZToicYcHIOU']
  };

  const emotionKey = emotion.toLowerCase();
  const videos = videoSets[emotionKey] || videoSets.healing;
  return videos[index % videos.length];
};

const getDefaultVideos = (emotion: string): VideoRecommendation[] => {
  const videoData = [
    {
      title: '528Hz Healing Frequency - DNA Repair & Positive Transformation',
      type: 'frequency' as const,
      description: 'The miracle tone of transformation and DNA repair'
    },
    {
      title: 'Deep Theta Binaural Beats - Meditation & Healing',
      type: 'binaural' as const,
      description: 'Theta waves for deep meditation and subconscious healing'
    },
    {
      title: 'Subliminal Healing Messages - Positive Affirmations',
      type: 'subliminal' as const,
      description: 'Powerful subliminal messages for emotional healing'
    },
    {
      title: 'Nature Sounds Meditation - Forest Rain & Thunder',
      type: 'meditation' as const,
      description: 'Calming nature sounds for deep relaxation'
    }
  ];

  return videoData.map((video, index) => ({
    id: `default-${Date.now()}-${index}`,
    title: video.title,
    videoId: getDefaultVideoId(emotion, index),
    description: video.description,
    type: video.type,
    duration: '30:00',
    thumbnail: `https://img.youtube.com/vi/${getDefaultVideoId(emotion, index)}/maxresdefault.jpg`
  }));
};

export const getHoroscope = async (zodiacSign: string): Promise<HoroscopeReading> => {
  try {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a master astrologer with deep knowledge of Western astrology, planetary movements, and celestial influences. Generate fresh, unique horoscope readings that are different each time, incorporating current planetary transits and cosmic energies. Never repeat the same predictions."
        },
        {
          role: "user",
          content: `Generate a completely fresh and unique horoscope reading for ${zodiacSign} for ${yesterday.toDateString()}, ${today.toDateString()}, and ${tomorrow.toDateString()}. Make this reading unique and different from any previous readings. Include specific daily predictions, lucky colors, lucky numbers, mood forecasts, practical advice, a compatible zodiac sign, and a weekly overview. Format as JSON: { "sign": "${zodiacSign}", "readings": [array of 3 daily readings with date, day, prediction, luckyColor, luckyNumber, mood, advice], "compatibility": "sign name", "weeklyOverview": "text" }`
        }
      ],
      temperature: 0.9, // Higher temperature for more creative/unique responses
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch {
      return generateFallbackHoroscope(zodiacSign, yesterday, today, tomorrow);
    }
  } catch (error) {
    console.error('Error getting horoscope:', error);
    return generateFallbackHoroscope(zodiacSign, new Date(Date.now() - 86400000), new Date(), new Date(Date.now() + 86400000));
  }
};

const generateFallbackHoroscope = (zodiacSign: string, yesterday: Date, today: Date, tomorrow: Date): HoroscopeReading => {
  const predictions = [
    "The cosmic energies align to bring unexpected opportunities your way",
    "Your intuition is heightened, trust your inner wisdom today",
    "A significant breakthrough awaits in your personal growth journey",
    "The universe conspires to manifest your deepest desires",
    "New connections and meaningful relationships are on the horizon",
    "Your creative energy is at its peak, express yourself freely",
    "Financial abundance flows toward you through unexpected channels",
    "Healing energy surrounds you, embrace transformation",
    "Your leadership qualities shine brightly in group settings",
    "Deep spiritual insights emerge through quiet contemplation"
  ];

  const colors = ['Cosmic Purple', 'Golden Yellow', 'Emerald Green', 'Ocean Blue', 'Rose Pink', 'Silver White', 'Ruby Red', 'Sapphire Blue'];
  const moods = ['Inspired', 'Confident', 'Peaceful', 'Energetic', 'Reflective', 'Optimistic', 'Balanced', 'Empowered'];
  const advice = [
    "Trust the process and remain open to new possibilities",
    "Focus on gratitude and positive energy will multiply",
    "Take time for self-care and inner reflection",
    "Embrace change as a pathway to growth",
    "Connect with nature to ground your energy",
    "Practice mindfulness in all your interactions",
    "Follow your heart's true calling",
    "Seek balance between action and rest"
  ];

  const compatibleSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  return {
    sign: zodiacSign,
    readings: [
      {
        date: yesterday.toISOString().split('T')[0],
        day: 'yesterday' as const,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        luckyColor: colors[Math.floor(Math.random() * colors.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)],
        advice: advice[Math.floor(Math.random() * advice.length)]
      },
      {
        date: today.toISOString().split('T')[0],
        day: 'today' as const,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        luckyColor: colors[Math.floor(Math.random() * colors.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)],
        advice: advice[Math.floor(Math.random() * advice.length)]
      },
      {
        date: tomorrow.toISOString().split('T')[0],
        day: 'tomorrow' as const,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        luckyColor: colors[Math.floor(Math.random() * colors.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)],
        advice: advice[Math.floor(Math.random() * advice.length)]
      }
    ],
    compatibility: compatibleSigns[Math.floor(Math.random() * compatibleSigns.length)],
    weeklyOverview: `This week brings powerful cosmic shifts for ${zodiacSign}. The planetary alignments support your personal evolution and spiritual growth. Trust in the divine timing of the universe.`
  };
};

export const getOshoQuote = async (emotion: string, context: string): Promise<OshoQuote> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are channeling the wisdom of Osho (Bhagwan Shree Rajneesh). Provide profound, authentic quotes in his style that address human emotions and spiritual growth. Generate unique quotes each time, never repeat the same wisdom."
        },
        {
          role: "user",
          content: `Share a unique Osho quote relevant to someone feeling ${emotion} in the context of: ${context}. Make it profound and transformative. Include the quote text, spiritual category, and relevance percentage.`
        }
      ],
      temperature: 0.9,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    return {
      text: content,
      category: 'Wisdom',
      relevance: Math.floor(Math.random() * 10) + 90 // 90-99%
    };
  } catch (error) {
    console.error('Error getting Osho quote:', error);
    const quotes = [
      {
        text: "Be realistic: Plan for a miracle.",
        category: "Hope",
        relevance: 90
      },
      {
        text: "The moment you accept yourself, you become beautiful.",
        category: "Self-Love",
        relevance: 95
      },
      {
        text: "Drop the idea of becoming someone, because you are already a masterpiece.",
        category: "Self-Worth",
        relevance: 92
      },
      {
        text: "Life begins where fear ends.",
        category: "Courage",
        relevance: 88
      },
      {
        text: "The real question is not whether life exists after death. The real question is whether you are alive before death.",
        category: "Presence",
        relevance: 94
      }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
};

export const getPremiumConsultation = async (question: string, complexity: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a premium spiritual advisor and life coach with expertise in astrology, psychology, wellness, and spiritual guidance. Provide comprehensive, personalized advice that is unique and tailored to each individual's specific situation."
        },
        {
          role: "user",
          content: `Question: ${question}\nComplexity: ${complexity}\n\nPlease provide detailed, actionable advice with spiritual insights, practical steps, and wisdom for this ${complexity} question. Make your response comprehensive and personalized.`
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "The universe is guiding you. Trust your inner wisdom and take inspired action.";
  } catch (error) {
    console.error('Error getting premium consultation:', error);
    return "The stars align to bring you clarity. Your question holds the seed of its own answer - look within and trust the cosmic guidance flowing through you.";
  }
};

async function getYouTubeVideoId(title: string): Promise<string | null> {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: title,
        type: 'video',
        key: YOUTUBE_API_KEY,
        maxResults: 1
      }
    });
    const items = response.data.items;
    if (items && items.length > 0) {
      return items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error('YouTube API error:', error);
    return null;
  }
}