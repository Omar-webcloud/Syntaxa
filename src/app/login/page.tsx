"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const success = login(username, password);
      if (success) {
        router.push("/");
      } else {
        setError("Invalid username or password. Try Guest / 123");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F3EEF6] dark:bg-[#0F0A15] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-sm space-y-8">
         <div className="text-center space-y-2">
             <div className="w-16 h-16 bg-[#8A56A4] rounded-2xl mx-auto flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
                 <span className="text-3xl font-black">🧩</span>
             </div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white">Welcome Back!</h1>
             <p className="text-gray-500 dark:text-gray-400 font-medium">Log in to sync your progress & streaks.</p>
         </div>

         <div className="bg-white dark:bg-[#1C1625] p-8 rounded-[32px] shadow-xl border border-gray-100 dark:border-[#2D2438] space-y-6 transition-colors duration-300">
             <form onSubmit={handleSubmit} className="space-y-4">
                 {error && (
                     <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-sm p-4 rounded-2xl font-bold text-center border border-red-100 dark:border-red-900/30">
                         {error}
                     </div>
                 )}
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase ml-1 tracking-wider">Username</label>
                     <div className="relative">
                         <input 
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Guest"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#0F0A15] border-2 border-gray-100 dark:border-[#2D2438] text-gray-900 dark:text-white focus:border-[#8A56A4] dark:focus:border-[#A87BC7] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold"
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
                            placeholder="123"
                            className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-[#0F0A15] border-2 border-gray-100 dark:border-[#2D2438] text-gray-900 dark:text-white focus:border-[#8A56A4] dark:focus:border-[#A87BC7] outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold"
                            required
                         />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                     </div>
                 </div>

                 <div className="flex justify-end pt-1">
                     <Link href="#" className="text-sm text-[#8A56A4] dark:text-[#A87BC7] font-bold hover:underline underline-offset-4">Forgot Password?</Link>
                 </div>

                 <button 
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full py-4 bg-[#8A56A4] text-white rounded-2xl font-black shadow-lg shadow-purple-100 dark:shadow-none hover:bg-[#7D4D95] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2",
                        loading && "opacity-70 cursor-not-allowed"
                    )}
                 >
                     {loading ? "Logging in..." : "Log In"}
                     {!loading && <ArrowRight size={18} />}
                 </button>
             </form>

             <div className="relative py-2">
                 <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-gray-100 dark:border-[#2D2438]" />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase tracking-widest">
                     <span className="bg-white dark:bg-[#1C1625] px-4 text-gray-400 dark:text-gray-500 font-bold">Or continue with</span>
                 </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
                 <button className="flex items-center justify-center gap-3 bg-gray-50 dark:bg-[#0F0A15] border-2 border-gray-100 dark:border-[#2D2438] p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1C1625] hover:border-gray-200 dark:hover:border-gray-800 transition-all font-bold text-gray-700 dark:text-gray-300 text-sm active:scale-[0.98]">
                     <span className="font-black text-lg leading-none border-r pr-2 border-gray-200 dark:border-gray-800">G</span> Google
                 </button>
             </div>
         </div>

         <div className="text-center text-gray-500 dark:text-gray-400 text-sm font-medium">
             Don&apos;t have an account?{" "}
             <Link href="/signup" className="text-[#8A56A4] dark:text-[#A87BC7] font-black hover:underline underline-offset-4">Sign Up</Link>
         </div>
      </div>
    </div>
  );
}
