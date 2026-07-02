import { useAuthStore } from "../auth/store";
import type { JWTResponse } from "../types/auth/jwt-response";
import type { RequestConfig } from "../types/auth/request-config";

class ApiClient {
    private refreshPromise: Promise<string> | null = null;
    private baseURL: string;

    constructor(baseURL: string = "") {
        this.baseURL = baseURL;
    }

    private buildURL(url: string, params?: RequestConfig["params"]): string {
        const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;

        if (!params) return fullUrl;

        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, String(value));
            }
        });

        const queryString = searchParams.toString();
        return queryString ? `${fullUrl}?${queryString}` : fullUrl;
    }

    async request<T>(config: RequestConfig): Promise<T> {
        const token = useAuthStore.getState().accessToken;
        const url = this.buildURL(config.url, config.params);

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...config.headers,
            ...(token && { Authorization: `Bearer ${token}` }),
        };

        const controller = new AbortController();
        const timeoutId = config.timeout
            ? setTimeout(() => controller.abort(), config.timeout)
            : null;

        try {
            const response = await fetch(url, {
                ...config,
                headers,
                signal: controller.signal,
                credentials: config.credentials || "include",
            });

            if (timeoutId) clearTimeout(timeoutId);

            // Обработка 401
            if (response.status === 401) {
                if (!this.refreshPromise) {
                    this.refreshPromise = this.refreshToken();
                }

                try {
                    const newToken = await this.refreshPromise;
                    this.refreshPromise = null;

                    return this.request({
                        ...config,
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${newToken}`,
                        },
                    });
                } catch (refreshError) {
                    this.refreshPromise = null;
                    useAuthStore.getState().clearAuth();
                    window.location.href = "/login";
                    throw refreshError;
                }
            }

            // Если ответ пустой
            if (response.status === 204) {
                return {} as T;
            }

            // Проверка на успешный ответ
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: errorData.message || response.statusText,
                    data: errorData,
                };
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            if (timeoutId) clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    throw {
                        status: 408,
                        message: "Request timeout",
                    };
                }
            }

            throw error;
        }
    }

    // HTTP методы
    get<T>(
        url: string,
        config?: Omit<RequestConfig, "url" | "method">,
    ): Promise<T> {
        return this.request<T>({ ...config, url, method: "GET" });
    }

    post<T>(
        url: string,
        data?: unknown,
        config?: Omit<RequestConfig, "url" | "method" | "body">,
    ): Promise<T> {
        return this.request<T>({
            ...config,
            url,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    put<T>(
        url: string,
        data?: unknown,
        config?: Omit<RequestConfig, "url" | "method" | "body">,
    ): Promise<T> {
        return this.request<T>({
            ...config,
            url,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    patch<T>(
        url: string,
        data?: unknown,
        config?: Omit<RequestConfig, "url" | "method" | "body">,
    ): Promise<T> {
        return this.request<T>({
            ...config,
            url,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    delete<T>(
        url: string,
        config?: Omit<RequestConfig, "url" | "method">,
    ): Promise<T> {
        return this.request<T>({ ...config, url, method: "DELETE" });
    }

    async refreshToken(): Promise<string> {
        try {
            const response = await fetch(`${this.baseURL}/auth/refresh`, {
                method: "POST",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Refresh failed: ${response.status}`);
            }

            const data: JWTResponse = await response.json();

            if (!data.accessToken) {
                throw new Error("No access token in refresh response");
            }

            useAuthStore.getState().setAccessToken(data.accessToken);
            return data.accessToken;
        } catch (error) {
            console.error("Refresh token error:", error);
            throw new Error("Refresh failed", { cause: error });
        }
    }
}

export const apiClient = new ApiClient(import.meta.env.VITE_BACKEND_URL);
