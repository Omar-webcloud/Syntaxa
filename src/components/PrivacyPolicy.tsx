"use client";

import Link from "next/link";
import { 
  ArrowLeft, 
  ShieldCheck, 
  UserCheck, 
  Database, 
  Bot, 
  Volume2, 
  Lock, 
  Palette, 
  Code2, 
  ExternalLink
} from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex justify-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-4 sm:p-6 flex flex-col items-center">
        
        {/* Header Navigation */}
        <div className="w-full flex items-center justify-between mb-6">
          <Link
            href="/account"
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-[#1C1625] text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white shadow-sm border border-transparent dark:border-[#2D2438] active:scale-95 transition-all text-sm font-semibold"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5CCFA] dark:bg-[#2A2035] text-[#8A56A4] dark:text-[#C49CE6] text-xs font-bold">
            <ShieldCheck size={14} />
            <span>Privacy & Terms</span>
          </div>
        </div>

        {/* Title & Introduction */}
        <div className="w-full text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] max-w-lg mx-auto">
            Your privacy and trust are our top priorities. Learn how Syntaxa collects, uses, and safeguards your learning data.
          </p>
          <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500 pt-1">
            Last Updated: September 2026 • Version 1.0
          </div>
        </div>

        {/* Creators & Credits Spotlight */}
        <div className="w-full bg-gradient-to-br from-[#8A56A4] to-[#6A3884] dark:from-[#2A1D36] dark:to-[#1C1325] text-white rounded-[28px] p-5 sm:p-6 mb-6 shadow-md border border-purple-400/20 dark:border-[#3D294F]">
          <div className="text-purple-200 text-xs font-bold uppercase tracking-wider mb-3">
            <span>Project Creators & Leadership</span>
          </div>

          <p className="text-xs sm:text-sm text-purple-100 dark:text-gray-300 leading-relaxed mb-4">
            Syntaxa was conceptualized, designed, and built to make English grammar learning playful, interactive, and beautifully accessible.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* UI/UX Lead */}
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/15 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-300/20 text-purple-200 flex items-center justify-center shrink-0">
                <Palette size={20} className="text-pink-300" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-200/80 block">
                  UI/UX Design
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Fariha Munir Prity
                </h2>
                <p className="text-[11px] text-purple-200/90 leading-tight">
                  Design systems, visual identity & learner experience
                </p>
              </div>
            </div>

            {/* Development Lead */}
            <div className="bg-white/10 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/15 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-300/20 text-purple-200 flex items-center justify-center shrink-0">
                <Code2 size={20} className="text-cyan-300" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-200/80 block">
                  Developed by
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  Md Omar Faruk Chowdhury
                </h2>
                <p className="text-[11px] text-purple-200/90 leading-tight">
                  Fullstack engineering, AI integration & platform architecture
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="w-full space-y-4">

          {/* Section 1: Information Collection */}
          <div className="bg-white dark:bg-[#1C1625] rounded-[24px] p-5 sm:p-6 shadow-sm border border-transparent dark:border-[#2D2438] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F0E4FF] dark:bg-[#2A2035] flex items-center justify-center text-[#8A56A4] dark:text-[#C49CE6] shrink-0">
                <UserCheck size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                1. Information We Collect
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              Syntaxa collects minimal information necessary to deliver personalized grammar learning experiences:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] pl-1">
              <li><strong className="text-gray-800 dark:text-gray-200">Profile Information:</strong> Chosen display name and avatar seed identifier.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Learning Progress:</strong> Quiz scores, practice history, day streak records, gem count, and cumulative time spent studying.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Preferences:</strong> Theme choices (Dark/Light mode), daily reminder preferences, and sound effect toggles.</li>
            </ul>
          </div>

          {/* Section 2: AI & Processing */}
          <div className="bg-white dark:bg-[#1C1625] rounded-[24px] p-5 sm:p-6 shadow-sm border border-transparent dark:border-[#2D2438] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FFF0DC] dark:bg-[#352820] flex items-center justify-center text-[#FC9502] shrink-0">
                <Bot size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                2. AI Assistance & Grammar Processing
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              Syntaxa utilizes the Google Gemini API to simplify dictionary definitions, explain grammatical structures, and generate interactive hints.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              AI requests only include the relevant vocabulary words and grammar topics requested. We do not transmit personal identifiers or sensitive user information to AI models.
            </p>
          </div>

          {/* Section 3: Audio & Speech */}
          <div className="bg-white dark:bg-[#1C1625] rounded-[24px] p-5 sm:p-6 shadow-sm border border-transparent dark:border-[#2D2438] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E7FBFF] dark:bg-[#1E2D35] flex items-center justify-center text-[#2EC0FF] shrink-0">
                <Volume2 size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                3. Audio & Voice Pronunciation
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              Vocabulary pronunciation is rendered locally on your device via standard browser speech synthesis (Web Speech API). Your voice or microphone is never recorded without explicit interaction.
            </p>
          </div>

          {/* Section 4: Data Storage & User Control */}
          <div className="bg-white dark:bg-[#1C1625] rounded-[24px] p-5 sm:p-6 shadow-sm border border-transparent dark:border-[#2D2438] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F0E4FF] dark:bg-[#2A2035] flex items-center justify-center text-[#8A56A4] dark:text-[#C49CE6] shrink-0">
                <Database size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                4. Data Storage & Reset Controls
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              For guest sessions, all learning metrics and settings remain securely in your local device browser storage.
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              You have complete control over your statistics. You can wipe all quiz history, gems, and streak counts at any time by clicking <strong className="text-red-600 dark:text-red-400">Reset Progress</strong> in your Account Settings.
            </p>
          </div>

          {/* Section 5: Third-Party Services */}
          <div className="bg-white dark:bg-[#1C1625] rounded-[24px] p-5 sm:p-6 shadow-sm border border-transparent dark:border-[#2D2438] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#E8DDED] dark:bg-[#2A2035] flex items-center justify-center text-[#8A56A4] dark:text-[#C49CE6] shrink-0">
                <Lock size={18} />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                5. Third-Party Services
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              Syntaxa integrates with trusted third-party providers for core functionalities:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] pl-1">
              <li><strong className="text-gray-800 dark:text-gray-200">Supabase:</strong> For cloud authentication and data synchronization.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Google Gemini API:</strong> For AI-powered grammar explanations and simplification.</li>
              <li><strong className="text-gray-800 dark:text-gray-200">Dicebear API:</strong> For rendering SVG profile avatar representations.</li>
            </ul>
          </div>

          {/* Section 6: Contact & Support */}
          <div className="bg-white dark:bg-[#1C1625] rounded-[24px] p-5 sm:p-6 shadow-sm border border-transparent dark:border-[#2D2438] space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              6. Contact & Support
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#9CA3AF] leading-relaxed">
              If you have any questions, feedback, or concerns regarding your privacy or data in Syntaxa, please feel free to reach out to the development team or open an issue on the repository.
            </p>
            <div className="pt-1">
              <a
                href="https://omar-webcloud.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F0E4FF] dark:bg-[#2A2035] text-[#8A56A4] dark:text-[#C49CE6] text-xs sm:text-sm font-bold hover:bg-[#E5CCFA] dark:hover:bg-[#352843] active:scale-95 transition-all shadow-sm"
              >
                <span>Developer Portfolio & Contact</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

        </div>

        {/* Footer Credit Note */}
        <div className="mt-8 text-center space-y-1 pb-4">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            UI/UX by Fariha Munir Prity • Developed by Md Omar Faruk Chowdhury
          </div>
          <div className="text-[11px] text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Syntaxa. All rights reserved.
          </div>
        </div>

      </div>
    </div>
  );
}
