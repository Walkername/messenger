import { useState } from "react";
import ModalWindow from "../../modal-window/modal-window";
import { chatService } from "../../../services/chat-service";
import type { CreateChatRequest } from "../../../types/chat/create-chat-request";
import "./create-chat-window.css";
import { useNavigate } from "react-router-dom";

interface CreateChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateChatWindow({
    isOpen,
    onClose,
}: CreateChatWindowProps) {
    const navigate = useNavigate();
    
    const [name, setName] = useState<string>("");
    const [status, setStatus] = useState<{
        message: string;
        type: "success" | "error" | null;
    }>({
        message: "",
        type: null,
    });

    const handleClose = () => {
        setName("");
        setStatus({ message: "", type: null });
        onClose();
    };

    const handleCreateChat = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const request: CreateChatRequest = {
            name: name,
            type: "PRIVATE",
        };
        chatService
            .createChat(request)
            .then((data) => {
                setStatus({
                    message: "Chat has been created successfully!",
                    type: "success",
                });
                setName("");
                navigate(`/chats/${data.id}`);
                window.location.reload();
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
                className="create-chat-modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <form className="create-chat-form" onSubmit={handleCreateChat}>
                    <span className="create-chat-window-description">
                        Type the name for new chat:
                    </span>
                    <label className="create-chat-name-label">Name:</label>
                    <input
                        className="create-chat-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        required
                        placeholder="Chat name"
                    />
                    <input
                        className="create-chat-submit-button"
                        type="submit"
                        value="Create"
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
