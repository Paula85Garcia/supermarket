export type UserRole = "customer" | "admin";

export const getRoleFromEnv = (): UserRole =>
  process.env.NEXT_PUBLIC_USER_ROLE === "admin" ? "admin" : "customer";

export const setClientSession = (role: string, identifier: string): void => {
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `mkx_token=demo-token-${identifier}; path=/; max-age=${maxAge}`;
  document.cookie = `mkx_role=${role}; path=/; max-age=${maxAge}`;
  document.cookie = `mkx_identifier=${identifier}; path=/; max-age=${maxAge}`;
};

export const clearAuthSession = (): void => {
  document.cookie = "mkx_access_token=; path=/; max-age=0";
  document.cookie = "mkx_refresh_token=; path=/; max-age=0";
  document.cookie = "mkx_role=; path=/; max-age=0";
  document.cookie = "mkx_identifier=; path=/; max-age=0";
  document.cookie = "mkx_token=; path=/; max-age=0";
};
