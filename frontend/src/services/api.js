
const API_BASE_URL = "http://localhost:8080/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Read the response body only once.
  const responseText = await response.text();

  let result = null;

  // Parse JSON only when the response has content.
  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = responseText;
    }
  }

  // Handle failed API requests.
  if (!response.ok) {
    const errorMessage =
      typeof result === "string"
        ? result
        : result?.message ||
          result?.error ||
          `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return result;
}
