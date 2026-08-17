import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import React from "react";

interface CallControlsProps {
    isInCall: boolean;
    isMuted: boolean;
    isVideoOn: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
    callStatus?: string;
}

const CallControls: React.FC<CallControlsProps> = ({
    isInCall,
    isMuted,
    isVideoOn,
    onToggleMute,
    onToggleVideo,
    onEndCall,
    callStatus,
}) => {
    return (
        <div className="call-controls">
            <div className="controls-group">
                <button
                    className={`control-btn ${isMuted ? "active" : ""}`}
                    onClick={onToggleMute}
                    title={isMuted ? "Включить микрофон" : "Выключить микрофон"}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    className={`control-btn ${!isVideoOn ? "active" : ""}`}
                    onClick={onToggleVideo}
                    title={isVideoOn ? "Выключить камеру" : "Включить камеру"}
                >
                    {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>

                {isInCall && (
                    <button
                        className="control-btn end-call"
                        onClick={onEndCall}
                        title="Завершить звонок"
                    >
                        <PhoneOff size={24} />
                    </button>
                )}
            </div>

            {callStatus === "connected" && (
                <div className="call-timer">
                    <span>●</span> В эфире
                </div>
            )}
        </div>
    );
};

export default CallControls;
