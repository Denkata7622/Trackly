export async function apiFetch(path: string, options?: RequestInit) {
  const token = typeof window === "undefined" ? null : localStorage.getItem("ponotii_token");
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  return fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
}
