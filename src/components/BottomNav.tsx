"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Book, FileText, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  if (["/login", "/signup"].includes(pathname)) return null;

  const navItems = [
    { name: "Quiz", href: "/", icon: Home },
    { name: "Dictionary", href: "/dictionary", icon: Book },
    { name: "Practice", href: "/practice", icon: FileText },
    { name: "Rewards", href: "/rewards", icon: Trophy },
    { name: "Profile", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[72px] border-t border-[#E8DDED] dark:border-[#2D2438] bg-[#F3EEF6] dark:bg-[#0F0A15] transition-colors duration-300">
      <nav className="mx-auto flex h-full max-w-md md:max-w-[768px] items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = 
            item.href === "/" 
              ? pathname === "/" 
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 flex-1 min-w-0 max-w-[72px]",
                isActive ? "text-[#8A56A4] dark:text-[#A87BC7]" : "text-[#7F7F7F] dark:text-[#9CA3AF]"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-12 h-8 rounded-full transition-all duration-300",
                isActive ? "bg-[#8A56A4]" : "bg-transparent"
              )}>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "stroke-white dark:stroke-white" : "stroke-current"
                  )}
                />
              </div>
              <span className={cn(
                "text-[12px]",
                isActive ? "font-semibold dark:font-bold" : "font-normal"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
