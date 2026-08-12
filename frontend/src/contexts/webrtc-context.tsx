import { createContext, useContext, useState, type ReactNode } from "react";
import { useAuthStore } from "../auth/store";
import { useWebRTC } from "../hooks/use-webrtc";

const WebRTCContext = createContext<ReturnType<typeof useWebRTC> | null>(null);

interface WebRTCProviderProps {
    children: ReactNode;
}

export function WebRTCProvider({ children }: WebRTCProviderProps) {
    const accountId = useAuthStore((state) => state.accountId);

    const webRTC = useWebRTC({
        accountId: String(accountId),
    });

    return (
        <WebRTCContext.Provider value={webRTC}>
            {children}
        </WebRTCContext.Provider>
    );
}

export function useWebRTCContext() {
    const context = useContext(WebRTCContext);

    if (!context) {
        throw new Error("useWebRTCContext must be used inside WebRTCProvider");
    }

    return context;
}
