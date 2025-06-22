import openai from '../config/openai';
import { VideoRecommendation, HoroscopeReading, OshoQuote, DailyReading, AngelGuidance, AngelGuidanceRequest, HandReading, PalmReadingAnalysis, KundliAnalysis, DietRecommendation, HealthProfile, PujaRequest, PujaRecommendation } from '../types';
import axios from 'axios';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Helper function to convert image to base64
async function convertImageToBase64(imageFile: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 data
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });
}

export const getVideoRecommendations = async (emotion: string, problem: string): Promise<VideoRecommendation[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in wellness, meditation, sound therapy, and healing frequencies. Provide YouTube video recommendations for subliminal videos, binaural beats, solfeggio frequencies, and therapeutic sounds based on user emotions and problems. For each, provide a descriptive title, detailed description, type (subliminal/binaural/meditation/frequency), and approximate duration. DO NOT include URLs as they may be invalid. Respond with a valid JSON array."
        },
        {
          role: "user",
          content: `I'm feeling ${emotion} and dealing with: ${problem}. Please recommend 3-4 videos (subliminal, binaural beats, solfeggio frequencies, or therapeutic sounds) that could help. For each, provide: title, description, type (subliminal/binaural/meditation/frequency), duration. Focus on meditation and healing frequencies.`
        }
      ],
      temperature: 0.7,
    });

    console.log('OpenAI API response:', response);
    const content = response.choices[0].message.content;
    console.log('OpenAI API content:', content);
    if (!content) return [];

    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n|\n```/g, '').trim();
      console.log('Cleaned JSON content:', jsonContent);

      const recommendations = JSON.parse(jsonContent);
      const allowedTypes = ['subliminal', 'binaural', 'meditation', 'frequency'];
      const mapType = (type: string) => allowedTypes.includes(type) ? type : 'meditation';

      // Map and fetch videoIds using YouTube API
      const videoPromises = recommendations.map(async (rec: any, index: number) => {
        const searchQuery = `${rec.title} ${rec.type} meditation healing`;
        console.log('Searching for video:', searchQuery);
        const videoId = await getYouTubeVideoId(searchQuery);
        console.log(`Video ${index + 1}:`, { title: rec.title, videoId });

        if (!videoId) {
          console.log('No video ID found, trying alternative search...');
          // Try a more generic search if specific title doesn't work
          const altSearchQuery = `${rec.type} meditation ${rec.duration}`;
          const altVideoId = await getYouTubeVideoId(altSearchQuery);
          if (altVideoId) {
            console.log('Found alternative video ID:', altVideoId);
            return {
              id: `rec-${Date.now()}-${index}`,
              title: rec.title,
              videoId: altVideoId,
              description: rec.description,
              type: mapType(rec.type),
              duration: rec.duration,
              thumbnail: `https://img.youtube.com/vi/${altVideoId}/maxresdefault.jpg`,
            };
          }
        }

        return {
          id: `rec-${Date.now()}-${index}`,
          title: rec.title,
          videoId: videoId,
          description: rec.description,
          type: mapType(rec.type),
          duration: rec.duration,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '',
        };
      });

      const results = await Promise.all(videoPromises);
      console.log('Final video recommendations:', results);
      return results.filter(video => video.videoId); // Only return videos with valid IDs
    } catch (error) {
      console.error('Error processing recommendations:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error getting video recommendations:', error);
    throw error;
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

    console.log('🔮 Requesting horoscope for:', zodiacSign);
    console.log('📅 Dates:', {
      yesterday: yesterday.toDateString(),
      today: today.toDateString(),
      tomorrow: tomorrow.toDateString()
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a master astrologer with deep knowledge of Western astrology, planetary movements, and celestial influences. Generate fresh, unique horoscope readings that are different each time, incorporating current planetary transits and cosmic energies. Never repeat the same predictions."
        },
        {
          role: "user",
          content: `Generate a completely fresh and unique horoscope reading for ${zodiacSign} for ${yesterday.toDateString()}, ${today.toDateString()}, and ${tomorrow.toDateString()}. Make this reading unique and different from any previous readings. Include:
          - Daily predictions
          - Lucky colors and numbers
          - Mood forecasts
          - Practical advice
          - Love & relationships forecast
          - Career & professional guidance
          - Financial outlook
          - Health & wellness insights
          - A compatible zodiac sign
          - Weekly overview
          
          Format as JSON: {
            "sign": "${zodiacSign}",
            "readings": [
              {
                "date": "YYYY-MM-DD",
                "day": "yesterday/today/tomorrow",
                "prediction": "general prediction",
                "luckyColor": "color",
                "luckyNumber": number,
                "mood": "mood",
                "advice": "advice",
                "love": "love and relationship insights",
                "career": "career guidance",
                "money": "financial outlook",
                "health": "health and wellness advice"
              }
            ],
            "compatibility": "sign name",
            "weeklyOverview": "text"
          }`
        }
      ],
      temperature: 0.9,
    });

    console.log('🌟 OpenAI API Response:', {
      id: response.id,
      model: response.model,
      usage: response.usage
    });

    const content = response.choices[0].message.content;
    if (!content) {
      console.warn('⚠️ No content in OpenAI response');
      throw new Error('No response from AI');
    }

    console.log('📝 Raw AI Response:', content);

    try {
      const parsed = JSON.parse(content);
      console.log('✨ Parsed Horoscope:', {
        sign: parsed.sign,
        readingCount: parsed.readings?.length,
        compatibility: parsed.compatibility,
        hasWeeklyOverview: !!parsed.weeklyOverview
      });

      // Validate the structure
      if (!parsed.readings || !Array.isArray(parsed.readings) || parsed.readings.length !== 3) {
        console.error('❌ Invalid readings structure:', parsed.readings);
        throw new Error('Invalid horoscope structure');
      }

      return parsed;
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.log('⚠️ Falling back to default horoscope');
      return generateFallbackHoroscope(zodiacSign, yesterday, today, tomorrow);
    }
  } catch (error: any) {
    console.error('❌ Error getting horoscope:', error?.message || error);
    if (error?.response) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return generateFallbackHoroscope(zodiacSign, new Date(Date.now() - 86400000), new Date(), new Date(Date.now() + 86400000));
  }
};

const generateFallbackHoroscope = (zodiacSign: string, yesterday: Date, today: Date, tomorrow: Date): HoroscopeReading => {
  console.log('🔄 Generating fallback horoscope for:', zodiacSign);
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

  const loveReadings = [
    "Your heart chakra opens to new possibilities in love",
    "Deep emotional connections strengthen existing bonds",
    "A time for healing past relationship wounds",
    "Romance blooms under favorable cosmic alignments",
    "Self-love attracts authentic connections",
    "Trust your intuition in matters of the heart"
  ];

  const careerReadings = [
    "Professional opportunities align with your true purpose",
    "Leadership qualities bring recognition and advancement",
    "Creative solutions lead to workplace success",
    "Networking efforts yield valuable connections",
    "Your unique skills are highly valued",
    "A time of career growth and achievement"
  ];

  const moneyReadings = [
    "Financial wisdom guides prosperous decisions",
    "Abundance flows through unexpected channels",
    "Investments show promising potential",
    "A period of financial stability and growth",
    "New income opportunities present themselves",
    "Smart planning leads to monetary gains"
  ];

  const healthReadings = [
    "Energy levels rise with cosmic support",
    "Holistic wellness practices bring balance",
    "Mind-body connection strengthens",
    "Vitality increases through self-care",
    "Natural healing abilities are enhanced",
    "Perfect time for health transformations"
  ];

  const compatibleSigns = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

  const result = {
    sign: zodiacSign,
    readings: [
      {
        date: yesterday.toISOString().split('T')[0],
        day: 'yesterday' as const,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        luckyColor: colors[Math.floor(Math.random() * colors.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)],
        advice: advice[Math.floor(Math.random() * advice.length)],
        love: loveReadings[Math.floor(Math.random() * loveReadings.length)],
        career: careerReadings[Math.floor(Math.random() * careerReadings.length)],
        money: moneyReadings[Math.floor(Math.random() * moneyReadings.length)],
        health: healthReadings[Math.floor(Math.random() * healthReadings.length)]
      },
      {
        date: today.toISOString().split('T')[0],
        day: 'today' as const,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        luckyColor: colors[Math.floor(Math.random() * colors.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)],
        advice: advice[Math.floor(Math.random() * advice.length)],
        love: loveReadings[Math.floor(Math.random() * loveReadings.length)],
        career: careerReadings[Math.floor(Math.random() * careerReadings.length)],
        money: moneyReadings[Math.floor(Math.random() * moneyReadings.length)],
        health: healthReadings[Math.floor(Math.random() * healthReadings.length)]
      },
      {
        date: tomorrow.toISOString().split('T')[0],
        day: 'tomorrow' as const,
        prediction: predictions[Math.floor(Math.random() * predictions.length)],
        luckyColor: colors[Math.floor(Math.random() * colors.length)],
        luckyNumber: Math.floor(Math.random() * 99) + 1,
        mood: moods[Math.floor(Math.random() * moods.length)],
        advice: advice[Math.floor(Math.random() * advice.length)],
        love: loveReadings[Math.floor(Math.random() * loveReadings.length)],
        career: careerReadings[Math.floor(Math.random() * careerReadings.length)],
        money: moneyReadings[Math.floor(Math.random() * moneyReadings.length)],
        health: healthReadings[Math.floor(Math.random() * healthReadings.length)]
      }
    ],
    compatibility: compatibleSigns[Math.floor(Math.random() * compatibleSigns.length)],
    weeklyOverview: `This week brings powerful cosmic shifts for ${zodiacSign}. The planetary alignments support your personal evolution and spiritual growth. Trust in the divine timing of the universe.`
  };

  console.log('✅ Generated fallback horoscope:', {
    sign: result.sign,
    readingCount: result.readings.length,
    compatibility: result.compatibility,
    hasWeeklyOverview: !!result.weeklyOverview
  });

  return result;
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

async function getYouTubeVideoId(searchQuery: string): Promise<string | null> {
  try {
    console.log('Searching YouTube for:', searchQuery);
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        videoDuration: 'medium',
        videoEmbeddable: true,
        key: YOUTUBE_API_KEY,
        maxResults: 1,
        safeSearch: 'strict',
        relevanceLanguage: 'en',
        fields: 'items(id/videoId,snippet/title)',  // Only request fields we need
        videoCategoryId: '10',  // Music category
      }
    });

    console.log('YouTube API Response:', JSON.stringify(response.data, null, 2));

    if (response.data.items && response.data.items.length > 0) {
      const videoId = response.data.items[0].id.videoId;
      console.log('Found YouTube video ID:', videoId);

      // Verify the video exists and is embeddable
      const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'status',
          id: videoId,
          key: YOUTUBE_API_KEY,
        }
      });

      if (videoResponse.data.items && videoResponse.data.items.length > 0) {
        const videoStatus = videoResponse.data.items[0].status;
        if (videoStatus.embeddable) {
          return videoId;
        }
        console.log('Video is not embeddable:', videoId);
      }
    }
    console.log('No suitable videos found for query:', searchQuery);
    return null;
  } catch (error: any) {
    if (error.response?.data?.error?.code === 403) {
      console.error('YouTube API key error - please check API key permissions');
    } else if (error.response?.data?.error?.code === 429) {
      console.error('YouTube API quota exceeded');
    } else {
      console.error('YouTube API error:', error.response?.data || error.message);
    }
    return null;
  }
}

export const calculateLifePathNumber = (birthDate: string): number => {
  console.log('🔢 Calculating life path number for:', birthDate);

  // Remove any non-digit characters and get just the date numbers
  const dateOnly = birthDate.replace(/\D/g, '');

  if (dateOnly.length < 8) {
    console.log('❌ Invalid date format for life path calculation');
    return 1; // Default fallback
  }

  // Extract day, month, year from DDMMYYYY format
  const day = parseInt(dateOnly.substring(0, 2));
  const month = parseInt(dateOnly.substring(2, 4));
  const year = parseInt(dateOnly.substring(4, 8));

  console.log('📅 Parsed date:', { day, month, year });

  // Calculate life path number by reducing all numbers to single digit
  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  };

  const reducedDay = reduceToSingleDigit(day);
  const reducedMonth = reduceToSingleDigit(month);
  const reducedYear = reduceToSingleDigit(year);

  const lifePathNumber = reduceToSingleDigit(reducedDay + reducedMonth + reducedYear);

  console.log('✨ Life path number calculated:', lifePathNumber);
  return lifePathNumber;
};

export const getAngelGuidance = async (request: AngelGuidanceRequest): Promise<AngelGuidance> => {
  console.log('👼 Getting angel guidance for:', request);

  try {
    const prompt = `As a spiritual angel guide, provide personalized guidance for someone with:
    - Birth Date: ${request.birthDate}
    - Zodiac Sign: ${request.zodiacSign}
    - Life Path Number: ${request.lifePathNumber}
    - Problem/Situation: ${request.problem}
    ${request.birthTime ? `- Birth Time: ${request.birthTime}` : ''}

    Please provide:
    1. Healing stones/crystals they should wear (3-5 specific stones)
    2. Lucky color for this period
    3. Lucky number (single digit 1-9)
    4. A powerful mantra they should chant daily
    5. A spiritual message of guidance and hope
    6. Life path number meaning and significance

    Format your response as JSON:
    {
      "stones": ["stone1", "stone2", "stone3"],
      "luckyColor": "color name",
      "luckyNumber": number,
      "mantra": "mantra text",
      "message": "detailed spiritual guidance message",
      "lifePathMeaning": "meaning of their life path number"
    }`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('🤖 OpenAI angel guidance response:', content);

    // Parse JSON response
    let guidanceData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      guidanceData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse angel guidance JSON:', parseError);
      throw new Error('Failed to parse guidance response');
    }

    // Get subliminal video recommendation
    console.log('🎬 Getting subliminal video for angel guidance...');
    const videoPrompt = `Subliminal affirmations and angel guidance meditation for ${request.problem}. Focus on spiritual healing, manifestation, and divine guidance.`;
    const videos = await getVideoRecommendations('spiritual healing', videoPrompt);

    const angelGuidance: AngelGuidance = {
      stones: guidanceData.stones || ['Clear Quartz', 'Amethyst', 'Rose Quartz'],
      luckyColor: guidanceData.luckyColor || 'White',
      luckyNumber: guidanceData.luckyNumber || 7,
      mantra: guidanceData.mantra || 'I am guided and protected by divine light',
      subliminalVideo: videos[0] || {
        id: 'default',
        title: 'Angel Guidance Meditation',
        description: 'Divine guidance and healing',
        thumbnail: '',
        type: 'subliminal'
      },
      message: guidanceData.message || 'You are divinely guided and protected. Trust in the universe\'s plan for you.',
      lifePathNumber: request.lifePathNumber,
      lifePathMeaning: guidanceData.lifePathMeaning || 'Your life path represents your spiritual journey and purpose.'
    };

    console.log('✨ Angel guidance prepared:', angelGuidance);
    return angelGuidance;

  } catch (error) {
    console.error('❌ Error getting angel guidance:', error);

    // Fallback guidance
    const videos = await getVideoRecommendations('spiritual healing', 'Angel guidance meditation and divine healing');

    return {
      stones: ['Clear Quartz', 'Amethyst', 'Selenite'],
      luckyColor: 'White',
      luckyNumber: 7,
      mantra: 'I am surrounded by divine love and light',
      subliminalVideo: videos[0] || {
        id: 'fallback',
        title: 'Divine Guidance Meditation',
        description: 'Connect with your guardian angels',
        thumbnail: '',
        type: 'subliminal'
      },
      message: 'The angels are always with you, guiding you towards your highest good. Trust in divine timing and have faith in your journey.',
      lifePathNumber: request.lifePathNumber,
      lifePathMeaning: 'Your life path number reveals your soul\'s purpose and the lessons you came here to learn.'
    };
  }
};

export async function analyzeHandReading(imageFile: File): Promise<PalmReadingAnalysis> {
  console.log('👋 Analyzing hand reading for image:', imageFile.name);

  try {
    // Convert image to base64
    const base64Image = await convertImageToBase64(imageFile);
    console.log('📸 Image converted to base64, size:', base64Image.length);

    // Use the same successful approach as i2OOp-main project
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use the same model that works in i2OOp-main
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `As an expert Indian palmist and Vedic astrologer, analyze this hand image and provide a comprehensive palm reading incorporating traditional Indian palmistry and astrology. Focus on all visible lines, mounts, and finger characteristics. Structure your response as a JSON object with the following format:

{
  "majorLines": {
    "lifeLine": "detailed description of the life line and its meaning for longevity and vitality",
    "heartLine": "detailed description of the heart line and emotional nature", 
    "headLine": "detailed description of the head line and mental qualities",
    "fateLine": "detailed description of the fate line and destiny",
    "marriageLine": "analysis of marriage line(s) and relationship prospects",
    "travelLine": "analysis of travel lines and foreign connections",
    "childrenLine": "analysis of children lines and offspring potential",
    "moneyLine": "analysis of money lines and wealth indicators"
  },
  "mountAnalysis": {
    "mountOfVenus": "Venus mount analysis for love, passion, and family life",
    "mountOfJupiter": "Jupiter mount analysis for leadership and wisdom",
    "mountOfSaturn": "Saturn mount analysis for discipline and responsibility",
    "mountOfSun": "Sun mount analysis for fame, success, and creativity",
    "mountOfMercury": "Mercury mount analysis for communication and business",
    "mountOfMars": "Mars mount analysis for courage and aggression",
    "mountOfMoon": "Moon mount analysis for imagination and intuition",
    "mountOfRahu": "Rahu influence analysis for desires and worldly pursuits",
    "mountOfKetu": "Ketu influence analysis for spirituality and detachment"
  },
  "fingerAnalysis": {
    "thumb": "thumb analysis for willpower and logic",
    "indexFinger": "index finger analysis for ambition and leadership",
    "middleFinger": "middle finger analysis for responsibility and balance", 
    "ringFinger": "ring finger analysis for creativity and self-expression",
    "littleFinger": "little finger analysis for communication and business acumen"
  },
  "characterReading": {
    "personality": "personality traits based on hand analysis",
    "strengths": "identified strengths and positive qualities",
    "challenges": "potential challenges or areas for growth",
    "talents": "natural talents and abilities",
    "spiritualNature": "spiritual inclinations and dharmic path",
    "karmaAnalysis": "karmic patterns and past life influences"
  },
  "lifePredictions": {
    "career": "career and professional life insights with timing",
    "relationships": "love, marriage and relationship insights",
    "health": "health and wellness insights with vulnerable areas",
    "wealth": "financial prospects and money matters with timing",
    "family": "family life and relationships with parents/siblings",
    "education": "educational prospects and knowledge acquisition",
    "spiritualJourney": "spiritual evolution and moksha path",
    "karma": "karmic lessons and dharmic purpose in this life"
  },
  "indianAstrology": {
    "rahuInfluence": "detailed analysis of Rahu's influence on the person's life",
    "ketuInfluence": "detailed analysis of Ketu's influence and spiritual journey",
    "vedicRemedies": ["specific Vedic remedy 1", "specific Vedic remedy 2", "specific Vedic remedy 3"],
    "yantraRecommendations": ["recommended yantra 1", "recommended yantra 2"],
    "rudrakshaGuidance": "specific Rudraksha recommendations with mukhi details",
    "fasting": ["fasting day 1", "fasting day 2"],
    "donations": ["donation recommendation 1", "donation recommendation 2"],
    "templeVisits": ["specific temple/deity 1", "specific temple/deity 2"]
  },
  "recommendations": {
    "gemstones": "recommended gemstones with specific details and wearing instructions",
    "colors": "lucky colors based on planetary influences",
    "mantras": "beneficial mantras with specific chanting instructions",
    "lifestyle": "lifestyle recommendations for optimal living",
    "spiritual": "spiritual practices that would benefit the person",
    "vedicRituals": "specific Vedic rituals and pujas to perform"
  }
}

Provide a comprehensive Indian palmistry analysis incorporating Vedic astrology principles. Focus on visible features and provide meaningful interpretations rooted in traditional Indian palmistry. Respond ONLY with the JSON object, no additional text or markdown formatting.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageFile.type};base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 2000
    });

    console.log('🤖 OpenAI Vision response:', response.choices[0].message.content);

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response content from OpenAI Vision');
    }

    try {
      // Clean the response
      let cleanContent = content.trim();

      // Remove any markdown formatting if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\s*/, '').replace(/```\s*$/, '');
      }

      const analysis = JSON.parse(cleanContent);
      console.log('✅ Successfully parsed hand reading analysis');
      return analysis;
    } catch (parseError) {
      console.error('❌ Failed to parse hand reading JSON:', parseError);
      console.log('Raw response:', content);

      // If the response contains refusal text, throw specific error
      if (content.toLowerCase().includes("unable to analyze") ||
        content.toLowerCase().includes("cannot analyze") ||
        content.toLowerCase().includes("can't analyze") ||
        content.toLowerCase().includes("unable to provide") ||
        content.toLowerCase().includes("cannot provide")) {
        throw new Error('OpenAI Vision cannot analyze this palm image clearly. Please try uploading a clearer image with better lighting and visible palm lines.');
      }

      throw new Error('Failed to parse palm reading analysis. Please try again with a clearer image.');
    }
  } catch (error) {
    console.error('❌ Error analyzing hand reading:', error);

    // Return a meaningful error message
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to analyze palm reading. Please ensure the image shows a clear view of the palm with good lighting.');
  }
}

export const analyzeKundli = async (
  name: string,
  birthDate: string,
  birthTime: string,
  birthPlace: string
): Promise<KundliAnalysis> => {
  console.log('🔮 Analyzing kundli for:', { name, birthDate, birthTime, birthPlace });

  try {
    const prompt = `As an expert Vedic astrologer, create a comprehensive Kundli (birth chart) analysis for:

Name: ${name}
Birth Date: ${birthDate}
Birth Time: ${birthTime}
Birth Place: ${birthPlace}

Provide detailed analysis including:

1. Planetary Positions in signs and houses
2. Analysis of all 12 houses and their significance
3. Dosha analysis (Manglik, Kal Sarp, Pitru Dosh)
4. Life predictions for different areas
5. Remedies and gemstone recommendations
6. Favorable and unfavorable time periods

Format your response as JSON:
{
  "planetaryPositions": {
    "sun": "sign and house with meaning",
    "moon": "sign and house with meaning",
    "mars": "sign and house with meaning",
    "mercury": "sign and house with meaning",
    "jupiter": "sign and house with meaning",
    "venus": "sign and house with meaning",
    "saturn": "sign and house with meaning",
    "rahu": "sign and house with meaning",
    "ketu": "sign and house with meaning"
  },
  "houses": {
    "1st": "self, personality analysis",
    "2nd": "wealth, family analysis",
    "3rd": "siblings, communication analysis",
    "4th": "home, mother analysis",
    "5th": "children, education analysis",
    "6th": "health, enemies analysis",
    "7th": "marriage, partnership analysis",
    "8th": "longevity, transformation analysis",
    "9th": "fortune, spirituality analysis",
    "10th": "career, reputation analysis",
    "11th": "gains, friends analysis",
    "12th": "losses, spirituality analysis"
  },
  "doshas": {
    "manglik": true/false,
    "kalSarp": true/false,
    "pitruDosh": true/false,
    "description": "detailed dosha analysis"
  },
  "predictions": {
    "career": "detailed career predictions",
    "marriage": "detailed marriage predictions",
    "health": "detailed health predictions",
    "finance": "detailed finance predictions",
    "education": "detailed education predictions"
  },
  "remedies": ["remedy1", "remedy2", "remedy3"],
  "gemstones": ["gemstone1", "gemstone2"],
  "favorableDays": ["Monday", "Wednesday"],
  "unfavorableDays": ["Saturday", "Tuesday"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('🤖 OpenAI kundli response:', content);

    // Parse JSON response
    let kundliData;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      kundliData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse kundli JSON:', parseError);
      throw new Error('Failed to parse kundli response');
    }

    const kundliAnalysis: KundliAnalysis = {
      basicInfo: {
        name,
        birthDate,
        birthTime,
        birthPlace
      },
      planetaryPositions: kundliData.planetaryPositions || {
        sun: 'Sun in Leo in 1st house - Strong personality and leadership',
        moon: 'Moon in Cancer in 12th house - Emotional and intuitive',
        mars: 'Mars in Aries in 9th house - Energetic and spiritual',
        mercury: 'Mercury in Virgo in 2nd house - Practical communication',
        jupiter: 'Jupiter in Sagittarius in 5th house - Wisdom and creativity',
        venus: 'Venus in Libra in 3rd house - Harmonious relationships',
        saturn: 'Saturn in Capricorn in 6th house - Disciplined work ethic',
        rahu: 'Rahu in Gemini in 11th house - Innovative gains',
        ketu: 'Ketu in Sagittarius in 5th house - Spiritual wisdom'
      },
      houses: kundliData.houses || {
        '1st': 'Strong personality with natural leadership qualities',
        '2nd': 'Steady wealth accumulation through hard work',
        '3rd': 'Good communication skills and supportive siblings',
        '4th': 'Harmonious home environment and caring mother',
        '5th': 'Creative abilities and potential for children',
        '6th': 'Good health with ability to overcome challenges',
        '7th': 'Successful marriage and business partnerships',
        '8th': 'Transformation and hidden knowledge',
        '9th': 'Fortune through spirituality and higher learning',
        '10th': 'Successful career with good reputation',
        '11th': 'Gains through friends and network',
        '12th': 'Spiritual growth and foreign connections'
      },
      doshas: kundliData.doshas || {
        manglik: false,
        kalSarp: false,
        pitruDosh: false,
        description: 'Your kundli is generally free from major doshas, indicating a balanced life path.'
      },
      predictions: kundliData.predictions || {
        career: 'Strong career prospects with leadership opportunities. Success in business or government sectors.',
        marriage: 'Harmonious marriage with a compatible partner. Good family life and supportive spouse.',
        health: 'Generally good health with strong constitution. Minor issues may arise due to stress.',
        finance: 'Steady financial growth with multiple income sources. Avoid risky investments.',
        education: 'Good educational prospects with potential for higher studies and specialization.'
      },
      remedies: kundliData.remedies || [
        'Chant Gayatri Mantra daily',
        'Donate to charity on Tuesdays',
        'Wear yellow clothes on Thursdays',
        'Visit temples regularly'
      ],
      gemstones: kundliData.gemstones || ['Ruby', 'Pearl', 'Yellow Sapphire'],
      favorableDays: kundliData.favorableDays || ['Sunday', 'Monday', 'Thursday'],
      unfavorableDays: kundliData.unfavorableDays || ['Saturday', 'Tuesday']
    };

    console.log('✨ Kundli analysis completed:', kundliAnalysis);
    return kundliAnalysis;

  } catch (error) {
    console.error('❌ Error analyzing kundli:', error);
    throw error;
  }
};

export const analyzeKundliPdf = async (pdfFile: File): Promise<string> => {
  console.log('📄 Analyzing kundli PDF:', pdfFile.name);

  // Note: PDF analysis is not yet fully supported by OpenAI API
  // This function is a placeholder for future implementation

  const prompt = `You are a master Vedic astrologer. I'm providing a Kundli (birth chart) PDF document. Please analyze this document and provide a comprehensive astrological reading covering:

1. **Planetary Positions**: Extract and interpret the positions of all 9 planets
2. **House Analysis**: Analyze all 12 houses and their significance  
3. **Doshas & Yogas**: Identify any important doshas (Manglik, Kal Sarp, etc.) or beneficial yogas
4. **Life Predictions**: Detailed predictions for career, marriage, health, finance, education
5. **Remedies**: Suggest specific remedies, gemstones, mantras, and favorable periods

Please provide a detailed, well-structured analysis in markdown format. Focus on practical insights and actionable guidance.`;

  try {
    // Note: OpenAI's current API doesn't directly support PDF files in chat completions
    // This is a placeholder for when PDF support is added or we can use a different approach
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt + `\n\nPDF File: ${pdfFile.name} (${(pdfFile.size / 1024).toFixed(1)}KB)`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI for PDF analysis');
    }

    return content;
  } catch (error) {
    console.error('❌ Error analyzing PDF:', error);
    throw new Error('PDF analysis is currently not supported. Please use the manual form input instead.');
  }
};

export const getDietRecommendations = async (healthProfile: HealthProfile): Promise<DietRecommendation> => {
  try {
    console.log('🥗 Generating AI diet recommendations for:', healthProfile.healthGoals);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `          You are a certified nutritionist, Ayurvedic doctor, yoga therapist, and wellness expert with deep knowledge of:
          - Clinical nutrition and dietetics
          - Ayurvedic medicine and doshas
          - Yoga therapy and traditional asanas
          - Pranayama (breathing techniques)
          - Home remedies and natural healing
          - Exercise physiology and fitness
          - Meditation and mindfulness practices
          - Supplement science and herbal medicine
          
          Generate comprehensive, personalized diet and wellness recommendations that are:
          - Medically sound and evidence-based
          - Culturally appropriate for Indian/global audiences
          - Practical and actionable
          - Holistic (mind-body-spirit approach)
          
          Always provide specific YouTube video search terms that would yield relevant content, real supplement names available on Amazon, and authentic Ayurvedic remedies.`
        },
        {
          role: "user",
          content: `Create a comprehensive diet and wellness plan for this person:
          
          **Personal Details:**
          - Height: ${healthProfile.height}
          - Weight: ${healthProfile.weight}
          - Age: ${healthProfile.age}
          - Gender: ${healthProfile.gender}
          - Fitness Level: ${healthProfile.fitnessLevel}
          
          **Health Information:**
          - Medical History: ${healthProfile.medicalHistory.join(', ') || 'None specified'}
          - Current Medications: ${healthProfile.currentMedications || 'None'}
          - Allergies: ${healthProfile.allergies || 'None'}
          - Dietary Restrictions: ${healthProfile.dietaryRestrictions.join(', ') || 'None'}
          
          **Goals & Concerns:**
          - Health Goals: ${healthProfile.healthGoals}
          - Detailed Description: ${healthProfile.description}
          
          Please provide a complete wellness plan in JSON format with the following structure:
          {
            "id": "unique-id",
            "title": "Personalized title based on goals",
            "description": "Brief overview of the plan",
            "benefits": ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5"],
            "foods": {
              "include": ["specific foods to include - 10-15 items"],
              "avoid": ["specific foods to avoid - 8-12 items"]
            },
            "mealPlan": {
              "breakfast": ["4-5 breakfast options"],
              "lunch": ["4-5 lunch options"],
              "dinner": ["4-5 dinner options"],
              "snacks": ["4-5 healthy snack options"]
            },
            "recipes": [
              {
                "name": "Recipe 1 Name",
                "videoId": "search-term-for-youtube-recipe",
                "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
                "duration": "preparation time"
              },
              {
                "name": "Recipe 2 Name", 
                "videoId": "search-term-for-youtube-recipe",
                "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
                "duration": "preparation time"
              },
              {
                "name": "Recipe 3 Name",
                "videoId": "search-term-for-youtube-recipe", 
                "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
                "duration": "preparation time"
              }
            ],
            "supplements": [
              {
                "name": "Real supplement name available on Amazon",
                "dosage": "specific dosage instructions",
                "benefits": "specific health benefits",
                "amazonLink": "https://amazon.com/s?k=supplement-name-keywords"
              }
            ],
            "exercises": [
              {
                "name": "Exercise 1 Name",
                "videoId": "search-term-for-youtube-exercise",
                "duration": "workout duration",
                "difficulty": "Beginner/Intermediate/Advanced"
              }
            ],
            "juices": [
              {
                "name": "Juice 1 Name",
                "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
                "benefits": "specific health benefits",
                "videoId": "search-term-for-youtube-juice-recipe"
              }
            ],
                         "yoga": {
               "morningRoutine": {
                 "name": "Morning yoga routine name",
                 "duration": "routine duration",
                 "videoId": "search-term-for-youtube-morning-yoga",
                 "asanas": ["asana1", "asana2", "asana3", "asana4", "asana5"],
                 "benefits": "specific benefits for morning practice"
               },
               "therapeuticPoses": [
                 {
                   "condition": "specific health condition",
                   "poses": ["therapeutic pose1", "therapeutic pose2", "therapeutic pose3"],
                   "instructions": "detailed instructions for the poses",
                   "videoId": "search-term-for-therapeutic-yoga"
                 }
               ],
               "pranayama": {
                 "technique": "Specific breathing technique name",
                 "steps": ["step1", "step2", "step3", "step4"],
                 "duration": "practice duration",
                 "benefits": "breathing technique benefits",
                 "videoId": "search-term-for-pranayama-technique"
               },
               "eveningPractice": {
                 "name": "Evening yoga routine name",
                 "duration": "routine duration", 
                 "videoId": "search-term-for-evening-yoga",
                 "poses": ["evening pose1", "evening pose2", "evening pose3", "evening pose4"],
                 "benefits": "benefits for evening practice"
               }
             },
             "meditation": {
               "method": "Specific meditation technique suitable for this person",
               "duration": "recommended duration",
               "mantra": "Sanskrit mantra with translation",
               "benefits": "specific benefits for their condition",
               "videoId": "search-term-for-meditation-video",
               "instructions": ["step1", "step2", "step3", "step4", "step5"]
             },
             "timing": {
               "wakeUp": "recommended wake time",
               "breakfast": "breakfast time range",
               "lunch": "lunch time range", 
               "dinner": "dinner time range",
               "sleep": "recommended sleep time",
               "notes": "important timing notes and instructions"
             }
          }
          
          Make all recommendations specific to their health conditions, goals, and restrictions. Ensure all supplement names are real products available on Amazon, and all video search terms would yield relevant YouTube content.`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    console.log('🤖 Raw AI Response:', content);

    try {
      // Clean up the JSON response
      const jsonContent = content.replace(/```json\n|\n```/g, '').trim();
      const aiRecommendation = JSON.parse(jsonContent);

      // Search for actual YouTube video IDs for recipes, exercises, and juices
      const processedRecommendation = await processVideoRecommendations(aiRecommendation);

      console.log('✅ Generated diet recommendations:', {
        title: processedRecommendation.title,
        recipeCount: processedRecommendation.recipes.length,
        supplementCount: processedRecommendation.supplements.length,
        exerciseCount: processedRecommendation.exercises.length
      });

      return processedRecommendation;
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.log('⚠️ Falling back to generating structured recommendations');
      return await generateFallbackDietRecommendation(healthProfile);
    }
  } catch (error: any) {
    console.error('❌ Error getting diet recommendations:', error?.message || error);
    return await generateFallbackDietRecommendation(healthProfile);
  }
};

const processVideoRecommendations = async (recommendation: any): Promise<DietRecommendation> => {
  console.log('🔍 Processing video recommendations...');

  // Process recipe videos
  const processedRecipes = await Promise.all(
    recommendation.recipes.map(async (recipe: any) => {
      const searchQuery = typeof recipe.videoId === 'string' ? recipe.videoId : `${recipe.name} recipe healthy cooking`;
      let videoId = await getYouTubeVideoId(searchQuery);
      if (!videoId) {
        videoId = await getYouTubeVideoId(`healthy ${recipe.name} recipe`);
      }
      return {
        ...recipe,
        videoId: videoId || 'dVA9ZNKZr28' // fallback to a healthy recipe video
      };
    })
  );

  // Process exercise videos  
  const processedExercises = await Promise.all(
    recommendation.exercises.map(async (exercise: any) => {
      const searchQuery = typeof exercise.videoId === 'string' ? exercise.videoId : `${exercise.name} workout exercise`;
      let videoId = await getYouTubeVideoId(searchQuery);
      if (!videoId) {
        videoId = await getYouTubeVideoId(`beginner ${exercise.name} exercise`);
      }
      return {
        ...exercise,
        videoId: videoId || 'sTANio_2E0Q' // fallback to yoga video
      };
    })
  );

  // Process juice videos
  const processedJuices = await Promise.all(
    recommendation.juices.map(async (juice: any) => {
      const searchQuery = typeof juice.videoId === 'string' ? juice.videoId : `${juice.name} juice recipe healthy`;
      let videoId = await getYouTubeVideoId(searchQuery);
      if (!videoId) {
        videoId = await getYouTubeVideoId(`healthy ${juice.name} juice`);
      }
      return {
        ...juice,
        videoId: videoId || 'dVA9ZNKZr28' // fallback to healthy juice video
      };
    })
  );

  // Process yoga videos
  const processedYoga = {
    ...recommendation.yoga,
    morningRoutine: {
      ...recommendation.yoga.morningRoutine,
      videoId: await getYouTubeVideoId(recommendation.yoga.morningRoutine.videoId) || 'sTANio_2E0Q'
    },
    therapeuticPoses: await Promise.all(
      recommendation.yoga.therapeuticPoses.map(async (pose: any) => ({
        ...pose,
        videoId: await getYouTubeVideoId(pose.videoId) || 'sTANio_2E0Q'
      }))
    ),
    pranayama: {
      ...recommendation.yoga.pranayama,
      videoId: await getYouTubeVideoId(recommendation.yoga.pranayama.videoId) || 'ZToicYcHIOU'
    },
    eveningPractice: {
      ...recommendation.yoga.eveningPractice,
      videoId: await getYouTubeVideoId(recommendation.yoga.eveningPractice.videoId) || 'sTANio_2E0Q'
    }
  };

  // Process meditation video
  const processedMeditation = {
    ...recommendation.meditation,
    videoId: await getYouTubeVideoId(recommendation.meditation.videoId) || 'ZToicYcHIOU'
  };

  return {
    ...recommendation,
    recipes: processedRecipes,
    exercises: processedExercises,
    juices: processedJuices,
    yoga: processedYoga,
    meditation: processedMeditation
  };
};

const generateFallbackDietRecommendation = async (healthProfile: HealthProfile): Promise<DietRecommendation> => {
  console.log('🔄 Generating fallback diet recommendation');

  const goal = healthProfile.healthGoals || 'general wellness';
  const hasConditions = healthProfile.medicalHistory.length > 0;
  const isVegetarian = healthProfile.dietaryRestrictions.includes('Vegetarian');
  const isVegan = healthProfile.dietaryRestrictions.includes('Vegan');

  // Generate appropriate recipes with video IDs
  const recipeVideoIds = await Promise.all([
    getYouTubeVideoId('healthy green smoothie recipe detox').then(id => id || 'dVA9ZNKZr28'),
    getYouTubeVideoId('quinoa bowl recipe healthy meal prep').then(id => id || 'ULHEWLKfb2c'),
    getYouTubeVideoId('turmeric golden milk recipe anti inflammatory').then(id => id || 'wKBl2wYNjCo')
  ]);

  // Generate exercise video IDs
  const exerciseVideoIds = await Promise.all([
    getYouTubeVideoId('morning yoga flow beginners 20 minutes').then(id => id || 'sTANio_2E0Q'),
    getYouTubeVideoId('cardio hiit workout home 15 minutes').then(id => id || 'ml6cT4AZdqI'),
    getYouTubeVideoId('strength training beginners full body').then(id => id || 'R6gZoAzAhCg')
  ]);

  // Generate juice video IDs
  const juiceVideoIds = await Promise.all([
    getYouTubeVideoId('green detox juice recipe cucumber celery').then(id => id || 'dVA9ZNKZr28'),
    getYouTubeVideoId('immunity booster juice orange carrot ginger').then(id => id || 'kx5k7-5CmRw'),
    getYouTubeVideoId('digestive juice pineapple mint ginger').then(id => id || 'Kw6e8tAyIfU')
  ]);

  // Generate meditation video ID
  const meditationVideoId = await getYouTubeVideoId('guided mindfulness meditation breathing mantra').then(id => id || 'ZToicYcHIOU');

  return {
    id: `diet-${Date.now()}`,
    title: `Personalized Wellness Plan for ${goal}`,
    description: `A comprehensive diet and lifestyle plan tailored to your health profile and wellness goals`,
    benefits: [
      'Improved energy and vitality',
      'Better digestive health',
      'Enhanced immune system',
      'Balanced nutrition',
      'Stress reduction and mental clarity'
    ],
    foods: {
      include: [
        'Whole grains (quinoa, brown rice, oats)',
        'Fresh fruits (berries, citrus, apples, bananas)',
        'Leafy greens (spinach, kale, lettuce)',
        'Lean proteins (fish, chicken, legumes, tofu)',
        'Nuts and seeds (almonds, walnuts, chia, flax)',
        'Healthy fats (avocado, olive oil, coconut oil)',
        'Herbs and spices (turmeric, ginger, garlic)',
        'Fermented foods (yogurt, kefir, kimchi)',
        'Herbal teas (green tea, chamomile, tulsi)',
        'Seasonal vegetables (broccoli, carrots, bell peppers)'
      ],
      avoid: [
        'Processed and packaged foods',
        'Refined sugars and artificial sweeteners',
        'Trans fats and deep fried foods',
        'Excessive caffeine and alcohol',
        'High sodium processed meats',
        'Artificial additives and preservatives',
        'Sugary beverages and sodas',
        'White flour and refined grains'
      ]
    },
    mealPlan: {
      breakfast: [
        'Oatmeal with berries and nuts',
        'Green smoothie with spinach and fruits',
        'Whole grain toast with avocado',
        'Greek yogurt with honey and seeds',
        'Herbal tea or green tea'
      ],
      lunch: [
        'Quinoa salad with mixed vegetables',
        'Lentil soup with whole grain bread',
        'Grilled fish/chicken with steamed vegetables',
        'Buddha bowl with greens and protein',
        'Fresh fruit salad'
      ],
      dinner: [
        'Vegetable curry with brown rice',
        'Grilled protein with roasted vegetables',
        'Legume-based dal with chapati',
        'Stir-fried vegetables with tofu',
        'Herbal tea before bed'
      ],
      snacks: [
        'Mixed nuts and seeds',
        'Fresh seasonal fruits',
        'Vegetable sticks with hummus',
        'Herbal tea with honey',
        'Homemade energy balls'
      ]
    },
    recipes: [
      {
        name: 'Detox Green Smoothie',
        videoId: recipeVideoIds[0],
        ingredients: ['Spinach', 'Banana', 'Apple', 'Ginger', 'Lemon', 'Coconut water'],
        duration: '5 minutes'
      },
      {
        name: 'Nourishing Quinoa Buddha Bowl',
        videoId: recipeVideoIds[1],
        ingredients: ['Quinoa', 'Chickpeas', 'Mixed vegetables', 'Tahini', 'Lemon'],
        duration: '30 minutes'
      },
      {
        name: 'Golden Turmeric Milk',
        videoId: recipeVideoIds[2],
        ingredients: ['Turmeric', 'Plant milk', 'Ginger', 'Honey', 'Black pepper'],
        duration: '10 minutes'
      }
    ],
    supplements: [
      {
        name: 'Organic Turmeric Curcumin with BioPerine',
        dosage: '500mg daily with meals',
        benefits: 'Anti-inflammatory support, joint health, antioxidant properties',
        amazonLink: 'https://amazon.com/s?k=organic+turmeric+curcumin+bioperine'
      },
      {
        name: 'KSM-66 Ashwagandha Root Extract',
        dosage: '300mg twice daily',
        benefits: 'Stress relief, energy boost, hormonal balance, sleep quality',
        amazonLink: 'https://amazon.com/s?k=ksm66+ashwagandha+root+extract'
      },
      {
        name: 'Organic Triphala Powder',
        dosage: '1 teaspoon before bed with warm water',
        benefits: 'Digestive health, detoxification, bowel regularity',
        amazonLink: 'https://amazon.com/s?k=organic+triphala+powder'
      }
    ],
    exercises: [
      {
        name: 'Morning Yoga Flow',
        videoId: exerciseVideoIds[0],
        duration: '20 minutes',
        difficulty: 'Beginner'
      },
      {
        name: 'Cardio HIIT Workout',
        videoId: exerciseVideoIds[1],
        duration: '15 minutes',
        difficulty: 'Intermediate'
      },
      {
        name: 'Full Body Strength Training',
        videoId: exerciseVideoIds[2],
        duration: '25 minutes',
        difficulty: 'Beginner'
      }
    ],
    juices: [
      {
        name: 'Green Detox Juice',
        ingredients: ['Cucumber', 'Celery', 'Spinach', 'Lemon', 'Ginger'],
        benefits: 'Detoxification, hydration, alkalizing, liver support',
        videoId: juiceVideoIds[0]
      },
      {
        name: 'Immunity Booster Juice',
        ingredients: ['Orange', 'Carrot', 'Ginger', 'Turmeric', 'Lemon'],
        benefits: 'Immune support, anti-inflammatory, vitamin C boost',
        videoId: juiceVideoIds[1]
      },
      {
        name: 'Digestive Wellness Juice',
        ingredients: ['Pineapple', 'Mint', 'Ginger', 'Lime', 'Fennel'],
        benefits: 'Improves digestion, reduces bloating, enzyme support',
        videoId: juiceVideoIds[2]
      }
    ],
    yoga: {
      morningRoutine: {
        name: 'Energizing Morning Flow',
        duration: '20 minutes',
        videoId: exerciseVideoIds[0], // Morning yoga flow
        asanas: ['Surya Namaskara (Sun Salutation)', 'Vrikshasana (Tree Pose)', 'Bhujangasana (Cobra Pose)', 'Adho Mukha Svanasana (Downward Dog)', 'Sukhasana (Easy Pose)'],
        benefits: 'Increases energy, improves flexibility, boosts metabolism, enhances mental clarity'
      },
      therapeuticPoses: healthProfile.medicalHistory.length > 0 ? [
        {
          condition: healthProfile.medicalHistory[0],
          poses: ['Balasana (Child\'s Pose)', 'Shavasana (Corpse Pose)', 'Viparita Karani (Legs Up Wall)', 'Marjaryasana (Cat Pose)'],
          instructions: 'Hold each pose for 30-60 seconds. Focus on gentle breathing and relaxation. Never force any position.',
          videoId: exerciseVideoIds[0]
        }
      ] : [
        {
          condition: 'General Wellness',
          poses: ['Balasana (Child\'s Pose)', 'Shavasana (Corpse Pose)', 'Sukhasana (Easy Pose)', 'Bhujangasana (Cobra Pose)'],
          instructions: 'Practice these poses daily for overall wellness. Hold each pose for 30-60 seconds with mindful breathing.',
          videoId: exerciseVideoIds[0]
        }
      ],
      pranayama: {
        technique: 'Anulom Vilom (Alternate Nostril Breathing)',
        steps: [
          'Sit comfortably with spine straight',
          'Close right nostril with thumb, inhale through left nostril',
          'Close left nostril with ring finger, release thumb, exhale through right nostril',
          'Inhale through right nostril',
          'Close right nostril, release left nostril, exhale through left nostril',
          'This completes one cycle. Repeat 5-10 times'
        ],
        duration: '10-15 minutes',
        benefits: 'Balances nervous system, reduces stress, improves concentration, enhances lung capacity',
        videoId: juiceVideoIds[0] // Will be replaced with pranayama video
      },
      eveningPractice: {
        name: 'Relaxing Evening Sequence',
        duration: '15 minutes',
        videoId: exerciseVideoIds[0],
        poses: ['Balasana (Child\'s Pose)', 'Supta Baddha Konasana (Reclined Butterfly)', 'Viparita Karani (Legs Up Wall)', 'Shavasana (Corpse Pose)'],
        benefits: 'Promotes relaxation, improves sleep quality, reduces stress, calms the mind'
      }
    },
    meditation: {
      method: 'Mindful Breathing with Healing Mantras',
      duration: '15-20 minutes daily',
      mantra: 'Om Gam Ganapataye Namaha (Om Gam Ga-na-pa-ta-ye Na-ma-ha) - Removes obstacles to health and wellness',
      benefits: 'Reduces stress hormones, improves focus, enhances healing response, balances nervous system',
      videoId: meditationVideoId,
      instructions: [
        'Find a quiet, comfortable place to sit with your spine straight',
        'Close your eyes gently and take three deep breaths',
        'Begin to observe your natural breath without changing it',
        'When thoughts arise, acknowledge them and gently return to your breath',
        'Silently repeat your chosen mantra with each exhale',
        'Continue for the recommended duration, ending with gratitude'
      ]
    },
    timing: {
      wakeUp: '6:00-6:30 AM',
      breakfast: '7:00-8:00 AM',
      lunch: '12:00-1:00 PM',
      dinner: '7:00-8:00 PM',
      sleep: '10:00-10:30 PM',
      notes: 'Drink warm water upon waking. Eat meals mindfully. Avoid eating 2-3 hours before bed. Stay hydrated throughout the day.'
    }
  };
};

export const getPujaRecommendations = async (request: PujaRequest): Promise<PujaRecommendation> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in Hindu religious ceremonies, rituals, and traditions. Provide detailed puja recommendations including procedures, essential items, spiritual benefits, and pandit requirements. Format your response as valid JSON."
        },
        {
          role: "user",
          content: `Please provide detailed puja recommendations for:
          - Puja Type: ${request.pujaType}
          - Deity: ${request.deity}
          - Occasion: ${request.occasion}
          - Location: ${request.location}
          - Participants: ${request.participants}
          - Budget: ${request.budget}
          - Special Requirements: ${request.specialRequirements}
          - Description: ${request.description}
          
          Format as JSON with the following structure:
          {
            "pujaName": "string",
            "description": "string",
            "duration": "string",
            "deity": "string",
            "auspiciousTime": "string",
            "benefits": ["string"],
            "essentialItems": [{"name": "string", "purpose": "string", "price": "string", "amazonLink": "string"}],
            "procedures": [{"step": number, "action": "string", "items": ["string"], "mantra": "string"}],
            "videos": [{"title": "string", "description": "string", "videoId": "string"}],
            "panditRequirements": {
              "specialization": ["string"],
              "languages": ["string"],
              "experience": "string",
              "estimatedCost": "string"
            },
            "preparation": ["string"]
          }`
        }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from AI');

    try {
      const jsonContent = content.replace(/```json\n|\n```/g, '').trim();
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse puja recommendations JSON:', parseError);
      return generateFallbackPujaRecommendation(request);
    }
  } catch (error) {
    console.error('Error getting puja recommendations:', error);
    return generateFallbackPujaRecommendation(request);
  }
};

const generateFallbackPujaRecommendation = (request: PujaRequest): PujaRecommendation => {
  return {
    pujaName: `${request.deity} Puja`,
    description: `A traditional and spiritually enriching puja dedicated to ${request.deity} for ${request.occasion || 'general blessings'}`,
    duration: "2-3 hours",
    deity: request.deity,
    auspiciousTime: "Early morning (6:00 AM - 8:00 AM) or evening (6:00 PM - 8:00 PM)",
    benefits: [
      "Spiritual purification and cleansing",
      "Divine blessings and protection",
      "Peace and harmony in the home",
      "Removal of obstacles and negative energies",
      "Increased prosperity and well-being"
    ],
    essentialItems: [
      {
        name: "Coconut",
        purpose: "Offering to the deity",
        price: "$2-3",
        amazonLink: "https://amazon.com/search?k=fresh+coconut"
      },
      {
        name: "Incense Sticks",
        purpose: "Creating sacred atmosphere",
        price: "$5-10",
        amazonLink: "https://amazon.com/search?k=incense+sticks"
      },
      {
        name: "Flowers",
        purpose: "Worship and decoration",
        price: "$10-20",
        amazonLink: "https://amazon.com/search?k=worship+flowers"
      },
      {
        name: "Diya/Oil Lamps",
        purpose: "Light offering",
        price: "$8-15",
        amazonLink: "https://amazon.com/search?k=diya+oil+lamps"
      }
    ],
    procedures: [
      {
        step: 1,
        action: "Preparation and purification",
        items: ["Water", "Clean cloth", "Sacred thread"],
        mantra: "Om Gan Ganapataye Namah"
      },
      {
        step: 2,
        action: "Invocation of the deity",
        items: ["Flowers", "Incense", "Bell"],
        mantra: "Om Namah Shivaya"
      },
      {
        step: 3,
        action: "Main worship and offerings",
        items: ["Coconut", "Fruits", "Sweets"],
        mantra: "Om Jai Jagdish Hare"
      }
    ],
    videos: [
      {
        title: "Traditional Puja Procedures",
        description: "Step-by-step guide to performing the puja",
        videoId: "dQw4w9WgXcQ"
      }
    ],
    panditRequirements: {
      specialization: ["Vedic rituals", "Sanskrit mantras", "Traditional ceremonies"],
      languages: ["Sanskrit", "Hindi", "English"],
      experience: "Minimum 5 years in conducting similar pujas",
      estimatedCost: "$100-300 depending on complexity"
    },
    preparation: [
      "Clean the puja area thoroughly",
      "Gather all essential items",
      "Take a purifying bath",
      "Wear clean, preferably traditional clothes",
      "Keep mobile phones on silent"
    ]
  };
};