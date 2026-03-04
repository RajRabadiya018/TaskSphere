"use client";

import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

// dont show navbar in below routes
const AUTH_ROUTES = ["/login", "/signup"];

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
