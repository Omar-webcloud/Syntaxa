"use client";

import { useState, useEffect } from "react";
import { Search, X, Volume2, Loader2 } from "lucide-react";

interface DictionaryEntry {
  en: string;
  bn: string;
  pron?: string[];
  bn_syns?: string[];
  en_syns?: string[];
  sents?: string[];
}

export default function Dictionary() {
  const [query, setQuery] = useState("");
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>([]);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordOfDay, setWordOfDay] = useState<DictionaryEntry | null>(null);

  useEffect(() => {
    const fetchDictionary = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://raw.githubusercontent.com/MinhasKamal/BengaliDictionary/master/BengaliDictionary.json");
        if (!response.ok) throw new Error("Failed to fetch dictionary");
        const data = await response.json();
        setDictionary(data);
        
        // Select a random "Word of the Day"
        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setWordOfDay(data[randomIndex]);
        }
      } catch (err) {
        setError("Could not load dictionary data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDictionary();
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    const found = dictionary.find(entry => 
      entry.en.toLowerCase() === query.toLowerCase().trim()
    );
    setResult(found || null);
    if (!found) {
        setError(`No definition found for "${query}"`);
    } else {
        setError(null);
    }
  };

  const playSound = async (word: string) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      const data = await response.json();
      const audioUrl = data[0]?.phonetics?.find((p: any) => p.audio)?.audio;
      
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audio.play();
      } else {
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Audio play failed, falling back to synthesis", err);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        
        <div className="space-y-1">
          <h1 className="text-[20px] sm:text-3xl font-bold sm:font-extrabold text-[#111] dark:text-[#F3F4F6]">Dictionary</h1>
          <p className="text-gray-500 dark:text-[#9CA3AF] font-medium tracking-tight">From English to Bangla</p>
        </div>

        <div className="flex gap-3">
            <div className="relative flex-1">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search an English word..."
                    className="w-full h-[60px] bg-white dark:bg-[#1C1625] rounded-[24px] px-6 pr-12 text-base sm:text-[18px] font-medium shadow-sm border border-transparent dark:border-[#2D2438] focus:border-[#8A56A4] outline-none text-black dark:text-[#F3F4F6]"
                />
                {query && (
                    <button 
                        onClick={() => { setQuery(""); setResult(null); setError(null); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>
            <button 
                onClick={handleSearch}
                disabled={loading}
                className="w-[60px] h-[60px] bg-[#8A56A4] text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-transform disabled:opacity-50"
            >
                {loading ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
            </button>
        </div>

        {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-[24px] text-center font-bold">
                {error}
            </div>
        )}

        {result && (
            <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
                <div className="space-y-1">
                    <h2 className="text-[20px] sm:text-3xl font-bold sm:font-black text-[#8A56A4] dark:text-[#A87BC7]">{result.bn}</h2>
                    <p className="text-base sm:text-[18px] text-[#8A56A4] dark:text-[#A87BC7] opacity-70">
                        {result.pron && result.pron.length > 0 ? `/${result.pron[0]}/` : result.en}
                    </p>
                </div>

                <div className="space-y-4">
                    {result.en_syns && result.en_syns.length > 0 && (
                        <p className="text-base sm:text-[18px] font-bold leading-snug text-black dark:text-[#F3F4F6]">
                            Synonyms: {result.en_syns.slice(0, 3).join(", ")}
                        </p>
                    )}
                    {result.sents && result.sents.length > 0 ? (
                        <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D]">
                            <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic font-medium leading-relaxed">
                                &quot;{result.sents[0]}&quot;
                            </p>
                        </div>
                    ) : (
                        <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF]">No example sentences available.</p>
                    )}
                </div>

                <button 
                  onClick={() => playSound(result.en)}
                  className="w-full h-[60px] bg-[#8A56A4] text-white rounded-[24px] text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <Volume2 size={24} />
                    Listen Pronunciation
                </button>
            </div>
        )}

        {wordOfDay && !result && (
            <div className="space-y-4">
                <h3 className="text-lg sm:text-[20px] font-black px-2 dark:text-[#F3F4F6] text-black">Word of The Day</h3>
                
                <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-[20px] sm:text-3xl font-bold sm:font-black text-black dark:text-[#F3F4F6]">{wordOfDay.en}</h2>
                            <p className="text-base sm:text-[18px] text-[#8A56A4] dark:text-[#A87BC7] opacity-70">
                                {wordOfDay.pron && wordOfDay.pron.length > 0 ? `/${wordOfDay.pron[0]}/` : ""}
                            </p>
                        </div>
                        <span className="text-[20px] sm:text-2xl font-bold sm:font-black text-[#8A56A4] dark:text-[#A87BC7]">{wordOfDay.bn}</span>
                    </div>

                    <div className="space-y-4">
                        {wordOfDay.en_syns && wordOfDay.en_syns.length > 0 && (
                            <p className="text-base sm:text-[18px] font-bold leading-snug text-black dark:text-[#F3F4F6]">
                                {wordOfDay.en_syns[0]}
                            </p>
                        )}
                        {wordOfDay.sents && wordOfDay.sents.length > 0 && (
                            <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D]">
                                <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic font-medium leading-relaxed">
                                    &quot;{wordOfDay.sents[0]}&quot;
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                      onClick={() => playSound(wordOfDay.en)}
                      className="w-full h-[60px] bg-white dark:bg-[#1C1625] border-2 border-[#E8DDED] dark:border-[#2D2438] text-black dark:text-[#F3F4F6] rounded-[24px] text-[16px] font-bold flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                        <Volume2 size={24} />
                        Listen Pronunciation
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
