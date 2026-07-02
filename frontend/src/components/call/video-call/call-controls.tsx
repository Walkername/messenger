// components/VideoCall/CallControls.tsx
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import React from "react";

interface CallControlsProps {
    isInCall: boolean;
    isMuted: boolean;
    isVideoOn: boolean;
    onToggleMute: () => void;
    onToggleVideo: () => void;
    onEndCall: () => void;
    onStartCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
    isInCall,
    isMuted,
    isVideoOn,
    onToggleMute,
    onToggleVideo,
    onEndCall,
    onStartCall,
}) => {
    return (
        <div className="call-controls">
            {isInCall ? (
                <>
                    <button className="control-btn" onClick={onToggleMute}>
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    <button className="control-btn" onClick={onToggleVideo}>
                        {isVideoOn ? (
                            <Video size={24} />
                        ) : (
                            <VideoOff size={24} />
                        )}
                    </button>

                    <button
                        className="control-btn end-call"
                        onClick={onEndCall}
                    >
                        <PhoneOff size={24} />
                    </button>
                </>
            ) : (
                <button
                    className="control-btn start-call"
                    onClick={onStartCall}
                >
                    <Phone size={24} />
                </button>
            )}
        </div>
    );
};

export default CallControls;
