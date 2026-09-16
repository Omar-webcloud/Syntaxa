"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, Globe, BookOpen, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import PronunciationButton from "@/components/PronunciationButton";
import type { SimplifyDefinitionResponse, TranslateResponse } from "@/lib/ai/types";

// ─── Types ─────────────────────────────────────────────────────────

interface BanglaEntry {
  en: string;
  bn: string;
  pron?: string[];
  bn_syns?: string[];
  en_syns?: string[];
  sents?: string[];
}

type DictMode = "en-easy" | "en-ko" | "ko-en" | "bn-en" | "en-bn";

interface ModeConfig {
  label: string;
  shortLabel: string;
  placeholder: string;
  icon: React.ReactNode;
}

const MODES: Record<DictMode, ModeConfig> = {
  "en-easy": {
    label: "English → Easy English",
    shortLabel: "Easy EN",
    placeholder: "Search an English word...",
    icon: <BookOpen size={14} />,
  },
  "en-ko": {
    label: "English → Korean",
    shortLabel: "EN→KO",
    placeholder: "Search an English word...",
    icon: <Languages size={14} />,
  },
  "ko-en": {
    label: "Korean → English",
    shortLabel: "KO→EN",
    placeholder: "한국어 단어를 입력하세요...",
    icon: <Languages size={14} />,
  },
  "bn-en": {
    label: "Bangla → English",
    shortLabel: "BN→EN",
    placeholder: "বাংলা শব্দ লিখুন...",
    icon: <Globe size={14} />,
  },
  "en-bn": {
    label: "English → Bangla",
    shortLabel: "EN→BN",
    placeholder: "Search an English word...",
    icon: <Globe size={14} />,
  },
};

const MODE_KEYS: DictMode[] = ["en-easy", "en-ko", "ko-en", "bn-en", "en-bn"];

// ─── Result types for each mode ────────────────────────────────────

interface ResultEasyEnglish {
  kind: "easy-english";
  word: string;
  senses: Array<{ partOfSpeech: string; simpleDefinition: string; example: string }>;
  phonetic?: string;
}

interface ResultTranslation {
  kind: "translation";
  sourceText: string;
  translated: string;
  romanization?: string;
  notes?: string;
  example?: { source: string; target: string };
}

interface ResultBangla {
  kind: "bangla";
  entry: BanglaEntry;
}

type SearchResult = ResultEasyEnglish | ResultTranslation | ResultBangla;

// ─── Component ─────────────────────────────────────────────────────

export default function Dictionary() {
  const [mode, setMode] = useState<DictMode>("en-easy");
  const [query, setQuery] = useState("");
  const [banglaDict, setBanglaDict] = useState<BanglaEntry[]>([]);
  const [dictLoading, setDictLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wordOfDay, setWordOfDay] = useState<BanglaEntry | null>(null);
  const [mounted, setMounted] = useState(false);

  // ─── Init ──────────────────────────────────────────────────────

  useEffect(() => {
    setMounted(true);

    // Restore last-used mode
    const savedMode = localStorage.getItem("syntaxa_dict_mode") as DictMode | null;
    if (savedMode && MODE_KEYS.includes(savedMode)) {
      setMode(savedMode);
    }

    // Load Bangla dictionary
    const fetchDictionary = async () => {
      setDictLoading(true);
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/MinhasKamal/BengaliDictionary/master/BengaliDictionary.json",
        );
        if (!response.ok) throw new Error("Failed to fetch dictionary");
        const data: BanglaEntry[] = await response.json();
        setBanglaDict(data);

        // Word of the Day — use date-based index for stability within a day
        if (data.length > 0) {
          const today = new Date().toISOString().split("T")[0];
          const cachedWotd = localStorage.getItem(`syntaxa_wotd_bn_${today}`);
          if (cachedWotd) {
            setWordOfDay(JSON.parse(cachedWotd));
          } else {
            const seed = today.split("-").reduce((a, b) => a + parseInt(b), 0);
            const idx = seed % data.length;
            setWordOfDay(data[idx]);
            localStorage.setItem(`syntaxa_wotd_bn_${today}`, JSON.stringify(data[idx]));
          }
        }
      } catch (err) {
        console.error("Dictionary load error:", err);
      } finally {
        setDictLoading(false);
      }
    };

    fetchDictionary();
  }, []);

  // Persist mode changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("syntaxa_dict_mode", mode);
    }
  }, [mode, mounted]);

  // Clear results when switching modes
  const handleModeChange = (newMode: DictMode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setQuery("");
  };

  // ─── Search handlers per mode ──────────────────────────────────

  const searchEasyEnglish = useCallback(async (word: string) => {
    // Step 1: fetch from Free Dictionary API
    const dictRes = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    );
    if (!dictRes.ok) throw new Error(`No definition found for "${word}"`);
    const dictData = await dictRes.json();
    const entry = dictData[0];
    const phonetic = entry?.phonetic || entry?.phonetics?.[0]?.text || "";

    const definitions: string[] = [];
    const partsOfSpeech: string[] = [];
    for (const meaning of entry?.meanings || []) {
      for (const def of meaning.definitions?.slice(0, 2) || []) {
        definitions.push(def.definition);
        partsOfSpeech.push(meaning.partOfSpeech);
      }
    }

    if (definitions.length === 0) {
      throw new Error(`No definition found for "${word}"`);
    }

    // Step 2: simplify via AI
    const aiRes = await fetch("/api/ai/simplify-definition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, definitions, partOfSpeech: partsOfSpeech }),
    });

    if (aiRes.ok) {
      const data: SimplifyDefinitionResponse = await aiRes.json();
      return {
        kind: "easy-english" as const,
        word: data.word,
        senses: data.senses,
        phonetic,
      };
    }

    // AI failed — return raw definitions
    return {
      kind: "easy-english" as const,
      word,
      senses: definitions.map((d, i) => ({
        partOfSpeech: partsOfSpeech[i],
        simpleDefinition: d,
        example: "",
      })),
      phonetic,
    };
  }, []);

  const searchTranslation = useCallback(
    async (text: string, direction: "en-ko" | "ko-en") => {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction }),
      });

      if (!res.ok) throw new Error("Translation unavailable right now, try again");
      const data: TranslateResponse = await res.json();

      return {
        kind: "translation" as const,
        sourceText: text,
        translated: data.translated,
        romanization: data.romanization,
        notes: data.notes,
        example: data.example ? { source: data.example.source, target: data.example.target } : undefined,
      };
    },
    [],
  );

  const searchBangla = useCallback(
    async (text: string, direction: "bn-en" | "en-bn") => {
      // Try local dataset first
      if (direction === "bn-en") {
        const found = banglaDict.find(
          (e) => e.bn.toLowerCase() === text.toLowerCase().trim(),
        );
        if (found) return { kind: "bangla" as const, entry: found };
      } else {
        const found = banglaDict.find(
          (e) => e.en.toLowerCase() === text.toLowerCase().trim(),
        );
        if (found) return { kind: "bangla" as const, entry: found };
      }

      // Fallback: AI translation
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, direction }),
      });

      if (!res.ok) throw new Error(`No definition found for "${text}"`);
      const data: TranslateResponse = await res.json();

      return {
        kind: "translation" as const,
        sourceText: text,
        translated: data.translated,
        romanization: data.romanization,
        notes: data.notes,
        example: data.example ? { source: data.example.source, target: data.example.target } : undefined,
      };
    },
    [banglaDict],
  );

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResult(null);

    try {
      let res: SearchResult;
      switch (mode) {
        case "en-easy":
          res = await searchEasyEnglish(query.trim());
          break;
        case "en-ko":
          res = await searchTranslation(query.trim(), "en-ko");
          break;
        case "ko-en":
          res = await searchTranslation(query.trim(), "ko-en");
          break;
        case "bn-en":
          res = await searchBangla(query.trim(), "bn-en");
          break;
        case "en-bn":
          res = await searchBangla(query.trim(), "en-bn");
          break;
      }
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  // ─── Render helpers ────────────────────────────────────────────

  const getModeLangs = () => {
    switch (mode) {
      case "en-easy":
        return { source: "en", target: "en" };
      case "en-ko":
        return { source: "en", target: "ko" };
      case "ko-en":
        return { source: "ko", target: "en" };
      case "en-bn":
        return { source: "en", target: "bn" };
      case "bn-en":
        return { source: "bn", target: "en" };
      default:
        return { source: "en", target: "en" };
    }
  };

  const renderResult = () => {
    if (!result) return null;

    switch (result.kind) {
      case "easy-english":
        return (
          <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] sm:text-3xl font-bold sm:font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {result.word}
                  </h2>
                  <PronunciationButton
                    text={result.word}
                    lang="en"
                    variant="icon"
                    iconSize={22}
                  />
                </div>
                {result.phonetic && (
                  <p className="text-base text-gray-400 dark:text-[#9CA3AF]">
                    {result.phonetic}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {result.senses.map((sense, i) => (
                <div key={i} className="space-y-2">
                  <span className="inline-block bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7] text-[12px] font-bold px-3 py-1 rounded-full">
                    {sense.partOfSpeech}
                  </span>
                  <p className="text-base font-medium leading-relaxed text-black dark:text-[#F3F4F6]">
                    {sense.simpleDefinition}
                  </p>
                  {sense.example && (
                    <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D]">
                      <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic font-medium">
                        &quot;{sense.example}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <PronunciationButton
              text={result.word}
              lang="en"
              label="Listen Pronunciation"
            />
          </div>
        );

      case "translation": {
        const { source: srcLang, target: tgtLang } = getModeLangs();
        return (
          <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-gray-400 dark:text-[#9CA3AF] uppercase">
                  {result.sourceText}
                </p>
                <PronunciationButton
                  text={result.sourceText}
                  lang={srcLang}
                  variant="inline"
                  label={`Listen ${srcLang.toUpperCase()}`}
                  iconSize={13}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <h2 className="text-[24px] sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
                  {result.translated}
                </h2>
                <PronunciationButton
                  text={result.translated}
                  lang={tgtLang}
                  variant="icon"
                  iconSize={24}
                />
              </div>

              {result.romanization && (
                <p className="text-base text-gray-500 dark:text-[#9CA3AF] italic">
                  {result.romanization}
                </p>
              )}
            </div>

            {result.notes && (
              <p className="text-[14px] text-gray-500 dark:text-[#9CA3AF] font-medium bg-[#F3EEF6] dark:bg-[#0F0A15] px-4 py-2 rounded-[16px]">
                📝 {result.notes}
              </p>
            )}

            {result.example && (
              <div className="space-y-2">
                <p className="text-[12px] font-bold text-gray-400 uppercase">
                  Example
                </p>
                <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D] space-y-1">
                  <p className="text-[14px] font-medium text-black dark:text-[#F3F4F6]">
                    {result.example.source}
                  </p>
                  <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic">
                    {result.example.target}
                  </p>
                </div>
              </div>
            )}

            <PronunciationButton
              text={result.translated}
              lang={tgtLang}
              label={`Listen Pronunciation (${tgtLang.toUpperCase()})`}
              showLanguageTag
            />
          </div>
        );
      }

      case "bangla":
        return (
          <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-[20px] sm:text-3xl font-bold sm:font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {result.entry.bn}
                  </h2>
                  <PronunciationButton
                    text={result.entry.bn}
                    lang="bn"
                    variant="icon"
                    iconSize={22}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base sm:text-[18px] text-[#8A56A4] dark:text-[#A87BC7] opacity-70">
                    {result.entry.pron && result.entry.pron.length > 0
                      ? `/${result.entry.pron[0]}/`
                      : result.entry.en}
                  </p>
                  <PronunciationButton
                    text={result.entry.en}
                    lang="en"
                    variant="icon"
                    iconSize={16}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {result.entry.en_syns && result.entry.en_syns.length > 0 && (
                <p className="text-base sm:text-[18px] font-bold leading-snug text-black dark:text-[#F3F4F6]">
                  Synonyms: {result.entry.en_syns.slice(0, 3).join(", ")}
                </p>
              )}
              {result.entry.sents && result.entry.sents.length > 0 ? (
                <div className="pl-4 border-l-4 border-[#E8DDED] dark:border-[#3D334D]">
                  <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF] italic font-medium leading-relaxed">
                    &quot;{result.entry.sents[0]}&quot;
                  </p>
                </div>
              ) : (
                <p className="text-[14px] text-gray-400 dark:text-[#9CA3AF]">
                  No example sentences available.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <PronunciationButton
                text={result.entry.en}
                lang="en"
                label="Listen English Pronunciation"
              />
              <PronunciationButton
                text={result.entry.bn}
                lang="bn"
                variant="secondary"
                label="Listen Bangla Pronunciation"
              />
            </div>
          </div>
        );
    }
  };

  // ─── Loading skeleton ──────────────────────────────────────────

  const renderSkeleton = () => (
    <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-[#F0E4FF] dark:bg-[#2D1F3D] rounded-[12px]" />
        <div className="h-4 w-24 bg-gray-100 dark:bg-[#2D2438] rounded-[8px]" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 dark:bg-[#2D2438] rounded-[8px]" />
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-[#2D2438] rounded-[8px]" />
      </div>
      <div className="h-[60px] w-full bg-gray-100 dark:bg-[#2D2438] rounded-[24px]" />
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-[20px] sm:text-3xl font-bold sm:font-extrabold text-[#111] dark:text-[#F3F4F6]">
            Dictionary
          </h1>
          <p className="text-gray-500 dark:text-[#9CA3AF] font-medium tracking-tight">
            {MODES[mode].label}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-white dark:bg-[#1C1625] rounded-[20px] p-1.5 border border-gray-100 dark:border-[#2D2438] shadow-sm overflow-x-auto no-scrollbar">
          {MODE_KEYS.map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[14px] text-[12px] sm:text-[13px] font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0",
                mode === m
                  ? "bg-[#8A56A4] text-white shadow-md"
                  : "text-gray-500 dark:text-[#9CA3AF] hover:text-[#8A56A4]",
              )}
            >
              {MODES[m].icon}
              {MODES[m].shortLabel}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={MODES[mode].placeholder}
              className="w-full h-[60px] bg-white dark:bg-[#1C1625] rounded-[24px] px-6 pr-12 text-base sm:text-[18px] font-medium shadow-sm border border-transparent dark:border-[#2D2438] focus:border-[#8A56A4] outline-none text-black dark:text-[#F3F4F6]"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setResult(null);
                  setError(null);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || dictLoading}
            className="w-[60px] h-[60px] bg-[#8A56A4] text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-transform disabled:opacity-50"
          >
            {searching ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Search size={24} />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-[24px] text-center font-bold">
            {error}
          </div>
        )}

        {/* Result */}
        {searching ? renderSkeleton() : renderResult()}

        {/* Word of the Day — show when no result */}
        {wordOfDay && !result && !searching && !error && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold px-2 dark:text-[#F3F4F6] text-black">
              Word of The Day
            </h3>

            <div className="bg-white dark:bg-[#1C1625] rounded-[40px] p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] sm:text-3xl font-bold sm:font-black text-black dark:text-[#F3F4F6]">
                      {wordOfDay.en}
                    </h2>
                    <PronunciationButton
                      text={wordOfDay.en}
                      lang="en"
                      variant="icon"
                      iconSize={22}
                    />
                  </div>
                  <p className="text-base sm:text-[18px] text-[#8A56A4] dark:text-[#A87BC7] opacity-70">
                    {wordOfDay.pron && wordOfDay.pron.length > 0
                      ? `/${wordOfDay.pron[0]}/`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] sm:text-2xl font-bold sm:font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {wordOfDay.bn}
                  </span>
                  <PronunciationButton
                    text={wordOfDay.bn}
                    lang="bn"
                    variant="icon"
                    iconSize={20}
                  />
                </div>
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

              <PronunciationButton
                text={wordOfDay.en}
                lang="en"
                variant="secondary"
                label="Listen Pronunciation"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
