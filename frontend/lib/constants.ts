export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const COOKIE_SESSION_NAME = "session_token";
export const SESSION_EXPIRATION_DAYS = 7;

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL || "";
export const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "";
