import React, { useEffect, useRef, useState } from "react";
import io from 'socket.io-client';
import Peer from 'simple-peer';

interface CallRoomProps {
  callId: string;
  mode: "voice" | "video";
}

interface RemoteStream {
  peerId: string;
  stream: MediaStream;
}

// This is a scaffold. Real signaling and peer logic should be added.
export default function CallRoom({ callId, mode }: CallRoomProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const socketRef = useRef<any>(null);
  const peersRef = useRef<any>({});

  useEffect(() => {
    // Get user media (audio/video)
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: mode === "video"
        });
        setMediaStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Could not access media devices: " + err);
      }
    };
    getMedia();
    return () => {
      mediaStream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line
  }, [mode]);

  useEffect(() => {
    // Connect to signaling server
    // socketRef.current = io('http://localhost:4000'); // <-- Set your signaling server URL

    socketRef.current = io(window.location.origin, {
        path: "/api/signaling"
    });

    socketRef.current.emit('join-room', callId);

    socketRef.current.on('all-users', (users: string[]) => {
      users.forEach((userId) => {
        if (userId === socketRef.current.id) return;
        const peer = createPeer(userId, socketRef.current.id, mediaStream);
        peersRef.current[userId] = peer;
      });
    });

    socketRef.current.on('user-joined', (payload: { signal: any, callerId: string }) => {
      const peer = addPeer(payload.signal, payload.callerId, mediaStream);
      peersRef.current[payload.callerId] = peer;
    });

    socketRef.current.on('receiving-returned-signal', (payload: { id: string, signal: any }) => {
      const peer = peersRef.current[payload.id];
      if (peer) peer.signal(payload.signal);
    });

    return () => {
      socketRef.current.disconnect();
      Object.values(peersRef.current).forEach((peer: any) => peer.destroy());
      setRemoteStreams([]);
    };
    // eslint-disable-next-line
  }, [callId, mediaStream]);

  function createPeer(userToSignal: string, callerId: string, stream: MediaStream | null) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on('signal', (signal: any) => {
      socketRef.current.emit('sending-signal', { userToSignal, callerId, signal });
    });
    peer.on('stream', (stream: MediaStream) => {
      setRemoteStreams((prev) => [...prev, { peerId: userToSignal, stream }]);
    });
    return peer;
  }

  function addPeer(incomingSignal: any, callerId: string, stream: MediaStream | null) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on('signal', (signal: any) => {
      socketRef.current.emit('returning-signal', { signal, callerId });
    });
    peer.on('stream', (stream: MediaStream) => {
      setRemoteStreams((prev) => [...prev, { peerId: callerId, stream }]);
    });
    peer.signal(incomingSignal);
    return peer;
  }

  const handleScreenShare = async () => {
    if (!screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setScreenSharing(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        screenStream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          if (mediaStream && localVideoRef.current) {
            localVideoRef.current.srcObject = mediaStream;
          }
        };
      } catch (err) {
        alert("Screen share failed: " + err);
      }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>{mode === "voice" ? "Voice" : "Video"} Call Room: {callId}</h2>
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: 320, height: 240, background: "#222", borderRadius: 8 }}
          />
          <div style={{ marginTop: 8 }}>
            <button onClick={handleScreenShare} disabled={screenSharing || mode === "voice"}>
              {screenSharing ? "Sharing..." : "Share Screen"}
            </button>
          </div>
        </div>
        <div style={{ flex: 1, background: "#f5f5f5", borderRadius: 8, minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          {remoteStreams.length === 0 && <span>Remote participants will appear here</span>}
          {remoteStreams.map(({ peerId, stream }) => (
            <video key={peerId} autoPlay playsInline style={{ width: 200, height: 150, borderRadius: 8, margin: 4 }} ref={video => { if (video) video.srcObject = stream; }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <p>Share this link to invite others: <b>{typeof window !== 'undefined' ? window.location.href : ''}</b></p>
      </div>
    </div>
  );
}
