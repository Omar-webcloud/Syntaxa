"use client";

import { useState } from "react";
import { Search, Volume2, Bookmark, ArrowRight, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_DICTIONARY: Record<string, { definition: string; bangla: string; example: string; type: string }> = {
  "serendipity": {
    definition: "The occurrence and development of events by chance in a happy or beneficial way.",
    bangla: "ভাগ্যক্রমে প্রাপ্তি (Serendipity)",
    example: "We found the restaurant by pure serendipity.",
    type: "noun"
  },
  "ephemeral": {
    definition: "Lasting for a very short time.",
    bangla: "ক্ষণস্থায়ী (Khonn-osthayi)",
    example: "Fashions are ephemeral, changing with every season.",
    type: "adjective"
  },
  "eloquent": {
    definition: "Fluent or persuasive in speaking or writing.",
    bangla: "বাকপটু (Bakpotu)",
    example: "An eloquent speech that moved the audience to tears.",
    type: "adjective"
  },
  "grammar": {
    definition: "The whole system and structure of a language.",
    bangla: "ব্যাকরণ (Byakoron)",
    example: "English grammar can be tricky to master.",
    type: "noun"
  }
};

export default function Dictionary() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<typeof MOCK_DICTIONARY["serendipity"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    setResult(null);

    setTimeout(() => {
      const key = query.toLowerCase().trim();
      const found = MOCK_DICTIONARY[key];
      setResult(found || null);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-violet-600" />
          Dictionary
        </h1>
        <p className="text-gray-500 text-sm">English to Bangla Dictionary & Meanings</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search a word (e.g., grammar)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-5 pr-12 py-4 rounded-2xl border-2 border-gray-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-50 outline-none transition-all shadow-sm text-lg"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
        >
          <Search size={20} />
        </button>
      </form>

      <div className="min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-4 text-gray-400">
             <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
             <p>Searching...</p>
          </div>
        ) : result ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 capitalize">{query}</h2>
                <span className="text-gray-500 italic text-sm">{result.type}</span>
              </div>
              <button className="p-2.5 bg-violet-50 text-violet-600 rounded-full hover:bg-violet-100 transition-colors">
                <Volume2 size={24} />
              </button>
            </div>

            <div className="space-y-4">
               <div className="bg-violet-50 p-4 rounded-2xl">
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-1">Bangla Meaning</p>
                  <p className="text-xl font-medium text-violet-900">{result.bangla}</p>
               </div>

               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Definition</p>
                  <p className="text-gray-700 text-lg leading-relaxed">{result.definition}</p>
               </div>

               <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Example</p>
                  <p className="text-gray-600 italic">"{result.example}"</p>
               </div>
            </div>

            <button className="w-full py-3 border-2 border-gray-100 text-gray-600 font-semibold rounded-xl hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
              <Bookmark size={18} />
              Save Word
            </button>
          </motion.div>
        ) : searched ? (
           <div className="text-center py-10 text-gray-400">
              <p className="text-lg">No results found for &quot;{query}&quot;</p>
              <p className="text-sm">Try &apos;serendipity&apos;, &apos;grammar&apos;, or &apos;eloquent&apos;</p>
           </div>
        ) : (
          <div className="text-center py-10 space-y-4 opacity-50">
             <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center">
                <Search size={32} className="text-gray-300" />
             </div>
             <p className="text-gray-400">Search for a word to see its meaning and usage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
