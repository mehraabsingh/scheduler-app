// API base URL — set NEXT_PUBLIC_API_URL in your .env.local (dev) or Vercel env vars (prod)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`GET ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  post: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`POST ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  put: async (endpoint: string, data: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`PUT ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  patch: async (endpoint: string, data?: any) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) throw new Error(`PATCH ${endpoint} failed: ${res.status}`);
    return res.json();
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`DELETE ${endpoint} failed: ${res.status}`);
    return res.json();
  },
};
