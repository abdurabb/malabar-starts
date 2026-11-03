const deployedApi = "http://13.51.106.161";

/** Backend origin with no path. Override with API_ORIGIN. */
export function apiOrigin() {
  const configured = process.env.API_ORIGIN?.trim().replace(/\/$/, "");
  return configured || deployedApi;
}
