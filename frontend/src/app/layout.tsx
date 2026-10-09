import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/src/components/providers/QueryProvider";
import { ThemeProvider } from "@/src/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: {
    template: "%s | SplitSync",
    default: "SplitSync",
  },
  description: "Split expenses with friends",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
