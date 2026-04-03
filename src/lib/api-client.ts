import type { ApiResponse } from "@/types/api";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new ApiError(json.error ?? "Request failed", res.status);
  }

  return json.data as T;
}

/** SWR fetcher — throws on non-2xx so SWR surfaces errors */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return handleResponse<T>(res);
}

/** Generic API client for mutations (POST/PUT/PATCH/DELETE) */
export async function apiClient<T>(
  url: string,
  options: {
    method?: "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
  } = {}
): Promise<T> {
  const res = await fetch(url, {
    method: options.method ?? "POST",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  return handleResponse<T>(res);
}

export { ApiError };
