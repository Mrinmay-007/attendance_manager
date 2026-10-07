// const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// export async function apiFetch(url, method = "GET", body = null, isFormData = false) {
//   const options = { method, headers: {} };
//   const token = localStorage.getItem("token");

//   if (token) {
//     options.headers.Authorization = "Bearer " + token;
//   }

//   if (body) {
//     if (isFormData) {
//       options.body = body;
//     } else {
//       options.headers["Content-Type"] = "application/json";
//       options.body = JSON.stringify(body);
//     }
//   }

//   const response = await fetch(`${API_BASE}${url}`, options);

//   if (response.status === 401) {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     window.location.href = "/";
//   }

//   if (!response.ok) {
//     const text = await response.text();
//     let message = text || "API request failed";
//     try {
//       message = JSON.parse(text).detail || message;
//     } catch {
//       // Keep the plain response when the API does not return JSON.
//     }
//     throw new Error(message);
//   }

//   const text = await response.text();
//   if (!text) return null;
//   return JSON.parse(text);
// }




const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const DEFAULT_TTL_MS = 30_000;

const cache = new Map();     // key -> { data, expires }
const inflight = new Map();  // key -> Promise
let epoch = 0;               // bumps on every clear, so late responses can't resurrect stale data

export function clearApiCache() {
  epoch += 1;
  cache.clear();
  inflight.clear();
}

async function request(url, method, body, isFormData) {
  const options = { method, headers: {} };
  const token = localStorage.getItem("token");
  if (token) options.headers.Authorization = "Bearer " + token;

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
    clearApiCache();
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
  return text ? JSON.parse(text) : null;
}

export function apiFetch(
  url,
  method = "GET",
  body = null,
  isFormData = false,
  { ttl = DEFAULT_TTL_MS, force = false } = {}
) {
  // Any successful write invalidates everything: simple and always safe.
  if (method !== "GET") {
    return request(url, method, body, isFormData).then((result) => {
      clearApiCache();
      return result;
    });
  }

  const key = `${localStorage.getItem("token")}|${url}`; // per-user, so accounts never share data

  if (!force) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return Promise.resolve(hit.data);
    const pending = inflight.get(key);
    if (pending) return pending; // dedupe identical in-flight requests
  }

  const startedAt = epoch;
  const promise = request(url, "GET", null, false)
    .then((data) => {
      if (ttl > 0 && startedAt === epoch) {
        cache.set(key, { data, expires: Date.now() + ttl });
      }
      return data;
    })
    .finally(() => {
      if (inflight.get(key) === promise) inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}