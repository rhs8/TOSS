const BASE = import.meta.env.VITE_API_URL || "";

function headers(token?: string | null) {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (import.meta.env.DEV) h["X-Dev-Uid"] = token || "dev-uid-1";
  return h;
}

export const api = {
  async getMe(token: string) {
    const r = await fetch(`${BASE}/api/users/me`, { headers: headers(token) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async signUp(body: { firebase_uid: string; email: string; display_name?: string }) {
    const r = await fetch(`${BASE}/api/users/signup`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.json()).error || await r.text());
    return r.json();
  },
  async getCategories() {
    const r = await fetch(`${BASE}/api/categories`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async getItems(token: string, params?: { category?: string; neighbourhood?: string; seasonal?: string }) {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    const r = await fetch(`${BASE}/api/items?${q}`, { headers: headers(token) });
    if (!r.ok) throw new Error((await r.json()).error || await r.text());
    return r.json();
  },
  async getItem(id: string) {
    const r = await fetch(`${BASE}/api/items/${id}`);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async postItem(token: string, body: { title: string; description?: string; photo_url?: string; category_id: string; neighbourhood?: string; seasonal_collection?: string }) {
    const r = await fetch(`${BASE}/api/items`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.json()).error || await r.text());
    return r.json();
  },
  async requestItem(token: string, itemId: string) {
    const r = await fetch(`${BASE}/api/items/${itemId}/request`, {
      method: "POST",
      headers: headers(token),
    });
    if (!r.ok) throw new Error((await r.json()).error || await r.text());
    return r.json();
  },
  async getWishlists(token: string) {
    const r = await fetch(`${BASE}/api/wishlists`, { headers: headers(token) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  async addWishlist(token: string, body: { title: string; description?: string; category_id?: string }) {
    const r = await fetch(`${BASE}/api/wishlists`, {
      method: "POST",
      headers: headers(token),
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error((await r.json()).error || await r.text());
    return r.json();
  },
};
