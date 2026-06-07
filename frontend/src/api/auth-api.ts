import type { AuthRequest } from "../types/auth/auth-request";
import type { AuthResponse } from "../types/auth/auth-response";
import type { JWTResponse } from "../types/auth/jwt-response";
import customRequest from "./custom-request";

export const login = async (request: AuthRequest) => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        },
    );
    const jwt = await response.json() as JWTResponse;
    localStorage.setItem("accessToken", jwt.accessToken);
    localStorage.setItem("refreshToken", jwt.refreshToken);
};

export const register = async (request: AuthRequest): Promise<AuthResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/auth/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        },
    );
    return await response.json() as AuthResponse;
};
