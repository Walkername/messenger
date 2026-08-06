import type { SignalingMessage } from "../types/call/webrtc";
import websocketService from "./websocket-service";

class SignalingService {
    private isHandlerRegistered = false;

    async connect(
        onMessage: (message: SignalingMessage) => void,
    ): Promise<void> {
        await websocketService.connect();

        console.log("✅ Signaling connected");

        if (!this.isHandlerRegistered) {
            websocketService.registerSignalingHandler(onMessage);
            this.isHandlerRegistered = true;
        } else {
            websocketService.registerSignalingHandler(onMessage);
        }
    }

    sendSignalingMessage(message: SignalingMessage) {
        const destination = `/app/video-call/${message.type}`;
        websocketService.sendMessage(destination, message);
    }

    disconnect() {}

    get isConnected(): boolean {
        return websocketService.connected;
    }
}

export default new SignalingService();
