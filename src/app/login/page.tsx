"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
         <div className="text-center space-y-2">
             <div className="w-16 h-16 bg-violet-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform -rotate-3 mb-4">
                 <span className="text-3xl">🧩</span>
             </div>
             <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
             <p className="text-gray-500">Log in to sync your progress & streaks.</p>
         </div>

         <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 uppercase ml-1">Email</label>
                     <div className="relative">
                         <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="hello@example.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet-500 outline-none transition-colors"
                            required
                         />
                         <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     </div>
                 </div>
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 uppercase ml-1">Password</label>
                      <div className="relative">
                         <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet-500 outline-none transition-colors"
                            required
                         />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     </div>
                 </div>

                 <div className="flex justify-end">
                     <Link href="#" className="text-sm text-violet-600 font-medium hover:underline">Forgot Password?</Link>
                 </div>

                 <button 
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full py-3.5 bg-violet-600 text-white rounded-xl font-bold shadow-lg hover:bg-violet-700 transition-all flex items-center justify-center gap-2",
                        loading && "opacity-70 cursor-not-allowed"
                    )}
                 >
                     {loading ? "Logging in..." : "Log In"}
                     {!loading && <ArrowRight size={18} />}
                 </button>
             </form>

             <div className="relative">
                 <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-gray-100" />
                 </div>
                 <div className="relative flex justify-center text-xs uppercase">
                     <span className="bg-white px-2 text-gray-400 font-bold">Or continue with</span>
                 </div>
             </div>

             <div className="grid grid-cols-1 gap-3">
                 <button className="flex items-center justify-center gap-2 border-2 border-gray-100 p-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-600 text-sm">
                     <span className="font-bold text-lg leading-none">G</span> Google
                 </button>
             </div>
         </div>

         <div className="text-center text-gray-500 text-sm">
             Don&apos;t have an account?{" "}
             <Link href="/signup" className="text-violet-600 font-bold hover:underline">Sign Up</Link>
         </div>
      </div>
    </div>
  );
}
