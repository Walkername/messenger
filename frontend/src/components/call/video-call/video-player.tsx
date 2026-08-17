import React, { useRef, useEffect } from "react";

interface VideoPlayerProps {
    stream?: MediaStream;
    muted?: boolean;
    label?: string;
    className?: string;
    isConnecting?: boolean;
    isMini?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    stream,
    muted = false,
    label,
    className = "",
    isConnecting = false,
    isMini = false,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            const videoPlay = async () => {
                try {
                    await videoRef?.current?.play();
                } catch (error) {
                    console.error("Video play error:", error);
                }
            };
            videoPlay();
        }
    }, [stream]);

    return (
        <div className={`video-player ${className} ${isMini ? "mini" : ""}`}>
            <video
                ref={videoRef}
                autoPlay
                muted={muted}
                playsInline
                className="video-element"
            />

            {label && (
                <div className="video-label">
                    <span>{label}</span>
                    {isConnecting && <span className="connecting-dot">●</span>}
                </div>
            )}

            {!stream && !isConnecting && (
                <div className="video-placeholder">
                    <span>Ожидание видео</span>
                </div>
            )}

            {isConnecting && (
                <div className="connecting-overlay">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
