"use client";

import { Trophy, Target, Flame, Clock, Check, X, RotateCcw, Edit2, Shuffle, Camera, ShieldCheck, ChevronRight, Palette, Code2 } from "lucide-react";
import Link from "next/link";
import { cn, FORMAL_AVATARS, getAvatarUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { useUserStats, resetUserStats } from "@/lib/userStats";
import { toast } from "sonner";

export default function Account() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [reminderActive, setReminderActive] = useState(true);
  const [soundActive, setSoundActive] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { user, updateUsername, updateAvatar, resetGuest } = useAuth();
  const { stats, formatTimeSpent } = useUserStats();

  useEffect(() => {
    setMounted(true);
    if (user?.username) {
      setNameInput(user.username);
    }
  }, [user?.username]);

  if (!mounted) return null;

  const currentName = user?.username || "Guest Learner";
  const currentAvatarSeed = user?.avatar || user?.username || "Alexander";
  const avatarUrl = getAvatarUrl(currentAvatarSeed);

  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed.length > 0) {
      updateUsername(trimmed);
      setIsEditingName(false);
      toast.success("Profile name updated!");
    } else {
      toast.error("Please enter a valid name");
    }
  };

  const handleSelectAvatar = (seed: string) => {
    updateAvatar(seed);
    setShowAvatarPicker(false);
    toast.success("Avatar updated!");
  };

  const handleRandomAvatar = () => {
    const formalPool = [
      "Alexander", "Sophia", "James", "Emma", "William", "Olivia",
      "Michael", "Elena", "David", "Grace", "Lucas", "Clara",
      "Thomas", "Victoria", "Benjamin", "Charlotte", "Arthur", "Amelia",
      "Henry", "Alice", "Edward", "Nora", "George", "Hazel"
    ];
    const available = formalPool.filter((s) => s !== currentAvatarSeed);
    const randomSeed = available[Math.floor(Math.random() * available.length)] || "Alexander";
    updateAvatar(randomSeed);
    toast.success("Randomized avatar!");
  };

  const handleResetData = () => {
    resetUserStats();
    resetGuest();
    setNameInput("Guest Learner");
    setShowResetConfirm(false);
    toast.success("Progress and account data reset!");
  };

  const isDarkMode = resolvedTheme === "dark" || theme === "dark";

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] font-sans text-black dark:text-[#F3F4F6] flex justify-center pb-24 transition-colors duration-300">
      <div className="w-full max-w-[412px] md:max-w-[768px] p-6 flex flex-col items-center">
        
        {/* Avatar & Edit */}
        <div className="relative group">
          <div 
            onClick={() => setShowAvatarPicker(true)}
            className="w-[140px] h-[140px] rounded-[24px] overflow-hidden bg-[#E5CCFA] dark:bg-[#2A2035] border-4 border-white dark:border-[#2D2438] shadow-md flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
          >
            <Image 
              src={avatarUrl} 
              alt="Avatar" 
              width={140}
              height={140}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <button 
            onClick={() => setShowAvatarPicker(true)}
            title="Change Avatar"
            className="absolute -bottom-2 -right-2 w-[40px] h-[40px] bg-[#8A56A4] dark:bg-[#A87BC7] text-white flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-transform shadow-md border-2 border-white dark:border-[#0F0A15]"
          >
            <Camera size={18} />
          </button>
        </div>

        {/* Profile Name / Edit mode */}
        {isEditingName ? (
          <form onSubmit={handleSaveName} className="mt-5 flex items-center gap-2 w-full max-w-xs">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Your name..."
              autoFocus
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1C1625] border-2 border-[#8A56A4] text-sm sm:text-base font-bold text-gray-900 dark:text-white outline-none shadow-sm"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#8A56A4] text-white hover:bg-[#7D4D95] active:scale-95 transition-all shadow-sm"
              title="Save"
            >
              <Check size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setNameInput(currentName);
                setIsEditingName(false);
              }}
              className="p-2.5 rounded-xl bg-gray-200 dark:bg-[#2D2438] text-gray-700 dark:text-gray-300 hover:opacity-80 active:scale-95 transition-all shadow-sm"
              title="Cancel"
            >
              <X size={18} />
            </button>
          </form>
        ) : (
          <div className="mt-5 flex items-center gap-2.5">
            <h1 className="text-xl sm:text-[24px] font-black text-gray-900 dark:text-white">{currentName}</h1>
            <button
              onClick={() => {
                setIsEditingName(true);
                setNameInput(currentName);
              }}
              className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              title="Rename Username"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-8 w-full grid grid-cols-2 md:grid-cols-4 gap-[12px]">
            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#F0E4FF] dark:bg-[#2A2035] flex items-center justify-center shrink-0">
                    <Target size={22} className="text-[#8A56A4] dark:text-[#A87BC7]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Total Quiz</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{stats.quizzesCompleted}</span>
                </div>
            </div>

            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#FFF0DC] dark:bg-[#352820] flex items-center justify-center shrink-0">
                    <Flame size={22} className="text-[#FC9502]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Total Streak</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{stats.streak} Days</span>
                </div>
            </div>

            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#E7FBFF] dark:bg-[#1E2D35] flex items-center justify-center shrink-0">
                    <Trophy size={20} className="text-[#3AAAFF]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Total Gem</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{stats.gems}</span>
                </div>
            </div>

            <div className="h-[88px] bg-white dark:bg-[#1C1625] rounded-[28px] flex items-center p-[12px] gap-[12px] shadow-sm border border-transparent dark:border-[#2D2438]">
                <div className="w-[49px] h-[48px] rounded-full bg-[#E7FBFF] dark:bg-[#1E2D35] flex items-center justify-center shrink-0">
                    <Clock size={22} className="text-[#2EC0FF]" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-500 dark:text-[#9CA3AF]">Time Spent</span>
                    <span className="text-base sm:text-[18px] font-bold text-black dark:text-[#F3F4F6]">{formatTimeSpent()}</span>
                </div>
            </div>
        </div>

        {/* Settings */}
        <div className="mt-8 w-full text-left">
           <h2 className="text-base sm:text-[18px] font-bold px-2">Settings</h2>
        </div>

        <div className="mt-4 w-full bg-[#E8DDED] dark:bg-[#1C1625] rounded-[24px] p-[16px] flex flex-col gap-[12px] border border-transparent dark:border-[#2D2438]">
            <SettingRow 
              label="Daily Reminder" 
              active={reminderActive} 
              onToggle={() => setReminderActive(!reminderActive)}
            />
            <SettingRow 
              label="Sound Effects" 
              active={soundActive} 
              onToggle={() => setSoundActive(!soundActive)}
            />
            <SettingRow 
              label="Dark Mode" 
              active={isDarkMode} 
              onToggle={() => setTheme(isDarkMode ? "light" : "dark")}
            />
        </div>

        {/* Reset Progress Section */}
        <div className="mt-6 w-full space-y-3">
          {showResetConfirm ? (
            <div className="bg-white dark:bg-[#1C1625] p-5 rounded-2xl border border-red-200 dark:border-red-900/40 text-center space-y-3 shadow-sm">
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                Reset streak, gems, quiz history, and progress?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleResetData}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold active:scale-95 transition-all"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-[#2D2438] text-gray-800 dark:text-gray-200 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowResetConfirm(true)}
              className="w-full h-[51px] bg-white dark:bg-[#1C1625] rounded-[16px] flex items-center justify-center gap-2 shadow-sm border border-transparent dark:border-[#2D2438] active:scale-95 transition-transform hover:border-red-200 dark:hover:border-red-900/30"
            >
              <RotateCcw size={16} className="text-[#D00000] dark:text-[#FF4D4D]" />
              <span className="text-[15px] font-bold text-[#D00000] dark:text-[#FF4D4D]">Reset Progress</span>
            </button>
          )}
        </div>

        {/* Legal & About Section */}
        <div className="mt-6 w-full space-y-3">
          <Link
            href="/privacy"
            className="w-full bg-white dark:bg-[#1C1625] rounded-[20px] p-4 flex items-center justify-between shadow-sm border border-transparent dark:border-[#2D2438] hover:border-[#8A56A4]/40 dark:hover:border-[#A87BC7]/40 active:scale-[0.99] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0E4FF] dark:bg-[#2A2035] flex items-center justify-center text-[#8A56A4] dark:text-[#C49CE6] group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <span className="block text-sm sm:text-[15px] font-bold text-gray-900 dark:text-white group-hover:text-[#8A56A4] dark:group-hover:text-[#C49CE6] transition-colors">
                  Privacy Policy & Credits
                </span>
                <span className="block text-xs text-gray-500 dark:text-[#9CA3AF]">
                  Data protection, terms & project creators
                </span>
              </div>
            </div>
            <div className="text-gray-400 group-hover:text-[#8A56A4] dark:group-hover:text-[#C49CE6] transition-colors pr-1">
              <ChevronRight size={18} />
            </div>
          </Link>

          {/* Creators Card */}
          <div className="w-full bg-[#E8DDED]/70 dark:bg-[#1C1625] rounded-[20px] p-4 border border-transparent dark:border-[#2D2438] space-y-2.5">
            <div className="text-xs font-bold text-[#8A56A4] dark:text-[#C49CE6] uppercase tracking-wider">
              <span>Syntaxa Creators</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 dark:bg-[#0F0A15]/60 p-2.5 rounded-xl flex items-center gap-2 border border-black/5 dark:border-white/5">
                <Palette size={15} className="text-pink-500 shrink-0" />
                <div className="truncate">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">UI/UX Design</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate">Fariha Munir Prity</span>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#0F0A15]/60 p-2.5 rounded-xl flex items-center gap-2 border border-black/5 dark:border-white/5">
                <Code2 size={15} className="text-cyan-500 shrink-0" />
                <div className="truncate">
                  <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Development</span>
                  <span className="font-bold text-gray-900 dark:text-white truncate">Md Omar Faruk Chowdhury</span>
                </div>
              </div>
            </div>

            <div className="text-center pt-1">
              <span className="text-[11px] text-gray-400 dark:text-gray-500">
                Syntaxa v1.0 • Gamified English Grammar Learning
              </span>
            </div>
          </div>
        </div>

        {/* Avatar Picker Modal */}
        {showAvatarPicker && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1C1625] rounded-[32px] p-6 w-full max-w-sm border border-gray-100 dark:border-[#2D2438] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white">Choose Avatar</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Select a clean, formal avatar style</p>
                </div>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3 max-h-[260px] overflow-y-auto p-1">
                {FORMAL_AVATARS.map((seed) => {
                  const url = getAvatarUrl(seed);
                  const isSelected = currentAvatarSeed === seed;
                  return (
                    <button
                      key={seed}
                      onClick={() => handleSelectAvatar(seed)}
                      className={cn(
                        "w-16 h-16 rounded-2xl overflow-hidden bg-[#F3EEF6] dark:bg-[#0F0A15] border-2 transition-all p-1 flex items-center justify-center",
                        isSelected
                          ? "border-[#8A56A4] dark:border-[#A87BC7] scale-105 shadow-md"
                          : "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={url}
                        alt={seed}
                        width={60}
                        height={60}
                        className="w-full h-full object-cover rounded-xl"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleRandomAvatar}
                  className="flex-1 py-3 bg-[#F3EEF6] dark:bg-[#2D2438] text-gray-900 dark:text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-[#E8DDED] active:scale-95 transition-all"
                >
                  <Shuffle size={16} /> Randomize
                </button>
                <button
                  onClick={() => setShowAvatarPicker(false)}
                  className="flex-1 py-3 bg-[#8A56A4] text-white rounded-2xl text-xs sm:text-sm font-bold hover:bg-[#7D4D95] active:scale-95 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function SettingRow({ label, active, onToggle }: { label: string, active: boolean, onToggle: () => void }) {
    return (
        <div 
          className="w-full h-[54px] bg-white dark:bg-[#0F0A15] rounded-[16px] flex items-center justify-between px-[16px] shadow-sm cursor-pointer select-none group border border-transparent dark:border-[#2D2438]"
          onClick={onToggle}
        >
            <span className="text-[14px] font-semibold text-gray-700 dark:text-[#F3F4F6] group-hover:text-black dark:group-hover:text-white transition-colors">
              {label}
            </span>
            <div className={cn(
                "w-[53px] h-[33px] rounded-[22px] p-[4px] flex transition-all duration-300",
                active ? "bg-[#8A56A4] dark:bg-[#A87BC7] justify-end" : "bg-[#B7BBC3] dark:bg-[#3D334D] justify-start"
            )}>
                <div className="w-[25px] h-[25px] bg-white rounded-full shadow-md transition-all border border-transparent dark:border-[#2D2438]" />
            </div>
        </div>
    );
}
