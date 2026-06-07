import type { UpdateFirstNameRequest } from "../types/profile/profile-request";
import type { ProfileResponse } from "../types/profile/profile-response";
import customRequest from "./custom-request";

export const getProfile = async (id: number): Promise<ProfileResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}`,
    );
    return await response.json() as ProfileResponse;
};

export const getMyProfile = async (): Promise<ProfileResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users/me`,
    );
    return await response.json() as ProfileResponse;
};

export const updateProfileFirstName = async (id: number, request: UpdateFirstNameRequest) => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/users/${id}/firstname`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        },
    );
    return await response.json();
};
