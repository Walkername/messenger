import { useEffect, useRef } from "react";
import ModalWindow from "../../modal-window/modal-window";
import "./call-request-window.css";

interface CallRequestWindowProps {
    isOpen: boolean;
    callerId?: string;
    onAccept: () => void;
    onReject: () => void;
    onClose: () => void;
}

export default function CallRequestWindow({
    isOpen,
    callerId,
    onAccept,
    onReject,
    onClose,
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
        <ModalWindow isOpen={isOpen} onClose={onClose}>
            <div
                className="call-request-modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="caller-info">
                    <div className="avatar">
                        <svg viewBox="0 0 24 24" width="64" height="64">
                            <circle cx="12" cy="8" r="6" fill="#e0e0e0" />
                            <path
                                d="M4 20c0-4 4-6 8-6s8 2 8 6"
                                fill="#e0e0e0"
                            />
                        </svg>
                    </div>
                    <h3>Incoming call</h3>
                    <p className="caller-id">
                        {callerId ? `От: ${callerId}` : "Unknown subscriber"}
                    </p>
                    <div className="ringing-animation">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>

                <div className="call-actions">
                    <button
                        className="reject-btn"
                        onClick={onReject}
                        aria-label="Reject call"
                    >
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                fill="white"
                            />
                        </svg>
                    </button>
                    <button
                        className="accept-btn"
                        onClick={onAccept}
                        aria-label="Accept call"
                    >
                        <svg viewBox="0 0 24 24" width="32" height="32">
                            <path
                                d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"
                                fill="white"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </ModalWindow>
    );
}
