import type { LibraryState } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("authToken");
}

export async function syncLibraryState(state: LibraryState): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/library/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(state),
    });

    return response.ok;
  } catch {
    return false;
  }
}
