import { useEffect, useRef } from "react";
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
        <div className="call-request-modal-overlay">
            <div
                className="call-request-modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="caller-info">
                    <h3 className="caller-username">
                        {callerId ? `От: ${callerId}` : "Unknown"}
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
                        <svg
                            height="32"
                            width="32"
                            viewBox="0 0 24 24"
                            fill="white"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                                {" "}
                                <path
                                    d="M3 5.5C3 14.0604 9.93959 21 18.5 21C18.8862 21 19.2691 20.9859 19.6483 20.9581C20.0834 20.9262 20.3009 20.9103 20.499 20.7963C20.663 20.7019 20.8185 20.5345 20.9007 20.364C21 20.1582 21 19.9181 21 19.438V16.6207C21 16.2169 21 16.015 20.9335 15.842C20.8749 15.6891 20.7795 15.553 20.6559 15.4456C20.516 15.324 20.3262 15.255 19.9468 15.117L16.74 13.9509C16.2985 13.7904 16.0777 13.7101 15.8683 13.7237C15.6836 13.7357 15.5059 13.7988 15.3549 13.9058C15.1837 14.0271 15.0629 14.2285 14.8212 14.6314L14 16C11.3501 14.7999 9.2019 12.6489 8 10L9.36863 9.17882C9.77145 8.93713 9.97286 8.81628 10.0942 8.64506C10.2012 8.49408 10.2643 8.31637 10.2763 8.1317C10.2899 7.92227 10.2096 7.70153 10.0491 7.26005L8.88299 4.05321C8.745 3.67376 8.67601 3.48403 8.55442 3.3441C8.44701 3.22049 8.31089 3.12515 8.15802 3.06645C7.98496 3 7.78308 3 7.37932 3H4.56201C4.08188 3 3.84181 3 3.63598 3.09925C3.4655 3.18146 3.29814 3.33701 3.2037 3.50103C3.08968 3.69907 3.07375 3.91662 3.04189 4.35173C3.01413 4.73086 3 5.11378 3 5.5Z"
                                    stroke="#ffffff"
                                    stroke-width="0.4800000000000001"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></path>{" "}
                            </g>
                        </svg>
                    </button>

                    <button
                        className="call-request-reject-button"
                        onClick={onReject}
                        aria-label="Reject call"
                    >
                        <svg
                            height="32"
                            width="32"
                            viewBox="0 0 512 512"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="#000000"
                        >
                            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                            <g
                                id="SVGRepo_tracerCarrier"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                                {" "}
                                <title>cancel</title>{" "}
                                <g
                                    id="Page-1"
                                    stroke="none"
                                    stroke-width="1"
                                    fill="none"
                                    fill-rule="evenodd"
                                >
                                    {" "}
                                    <g
                                        id="work-case"
                                        fill="#ffffff"
                                        transform="translate(91.520000, 91.520000)"
                                    >
                                        {" "}
                                        <polygon
                                            id="Close"
                                            points="328.96 30.2933333 298.666667 1.42108547e-14 164.48 134.4 30.2933333 1.42108547e-14 1.42108547e-14 30.2933333 134.4 164.48 1.42108547e-14 298.666667 30.2933333 328.96 164.48 194.56 298.666667 328.96 328.96 298.666667 194.56 164.48"
                                        >
                                            {" "}
                                        </polygon>{" "}
                                    </g>{" "}
                                </g>{" "}
                            </g>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
