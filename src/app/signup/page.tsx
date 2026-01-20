"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
         <div className="text-center space-y-2">
             <div className="w-16 h-16 bg-linear-to-br from-violet-500 to-fuchsia-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                 <span className="text-3xl text-white">✨</span>
             </div>
             <h1 className="text-3xl font-bold text-gray-900">Get Started</h1>
             <p className="text-gray-500">Create an account to start your learning journey.</p>
         </div>

         <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 space-y-6">
             <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-1">
                     <label className="text-xs font-bold text-gray-700 uppercase ml-1">Full Name</label>
                     <div className="relative">
                         <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet-500 outline-none transition-colors"
                            required
                         />
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     </div>
                 </div>
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
                            placeholder="Create a password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-100 focus:border-violet-500 outline-none transition-colors"
                            required
                         />
                         <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                     </div>
                 </div>

                 <button 
                    type="submit"
                    disabled={loading}
                    className={cn(
                        "w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 mt-4",
                        loading && "opacity-70 cursor-not-allowed"
                    )}
                 >
                     {loading ? "Creating Account..." : "Sign Up"}
                     {!loading && <ArrowRight size={18} />}
                 </button>
             </form>
         </div>

         <div className="text-center text-gray-500 text-sm">
             Already have an account?{" "}
             <Link href="/login" className="text-violet-600 font-bold hover:underline">Log In</Link>
         </div>
         
         <p className="text-center text-xs text-gray-400 px-8">
             By signing up, you agree to our Terms of Service and Privacy Policy.
         </p>
      </div>
    </div>
  );
}
