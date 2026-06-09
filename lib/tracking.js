export const getVisitorId = async () => {
  if (typeof window === "undefined") return null;

  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
    // Basic fingerprint: simple random string for now or use a proper hashing
    visitorId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem("visitor_id", visitorId);
  }
  return visitorId;
};

export const getSessionId = () => {
  if (typeof window === "undefined") return null;

  let sessionId = sessionStorage.getItem("session_id");
  if (!sessionId) {
    sessionId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("session_id", sessionId);
  }
  return sessionId;
};

export const clearSession = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("session_id");
};
