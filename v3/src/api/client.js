// Base API client — all requests go through here
// Token is read from localStorage on every call so it's always fresh

const TOKEN_KEY = "filmshare_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(path, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

export const api = {
  get: (path, options = {}) => request(path, options),
  post: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "POST",
      body: body instanceof URLSearchParams ? body : JSON.stringify(body),
    }),
  put: (path, body, options = {}) =>
    request(path, {
      ...options,
      method: "PUT",
      body: body instanceof URLSearchParams ? body : JSON.stringify(body),
    }),
  delete: (path, options = {}) =>
    request(path, { ...options, method: "DELETE" }),
};
