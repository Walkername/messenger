import { useState } from 'react';
import './chat-layout.css';
import ChatList from '../chat-list/chat-list';
import ChatWindow from '../chat-window/chat-window';

export default function ChatLayout() {
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    return (
        <div className="chat-layout">
            <aside className="chat-sidebar">
                <ChatList onSelectChat={setSelectedChatId} />
            </aside>
            <main className="chat-main">
                {selectedChatId ? (
                    <ChatWindow chatId={selectedChatId} />
                ) : (
                    <div className="no-chat-selected">Выберите чат</div>
                )}
            </main>
        </div>
    );
}