import type { MessageResponse } from "../types/chat/message-response";
import websocketService from "./websocket-service";

class ChatWebsocketService {
    private subscriptionId: string = "";
    private messageHandler: (message: MessageResponse) => void = () => {};

    async connect(
        chatId: number,
        onMessage: (message: MessageResponse) => void,
    ): Promise<void> {
        await websocketService.connect();
        console.log("✅ Chat websocket connected");
        this.registerMessageHandler(onMessage);
        await this.subscribeTo(chatId);
    }

    private async subscribeTo(chatId: number) {
        this.subscriptionId = await websocketService.subscribeToTopic(
            `/topic/chat/${chatId}`,
            (message) => {
                try {
                    if (this.messageHandler) {
                        const data: MessageResponse = JSON.parse(message.body);
                        this.messageHandler(data);
                    }
                } catch (error) {
                    console.error("Failed to parse chat message:", error);
                }
            },
        );
    }

    unsubscribe() {
        websocketService.unsubscribeFromTopic(this.subscriptionId);
        console.log("Chat unsubscribed");
    }

    registerMessageHandler(handler: (message: MessageResponse) => void) {
        this.messageHandler = handler;
    }
}

export default new ChatWebsocketService();
