
const API_URL = "http://localhost:8080/api/auth";

async function sendAuthRequest(endpoint, data) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseText = await response.text();
  let result = null;

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.error ||
      "Something went wrong. Please try again."
    );
  }

  if (!result?.accessToken || !result?.user) {
    throw new Error("Invalid response received from the server.");
  }

  localStorage.setItem("accessToken", result.accessToken);
  localStorage.setItem("user", JSON.stringify(result.user));

  return result;
}

export function loginUser(email, password) {
  return sendAuthRequest("login", { email, password });
}

export function registerUser(fullName, email, password) {
  return sendAuthRequest("register", {
    fullName,
    email,
    password,
  });
}
