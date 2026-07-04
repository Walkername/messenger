import { useState } from "react";
import { friendshipService } from "../../../services/friendship-service";
import "./invite-as-friend.css";

export default function InviteAsFriend() {
    const [usernameToInvite, setUsernameToInvite] = useState<string>("");
    const handleInviteAsFriend = () => {
        friendshipService.inviteAsFriendByUsername(usernameToInvite);
    };

    return (
        <div className="invite-as-friend-container">
            <form
                className="invite-as-friend-form"
                onSubmit={handleInviteAsFriend}
            >
                <input
                    className="invite-as-friend-input"
                    placeholder="username"
                    type="text"
                    onChange={(e) => setUsernameToInvite(e.target.value)}
                />
                <input
                    className="invite-as-friend-submit"
                    type="submit"
                    value="Invite"
                />
            </form>
        </div>
    );
}
