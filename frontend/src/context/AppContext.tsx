"use client";

import { createContext, useContext, useState } from "react";

type AppContextType = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
}
