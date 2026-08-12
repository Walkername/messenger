// components/VideoCall/VideoPlayer.tsx
import React, { useRef, useEffect } from "react";

interface VideoPlayerProps {
    stream?: MediaStream;
    muted?: boolean;
    label?: string;
    className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    stream,
    muted = false,
    label,
    className = "",
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            const videoPlay = async () => {
                await videoRef?.current?.play().catch(console.error);
            };
            videoPlay();
        }
    }, [stream]);

    return (
        <div className={`video-player ${className}`}>
            <video ref={videoRef} autoPlay muted={muted} playsInline />
            {label && <span className="video-label">{label}</span>}
            {!stream && (
                <div className="video-placeholder">
                    <span>Нет видео</span>
                </div>
            )}
        </div>
    );
};

export default VideoPlayer;
