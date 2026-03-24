import { api } from "./client";

export function getMe() {
  return api.get("/api/auth/me");
}

export function login(email, password) {
  // FastAPI OAuth2PasswordRequestForm expects form-data
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  return api.post("/api/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export function register(fields) {
  // fields: { email, password, username, display_name, avatar,
  //           invite_from_user?, invite_film_title?, invite_film_year?,
  //           invite_note?, invite_rating? }
  return api.post("/api/auth/register", fields);
}

export function googleAuth(credential, inviteFields = {}) {
  // inviteFields: { invite_from_user?, invite_film_title?, invite_film_year?,
  //                 invite_note?, invite_rating? }
  return api.post("/api/auth/google", { credential, ...inviteFields });
}

export function updateMe(fields) {
  return api.put("/api/auth/me", fields);
}
