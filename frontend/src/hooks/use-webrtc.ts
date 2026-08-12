import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { CallState, SignalingMessage } from "../types/call/webrtc";
import signaling from "../services/signaling";

interface UseWebRTCProps {
    accountId: string;
}

export function useWebRTC({ accountId }: UseWebRTCProps) {
    const [callState, setCallState] = useState<CallState>({
        isInCall: false,
        isMuted: false,
        isVideoOn: true,
        callStatus: "idle",
    });

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const currentPeerRef = useRef<string | null>(null);
    const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
    const pendingOfferRef = useRef<SignalingMessage | null>(null);
    const isCleaningUpRef = useRef(false);

    const [remoteStream, setRemoteStream] = useState<MediaStream>();
    const [localStream, setLocalStream] = useState<MediaStream>();

    const rtcConfig = useMemo<RTCConfiguration>(
        () => ({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun.ekiga.net" },
            ],
            iceCandidatePoolSize: 10,
        }),
        [],
    );

    const onCallEndedRef = useRef<(() => void) | undefined>(null);
    const onIncomingCallRef = useRef<
        ((fromUserId: string) => void) | undefined
    >(null);

    const setOnIncomingCall = useCallback(
        (callback?: (fromUserId: string) => void) => {
            onIncomingCallRef.current = callback;
        },
        [],
    );

    const setOnCallEnded = useCallback((callback?: () => void) => {
        onCallEndedRef.current = callback;
    }, []);

    // ---------------------------
    // MEDIA
    // ---------------------------
    const initLocalStream = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current;

        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
    }, []);

    // ---------------------------
    // CLEANUP
    // ---------------------------
    const cleanupCall = useCallback(() => {
        if (isCleaningUpRef.current) {
            console.log("🧹 Cleanup already in progress");
            return;
        }
        isCleaningUpRef.current = true;

        console.log("🧹 Cleaning up call");

        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current
                .getTracks()
                .forEach((track) => track.stop());
            remoteStreamRef.current = null;
        }

        currentPeerRef.current = null;
        pendingIceRef.current = [];
        pendingOfferRef.current = null;

        setCallState({
            isInCall: false,
            isMuted: false,
            isVideoOn: true,
            callStatus: "ended",
            localStream: localStreamRef.current || undefined,
            remoteStream: undefined,
        });

        if (onCallEndedRef.current) {
            onCallEndedRef.current?.();
        }

        setTimeout(() => {
            isCleaningUpRef.current = false;
        }, 100);
    }, []);

    // ---------------------------
    // SIGNALING SEND
    // ---------------------------
    const sendMessage = useCallback((msg: SignalingMessage) => {
        signaling.sendSignalingMessage(msg);
    }, []);

    // ---------------------------
    // PEER CONNECTION
    // ---------------------------
    const createPeerConnection = useCallback(
        (remoteUserId: string) => {
            console.log(`🔗 Creating PeerConnection for ${remoteUserId}`);

            if (pcRef.current) {
                console.log("🔄 Closing existing PeerConnection");
                pcRef.current.close();
            }

            const pc = new RTCPeerConnection(rtcConfig);
            pcRef.current = pc;
            currentPeerRef.current = remoteUserId;

            pc.oniceconnectionstatechange = () => {
                console.log(
                    `🧊 ICE connection state: ${pc.iceConnectionState}`,
                );

                if (pc.iceConnectionState === "failed") {
                    console.error("❌ ICE connection failed!");
                    cleanupCall();
                }
                if (pc.iceConnectionState === "connected") {
                    console.log("✅ ICE connection established!");
                }
            };

            pc.onsignalingstatechange = () => {
                console.log(`🔔 Signaling state: ${pc.signalingState}`);
            };

            console.log("➕ Adding local tracks to PeerConnection");
            localStreamRef.current?.getTracks().forEach((track) => {
                console.log(`  ➕ Adding track: ${track.kind} (${track.id})`);
                pc.addTrack(track, localStreamRef.current!);
            });

            const remoteStream = new MediaStream();

            pc.ontrack = (event) => {
                console.log(`📥 Remote track received: ${event.track.kind}`, {
                    trackId: event.track.id,
                    streamId: event.streams[0]?.id,
                    enabled: event.track.enabled,
                });

                // Добавляем все треки из потока
                if (event.streams && event.streams.length > 0) {
                    const stream = event.streams[0];
                    stream.getTracks().forEach((track) => {
                        console.log(`  📥 Adding track: ${track.kind}`);
                        remoteStream.addTrack(track);
                    });

                    remoteStreamRef.current = remoteStream;
                    setRemoteStream(remoteStream);
                    setCallState((p) => ({
                        ...p,
                        remoteStream,
                    }));
                } else {
                    remoteStream.addTrack(event.track);
                    remoteStreamRef.current = remoteStream;
                    setCallState((p) => ({
                        ...p,
                        remoteStream,
                    }));
                }
            };

            pc.onicecandidate = (event) => {
                if (!event.candidate) {
                    console.log("✅ ICE gathering complete");

                    sendMessage({
                        from: accountId,
                        to: remoteUserId,
                        type: "ice-complete",
                        payload: { complete: true },
                    });
                    return;
                }

                console.log("🧊 ICE candidate generated:", {
                    candidate:
                        event.candidate.candidate.substring(0, 50) + "...",
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    sdpMid: event.candidate.sdpMid,
                });

                sendMessage({
                    from: accountId,
                    to: remoteUserId,
                    type: "ice-candidate",
                    payload: {
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                    },
                });
            };

            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;

                if (state === "connected") {
                    setCallState((p) => ({
                        ...p,
                        isInCall: true,
                        callStatus: "connected",
                    }));
                }
            };

            return pc;
        },
        [accountId, cleanupCall, rtcConfig, sendMessage],
    );

    // ---------------------------
    // CALL START
    // ---------------------------
    const startCall = useCallback(
        async (remoteUserId: string) => {
            console.log(`📞 Starting call to ${remoteUserId}`);

            try {
                await initLocalStream();
                console.log("✅ Local stream ready");

                const pc = createPeerConnection(remoteUserId);
                console.log("✅ PeerConnection created");

                setCallState((p) => ({
                    ...p,
                    callStatus: "calling",
                    isInCall: true,
                }));

                console.log("📝 Creating offer...");
                const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                });
                console.log("✅ Offer created:", offer.type);

                await pc.setLocalDescription(offer);
                console.log("✅ Local description set");

                sendMessage({
                    from: accountId,
                    to: remoteUserId,
                    type: "offer",
                    payload: offer,
                });
                console.log("📤 Offer sent");
            } catch (error) {
                console.error("❌ Failed to start call:", error);
                cleanupCall();
            }
        },
        [
            accountId,
            initLocalStream,
            createPeerConnection,
            cleanupCall,
            sendMessage,
        ],
    );

    // ---------------------------
    // INCOMING OFFER
    // ---------------------------
    const handleOffer = useCallback(
        async (msg: SignalingMessage) => {
            console.log("📞 Incoming offer from:", msg.from);

            if (callState.isInCall) {
                console.log("⚠️ Already in a call, rejecting");
                sendMessage({
                    from: accountId,
                    to: msg.from,
                    type: "hangup",
                    payload: { reason: "busy" },
                });
                return;
            }

            pendingOfferRef.current = msg;

            setCallState((p) => ({
                ...p,
                callStatus: "ringing",
                isInCall: true,
            }));

            if (onIncomingCallRef.current) {
                onIncomingCallRef.current?.(msg.from);
            }
        },
        [accountId, callState.isInCall, sendMessage],
    );

    const acceptCall = useCallback(async () => {
        if (!pendingOfferRef.current) {
            console.warn("⚠️ No pending offer to accept");
            return;
        }

        const msg = pendingOfferRef.current;
        console.log("✅ Accepting call from:", msg.from);

        try {
            await initLocalStream();
            const pc = createPeerConnection(msg.from);

            await pc.setRemoteDescription(
                new RTCSessionDescription(msg.payload),
            );

            if (pendingIceRef.current.length > 0) {
                console.log(
                    `📦 Flushing ${pendingIceRef.current.length} pending ICE candidates`,
                );
                for (const c of pendingIceRef.current) {
                    try {
                        await pc.addIceCandidate(c);
                    } catch (error) {
                        console.warn(
                            "⚠️ Failed to add pending ICE candidate:",
                            error,
                        );
                    }
                }
                pendingIceRef.current = [];
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendMessage({
                from: accountId,
                to: msg.from,
                type: "answer",
                payload: answer,
            });

            pendingOfferRef.current = null;

            setCallState((p) => ({
                ...p,
                callStatus: "connected",
            }));

            return msg.from;
        } catch (error) {
            console.error("❌ Failed to accept call:", error);
            cleanupCall();
            throw error;
        }
    }, [
        accountId,
        initLocalStream,
        createPeerConnection,
        sendMessage,
        cleanupCall,
    ]);

    const rejectCall = useCallback(() => {
        if (pendingOfferRef.current) {
            sendMessage({
                from: accountId,
                to: pendingOfferRef.current.from,
                type: "hangup",
                payload: { reason: "rejected" },
            });
        }
        pendingOfferRef.current = null;
        cleanupCall();
    }, [accountId, sendMessage, cleanupCall]);

    // ---------------------------
    // ANSWER
    // ---------------------------
    const handleAnswer = useCallback(async (msg: SignalingMessage) => {
        const pc = pcRef.current;
        if (!pc) {
            console.warn("⚠️ No peer connection for answer");
            return;
        }

        console.log("📝 Setting remote description (answer)...");
        try {
            await pc.setRemoteDescription(
                new RTCSessionDescription(msg.payload),
            );
            console.log("✅ Remote description set");

            if (remoteStreamRef.current) {
                console.log(
                    `📊 Remote stream has ${remoteStreamRef.current.getTracks().length} tracks`,
                );
            }

            setCallState((p) => ({
                ...p,
                callStatus: "connected",
            }));
        } catch (error) {
            console.error("❌ Failed to handle answer:", error);
        }
    }, []);

    // ---------------------------
    // ICE - ИСПРАВЛЕННАЯ ВЕРСИЯ
    // ---------------------------
    const handleIce = useCallback(async (msg: SignalingMessage) => {
        const candidate = msg.payload;
        const pc = pcRef.current;

        console.log("🧊 Received ICE candidate:", {
            hasPC: !!pc,
            hasRemoteDesc: !!pc?.remoteDescription,
            candidate: candidate.candidate?.substring(0, 50) + "...",
            from: msg.from,
            to: msg.to,
        });

        if (!pc) {
            console.warn("⚠️ No peer connection for ICE candidate, storing");
            pendingIceRef.current.push(candidate);
            return;
        }

        if (!pc.remoteDescription) {
            console.log("📦 No remote description yet, storing ICE candidate");
            pendingIceRef.current.push(candidate);
            return;
        }

        try {
            console.log("➕ Adding ICE candidate to PeerConnection");
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log("✅ ICE candidate added successfully");
        } catch (error) {
            console.error("❌ Failed to add ICE candidate:", error);
            if (
                error instanceof DOMException &&
                error.name === "InvalidStateError"
            ) {
                console.log("⚠️ Invalid state, storing candidate for later");
                pendingIceRef.current.push(candidate);
            }
        }
    }, []);

    // ---------------------------
    // END CALL
    // ---------------------------
    const endCall = useCallback(() => {
        console.log("🔚 Ending call");

        if (currentPeerRef.current) {
            sendMessage({
                from: accountId,
                to: currentPeerRef.current,
                type: "hangup",
                payload: {},
            });
        }

        cleanupCall();
    }, [accountId, cleanupCall, sendMessage]);

    // ---------------------------
    // SIGNALLING ROUTER
    // ---------------------------
    const handleSignalingMessage = useCallback(
        async (msg: SignalingMessage) => {
            console.log(`📨 Received signaling message:`, {
                type: msg.type,
                from: msg.from,
                to: msg.to,
                accountId: accountId,
                isForMe: msg.to === accountId,
            });

            if (String(msg.to) !== String(accountId)) {
                console.log(
                    `⏭️ Message not for me (to: ${msg.to}, accountId: ${accountId})`,
                );
                return;
            }

            console.log(`✅ Processing message type: ${msg.type}`);

            switch (msg.type) {
                case "offer":
                    console.log("📞 Processing offer");
                    await handleOffer(msg);
                    break;

                case "answer":
                    console.log("💬 Processing answer");
                    await handleAnswer(msg);
                    break;

                case "ice-candidate":
                    console.log("🧊 Processing ICE candidate");
                    await handleIce(msg);
                    break;

                case "hangup":
                    console.log("🛑 Remote user ended call");
                    cleanupCall();
                    break;

                default:
                    console.warn("Unknown message type:", msg.type);
            }
        },
        [accountId, handleOffer, handleAnswer, handleIce, cleanupCall],
    );

    const toggleMute = useCallback(() => {
        const track = localStreamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCallState((p) => ({
            ...p,
            isMuted: !p.isMuted,
        }));
    }, []);

    const toggleVideo = useCallback(() => {
        const track = localStreamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCallState((p) => ({
            ...p,
            isVideoOn: !p.isVideoOn,
        }));
    }, []);

    useEffect(() => {
        return () => cleanupCall();
    }, [cleanupCall]);

    return {
        callState,
        startCall,
        endCall,
        toggleMute,
        toggleVideo,
        handleSignalingMessage,
        localStream,
        remoteStream,
        acceptCall,
        rejectCall,
        isRinging: callState.callStatus === "ringing",

        setOnIncomingCall,
        setOnCallEnded
    };
}
