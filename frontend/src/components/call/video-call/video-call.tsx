import React, { useState } from "react";
import VideoPlayer from "./video-player";
import CallControls from "./call-controls";
import { useWebRTCContext } from "../../../contexts/webrtc-context";

interface VideoCallProps {
    accountId: string;
    remoteUserId?: string;
    onCallEnded?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
    accountId,
    remoteUserId,
    onCallEnded,
}) => {
    const {
        callState,
        startCall,
        localStream,
        remoteStream,
        endCall,
        toggleMute,
        toggleVideo,
    } = useWebRTCContext();

    const [callTarget, setCallTarget] = useState<string | undefined>(
        remoteUserId,
    );

    return (
        <div className="video-call-container">
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

            <div className="call-status">
                {callState.callStatus === "calling" && "Вызов..."}
                {callState.callStatus === "connected" && "Разговор"}
                {callState.callStatus === "ended" && "Звонок завершен"}
            </div>

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

            {!callState.isInCall && callState.callStatus !== "ringing" && (
                <div className="contacts">
                    <h3>Контакты онлайн</h3>
                    <button
                        onClick={() => {
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
