export interface EasyEnglishWotd {
  word: string;
  phonetic: string;
  senses: Array<{
    partOfSpeech: string;
    simpleDefinition: string;
    example: string;
  }>;
}

export interface TranslationWotd {
  sourceText: string;
  translated: string;
  romanization?: string;
  notes?: string;
  example?: {
    source: string;
    target: string;
  };
}

export interface BanglaWotd {
  en: string;
  bn: string;
  pron?: string[];
  en_syns?: string[];
  bn_syns?: string[];
  sents?: string[];
}

export const EASY_ENGLISH_POOL: EasyEnglishWotd[] = [
  {
    word: "Resilience",
    phonetic: "/rɪˈzɪl.jəns/",
    senses: [
      {
        partOfSpeech: "noun",
        simpleDefinition: "The ability to recover quickly from difficulties, tough situations, or changes.",
        example: "Her resilience helped her overcome every obstacle in her studies.",
      },
    ],
  },
  {
    word: "Serendipity",
    phonetic: "/ˌser.ənˈdɪp.ə.ti/",
    senses: [
      {
        partOfSpeech: "noun",
        simpleDefinition: "Finding pleasant or valuable things by chance in a happy and unexpected way.",
        example: "Meeting my best friend on that delayed train was pure serendipity.",
      },
    ],
  },
  {
    word: "Eloquent",
    phonetic: "/ˈel.ə.kwənt/",
    senses: [
      {
        partOfSpeech: "adjective",
        simpleDefinition: "Fluent or persuasive in speaking or writing; expressing feelings clearly and beautifully.",
        example: "The student gave an eloquent speech about human kindness.",
      },
    ],
  },
  {
    word: "Empathy",
    phonetic: "/ˈem.pə.θi/",
    senses: [
      {
        partOfSpeech: "noun",
        simpleDefinition: "The ability to understand and share the feelings of another person.",
        example: "Having empathy allows us to connect deeply with people from different backgrounds.",
      },
    ],
  },
  {
    word: "Tenacious",
    phonetic: "/təˈneɪ.ʃəs/",
    senses: [
      {
        partOfSpeech: "adjective",
        simpleDefinition: "Holding fast; persistent, determined, and never giving up easily.",
        example: "She was tenacious in pursuing her goal of becoming a software engineer.",
      },
    ],
  },
  {
    word: "Pragmatic",
    phonetic: "/præɡˈmæt.ɪk/",
    senses: [
      {
        partOfSpeech: "adjective",
        simpleDefinition: "Dealing with things sensibly and realistically based on practical considerations rather than theoretical ones.",
        example: "We need a pragmatic solution that works within our current budget.",
      },
    ],
  },
  {
    word: "Luminous",
    phonetic: "/ˈluː.mɪ.nəs/",
    senses: [
      {
        partOfSpeech: "adjective",
        simpleDefinition: "Emitting or reflecting light; glowing softly and brightly.",
        example: "The luminous moon lit up the calm night ocean.",
      },
    ],
  },
];

export const EN_KO_POOL: TranslationWotd[] = [
  {
    sourceText: "Gratitude",
    translated: "감사",
    romanization: "gamsa",
    notes: "Expressing thankfulness; commonly used in '감사합니다' (gamsahamnida - thank you).",
    example: {
      source: "Gratitude brings peace to mind.",
      target: "감사는 마음에 평화를 가져다줍니다.",
    },
  },
  {
    sourceText: "Perseverance",
    translated: "인내",
    romanization: "innae",
    notes: "Patience, endurance, and continuous effort in difficult times.",
    example: {
      source: "Success comes with perseverance.",
      target: "성공은 인내와 함께 옵니다.",
    },
  },
  {
    sourceText: "Opportunity",
    translated: "기회",
    romanization: "gihoe",
    notes: "A favorable moment or chance for advancement.",
    example: {
      source: "Every challenge is a new opportunity.",
      target: "모든 도전은 새로운 기회입니다.",
    },
  },
  {
    sourceText: "Friendship",
    translated: "우정",
    romanization: "ujeong",
    notes: "Warm affection and mutual trust between friends.",
    example: {
      source: "True friendship lasts forever.",
      target: "진정한 우정은 영원합니다.",
    },
  },
  {
    sourceText: "Courage",
    translated: "용기",
    romanization: "yonggi",
    notes: "Bravery and confidence in the face of fear or challenge.",
    example: {
      source: "Have courage to follow your dream.",
      target: "꿈을 따를 용기를 가지세요.",
    },
  },
];

export const KO_EN_POOL: TranslationWotd[] = [
  {
    sourceText: "설레임",
    translated: "Fluttering Excitement",
    romanization: "seolleim",
    notes: "The sweet, nervous anticipation or fluttering feeling before a happy event or seeing someone special.",
    example: {
      source: "새로운 시작은 늘 설레임을 줍니다.",
      target: "A new beginning always brings fluttering excitement.",
    },
  },
  {
    sourceText: "소확행",
    translated: "Small but Certain Happiness",
    romanization: "so-hwak-haeng",
    notes: "A popular Korean concept of appreciating simple, everyday moments of joy (e.g. A hot cup of tea).",
    example: {
      source: "따뜻한 커피 한 잔의 소확행.",
      target: "The small but certain happiness of a warm cup of coffee.",
    },
  },
  {
    sourceText: "정",
    translated: "Deep Affection & Bonding",
    romanization: "jeong",
    notes: "A unique Korean cultural concept of warm, unspoken emotional bond, empathy, and loyalty built over time.",
    example: {
      source: "오랜 시간 함께하며 정이 들었습니다.",
      target: "Spending time together has deepened our bond and affection.",
    },
  },
  {
    sourceText: "눈치",
    translated: "Social Perceptiveness",
    romanization: "nunchi",
    notes: "The art of reading the room and sensing others' mood and unspoken atmosphere quickly.",
    example: {
      source: "그는 눈치가 빨라서 상황을 잘 파악합니다.",
      target: "He has great social perceptiveness and grasps situations quickly.",
    },
  },
  {
    sourceText: "열정",
    translated: "Passion",
    romanization: "yeoljeong",
    notes: "Strong zeal, enthusiasm, and dedication toward one's work or goals.",
    example: {
      source: "그녀의 배움에 대한 열정은 대단합니다.",
      target: "Her passion for learning is remarkable.",
    },
  },
];

export const BN_EN_POOL: BanglaWotd[] = [
  {
    bn: "অনুপ্রেরণা",
    en: "Inspiration",
    pron: ["on-u-pre-ro-na"],
    en_syns: ["Motivation", "Stimulus", "Encouragement"],
    sents: ["তার সাফল্য সবার জন্য একটি অনুপ্রেরণা।"],
  },
  {
    bn: "অধ্যবসায়",
    en: "Perseverance",
    pron: ["od-dho-bo-shay"],
    en_syns: ["Persistence", "Diligence", "Dedication"],
    sents: ["অধ্যবসায় যেকোনো কঠিন লক্ষ্য অর্জনের মূল চাবিকাঠি।"],
  },
  {
    bn: "কৃতজ্ঞতা",
    en: "Gratitude",
    pron: ["kri-tog-go-ta"],
    en_syns: ["Thankfulness", "Appreciation"],
    sents: ["আমরা আপনার সাহায্যের জন্য আন্তরিক কৃতজ্ঞতা প্রকাশ করছি।"],
  },
  {
    bn: "আকাঙ্ক্ষা",
    en: "Aspiration",
    pron: ["a-kang-kha"],
    en_syns: ["Desire", "Ambition", "Dream"],
    sents: ["উচ্চ আকাঙ্ক্ষা মানুষের সম্ভাবনাকে জাগ্রত করে।"],
  },
  {
    bn: "সৌহার্দ্য",
    en: "Goodwill & Harmony",
    pron: ["shou-har-ddo"],
    en_syns: ["Friendliness", "Amity", "Harmony"],
    sents: ["সবার সাথে সৌহার্দ্যপূর্ণ সম্পর্ক বজায় রাখুন।"],
  },
];

export const EN_BN_POOL: BanglaWotd[] = [
  {
    en: "Curiosity",
    bn: "কৌতূহল",
    pron: ["kou-tu-hol"],
    en_syns: ["Inquisitiveness", "Interest", "Wonder"],
    sents: ["Curiosity is the engine of achievement."],
  },
  {
    en: "Generosity",
    bn: "উদারতা",
    pron: ["u-da-ro-ta"],
    en_syns: ["Kindness", "Benevolence", "Magnanimity"],
    sents: ["True generosity brings warmth to the community."],
  },
  {
    en: "Integrity",
    bn: "সততা ও নিষ্ঠা",
    pron: ["so-to-ta"],
    en_syns: ["Honesty", "Uprightness", "Morality"],
    sents: ["Integrity is doing the right thing even when no one is watching."],
  },
  {
    en: "Compassion",
    bn: "সহমর্মিতা",
    pron: ["sho-ho-mor-mi-ta"],
    en_syns: ["Sympathy", "Kindness", "Empathy"],
    sents: ["Compassion connects hearts across barriers."],
  },
  {
    en: "Dedication",
    bn: "উৎসর্গ ও একাগ্রতা",
    pron: ["ut-shor-go"],
    en_syns: ["Commitment", "Devotion", "Loyalty"],
    sents: ["Great results require patience and dedication."],
  },
];

export function getDailyIndex(poolLength: number, offset: number = 0): number {
  if (poolLength <= 0) return 0;
  const now = new Date();
  // Day of year calculation
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return (dayOfYear + offset) % poolLength;
}
