import { useCallback, useEffect, useRef, useState } from "react";
import CallRequestWindow from "../call-request-window/call-request-window";
import { useNavigate } from "react-router-dom";
import websocketService from "../../../services/websocket-service";
import type { SignalingMessage } from "../../../types/call/webrtc";
import { profileService } from "../../../services/profile-service";
import type { ProfileResponse } from "../../../types/profile/profile-response";
import { useWebRTCContext } from "../../../contexts/webrtc-context";

export default function CallSystem() {
    const navigate = useNavigate();

    const [interlocutor, setInterlocutor] = useState<ProfileResponse>();

    const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);

    const isProcessingRef = useRef(false);

    const {
        isRinging,
        acceptCall,
        rejectCall,
        handleSignalingMessage,
        setOnIncomingCall,
        setOnCallEnded,
        endCall,
    } = useWebRTCContext();

    useEffect(() => {
        const connectWebSocket = async () => {
            websocketService.registerSignalingHandler(
                (message: SignalingMessage) => {
                    handleSignalingMessage(message);
                },
            );
        };

        connectWebSocket();
    }, [handleSignalingMessage]);

    const onIncomingCall = useCallback(async (fromUserId: string) => {
        if (isProcessingRef.current) {
            console.log("⚠️ Already processing a call");
            return;
        }

        isProcessingRef.current = true;
        setIsCallRequestModalOpen(true);

        profileService.getProfile(parseInt(fromUserId)).then((data) => {
            setInterlocutor(data);
        });
    }, []);

    const onCallEnded = useCallback(() => {
        endCall()
    }, [endCall]);

    useEffect(() => {
        setOnIncomingCall(onIncomingCall);
        setOnCallEnded(onCallEnded);

        return () => {
            setOnIncomingCall(undefined);
            setOnCallEnded(undefined);
        };
    }, [onCallEnded, onIncomingCall, setOnCallEnded, setOnIncomingCall]);

    if (!isRinging) {
        return null;
    }

    const handleAcceptCall = async () => {
        try {
            const accountId = await acceptCall();
            setIsCallRequestModalOpen(false);
            setInterlocutor(undefined);

            navigate(`/call?with=${accountId}`);
        } catch (error) {
            console.error("Failed to accept incoming call:", error);
        }
    };

    const handleRejectCall = () => {
        rejectCall();
        setIsCallRequestModalOpen(false);
        setInterlocutor(undefined);
    };

    return (
        <CallRequestWindow
            isOpen={isCallRequestModalOpen}
            profile={interlocutor || undefined}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
            onClose={() => {
                handleRejectCall();
            }}
        />
    );
}
