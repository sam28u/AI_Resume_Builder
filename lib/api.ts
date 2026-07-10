// ==========================================
// Types
// ==========================================
export type Resume = {
  id: string;
  jobDescription: string;
  createdAt: string;
};

// ==========================================
// Token Management Utilities
// ==========================================
const getAccessToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
};

export const setAccessToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
  }
};

export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
  }
};

// ==========================================
// Authentication Wrapper (The Magic)
// ==========================================
/**
 * A wrapper around `fetch` that automatically attaches the access token.
 * If the request fails due to expiration, it automatically attempts to refresh the token
 * using the HttpOnly cookie and retries the original request.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();

  // 1. Make the initial request
  let res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 2. If the token is invalid/expired (Backend returns 401, or 500 due to the throw Error)
  if (res.status === 401 || res.status === 500) {
    
    // Attempt to refresh the token
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // CRITICAL: This sends the HttpOnly refresh_token cookie
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      
      // Save the new access token
      setAccessToken(refreshData.accessToken);

      // Retry the original request with the NEW token
      res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
      });
    } else {
      // Refresh failed (refresh token expired/revoked). Force logout.
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login"; 
      }
    }
  }

  return res;
}

// ==========================================
// API Endpoints
// ==========================================

export async function getResumes(): Promise<Resume[]> {
  // Use the wrapper instead of raw fetch
  const res = await fetchWithAuth("/api/resumes", {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch resumes");
  }
  
  return res.json();
}

// Add other protected routes here later using fetchWithAuth...
// export async function createResume(data) { ... }
// export async function deleteResume(id) { ... }