"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] flex items-center justify-center p-4 transition-colors duration-300 relative">
      <Link 
        href="/" 
        className="absolute top-6 left-6 p-2 rounded-full bg-white dark:bg-[#1C1625] shadow-md hover:scale-110 active:scale-95 transition-all group"
      >
        <ArrowLeft className="text-[#8A56A4] dark:text-[#A87BC7] group-hover:stroke-[3px] transition-all" size={24} />
      </Link>

      <div className="w-full max-w-sm space-y-8">
         <div className="text-center space-y-2">
             <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                 <span className="text-3xl text-white font-black">✨</span>
             </div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white">Get Started</h1>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Create an account to start your learning journey.</p>
         </div>

         <div className="bg-white dark:bg-[#1C1625] p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-[#2D2438] space-y-6 transition-colors duration-300">
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase ml-1 tracking-wider">Full Name</label>
                     <div className="relative">
                         <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#0F0A15] border-2 border-gray-100 dark:border-[#2D2438] text-gray-900 dark:text-white focus:border-[#8A56A4] dark:focus:border-[#A87BC7] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            required
                         />
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                     </div>
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase ml-1 tracking-wider">Email</label>
                     <div className="relative">
                         <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#0F0A15] border-2 border-gray-100 dark:border-[#2D2438] text-gray-900 dark:text-white focus:border-[#8A56A4] dark:focus:border-[#A87BC7] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            required
                         />
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                     </div>
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase ml-1 tracking-wider">Password</label>
                      <div className="relative">
                         <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Create a password"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#0F0A15] border-2 border-gray-100 dark:border-[#2D2438] text-gray-900 dark:text-white focus:border-[#8A56A4] dark:focus:border-[#A87BC7] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                            required
                         />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                     </div>
                 </div>

                 <button 
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full py-3.5 sm:py-4 bg-[#111] dark:bg-white text-white dark:text-black rounded-2xl font-black shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 text-sm sm:text-base",
                        loading && "opacity-70 cursor-not-allowed"
                    )}
                 >
                     {loading ? "Creating Account..." : "Sign Up"}
                     {!loading && <ArrowRight size={18} />}
                 </button>
             </form>
         </div>

         <div className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
             Already have an account?{" "}
             <Link href="/login" className="text-[#8A56A4] dark:text-[#A87BC7] font-black hover:underline underline-offset-4">Log In</Link>
         </div>
         
         <p className="text-center text-xs text-gray-400 dark:text-gray-500 px-8">
             By signing up, you agree to our Terms of Service and Privacy Policy.
         </p>
      </div>
    </div>
  );
}
