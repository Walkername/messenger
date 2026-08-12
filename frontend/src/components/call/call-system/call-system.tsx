import { useCallback, useEffect, useRef, useState } from "react";
import CallRequestWindow from "../call-request-window/call-request-window";
import { useNavigate } from "react-router-dom";
import { useWebRTCContext } from "../../../contexts/webrtc-context";
import websocketService from "../../../services/websocket-service";
import type { SignalingMessage } from "../../../types/call/webrtc";

export default function CallSystem() {
    const navigate = useNavigate();

    const [isCallRequestModalOpen, setIsCallRequestModalOpen] = useState(false);
    
    const [incomingCallerId, setIncomingCallerId] = useState<string | null>(
        null,
    );

    const isProcessingRef = useRef(false);

    const {
        isRinging,
        acceptCall,
        rejectCall,
        handleSignalingMessage,
        setOnIncomingCall,
        setOnCallEnded,
    } = useWebRTCContext();

    useEffect(() => {
        const connectWebSocket = async () => {
            websocketService.registerSignalingHandler(
                (message: SignalingMessage) => {
                    handleSignalingMessage(message);
                },
            );

            // setIsConnected(true);
        };

        connectWebSocket();
    }, [handleSignalingMessage]);

    const onIncomingCall = useCallback((fromUserId: string) => {
        if (isProcessingRef.current) {
            console.log("⚠️ Already processing a call");
            return;
        }

        isProcessingRef.current = true;
        setIncomingCallerId(fromUserId);
        setIsCallRequestModalOpen(true);
    }, []);

    const onCallEnded = useCallback(() => {
        // navigate(-1);
    }, [navigate]);

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
            await acceptCall();
            setIsCallRequestModalOpen(false);
            setIncomingCallerId(null);

            navigate("/call");
        } catch (error) {
            console.error("Failed to accept incoming call:", error);
        }
    };

    const handleRejectCall = () => {
        rejectCall();
        setIsCallRequestModalOpen(false);
        setIncomingCallerId(null);
    };

    return (
        <CallRequestWindow
            isOpen={isCallRequestModalOpen}
            callerId={incomingCallerId || undefined}
            onAccept={handleAcceptCall}
            onReject={handleRejectCall}
            onClose={() => {
                handleRejectCall();
            }}
        />
    );
}
