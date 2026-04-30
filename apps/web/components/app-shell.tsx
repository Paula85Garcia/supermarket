"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ChatbotWidget } from "./chatbot-widget";
import { heartbeatPresence } from "../lib/presence";
import { getProfile } from "../lib/workforce";

interface AppShellProps {
  children: React.ReactNode;
}

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : "";
}

function hideChatbotForPath(pathname: string): boolean {
  if (pathname === "/driver" || pathname === "/picker") return true;
  if (pathname.startsWith("/driver/") || pathname.startsWith("/picker/")) return true;
  return false;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  useEffect(() => {
    const id = readCookie("mkx_identifier");
    const role = readCookie("mkx_role");
    if (!id || !role) return;
    if (role === "customer") return;
    const profile = getProfile(id);
    const tick = () => heartbeatPresence(id, role, profile?.displayName || id, profile?.shift || "");
    tick();
    const t = setInterval(tick, 20_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-merka-black">
      <Sidebar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:pl-28 md:pr-8 md:pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Header />
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideChatbotForPath(pathname) ? <ChatbotWidget /> : null}
    </div>
  );
}
