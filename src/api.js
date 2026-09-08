// Empty string means "same origin", which is how it runs on Vercel: the
// front end and the API share one domain. In local dev, Vite proxies /api
// to the Express server on port 4000 (see vite.config.js).
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const TOKEN_KEY = "jack_admin_token";

export const auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set token(value) {
    if (value) localStorage.setItem(TOKEN_KEY, value);
    else localStorage.removeItem(TOKEN_KEY);
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

async function request(path, { method = "GET", body, isForm } = {}) {
  const headers = {};
  if (auth.token) headers.Authorization = `Bearer ${auth.token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Can't reach the server. Check that the API is running and VITE_API_URL is correct."
    );
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) auth.clear();
    throw new Error(data.error || `Request failed (${res.status}).`);
  }
  return data;
}

export const api = {
  // public
  getSite: () => request("/api/site"),

  // auth
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/api/auth/me"),
  changePassword: (currentPassword, newPassword) =>
    request("/api/auth/password", {
      method: "POST",
      body: { currentPassword, newPassword },
    }),

  // content
  getSiteAdmin: () => request("/api/site/admin"),
  saveSite: (patch) => request("/api/site", { method: "PUT", body: patch }),
  addItem: (list, item) =>
    request(`/api/site/${list}/items`, { method: "POST", body: item }),
  updateItem: (list, id, item) =>
    request(`/api/site/${list}/items/${id}`, { method: "PUT", body: item }),
  deleteItem: (list, id) =>
    request(`/api/site/${list}/items/${id}`, { method: "DELETE" }),
  reorder: (list, ids) =>
    request(`/api/site/${list}/reorder`, { method: "POST", body: { ids } }),

  // media
  listMedia: () => request("/api/media"),
  uploadMedia: (file, label = "") => {
    const form = new FormData();
    form.append("file", file);
    form.append("label", label);
    return request("/api/media", { method: "POST", body: form, isForm: true });
  },
  deleteMedia: (id) => request(`/api/media/${id}`, { method: "DELETE" }),
};
