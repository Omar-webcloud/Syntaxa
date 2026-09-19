"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
        {children}
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </AuthProvider>
  );
}
