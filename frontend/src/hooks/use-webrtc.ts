import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { CallState, SignalingMessage } from "../types/call/webrtc";

interface UseWebRTCProps {
    accountId: string;
    onCallEnded?: () => void;
}

export function useWebRTC({ accountId, onCallEnded }: UseWebRTCProps) {
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

    // ---------------------------
    // MEDIA
    // ---------------------------
    const initLocalStream = useCallback(async () => {
        if (localStreamRef.current) return localStreamRef.current;

        // console.log("📷 Getting user media...");
        const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });

        // console.log("✅ Local stream acquired:", {
        //     videoTracks: stream.getVideoTracks().length,
        //     audioTracks: stream.getAudioTracks().length,
        // });

        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
    }, []);

    // ---------------------------
    // CLEANUP
    // ---------------------------
    const cleanupCall = useCallback(() => {
        // console.log("🧹 Cleaning up call");

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

        setCallState({
            isInCall: false,
            isMuted: false,
            isVideoOn: true,
            callStatus: "ended",
            localStream: localStreamRef.current || undefined,
            remoteStream: undefined,
        });

        onCallEnded?.();
    }, [onCallEnded]);

    // ---------------------------
    // SIGNALING SEND
    // ---------------------------
    const sendMessage = useCallback((msg: SignalingMessage) => {
        // console.log(`📤 Sending message: ${msg.type}`, {
        //     from: msg.from,
        //     to: msg.to,
        //     hasPayload: !!msg.payload,
        // });

        if (window.__signalingService) {
            window.__signalingService.sendSignalingMessage(msg);
        } else {
            console.warn("⚠️ Signaling service not available");
        }
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

            // Логируем ICE соединение
            pc.oniceconnectionstatechange = () => {
                console.log("ice:", pc.iceConnectionState);
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

            // Логируем состояние сигнализации
            pc.onsignalingstatechange = () => {
                console.log(`🔔 Signaling state: ${pc.signalingState}`);
            };

            // local tracks
            console.log("➕ Adding local tracks to PeerConnection");
            localStreamRef.current?.getTracks().forEach((track) => {
                console.log(`  ➕ Adding track: ${track.kind} (${track.id})`);
                pc.addTrack(track, localStreamRef.current!);
            });

            // remote stream
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
                    // Fallback: добавляем только один трек
                    remoteStream.addTrack(event.track);
                    remoteStreamRef.current = remoteStream;
                    setCallState((p) => ({
                        ...p,
                        remoteStream,
                    }));
                }
            };

            // ICE
            // В createPeerConnection
            pc.onicecandidate = (event) => {
                if (!event.candidate) {
                    console.log("✅ ICE gathering complete");

                    // Отправляем специальное сообщение о завершении сбора ICE
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

                // Отправляем каждый кандидат отдельно
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

            // STATE
            pc.onconnectionstatechange = () => {
                const state = pc.connectionState;
                // console.log(`🔗 Connection state: ${state}`);

                if (state === "connected") {
                    // console.log("🎉 PeerConnection connected!");
                    setCallState((p) => ({
                        ...p,
                        isInCall: true,
                        callStatus: "connected",
                    }));
                }

                // if (state === "checking") {
                //     console.log("🔄 Checking connection...");
                // }

                // if (state === "new") {
                //     console.log("🆕 Connection state: new");
                // }

                // if (state === "connecting") {
                //     console.log("🔄 Connecting...");
                // }

                // if (state === "disconnected") {
                //     console.warn("⚠️ Connection disconnected");
                //     cleanupCall();
                // }

                // if (state === "failed") {
                //     console.error("❌ Connection failed");
                //     cleanupCall();
                // }

                // if (state === "closed") {
                //     console.log("🔒 Connection closed");
                // }
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
            console.log(
                "📋 Offer SDP:",
                msg.payload.sdp?.substring(0, 100) + "...",
            );

            try {
                await initLocalStream();
                console.log("✅ Local stream ready");

                const pc = createPeerConnection(msg.from);
                console.log("✅ PeerConnection created");

                console.log("📝 Setting remote description (offer)...");
                await pc.setRemoteDescription(
                    new RTCSessionDescription(msg.payload),
                );
                console.log("✅ Remote description set");

                // flush ICE
                if (pendingIceRef.current.length > 0) {
                    console.log(
                        `📦 Flushing ${pendingIceRef.current.length} pending ICE candidates`,
                    );
                    for (const c of pendingIceRef.current) {
                        try {
                            await pc.addIceCandidate(c);
                            console.log("✅ ICE candidate added from pending");
                        } catch (error) {
                            console.warn(
                                "⚠️ Failed to add pending ICE candidate:",
                                error,
                            );
                        }
                    }
                    pendingIceRef.current = [];
                }

                console.log("📝 Creating answer...");
                const answer = await pc.createAnswer();
                console.log("✅ Answer created");

                await pc.setLocalDescription(answer);
                console.log("✅ Local description set");

                sendMessage({
                    from: accountId,
                    to: msg.from,
                    type: "answer",
                    payload: answer,
                });
                console.log("📤 Answer sent");

                setCallState((p) => ({
                    ...p,
                    isInCall: true,
                    callStatus: "connected",
                }));
            } catch (error) {
                console.error("❌ Failed to handle offer:", error);
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

            // Проверяем, есть ли уже треки
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

        // Проверяем, есть ли remote description
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
            // Если ошибка, возможно кандидат уже добавлен или невалидный
            // Пробуем добавить позже
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

    // ... остальные методы без изменений ...
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
    };
}
