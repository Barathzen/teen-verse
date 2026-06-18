export const config = {
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? "https://teen-verse.onrender.com"
      : "http://localhost:8000"),
  appName: process.env.NEXT_PUBLIC_APP_NAME || "TeenVerse",
  appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};
