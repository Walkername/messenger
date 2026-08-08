import { useNavigate } from "react-router-dom";
import { chatService } from "../../../services/chat-service";
import ModalWindow from "../../modal-window/modal-window";
import "./exit-chat-window.css";

interface ExitChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    chatId: number;
}

export default function ExitChatWindow({
    isOpen,
    onClose,
    chatId,
}: ExitChatWindowProps) {
    const navigate = useNavigate();

    const handleClose = () => {
        onClose();
    };

    const handleExitChat = () => {
        if (chatId == null) {
            return;
        }
        chatService.exitChat(chatId).then(() => {
            onClose();
            navigate("/");
            window.location.reload();
        });
    };

    return (
        <ModalWindow isOpen={isOpen} onClose={handleClose}>
            <div
                className="exit-chat-modal-window"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="exit-chat-window-description">
                    Do you really want to exit the chat?
                </span>
                <button className="exit-chat-button" onClick={handleExitChat}>
                    Exit
                </button>
            </div>
        </ModalWindow>
    );
}
