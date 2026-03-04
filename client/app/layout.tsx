import AuthLoader from "@/components/AuthLoader";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/context/ThemeContext";
import ReduxProvider from "@/store/provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Sphere - Task Management System",
  description:
    "A production-level task management system built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Redux Toolkit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ReduxProvider>
          <ThemeProvider>
            <AuthLoader>
              <AppShell>
                {children}
              </AppShell>
            </AuthLoader>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
