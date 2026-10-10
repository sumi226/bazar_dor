
const BASE_URLS = [
  "https://openapi.programming-hero.com/api/bazardor",
  "https://api.api-store.workers.dev/api/bazardor",
  "https://api.abcz.workers.dev/api/bazardor",
] as const;

export async function fetchBazarDor(
  path: string,
): Promise<unknown | null> {
  for (const baseUrl of BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: {
          Accept: "application/json",
        },
      });

      // Rate limit, server error অথবা অন্য HTTP error হলে
      // পরবর্তী API চেষ্টা করবে।
      if (!response.ok) continue;

      const data: unknown = await response.json();

      if (
        data !== null &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        const result = data as Record<string, unknown>;

        if (
          result.success === false ||
          result.status === "error" ||
          result.error
        ) {
          continue;
        }
      }

      return data;
    } catch {
      // Network error বা timeout হলে পরবর্তী API চেষ্টা করবে।
      continue;
    }
  }

  return null;
}
