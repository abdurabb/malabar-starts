import { errorText } from "@/lib/apiError";

export async function loadPage<T>(task: () => Promise<T>, fallback: T, message: string) {
  try {
    return { data: await task(), error: "" };
  } catch (caught) {
    return { data: fallback, error: errorText(caught, message) };
  }
}
