// export async function sendChatMessage({ userMessage, threadId }) {
//   const res = await fetch("/api/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ userMessage, threadId }),
//   });
//   return res.json();
// }

import Cookies from "js-cookie";

// Helper function to get auth token
export const getAuthToken = () => {
  return Cookies.get("ivy-auth-token");
};

// Helper function to create headers with auth token
const createAuthHeaders = () => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const fetchData = async () => {
  try {
    const res = await fetch(
      `${process.env.API_URL}/api/v1/chat-bot/conversation`,
      {
        method: "GET",
        headers: createAuthHeaders(),
        credentials: "include", // Include cookies in the request
      }
    );

    if (!res.ok) {
      const data2 = await res.json();

      // if token available but user not found then remove token
      if (data2.remove_token) {
        Cookies.remove("ivy-auth-token");
      }

      console.warn(`API returned status: ${res.status}`);
      return;
    }

    const data = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    // Initialize with empty array on error
  }
};

export async function sendChatMessage({ userMessage, threadId }) {
  const res = await fetch(
    `${process.env.API_URL}/api/v1/chat-bot/ask-to-agent`,
    {
      method: "POST",
      headers: createAuthHeaders(),
      credentials: "include", // Include cookies in the request
      body: JSON.stringify({ message: userMessage, sessionId: threadId }),
    }
  );

  const data = await res.json();
  return data.data;
}
