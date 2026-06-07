import getClaimFromToken from "../utils/token-validation";

interface RequestOptions extends RequestInit {
    headers?: HeadersInit;
}

interface TokensResponse {
    accessToken: string;
    refreshToken: string;
}

interface ErrorResponse {
    message?: string;
}

export default async function customRequest(
    path: string | URL | globalThis.Request,
    options: RequestOptions = {}
): Promise<Response> {
    // Adding authorization token
    const requestOptions: RequestOptions = { ...options };
    requestOptions.headers = requestOptions.headers || {};

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const expRefreshToken = refreshToken
        ? getClaimFromToken(refreshToken, "exp")
        : null;

    if (Date.now() / 1000 > expRefreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }

    if (accessToken) {
        requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `Bearer ${accessToken}`
        };
    }

    let response = await fetch(path, requestOptions);

    // If 401 status code, then use refresh and the same rawBody
    if (response.status === 401) {
        const refreshRes = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/auth/refresh`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: localStorage.getItem("refreshToken"),
                }),
            }
        );
        
        if (!refreshRes.ok) throw new Error("Session expired");

        const tokens: TokensResponse = await refreshRes.json();
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = tokens;
        
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Updating authorization header
        const retryOptions: RequestOptions = {
            ...requestOptions,
            headers: {
                ...requestOptions.headers,
                Authorization: `Bearer ${newAccessToken}`,
            },
        };

        // Repeating initial request
        response = await fetch(path, retryOptions);
    }

    if (!response.ok) {
        const errBody: ErrorResponse = await response.json().catch(() => ({}));
        throw new Error(errBody.message || response.statusText);
    }

    return response;
}