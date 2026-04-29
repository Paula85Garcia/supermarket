interface FetchWithAuthOptions {
  redirectOnAuthFailure?: boolean;
}

export async function fetchWithAutoRefresh(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchWithAuthOptions
): Promise<Response> {
  let response = await fetch(input, init);
  if (response.status !== 401) return response;

  const refreshResponse = await fetch("/api/auth/refresh", {
    method: "POST"
  });
  if (!refreshResponse.ok) {
    if (options?.redirectOnAuthFailure && typeof window !== "undefined") {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/login?reason=session_expired";
    }
    return response;
  }

  response = await fetch(input, init);
  if (response.status === 401 && options?.redirectOnAuthFailure && typeof window !== "undefined") {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login?reason=session_expired";
  }
  return response;
}
