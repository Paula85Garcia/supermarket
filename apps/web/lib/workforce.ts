"use client";

export type WorkforceRole = "driver" | "picker" | "admin";

export interface WorkforceUser {
  id: string;
  username: string;
  password: string;
  role: WorkforceRole;
  active: boolean;
}

export interface WorkforceProfile {
  username: string;
  displayName: string;
  shift: string;
  /** WhatsApp del alistador (solo dígitos o con +57). Lo usan clientes desde carrito / Max. */
  whatsappPhone?: string;
}

export interface OrderDriverAssignment {
  orderId: string;
  username: string;
  displayName: string;
  shift: string;
  assignedAt: string;
}

export interface OrderPickerAssignment {
  orderId: string;
  username: string;
  displayName: string;
  /** Dígitos wa.me */
  whatsappDigits: string;
  assignedAt: string;
}

const STORAGE_KEY = "mkx_workforce_users";
const PROFILE_KEY = "mkx_workforce_profiles";
const ASSIGNMENTS_KEY = "mkx_order_driver_assignments";
const ROUND_ROBIN_KEY = "mkx_driver_round_robin_index";
const PICKER_ASSIGNMENTS_KEY = "mkx_order_picker_assignments";
const PICKER_ROUND_ROBIN_KEY = "mkx_picker_round_robin_index";

export const defaultWorkforceUsers: WorkforceUser[] = [
  { id: "w-1", username: "MaxFlash01", password: "Merka2026!", role: "driver", active: true },
  { id: "w-2", username: "MaxFlash02", password: "Merka2026!", role: "driver", active: true },
  { id: "w-3", username: "MaxReady01", password: "Merka2026!", role: "picker", active: true },
  { id: "w-4", username: "MaxReady02", password: "Merka2026!", role: "picker", active: true },
  { id: "w-5", username: "maxadministra", password: "Merka2026!", role: "admin", active: true }
];

export function loadWorkforceUsers(): WorkforceUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultWorkforceUsers));
      return defaultWorkforceUsers;
    }
    return JSON.parse(raw) as WorkforceUser[];
  } catch {
    return defaultWorkforceUsers;
  }
}

export function saveWorkforceUsers(users: WorkforceUser[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function loadProfiles(): WorkforceProfile[] {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? "[]") as WorkforceProfile[];
  } catch {
    return [];
  }
}

export function saveProfile(profile: WorkforceProfile): void {
  const prev = loadProfiles().filter((p) => p.username !== profile.username);
  const existing = loadProfiles().find((p) => p.username === profile.username);
  const merged: WorkforceProfile = {
    ...existing,
    ...profile,
    username: profile.username
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify([...prev, merged]));
}

export function getProfile(username: string): WorkforceProfile | undefined {
  return loadProfiles().find((profile) => profile.username === username);
}

function loadAssignments(): OrderDriverAssignment[] {
  try {
    return JSON.parse(localStorage.getItem(ASSIGNMENTS_KEY) ?? "[]") as OrderDriverAssignment[];
  } catch {
    return [];
  }
}

function saveAssignments(assignments: OrderDriverAssignment[]): void {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

function nextDriverIndex(max: number): number {
  const current = Number(localStorage.getItem(ROUND_ROBIN_KEY) ?? "0");
  const next = max > 0 ? (current + 1) % max : 0;
  localStorage.setItem(ROUND_ROBIN_KEY, String(next));
  return current % Math.max(max, 1);
}

function nextPickerIndex(max: number): number {
  const current = Number(localStorage.getItem(PICKER_ROUND_ROBIN_KEY) ?? "0");
  const next = max > 0 ? (current + 1) % max : 0;
  localStorage.setItem(PICKER_ROUND_ROBIN_KEY, String(next));
  return current % Math.max(max, 1);
}

function loadPickerAssignments(): OrderPickerAssignment[] {
  try {
    return JSON.parse(localStorage.getItem(PICKER_ASSIGNMENTS_KEY) ?? "[]") as OrderPickerAssignment[];
  } catch {
    return [];
  }
}

function savePickerAssignments(rows: OrderPickerAssignment[]): void {
  localStorage.setItem(PICKER_ASSIGNMENTS_KEY, JSON.stringify(rows));
}

export function assignDriverToOrder(orderId: string): OrderDriverAssignment | null {
  const activeDrivers = loadWorkforceUsers().filter((user) => user.active && user.role === "driver");
  if (!activeDrivers.length) return null;

  const selected = activeDrivers[nextDriverIndex(activeDrivers.length)];
  const profile = getProfile(selected.username);
  const assignment: OrderDriverAssignment = {
    orderId,
    username: selected.username,
    displayName: profile?.displayName || selected.username,
    shift: profile?.shift || "Turno no definido",
    assignedAt: new Date().toISOString()
  };

  const nextAssignments = loadAssignments().filter((item) => item.orderId !== orderId);
  nextAssignments.push(assignment);
  saveAssignments(nextAssignments);
  return assignment;
}

export function getOrderDriverAssignment(orderId: string): OrderDriverAssignment | null {
  return loadAssignments().find((item) => item.orderId === orderId) ?? null;
}

export function assignPickerToOrder(orderId: string): OrderPickerAssignment | null {
  const activePickers = loadWorkforceUsers().filter((user) => user.active && user.role === "picker");
  if (!activePickers.length) return null;

  const selected = activePickers[nextPickerIndex(activePickers.length)];
  const profile = getProfile(selected.username);
  const rawWa = profile?.whatsappPhone?.trim();
  const digitsFromProfile = rawWa ? rawWa.replace(/\D/g, "") : "";
  const whatsappDigits =
    digitsFromProfile.length >= 10
      ? digitsFromProfile.startsWith("57")
        ? digitsFromProfile
        : `57${digitsFromProfile}`
      : (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MERKAMAX_PICKER_WA
          ? process.env.NEXT_PUBLIC_MERKAMAX_PICKER_WA.replace(/\D/g, "")
          : "573053700491");

  const assignment: OrderPickerAssignment = {
    orderId,
    username: selected.username,
    displayName: profile?.displayName || selected.username,
    whatsappDigits,
    assignedAt: new Date().toISOString()
  };

  const next = loadPickerAssignments().filter((a) => a.orderId !== orderId);
  next.push(assignment);
  savePickerAssignments(next);
  return assignment;
}

export function getOrderPickerAssignment(orderId: string): OrderPickerAssignment | null {
  return loadPickerAssignments().find((a) => a.orderId === orderId) ?? null;
}
