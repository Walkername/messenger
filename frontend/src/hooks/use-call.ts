import { useCallback, useRef } from "react";

interface UseCallProps {
    accountId: string;
    onCallEnded?: () => void;
}

export const useCall = ({ accountId, onCallEnded }: UseCallProps) => {

    const localStreamRef = useRef<MediaStream | null>(null);
    
    const initLocalStream = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        localStreamRef.current = stream;

        return stream;
    }, []);
    
    const startCall = useCallback(async (accountIdToCall: string) => {
        await initLocalStream();

        
    }, []);

    const handleOffer = useCallback(() => {}, []);

    const handleAnswer = useCallback(() => {}, []);

    const handleIce = useCallback(() => {}, []);

    const cleanupCall = useCallback(() => {}, []);

    const handleSignalingMessage = useCallback(() => {
        if (msg.to !== accountId) return;

        switch (msg.type) {
            case "offer":
                await handleOffer(msg);
                break;
            case "answer":
                await handleAnswer(msg);
                break;
            case "ice-candidate":
                await handleIce(msg);
                break;
            case "hangup":
                cleanupCall();
                break;
        }
    }, [accountId, handleOffer, handleAnswer, handleIce, cleanupCall]);
};
