"use client";

import { useMemo, useState } from "react";
import { loadWorkforceUsers, loadProfiles, saveWorkforceUsers, type WorkforceRole, type WorkforceUser } from "../lib/workforce";

export function WorkforceManager() {
  const [users, setUsers] = useState<WorkforceUser[]>(() => loadWorkforceUsers());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("Merka2026!");
  const [role, setRole] = useState<WorkforceRole>("driver");

  const activeUsers = useMemo(() => users.filter((u) => u.active), [users]);
  const profiles = useMemo(() => loadProfiles(), [users]);

  const persist = (next: WorkforceUser[]) => {
    setUsers(next);
    saveWorkforceUsers(next);
  };

  const addUser = () => {
    if (!username.trim()) return;
    const next: WorkforceUser[] = [
      ...users,
      {
        id: `w-${Date.now()}`,
        username: username.trim(),
        password: password || "Merka2026!",
        role,
        active: true
      }
    ];
    persist(next);
    setUsername("");
    setPassword("Merka2026!");
    setRole("driver");
  };

  const deactivate = (id: string) => {
    persist(users.map((u) => (u.id === id ? { ...u, active: false } : u)));
  };

  return (
    <section className="mt-5 rounded-2xl border border-merka-border bg-merka-surface p-5">
      <h3 className="font-headline text-lg font-semibold text-white">Equipo operativo (turnos)</h3>
      <p className="mt-1 text-xs text-zinc-400">Crea nuevos usuarios si alguien renuncia o cambia de turno.</p>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario (ej: MaxFlash03)"
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contrasena"
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as WorkforceRole)}
          className="rounded-xl border border-merka-border bg-merka-black px-3 py-2 text-xs text-white outline-none"
        >
          <option value="driver">Domiciliario</option>
          <option value="picker">Alistamiento</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="button"
          onClick={addUser}
          className="cursor-pointer rounded-xl bg-merka-yellow px-3 py-2 text-xs font-semibold text-merka-black shadow-sm transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          Crear usuario
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {activeUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-xl border border-merka-border bg-merka-black p-3 text-xs">
            <span className="text-zinc-200">
              {user.username} · {user.role}
              {(() => {
                const pr = profiles.find((p) => p.username === user.username);
                return pr ? ` · ${pr.displayName} · ${pr.shift}` : "";
              })()}
            </span>
            <button
              type="button"
              onClick={() => deactivate(user.id)}
              className="cursor-pointer rounded-lg bg-merka-red px-2 py-1 text-white shadow-sm transition hover:brightness-110 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-merka-red/50"
            >
              Marcar retiro
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
