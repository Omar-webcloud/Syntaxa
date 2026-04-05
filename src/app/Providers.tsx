"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/lib/AuthContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
