"use client";

import { CartProvider } from "../lib/cart-context";
import { SessionActivityManager } from "../lib/session-activity";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SessionActivityManager />
      {children}
    </CartProvider>
  );
}
