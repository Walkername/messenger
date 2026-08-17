import { useState } from "react";
import VideoPlayer from "./video-player";
import CallControls from "./call-controls";
import "./video-call.css";
import type { ProfileResponse } from "../../../types/profile/profile-response";
import { useWebRTCContext } from "../../../contexts/webrtc-context";

interface VideoCallProps {
    profile?: ProfileResponse;
}

const VideoCall = ({ profile }: VideoCallProps) => {
    const {
        callState,
        localStream,
        remoteStream,
        endCall,
        toggleMute,
        toggleVideo,
    } = useWebRTCContext();

    const [focusedVideo, setFocusedVideo] = useState<"local" | "remote">(
        "remote",
    );

    const handleEndCall = () => {
        endCall();
    };

    const handleSwitchFocus = (videoType: "local" | "remote") => {
        setFocusedVideo(videoType);
    };

    return (
        <div className="video-call-container">
            <div className="video-grid">
                <div className={`video-wrapper main-video`}>
                    <VideoPlayer
                        stream={
                            focusedVideo === "remote"
                                ? remoteStream || undefined
                                : localStream || undefined
                        }
                        muted={focusedVideo === "remote" ? false : true}
                        label={
                            focusedVideo === "remote" ? `${profile?.username}` : "You"
                        }
                        className={!callState.isInCall ? "inactive" : ""}
                        isConnecting={
                            callState.isInCall &&
                            callState.callStatus !== "connected"
                        }
                    />
                </div>

                <div
                    className={`video-wrapper mini-video `}
                    onClick={() =>
                        handleSwitchFocus(
                            focusedVideo === "remote" ? "local" : "remote",
                        )
                    }
                >
                    <VideoPlayer
                        stream={
                            focusedVideo === "remote"
                                ? localStream || undefined
                                : remoteStream || undefined
                        }
                        muted={true}
                        label={
                            focusedVideo === "local" ? "You" : `${profile?.username}`
                        }
                        className={!callState.isInCall ? "inactive" : ""}
                        isConnecting={
                            callState.isInCall &&
                            callState.callStatus !== "connected"
                        }
                        isMini={true}
                    />
                </div>
            </div>

            <div className="controls-overlay">
                <CallControls
                    isInCall={callState.isInCall}
                    isMuted={callState.isMuted}
                    isVideoOn={callState.isVideoOn}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onEndCall={handleEndCall}
                    callStatus={callState.callStatus}
                />
            </div>

            {callState.isInCall && callState.callStatus !== "connected" && (
                <div className="call-status">
                    <span>Connecting...</span>
                </div>
            )}
        </div>
    );
};

export default VideoCall;
