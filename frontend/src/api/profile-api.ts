import type { UpdateFirstNameRequest } from "../types/profile/update-firstname-request";
import type { ProfileResponse } from "../types/profile/profile-response";
import customRequest from "./custom-request";
import type { UpdateUsernameRequest } from "../types/profile/update-username-request";

export const getProfile = async (id: number): Promise<ProfileResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/profiles/${id}`,
    );
    return await response.json() as ProfileResponse;
};

export const getMyProfile = async (): Promise<ProfileResponse> => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/profiles/me`,
    );
    return await response.json() as ProfileResponse;
};

export const updateProfileFirstName = async (request: UpdateFirstNameRequest) => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/profiles/me/firstname`,
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

export const updateProfileUsername = async (request: UpdateUsernameRequest) => {
    const response = await customRequest(
        `${import.meta.env.VITE_BACKEND_URL}/profiles/me/username`,
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
