const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/auth`;
export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }

  return data;
}

export function saveSession(data) {
  localStorage.setItem("nexaops_token", data.token);
  localStorage.setItem("nexaops_user", JSON.stringify(data.user));
}

export function getStoredToken() {
  return localStorage.getItem("nexaops_token");
}

export function getStoredUser() {
  const user = localStorage.getItem("nexaops_user");

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user);
  } catch (error) {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("nexaops_token");
  localStorage.removeItem("nexaops_user");
}