"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, LayoutGrid, History, Settings } from "lucide-react";

const nav = [
  { icon: Home, label: "Home", href: "/" },
  { icon: LayoutGrid, label: "Categorias", href: "/categories" },
  { icon: History, label: "Historial", href: "/orders" },
  { icon: Settings, label: "Ajustes", href: "/settings" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-2xl border border-merka-border bg-white/5 p-2 backdrop-blur-xl md:bottom-auto md:left-4 md:top-4 md:h-[calc(100vh-2rem)] md:w-20 md:translate-x-0 md:flex-col md:justify-between">
      {nav.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06 }}
        >
          <Link
            href={item.href}
            aria-label={item.label}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
              pathname === item.href
                ? "bg-merka-yellow text-merka-black"
                : "text-zinc-300 hover:bg-merka-yellow hover:text-merka-black"
            }`}
          >
            <item.icon size={18} />
          </Link>
        </motion.div>
      ))}
    </aside>
  );
}
