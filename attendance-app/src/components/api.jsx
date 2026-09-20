const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch(url, method = "GET", body = null, isFormData = false) {
  const options = { method, headers: {} };
  const token = localStorage.getItem("token");

  if (token) {
    options.headers.Authorization = "Bearer " + token;
  }

  if (body) {
    if (isFormData) {
      options.body = body;
    } else {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${API_BASE}${url}`, options);

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/";
  }

  if (!response.ok) {
    const text = await response.text();
    let message = text || "API request failed";
    try {
      message = JSON.parse(text).detail || message;
    } catch {
      // Keep the plain response when the API does not return JSON.
    }
    throw new Error(message);
  }

  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}
