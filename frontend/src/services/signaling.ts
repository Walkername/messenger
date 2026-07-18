import type { SignalingMessage } from "../types/call/webrtc";
import websocketService from "./websocket-service";

class SignalingService {
    
    connect(
        onMessage: (message: SignalingMessage) => void,
    ): Promise<void> {
        return websocketService.connect()
            .then(() => {
                console.log("✅ Signaling connected");
                websocketService.registerSignalingHandler(onMessage);
            })
    }

    sendSignalingMessage(message: SignalingMessage) {
        const destination = `/app/video-call/${message.type}`;
        websocketService.sendMessage(destination, message);
    }

    disconnect() {
    }

    get isConnected(): boolean {
        return websocketService.connected;
    }
}

export default new SignalingService();
