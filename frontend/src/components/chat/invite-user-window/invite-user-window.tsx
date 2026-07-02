import { useState } from "react";
import ModalWindow from "../../modal-window/modal-window";
import "./invite-user-window.css";
import { chatService } from "../../../services/chat-service";

interface InviteUserWindowProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: number;
}

export default function InviteUserWindow({
    isOpen,
    onClose,
    chatId,
}: InviteUserWindowProps) {
    const [usernameToInvite, setUsernameToInvite] = useState<string>("");
    const [status, setStatus] = useState<{
        message: string;
        type: "success" | "error" | null;
    }>({
        message: "",
        type: null,
    });

    const handleClose = () => {
        setUsernameToInvite("");
        setStatus({ message: "", type: null });
        onClose();
    };

    const handleChatInvite = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        chatService
            .inviteUserToChat(chatId, usernameToInvite)
            .then(() => {
                setStatus({
                    message: "User has been invited successfully!",
                    type: "success",
                });
                setUsernameToInvite("");
            })
            .catch((error) => {
                setStatus({
                    message: `${error.message}.`,
                    type: "error",
                });
            });
    };

    return (
        <ModalWindow isOpen={isOpen} onClose={handleClose}>
            <div
                className="chat-invite-modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <form className="chat-invite-form" onSubmit={handleChatInvite}>
                    <span className="chat-invite-window-description">
                        You can invite someone to the chat:
                    </span>
                    <label className="chat-invite-username-label">
                        Username:
                    </label>
                    <input
                        className="chat-invite-input"
                        value={usernameToInvite}
                        onChange={(e) => setUsernameToInvite(e.target.value)}
                        type="text"
                        required
                        placeholder="Username"
                    />
                    <input
                        className="chat-invite-submit-button"
                        type="submit"
                        value="Invite"
                    />
                    {status.message && (
                        <div
                            className={`invite-status ${status.type === "error" ? "error" : "success"}`}
                        >
                            {status.message}
                        </div>
                    )}
                </form>
            </div>
        </ModalWindow>
    );
}
