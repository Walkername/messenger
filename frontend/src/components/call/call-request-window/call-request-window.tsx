import { useEffect, useRef } from "react";
import "./call-request-window.css";
import { Phone, PhoneOff } from "lucide-react";
import type { ProfileResponse } from "../../../types/profile/profile-response";

interface CallRequestWindowProps {
    isOpen: boolean;
    profile?: ProfileResponse;
    onAccept: () => void;
    onReject: () => void;
    onClose: () => void;
}

export default function CallRequestWindow({
    isOpen,
    profile,
    onAccept,
    onReject,
}: CallRequestWindowProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            if (!audioRef.current) {
                audioRef.current = new Audio("/ringtone.mp3");
                audioRef.current.loop = true;
            }
            audioRef.current.play().catch(console.error);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="call-request-modal-overlay">
            <div
                className="call-request-modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="caller-info">
                    <h3 className="caller-username">
                        {profile ? `${profile.username}` : "Unknown"}
                    </h3>
                </div>

                <div className="ringing-animation">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                </div>

                <div className="call-request-actions">
                    <button
                        className="call-request-accept-button"
                        onClick={onAccept}
                        aria-label="Accept call"
                    >
                        <Phone color="white" />
                    </button>

                    <button
                        className="call-request-reject-button"
                        onClick={onReject}
                        aria-label="Reject call"
                    >
                        <PhoneOff color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
}
