"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  username: string;
  avatar?: string;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | null;
  updateUsername: (username: string) => void;
  updateAvatar: (avatar: string) => void;
  resetGuest: () => void;
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const DEFAULT_GUEST_USER: User = {
  username: "Guest Learner",
  avatar: "Alexander",
  isGuest: true,
};

const USER_STORAGE_KEY = "syntaxa_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(DEFAULT_GUEST_USER);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed.username === "string" && parsed.username.trim().length > 0) {
          setUser({
            ...DEFAULT_GUEST_USER,
            ...parsed,
          });
          return;
        }
      }
      // If no valid user found in local storage, save and use default guest
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST_USER));
      setUser(DEFAULT_GUEST_USER);
    } catch {
      setUser(DEFAULT_GUEST_USER);
    }
  }, []);

  const updateUsername = (username: string) => {
    const trimmed = username.trim();
    if (trimmed.length > 0) {
      setUser((prev) => {
        const updatedUser: User = {
          ...prev,
          username: trimmed,
          isGuest: true,
        };
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Failed to update username:", err);
        }
        return updatedUser;
      });
    }
  };

  const updateAvatar = (avatar: string) => {
    if (avatar.trim().length > 0) {
      setUser((prev) => {
        const updatedUser: User = {
          ...prev,
          avatar: avatar.trim(),
          isGuest: true,
        };
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
        } catch (err) {
          console.error("Failed to update avatar:", err);
        }
        return updatedUser;
      });
    }
  };

  const resetGuest = () => {
    setUser(DEFAULT_GUEST_USER);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_GUEST_USER));
    } catch (err) {
      console.error("Failed to reset guest user:", err);
    }
  };

  const login = (username: string) => {
    if (username.trim().length > 0) {
      updateUsername(username);
      return true;
    }
    return false;
  };

  const logout = () => {
    resetGuest();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        updateUsername,
        updateAvatar,
        resetGuest,
        login,
        logout,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
