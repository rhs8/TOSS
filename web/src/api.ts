// In dev use "" so /api goes through Vite proxy (see vite.config proxy target).
const BASE = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "");

function headers(token?: string | null) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (import.meta.env.DEV) h["X-Dev-Uid"] = token || "dev-uid-1";
  return h;
}

/** Read body once and parse JSON safely; avoids "Unexpected end of JSON input" on empty/invalid responses. */
async function parseJson(r: Response): Promise<{ text: string; data: unknown }> {
  const text = await r.text();
  let data: unknown = null;
  if (text.trim()) {
    try {
      data = JSON.parse(text);
    } catch {
      // leave data null
    }
  }
  return { text, data };
}

function errorMessage(r: Response, text: string, data: unknown): string {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return text || r.statusText || "Request failed";
}

/** Throw with message and status so callers can check for 401. */
function throwApiError(r: Response, text: string, data: unknown): never {
  const err = new Error(errorMessage(r, text, data)) as Error & { status?: number };
  err.status = r.status;
  throw err;
}

export const api = {
  async getMe(token: string) {
    const r = await fetch(`${BASE}/api/users/me`, { headers: headers(token) });
    const { text, data } = await parseJson(r);
    if (!r.ok) throwApiError(r, text, data);
    return data;
  },
  async signUp(body: { firebase_uid: string; email: string; display_name?: string }) {
    const r = await fetch(`${BASE}/api/users/signup`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async getCategories() {
    const r = await fetch(`${BASE}/api/categories`);
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async getItems(token: string | null | undefined, params?: { category?: string; neighbourhood?: string; seasonal?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    const r = await fetch(`${BASE}/api/items?${q}`, { headers: headers(token) });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async getMyItems(token: string) {
    const r = await fetch(`${BASE}/api/items/mine`, { headers: headers(token) });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async getItem(id: string) {
    const r = await fetch(`${BASE}/api/items/${id}`);
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async postItem(token: string, body: { title: string; description?: string; photo_url?: string; category_id: string; neighbourhood?: string; seasonal_collection?: string }) {
    const r = await fetch(`${BASE}/api/items`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(body),
    });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async requestItem(token: string, itemId: string, body?: { availability?: string; meeting_spots?: string }) {
    const r = await fetch(`${BASE}/api/items/${itemId}/request`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(body ?? {}),
    });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async getWishlists(token: string) {
    const r = await fetch(`${BASE}/api/wishlists`, { headers: headers(token) });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async addWishlist(token: string, body: { title: string; description?: string; category_id?: string }) {
    const r = await fetch(`${BASE}/api/wishlists`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(body),
    });
    const { text, data } = await parseJson(r);
    if (!r.ok) throw new Error(errorMessage(r, text, data));
    return data;
  },
  async getStats() {
    const r = await fetch(`${BASE}/api/stats/impact`);
    const { data } = await parseJson(r);
    if (!r.ok) return { preventedPurchases: 0 };
    return data ?? { preventedPurchases: 0 };
  },
  async getCircles() {
    const r = await fetch(`${BASE}/api/circles`);
    const { data } = await parseJson(r);
    if (!r.ok) return { circles: [] };
    return data ?? { circles: [] };
  },
};
