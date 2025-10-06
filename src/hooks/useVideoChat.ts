import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client'; // ✅ Added for chat

import { WebRTCService } from '../services/WebRTCService';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'; // ✅ your backend socket server

export const useVideoChat = (roomId: string) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaState, setMediaState] = useState({ audio: true, video: true });

  const webRTCServiceRef = useRef<WebRTCService | null>(null);

  // ✅ Added for chat
  const [socket, setSocket] = useState<any>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    // ✅ Connect socket when hook mounts
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // ✅ Generate a username (can be replaced by your auth user)
    const name = localStorage.getItem('username') || `User-${Math.floor(Math.random() * 1000)}`;
    setUsername(name);

    newSocket.emit('join_room', { roomId, username: name });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const setup = async () => {
      try {
        setIsConnecting(true);
        const webRTC = new WebRTCService(roomId);
        webRTCServiceRef.current = webRTC;

        webRTC.onLocalStream = (stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        };

        webRTC.onRemoteStream = (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setIsConnected(true);
          setIsConnecting(false);
        };

        webRTC.onDisconnected = () => {
          setIsConnected(false);
        };

        await webRTC.initialize();
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsConnecting(false);
      }
    };

    setup();

    return () => {
      webRTCServiceRef.current?.disconnect();
    };
  }, [roomId]);

  const toggleAudio = () => {
    const newState = webRTCServiceRef.current?.toggleAudio();
    setMediaState((prev) => ({ ...prev, audio: newState ?? prev.audio }));
    return !!newState;
  };

  const toggleVideo = () => {
    const newState = webRTCServiceRef.current?.toggleVideo();
    setMediaState((prev) => ({ ...prev, video: newState ?? prev.video }));
    return !!newState;
  };

  const endCall = () => {
    webRTCServiceRef.current?.disconnect();
    setIsConnected(false);
  };

  const retryConnection = async () => {
    setError(null);
    await webRTCServiceRef.current?.reinitializeStream();
  };

  return {
    localVideoRef,
    remoteVideoRef,
    toggleAudio,
    toggleVideo,
    endCall,
    retryConnection,
    isConnected,
    isConnecting,
    mediaState,
    error,
    // ✅ Add these for chat
    socket,
    username
  };
};
