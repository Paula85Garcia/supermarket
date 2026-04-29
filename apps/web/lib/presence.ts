"use client";

import { loadWorkforceUsers } from "./workforce";

const STORAGE_PREFIX = "mkx_presence_";
const CHANNEL = "mkx_presence";

export interface PresenceEntry {
  username: string;
  role: string;
  displayName: string;
  shift: string;
  lastSeen: string;
}

function broadcast(): void {
  if (typeof BroadcastChannel === "undefined") return;
  const ch = new BroadcastChannel(CHANNEL);
  ch.postMessage("tick");
  ch.close();
}

export function heartbeatPresence(username: string, role: string, displayName: string, shift: string): void {
  const key = `${STORAGE_PREFIX}${username}`;
  const entry: PresenceEntry = {
    username,
    role,
    displayName,
    shift,
    lastSeen: new Date().toISOString()
  };
  localStorage.setItem(key, JSON.stringify(entry));
  broadcast();
}

export function loadAllPresence(): PresenceEntry[] {
  if (typeof window === "undefined") return [];
  const users = loadWorkforceUsers().filter((u) => u.active);
  const out: PresenceEntry[] = [];
  for (const u of users) {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${u.username}`);
    if (!raw) continue;
    try {
      const e = JSON.parse(raw) as PresenceEntry;
      const age = Date.now() - new Date(e.lastSeen).getTime();
      if (age < 90_000) out.push(e);
    } catch {
      /* skip */
    }
  }
  return out.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function subscribePresence(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const id = window.setInterval(onChange, 5000);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(STORAGE_PREFIX)) onChange();
  };
  window.addEventListener("storage", onStorage);
  let ch: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    ch = new BroadcastChannel(CHANNEL);
    ch.onmessage = () => onChange();
  }
  return () => {
    window.clearInterval(id);
    window.removeEventListener("storage", onStorage);
    ch?.close();
  };
}
