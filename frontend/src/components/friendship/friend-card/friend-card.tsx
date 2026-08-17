import { useEffect, useRef, useState } from "react";
import type { FriendResponse } from "../../../types/friendship/friendship";
import { formatTimeLong } from "../../../utils/validation-time";
import "./friend-card.css";
import { friendshipService } from "../../../services/friendship-service";
import { useNavigate } from "react-router-dom";
import { Ellipsis, MessageCircle, Phone, UserX } from "lucide-react";
import StartPrivateChatWindow from "../../chat/start-private-chat-window/start-private-chat-window";
import { useWebRTCContext } from "../../../contexts/webrtc-context";

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

    const [isStartChatModalOpen, setIsStartChatModalOpen] =
        useState<boolean>(false);

    const handleMessageToFriend = () => {
        setIsStartChatModalOpen(true);
        setIsMoreOpen(false);
    };
    
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
                        <Ellipsis size={18} />
                    </button>
                    {isMoreOpen && (
                        <div ref={popupRef} className="friend-card-more-popup">
                            <button onClick={handleMessageToFriend}>
                                <MessageCircle size={22} color="gray" /> Message
                            </button>
                            <button
                                onClick={() =>
                                    handleCallToFriend(profile.friendId)
                                }
                            >
                                <Phone size={22} color="gray" /> Call
                            </button>
                            <button
                                onClick={() =>
                                    handleRemoveFromFriend(profile.friendId)
                                }
                                style={{ color: "red" }}
                            >
                                <UserX size={22} color="red" /> Remove from
                                friend
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <StartPrivateChatWindow
                interlocutorId={profile.friendId}
                isOpen={isStartChatModalOpen}
                onClose={() => setIsStartChatModalOpen(false)}
            />
        </div>
    );
}
