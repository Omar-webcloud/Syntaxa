"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Book, Pencil, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  if (["/login", "/signup"].includes(pathname)) return null;

  const navItems = [
    { name: "Quiz", href: "/", icon: Brain },
    { name: "Dictionary", href: "/dictionary", icon: Book },
    { name: "Practice", href: "/practice", icon: Pencil },
    { name: "Rewards", href: "/rewards", icon: Trophy },
    { name: "Account", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
      <nav className="mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-colors duration-200",
                isActive
                  ? "text-violet-600"
                  : "text-gray-400 hover:text-violet-400"
              )}
            >
              <Icon
                size={24}
                className={cn(
                  "mb-1 transition-transform duration-200",
                  isActive ? "scale-110" : "scale-100"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
