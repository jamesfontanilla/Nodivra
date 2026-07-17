import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nodivra - Developer Identity Platform",
  description:
    "Turn your online presence into a living proof-of-work profile. One link for your developer identity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <body className="font-sans min-h-[100dvh] gradient-mesh antialiased">
        <ThemeProvider>
          <div className="noise-overlay" aria-hidden="true" />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
