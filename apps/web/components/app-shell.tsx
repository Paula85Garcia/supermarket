"use client";

import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ChatbotWidget } from "./chatbot-widget";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-merka-black">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-7xl px-4 pb-28 pt-4 md:pl-28 md:pr-8 md:pt-8"
      >
        <Header />
        {children}
      </motion.main>
      <ChatbotWidget />
    </div>
  );
}
