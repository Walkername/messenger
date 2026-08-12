import { useEffect, useRef, useState } from "react";
import { useWebRTCContext } from "../../../contexts/webrtc-context";
import type { FriendResponse } from "../../../types/friendship/friendship";
import { formatTimeLong } from "../../../utils/validation-time";
import "./friend-card.css";
import { friendshipService } from "../../../services/friendship-service";
import { useNavigate } from "react-router-dom";

interface FriendCardProps {
    profile: FriendResponse;
    children?: React.ReactNode;
}

export default function FriendCard({ profile, children }: FriendCardProps) {
    const navigate = useNavigate();

    const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    const { startCall } = useWebRTCContext();

    const handleRemoveFromFriend = (accountId: number) => {
        friendshipService.removeFromFriend(accountId);
        window.location.reload();
    };

    const handleCallToFriend = (accountId: number) => {
        // change layout
        // wait for answer
        // or there is no answer and then change layout back again
        const id = String(accountId);
        startCall(id);
        navigate("/call");
    };

    const handleMessageToFriend = () => {};

    const handleTogglePopup = () => {
        setIsMoreOpen(!isMoreOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current &&
                !popupRef.current.contains(event.target as Node) &&
                moreButtonRef.current &&
                !moreButtonRef.current.contains(event.target as Node)
            ) {
                setIsMoreOpen(false);
            }
        };

        if (isMoreOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isMoreOpen]);

    return (
        <div className="friend-card">
            <div className="friend-card-info">
                <span className="friend-card-firstname">
                    {profile.firstname}
                </span>
                <span className="friend-card-username">
                    @{profile.username}
                    {profile.online && (
                        <span className="online-status-icon"></span>
                    )}
                </span>
                <span className="friend-card-sent-at">
                    {formatTimeLong(profile.createdAt)}
                </span>
            </div>
            <div className="friend-card-functions">
                {children}
                <div className="friend-card-more-wrapper">
                    <button
                        ref={moreButtonRef}
                        className="friend-card-more"
                        onClick={handleTogglePopup}
                    >
                        <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                            <g
                                id="SVGRepo_tracerCarrier"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            ></g>
                            <g id="SVGRepo_iconCarrier">
                                {" "}
                                <circle
                                    cx="18"
                                    cy="12"
                                    r="1.5"
                                    transform="rotate(90 18 12)"
                                    fill="#080341"
                                ></circle>{" "}
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="1.5"
                                    transform="rotate(90 12 12)"
                                    fill="#080341"
                                ></circle>{" "}
                                <circle
                                    cx="6"
                                    cy="12"
                                    r="1.5"
                                    transform="rotate(90 6 12)"
                                    fill="#080341"
                                ></circle>{" "}
                            </g>
                        </svg>
                    </button>
                    {isMoreOpen && (
                        <div ref={popupRef} className="friend-card-more-popup">
                            <button onClick={handleMessageToFriend}>
                                Message
                            </button>
                            <button
                                onClick={() =>
                                    handleCallToFriend(profile.friendId)
                                }
                            >
                                Call
                            </button>
                            <button
                                onClick={() =>
                                    handleRemoveFromFriend(profile.friendId)
                                }
                            >
                                Remove from friend
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
