import "./chat-layout.css";
import ChatList from "../chat-list/chat-list";
import ChatWindow from "../chat-window/chat-window";
import { useNavigate, useParams } from "react-router-dom";

export default function ChatLayout() {
    const { id } = useParams();

    const navigate = useNavigate();
    
    const selectedChatId = id ? parseInt(id) : null;

    const handleSelectChat = (chatId: number) => {
        navigate(`/chats/${chatId}`);
    };

    return (
        <div className="chat-layout">
            <aside className="chat-sidebar">
                <ChatList onSelectChat={handleSelectChat} selectedChatId={selectedChatId} />
            </aside>
            <main className="chat-main">
                {selectedChatId ? (
                    <ChatWindow chatId={selectedChatId} />
                ) : (
                    <div className="no-chat-selected">Choose the Chat</div>
                )}
            </main>
        </div>
    );
}
