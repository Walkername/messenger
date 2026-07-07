// components/VideoCall/VideoCall.tsx
import React, { useEffect, useState } from "react";
import { useWebRTC } from "../../../hooks/use-webrtc";
import type { SignalingMessage } from "../../../types/call/webrtc";
import VideoPlayer from "./video-player";
import CallControls from "./call-controls";
import signalingService from "../../../services/signaling";

interface VideoCallProps {
    accountId: string;
    remoteUserId?: string;
    onCallEnded?: () => void;
}

declare global {
    interface Window {
        __signalingService?: typeof signalingService;
    }
}

const VideoCall: React.FC<VideoCallProps> = ({
    accountId,
    remoteUserId,
    onCallEnded,
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [callTarget, setCallTarget] = useState<string | undefined>(
        remoteUserId,
    );

    const {
        callState,
        startCall,
        endCall,
        toggleMute,
        toggleVideo,
        handleSignalingMessage,
        localStream,
        remoteStream,
    } = useWebRTC({
        accountId,
        onCallEnded,
    });

    // Подключение к WebSocket
    useEffect(() => {
        const connectWebSocket = async () => {
            try {
                window.__signalingService = signalingService;

                await signalingService.connect(
                    accountId,
                    (message: SignalingMessage) => {
                        handleSignalingMessage(message);
                    },
                );

                setIsConnected(true);
            } catch (error) {
                console.error("Failed to connect to signaling server:", error);
            }
        };

        connectWebSocket();

        return () => {
            signalingService.disconnect();
            delete window.__signalingService;
        };
    }, [accountId, handleSignalingMessage]);

    // Автоматический старт звонка, если указан remoteUserId
    useEffect(() => {
        if (isConnected && remoteUserId && !callState.isInCall) {
            startCall(remoteUserId);
        }
    }, [isConnected, remoteUserId, startCall, callState.isInCall]);

    // Обработка звонка от другого пользователя
    // const handleIncomingCall = (fromUserId: string) => {
    //     setCallTarget(fromUserId);
    //     // Здесь можно показать модальное окно с подтверждением звонка
    //     // Для автоматического принятия раскомментируйте следующую строку:
    //     // startCall(fromUserId);
    // };

    return (
        <div className="video-call-container">
            {/* Видео пользователей */}
            <div className="video-grid">
                <div className="video-wrapper local">
                    <VideoPlayer
                        stream={localStream || undefined}
                        muted={true}
                        label="Вы"
                        className={!callState.isInCall ? "inactive" : ""}
                    />
                </div>

                {callState.isInCall && (
                    <div className="video-wrapper remote">
                        <VideoPlayer
                            stream={remoteStream}
                            label="Собеседник"
                            className={
                                callState.callStatus !== "connected"
                                    ? "connecting"
                                    : ""
                            }
                        />
                    </div>
                )}
            </div>

            {/* Статус звонка */}
            <div className="call-status">
                {callState.callStatus === "calling" && "Вызов..."}
                {callState.callStatus === "ringing" && "Входящий вызов..."}
                {callState.callStatus === "connected" && "Разговор"}
                {callState.callStatus === "ended" && "Звонок завершен"}
            </div>

            {/* Кнопки управления */}
            <CallControls
                isInCall={callState.isInCall}
                isMuted={callState.isMuted}
                isVideoOn={callState.isVideoOn}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onEndCall={endCall}
                onStartCall={() => {
                    if (callTarget) {
                        startCall(callTarget);
                    }
                }}
            />

            {/* Список контактов (можно вынести в отдельный компонент) */}
            {!callState.isInCall && (
                <div className="contacts">
                    <h3>Контакты онлайн</h3>
                    <button
                        onClick={() => {
                            // Здесь можно открыть список контактов или позвонить по ID
                            const id = prompt("Введите ID пользователя:");
                            if (id) {
                                setCallTarget(id);
                                startCall(id);
                            }
                        }}
                    >
                        Позвонить
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
