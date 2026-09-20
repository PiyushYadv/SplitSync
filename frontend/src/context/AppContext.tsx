"use client";

import { createContext, useContext, useState } from "react";
import { getCurrencyMeta } from "@/src/lib/currency/currencies";

type AppContextType = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;

  currency: string;
  setCurrency: (value: string) => void;

  currencyMeta: {
    symbol: string;
    rate: number;
  };
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("USD");

  return (
    <AppContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        currency,
        setCurrency,
        currencyMeta: getCurrencyMeta(currency),
      }}
    >
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
