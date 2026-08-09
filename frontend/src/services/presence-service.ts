import type { PresenceEvent } from "../types/presence/presence";
import websocketService from "./websocket-service";

class PresenceService {
    private messageHandler: (message: PresenceEvent) => void = () => {};

    async connect(): Promise<void> {
        await websocketService.connect();
        await this.subcribeToQueue();
    }

    private async subcribeToQueue() {
        await websocketService.subscribeToTopic(
            "/user/queue/presence",
            (message) => {
                try {
                    if (this.messageHandler) {
                        const data: PresenceEvent = JSON.parse(message.body);
                        this.messageHandler(data);
                    }
                } catch (error) {
                    console.error(
                        "Failed to parse presence event message:",
                        error,
                    );
                }
            },
        );
    }

    subscribeToAccounts(accountIds: number[]) {
        const destination = "/app/presence/subscribe";
        websocketService.sendMessage(destination, accountIds);
    }

    unsubscribeFromAccounts(accountIds: number[]) {
        const destination = "/app/presence/unsubscribe";
        websocketService.sendMessage(destination, accountIds);
    }

    registerMessageHandler(handler: (message: PresenceEvent) => void) {
        this.messageHandler = handler;
    }
}

export default new PresenceService();
