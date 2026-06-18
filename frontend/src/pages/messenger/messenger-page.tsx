import ChatList from "../../components/chat/chat-list/chat-list";
import ChatWindow from "../../components/chat/chat-window/chat-window";
import "./messenger-page.css";
import { useNavigate, useParams } from "react-router-dom";

export default function MessengerPage() {
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
