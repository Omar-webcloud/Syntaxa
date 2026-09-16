"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, BookOpen, ArrowLeftRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import PronunciationButton from "@/components/PronunciationButton";
import { recordDictionaryLookup } from "@/lib/userStats";
import {
  EASY_ENGLISH_POOL,
  EN_KO_POOL,
  KO_EN_POOL,
  BN_EN_POOL,
  EN_BN_POOL,
  getDailyIndex,
  type EasyEnglishWotd,
  type TranslationWotd,
  type BanglaWotd,
} from "@/data/wordOfDay";
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
type LangCategory = "easy" | "korean" | "bangla";

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
  const [mounted, setMounted] = useState(false);

  // Determine active category for the top selector
  const activeCategory: LangCategory =
    mode === "en-easy"
      ? "easy"
      : mode === "en-ko" || mode === "ko-en"
      ? "korean"
      : "bangla";

  // ─── Init ──────────────────────────────────────────────────────

  useEffect(() => {
    setMounted(true);

    const savedMode = localStorage.getItem("syntaxa_dict_mode") as DictMode | null;
    if (savedMode && ["en-easy", "en-ko", "ko-en", "bn-en", "en-bn"].includes(savedMode)) {
      setMode(savedMode);
    }

    const fetchDictionary = async () => {
      setDictLoading(true);
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/MinhasKamal/BengaliDictionary/master/BengaliDictionary.json",
        );
        if (!response.ok) throw new Error("Failed to fetch dictionary");
        const data: BanglaEntry[] = await response.json();
        setBanglaDict(data);
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

  const handleSelectCategory = (cat: LangCategory) => {
    let newMode: DictMode = "en-easy";
    if (cat === "korean") newMode = "en-ko";
    if (cat === "bangla") newMode = "en-bn";

    setMode(newMode);
    setResult(null);
    setError(null);
    setQuery("");
  };

  const handleSwapDirection = () => {
    let swapped: DictMode = mode;
    if (mode === "en-ko") swapped = "ko-en";
    else if (mode === "ko-en") swapped = "en-ko";
    else if (mode === "en-bn") swapped = "bn-en";
    else if (mode === "bn-en") swapped = "en-bn";

    setMode(swapped);
    setResult(null);
    setError(null);
    setQuery("");
  };

  // ─── Search Handlers ──────────────────────────────────────────

  const searchEasyEnglish = useCallback(async (word: string) => {
    const cleanWord = word.trim();
    if (!cleanWord) throw new Error("Please enter a word");

    try {
      // Direct call to Free Dictionary API
      const dictRes = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord.toLowerCase())}`,
      );

      if (dictRes.ok) {
        const dictData = await dictRes.json();
        const entry = dictData?.[0];
        const phonetic =
          entry?.phonetic ||
          entry?.phonetics?.find((p: { text?: string }) => p.text)?.text ||
          "";

        const senses: Array<{
          partOfSpeech: string;
          simpleDefinition: string;
          example: string;
        }> = [];

        for (const meaning of entry?.meanings || []) {
          for (const def of meaning.definitions?.slice(0, 2) || []) {
            senses.push({
              partOfSpeech: meaning.partOfSpeech || "definition",
              simpleDefinition: def.definition,
              example: def.example || "",
            });
          }
        }

        if (senses.length > 0) {
          return {
            kind: "easy-english" as const,
            word: entry?.word || cleanWord,
            senses: senses.slice(0, 4),
            phonetic,
          };
        }
      }
    } catch {
      // Proceed to fallback
    }

    // AI Fallback for compound or specialized words
    const aiRes = await fetch("/api/ai/simplify-definition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        word: cleanWord,
        definitions: [`General definition for ${cleanWord}`],
        partOfSpeech: ["word"],
      }),
    });

    if (aiRes.ok) {
      const data: SimplifyDefinitionResponse = await aiRes.json();
      return {
        kind: "easy-english" as const,
        word: data.word,
        senses: data.senses,
      };
    }

    throw new Error(`No definition found for "${cleanWord}". Please check the spelling.`);
  }, []);

  const searchTranslation = useCallback(
    async (text: string, direction: "en-ko" | "ko-en") => {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), direction }),
      });

      if (!res.ok) throw new Error("Translation service is busy. Please try again.");
      const data: TranslateResponse = await res.json();

      return {
        kind: "translation" as const,
        sourceText: text.trim(),
        translated: data.translated,
        romanization: data.romanization,
        notes: data.notes,
        example: data.example
          ? { source: data.example.source, target: data.example.target }
          : undefined,
      };
    },
    [],
  );

  const searchBangla = useCallback(
    async (text: string, direction: "bn-en" | "en-bn") => {
      const trimmed = text.trim().toLowerCase();

      // Check local dataset
      if (banglaDict && banglaDict.length > 0) {
        if (direction === "bn-en") {
          const found = banglaDict.find((e) => e.bn.toLowerCase() === trimmed);
          if (found) return { kind: "bangla" as const, entry: found };
        } else {
          const found = banglaDict.find((e) => e.en.toLowerCase() === trimmed);
          if (found) return { kind: "bangla" as const, entry: found };
        }
      }

      // Fallback to AI translation
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), direction }),
      });

      if (!res.ok) throw new Error(`No definition found for "${text}"`);
      const data: TranslateResponse = await res.json();

      return {
        kind: "translation" as const,
        sourceText: text.trim(),
        translated: data.translated,
        romanization: data.romanization,
        notes: data.notes,
        example: data.example
          ? { source: data.example.source, target: data.example.target }
          : undefined,
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
          res = await searchEasyEnglish(query);
          break;
        case "en-ko":
          res = await searchTranslation(query, "en-ko");
          break;
        case "ko-en":
          res = await searchTranslation(query, "ko-en");
          break;
        case "bn-en":
          res = await searchBangla(query, "bn-en");
          break;
        case "en-bn":
          res = await searchBangla(query, "en-bn");
          break;
      }
      setResult(res);
      recordDictionaryLookup();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case "en-easy":
        return "Search an English word...";
      case "en-ko":
        return "Type in English (e.g. Happiness)...";
      case "ko-en":
        return "한국어로 검색 (예: 행복, 설레임)...";
      case "en-bn":
        return "Type in English (e.g. Courage)...";
      case "bn-en":
        return "বাংলায় লিখুন (যেমন: অনুপ্রেরণা)...";
    }
  };

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
    }
  };

  // ─── Render Results ───────────────────────────────────────────

  const renderResult = () => {
    if (!result) return null;

    switch (result.kind) {
      case "easy-english":
        return (
          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
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
                  <p className="text-sm sm:text-base text-gray-400 dark:text-[#9CA3AF]">
                    {result.phonetic}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {result.senses.map((sense, i) => (
                <div key={i} className="space-y-1.5">
                  <span className="inline-block bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {sense.partOfSpeech}
                  </span>
                  <p className="text-base font-semibold leading-relaxed text-black dark:text-[#F3F4F6]">
                    {sense.simpleDefinition}
                  </p>
                  {sense.example && (
                    <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
                      <p className="text-[13px] text-gray-500 dark:text-[#9CA3AF] italic">
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
          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] animate-in fade-in duration-300">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-gray-400 dark:text-[#9CA3AF] uppercase">
                  {result.sourceText}
                </p>
                <PronunciationButton
                  text={result.sourceText}
                  lang={srcLang}
                  variant="inline"
                  label={`Listen (${srcLang.toUpperCase()})`}
                  iconSize={13}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
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
              <p className="text-[13px] text-gray-600 dark:text-[#9CA3AF] font-medium bg-[#F3EEF6] dark:bg-[#0F0A15] p-3.5 rounded-[18px]">
                💡 {result.notes}
              </p>
            )}

            {result.example && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Example
                </p>
                <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D] space-y-0.5">
                  <p className="text-[14px] font-semibold text-black dark:text-[#F3F4F6]">
                    {result.example.source}
                  </p>
                  <p className="text-[13px] text-gray-400 dark:text-[#9CA3AF] italic">
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
          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
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
                  <p className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-300">
                    {result.entry.en}
                  </p>
                  <PronunciationButton
                    text={result.entry.en}
                    lang="en"
                    variant="icon"
                    iconSize={16}
                  />
                </div>
                {result.entry.pron && result.entry.pron.length > 0 && (
                  <p className="text-sm text-gray-400">/{result.entry.pron[0]}/</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {result.entry.en_syns && result.entry.en_syns.length > 0 && (
                <p className="text-sm sm:text-base font-semibold text-black dark:text-[#F3F4F6]">
                  Synonyms: {result.entry.en_syns.slice(0, 3).join(", ")}
                </p>
              )}
              {result.entry.sents && result.entry.sents.length > 0 && (
                <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
                  <p className="text-[13px] text-gray-500 dark:text-[#9CA3AF] italic">
                    &quot;{result.entry.sents[0]}&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
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

  // ─── Render Tab-Specific Word of the Day ────────────────────────

  const renderWordOfTheDay = () => {
    if (result || searching || error) return null;

    if (mode === "en-easy") {
      const idx = getDailyIndex(EASY_ENGLISH_POOL.length, 0);
      const wotd: EasyEnglishWotd = EASY_ENGLISH_POOL[idx];
      return (
        <div className="space-y-3 animate-in fade-in duration-300">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base sm:text-lg font-black text-black dark:text-[#F3F4F6] flex items-center gap-2">
              <Sparkles size={18} className="text-[#8A56A4] dark:text-[#A87BC7]" />
              Word of The Day · Easy English
            </h3>
          </div>

          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-5 border border-gray-50 dark:border-[#2D2438]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {wotd.word}
                  </h2>
                  <PronunciationButton
                    text={wotd.word}
                    lang="en"
                    variant="icon"
                    iconSize={22}
                  />
                </div>
                {wotd.phonetic && (
                  <p className="text-sm text-gray-400">{wotd.phonetic}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {wotd.senses.map((sense, i) => (
                <div key={i} className="space-y-1">
                  <span className="inline-block bg-[#F0E4FF] dark:bg-[#2D1F3D] text-[#8A56A4] dark:text-[#A87BC7] text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    {sense.partOfSpeech}
                  </span>
                  <p className="text-base font-semibold text-black dark:text-[#F3F4F6]">
                    {sense.simpleDefinition}
                  </p>
                  {sense.example && (
                    <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
                      <p className="text-[13px] text-gray-500 dark:text-[#9CA3AF] italic">
                        &quot;{sense.example}&quot;
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <PronunciationButton
              text={wotd.word}
              lang="en"
              variant="secondary"
              label="Listen Pronunciation"
            />
          </div>
        </div>
      );
    }

    if (mode === "en-ko") {
      const idx = getDailyIndex(EN_KO_POOL.length, 1);
      const wotd: TranslationWotd = EN_KO_POOL[idx];
      return (
        <div className="space-y-3 animate-in fade-in duration-300">
          <h3 className="text-base sm:text-lg font-black text-black dark:text-[#F3F4F6] flex items-center gap-2 px-1">
            <Sparkles size={18} className="text-[#8A56A4] dark:text-[#A87BC7]" />
            Daily Korean Word · English → 한국어
          </h3>

          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-5 border border-gray-50 dark:border-[#2D2438]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {wotd.sourceText}
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {wotd.translated}
                  </h2>
                  <PronunciationButton
                    text={wotd.translated}
                    lang="ko"
                    variant="icon"
                    iconSize={22}
                  />
                </div>
                {wotd.romanization && (
                  <p className="text-sm text-gray-500 italic">[{wotd.romanization}]</p>
                )}
              </div>
            </div>

            {wotd.notes && (
              <p className="text-[13px] text-gray-600 dark:text-[#9CA3AF] font-medium bg-[#F3EEF6] dark:bg-[#0F0A15] p-3 rounded-2xl">
                💡 {wotd.notes}
              </p>
            )}

            {wotd.example && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Daily Example
                </p>
                <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
                  <p className="text-sm font-semibold text-black dark:text-[#F3F4F6]">
                    {wotd.example.source}
                  </p>
                  <p className="text-xs text-gray-500 italic">{wotd.example.target}</p>
                </div>
              </div>
            )}

            <PronunciationButton
              text={wotd.translated}
              lang="ko"
              variant="secondary"
              label="Listen Korean Pronunciation"
            />
          </div>
        </div>
      );
    }

    if (mode === "ko-en") {
      const idx = getDailyIndex(KO_EN_POOL.length, 2);
      const wotd: TranslationWotd = KO_EN_POOL[idx];
      return (
        <div className="space-y-3 animate-in fade-in duration-300">
          <h3 className="text-base sm:text-lg font-black text-black dark:text-[#F3F4F6] flex items-center gap-2 px-1">
            <Sparkles size={18} className="text-[#8A56A4] dark:text-[#A87BC7]" />
            Daily Korean Discovery · 한국어 → English
          </h3>

          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-5 border border-gray-50 dark:border-[#2D2438]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {wotd.sourceText}
                  </h2>
                  <PronunciationButton
                    text={wotd.sourceText}
                    lang="ko"
                    variant="icon"
                    iconSize={22}
                  />
                </div>
                {wotd.romanization && (
                  <p className="text-sm text-gray-500 italic">[{wotd.romanization}]</p>
                )}
                <p className="text-base sm:text-lg font-bold text-black dark:text-[#F3F4F6]">
                  {wotd.translated}
                </p>
              </div>
            </div>

            {wotd.notes && (
              <p className="text-[13px] text-gray-600 dark:text-[#9CA3AF] font-medium bg-[#F3EEF6] dark:bg-[#0F0A15] p-3 rounded-2xl">
                🇰🇷 Cultural Note: {wotd.notes}
              </p>
            )}

            {wotd.example && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Example Sentence
                </p>
                <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
                  <p className="text-sm font-semibold text-black dark:text-[#F3F4F6]">
                    {wotd.example.source}
                  </p>
                  <p className="text-xs text-gray-500 italic">{wotd.example.target}</p>
                </div>
              </div>
            )}

            <PronunciationButton
              text={wotd.sourceText}
              lang="ko"
              variant="secondary"
              label="Listen Korean Word"
            />
          </div>
        </div>
      );
    }

    if (mode === "bn-en") {
      const idx = getDailyIndex(BN_EN_POOL.length, 3);
      const wotd: BanglaWotd = BN_EN_POOL[idx];
      return (
        <div className="space-y-3 animate-in fade-in duration-300">
          <h3 className="text-base sm:text-lg font-black text-black dark:text-[#F3F4F6] flex items-center gap-2 px-1">
            <Sparkles size={18} className="text-[#8A56A4] dark:text-[#A87BC7]" />
            Daily Bangla Word · বাংলা → English
          </h3>

          <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-5 border border-gray-50 dark:border-[#2D2438]">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
                    {wotd.bn}
                  </h2>
                  <PronunciationButton
                    text={wotd.bn}
                    lang="bn"
                    variant="icon"
                    iconSize={22}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-base sm:text-lg font-bold text-black dark:text-[#F3F4F6]">
                    {wotd.en}
                  </p>
                  <PronunciationButton
                    text={wotd.en}
                    lang="en"
                    variant="icon"
                    iconSize={16}
                  />
                </div>
              </div>
            </div>

            {wotd.en_syns && wotd.en_syns.length > 0 && (
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                English Synonyms: {wotd.en_syns.join(", ")}
              </p>
            )}

            {wotd.sents && wotd.sents.length > 0 && (
              <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
                <p className="text-[13px] text-gray-500 dark:text-[#9CA3AF] italic">
                  &quot;{wotd.sents[0]}&quot;
                </p>
              </div>
            )}

            <PronunciationButton
              text={wotd.bn}
              lang="bn"
              variant="secondary"
              label="Listen Bangla Word"
            />
          </div>
        </div>
      );
    }

    // Default: en-bn
    const idx = getDailyIndex(EN_BN_POOL.length, 4);
    const wotd: BanglaWotd = EN_BN_POOL[idx];
    return (
      <div className="space-y-3 animate-in fade-in duration-300">
        <h3 className="text-base sm:text-lg font-black text-black dark:text-[#F3F4F6] flex items-center gap-2 px-1">
          <Sparkles size={18} className="text-[#8A56A4] dark:text-[#A87BC7]" />
          Daily Word · English → বাংলা
        </h3>

        <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-5 border border-gray-50 dark:border-[#2D2438]">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-[#8A56A4] dark:text-[#A87BC7]">
                  {wotd.en}
                </h2>
                <PronunciationButton
                  text={wotd.en}
                  lang="en"
                  variant="icon"
                  iconSize={22}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-black dark:text-[#F3F4F6]">
                  {wotd.bn}
                </span>
                <PronunciationButton
                  text={wotd.bn}
                  lang="bn"
                  variant="icon"
                  iconSize={18}
                />
              </div>
            </div>
          </div>

          {wotd.en_syns && wotd.en_syns.length > 0 && (
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Synonyms: {wotd.en_syns.join(", ")}
            </p>
          )}

          {wotd.sents && wotd.sents.length > 0 && (
            <div className="pl-3.5 border-l-3 border-[#E8DDED] dark:border-[#3D334D]">
              <p className="text-[13px] text-gray-500 dark:text-[#9CA3AF] italic">
                &quot;{wotd.sents[0]}&quot;
              </p>
            </div>
          )}

          <PronunciationButton
            text={wotd.en}
            lang="en"
            variant="secondary"
            label="Listen Pronunciation"
          />
        </div>
      </div>
    );
  };

  const renderSkeleton = () => (
    <div className="bg-white dark:bg-[#1C1625] rounded-[36px] p-6 sm:p-8 shadow-xl space-y-6 border border-gray-50 dark:border-[#2D2438] animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-[#F0E4FF] dark:bg-[#2D1F3D] rounded-[12px]" />
        <div className="h-4 w-24 bg-gray-100 dark:bg-[#2D2438] rounded-[8px]" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-100 dark:bg-[#2D2438] rounded-[8px]" />
        <div className="h-4 w-3/4 bg-gray-100 dark:bg-[#2D2438] rounded-[8px]" />
      </div>
      <div className="h-[56px] w-full bg-gray-100 dark:bg-[#2D2438] rounded-[24px]" />
    </div>
  );

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex flex-col items-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-[#111] dark:text-[#F3F4F6]">
            Dictionary
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-[#9CA3AF] font-medium">
            {mode === "en-easy" && "Simplified English definitions & examples"}
            {mode === "en-ko" && "Translate English words into Korean (한국어)"}
            {mode === "ko-en" && "Translate Korean words into English (영어)"}
            {mode === "en-bn" && "Translate English words into Bangla (বাংলা)"}
            {mode === "bn-en" && "Translate Bangla words into English (ইংরেজি)"}
          </p>
        </div>

        {/* ─── Modern Mobile-First Language Selector ─── */}
        <div className="space-y-2.5">
          {/* Top 3 Category Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white dark:bg-[#1C1625] rounded-[22px] border border-gray-100 dark:border-[#2D2438] shadow-sm">
            <button
              type="button"
              onClick={() => handleSelectCategory("easy")}
              className={cn(
                "py-2.5 px-2 rounded-[16px] text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5",
                activeCategory === "easy"
                  ? "bg-[#8A56A4] text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#8A56A4] dark:hover:text-[#A87BC7]",
              )}
            >
              <BookOpen size={15} />
              <span>Easy EN</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory("korean")}
              className={cn(
                "py-2.5 px-2 rounded-[16px] text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5",
                activeCategory === "korean"
                  ? "bg-[#8A56A4] text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#8A56A4] dark:hover:text-[#A87BC7]",
              )}
            >
              <span>🇰🇷 Korean</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory("bangla")}
              className={cn(
                "py-2.5 px-2 rounded-[16px] text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5",
                activeCategory === "bangla"
                  ? "bg-[#8A56A4] text-white shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-[#8A56A4] dark:hover:text-[#A87BC7]",
              )}
            >
              <span>🇧🇩 Bangla</span>
            </button>
          </div>

          {/* Sub Direction Bar with Swap Button for Korean & Bangla */}
          {activeCategory !== "easy" && (
            <div className="flex items-center justify-between px-3.5 py-2 bg-[#F0E4FF]/60 dark:bg-[#20172D] rounded-[18px] border border-[#E8DDED] dark:border-[#2D2438] animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">
                {mode === "en-ko" && (
                  <span>
                    <strong className="text-[#8A56A4] dark:text-[#A87BC7]">English</strong> ➔ 한국어
                  </span>
                )}
                {mode === "ko-en" && (
                  <span>
                    <strong className="text-[#8A56A4] dark:text-[#A87BC7]">한국어</strong> ➔ English
                  </span>
                )}
                {mode === "en-bn" && (
                  <span>
                    <strong className="text-[#8A56A4] dark:text-[#A87BC7]">English</strong> ➔ বাংলা
                  </span>
                )}
                {mode === "bn-en" && (
                  <span>
                    <strong className="text-[#8A56A4] dark:text-[#A87BC7]">বাংলা</strong> ➔ English
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSwapDirection}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1C1625] text-[#8A56A4] dark:text-[#A87BC7] rounded-full text-xs font-black shadow-sm border border-purple-100 dark:border-[#2D2438] hover:scale-105 active:scale-95 transition-all"
                title="Swap translation direction"
              >
                <ArrowLeftRight size={13} />
                <span>Swap ⇄</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={getPlaceholder()}
              className="w-full h-[58px] bg-white dark:bg-[#1C1625] rounded-[22px] px-5 pr-11 text-base sm:text-lg font-medium shadow-sm border border-transparent dark:border-[#2D2438] focus:border-[#8A56A4] outline-none text-black dark:text-[#F3F4F6] placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResult(null);
                  setError(null);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || dictLoading}
            className="w-[58px] h-[58px] bg-[#8A56A4] text-white rounded-[22px] flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none active:scale-95 transition-transform disabled:opacity-50 shrink-0"
          >
            {searching ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <Search size={22} />
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-[22px] text-center text-sm font-bold border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        {/* Result */}
        {searching ? renderSkeleton() : renderResult()}

        {/* Word of the Day (different per language tab) */}
        {renderWordOfTheDay()}
      </div>
    </div>
  );
}
