// types/webrtc.ts
export interface SignalingMessage {
    from: string;
    to: string;
    type: "offer" | "answer" | "ice-candidate" | "ice-complete" | "hangup";
    payload: any;
}

export interface ICECandidate {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
}

export interface CallState {
    isInCall: boolean;
    isMuted: boolean;
    isVideoOn: boolean;
    remoteStream?: MediaStream;
    localStream?: MediaStream;
    callStatus: "idle" | "calling" | "ringing" | "connected" | "ended";
}
