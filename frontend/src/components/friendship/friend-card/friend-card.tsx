import type { FriendResponse } from "../../../types/friendship/friendship";
import { formatTimeLong } from "../../../utils/validation-time";
import "./friend-card.css";

interface FriendCardProps {
    profile: FriendResponse;
    children: React.ReactNode
}

export default function FriendCard({ profile, children }: FriendCardProps) {
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
            </div>
        </div>
    )
}