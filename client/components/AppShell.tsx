"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

/** Routes where the Navbar should be hidden (auth pages) */
const AUTH_ROUTES = ["/login", "/signup"];

/**
 * AppShell — conditionally renders the Navbar and page wrapper.
 * Auth pages (/login, /signup) get a clean full-screen layout.
 * All other pages get the Navbar + padded main content area.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-350 px-4 py-6 sm:px-8 lg:px-12">
        {children}
      </main>
    </>
  );
}
