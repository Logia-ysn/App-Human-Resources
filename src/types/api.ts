export type ApiResponse<T = unknown> = {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export function successResponse<T>(data: T, meta?: ApiResponse["meta"]): ApiResponse<T> {
  return { success: true, data, error: null, meta };
}

export function errorResponse(error: string): ApiResponse<null> {
  return { success: false, data: null, error };
}
