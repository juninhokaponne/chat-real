import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client'; // ✅ Added for chat

import { WebRTCService } from '../services/WebRTCService';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'; // ✅ your backend socket server

export const useVideoChat = (roomId: string) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaState, setMediaState] = useState({ audio: true, video: true });
  const [remoteVideoEnabled, setRemoteVideoEnabled] = useState<boolean | undefined>(undefined);
  const [participantCount, setParticipantCount] = useState(1);
  const [remoteUsername, setRemoteUsername] = useState<string>('Participant');

  const webRTCServiceRef = useRef<WebRTCService | null>(null);

  // ✅ Added for chat
  const [socket, setSocket] = useState<any>(null);
  const [username, setUsername] = useState<string>('');


useEffect(() => {
    // ✅ Connect socket when hook mounts
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    const storedName = localStorage.getItem('username');
    let baseName;

    if (storedName) {
        baseName = storedName;
    } else {
        baseName = `User-${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem('username', baseName); 
    }
    // This ensures every open tab/instance has a distinct username string, 
    // satisfying the server's signaling logic.
    const uniqueSessionId = Math.floor(Math.random() * 1000);
    const uniqueUsername = `${baseName}-${uniqueSessionId}`;

    setUsername(uniqueUsername);
    
    console.log(`Assigned unique username for this tab: ${uniqueUsername}`);

    return () => {
      newSocket.disconnect();
    };
}, []); 


  useEffect(() => {
    if (!socket || !username) { 
        console.log("Waiting for socket or username to be ready...");
        return; 
    }
    const setup = async () => {
      try {
        setIsConnecting(true);
        const webRTC = new WebRTCService(roomId, socket,username);
        webRTCServiceRef.current = webRTC;
        webRTC.onLocalStream = (stream) => {
          console.log("Stream callback fired, setting localStream state.");
          setLocalStream(stream);
          setMediaState({
            audio: stream.getAudioTracks().length > 0,
            video: stream.getVideoTracks().length > 0
          });
        };
        webRTC.onRemoteStream = (stream) => {
          console.log("yup - Remote stream received, setting state.");

          setRemoteStream(stream);
        };

        await webRTC.initialize();
        setIsConnected(true);
        setIsConnecting(false);
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
  }, [roomId, socket,username]);
  useEffect(() => {
    if (!socket) return;

    const handleRemoteVideoStatus = ({ videoEnabled }: { videoEnabled: boolean }) => {
      console.log(`💡 Signaled remote video status received: ${videoEnabled}`);
      setRemoteVideoEnabled(videoEnabled);
    };
    socket.on('remote_video_status_change', handleRemoteVideoStatus);


    const handleRemoteUserLeft = () => {
      console.log('⚡️ Received immediate signal: Remote user has left.');

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
    }
      setRemoteStream(null);
      webRTCServiceRef.current?.closeRemoteConnection();
      setRemoteVideoEnabled(false);
      setRemoteUsername('Participant');
    };
    socket.on('remote_user_left', handleRemoteUserLeft);


    const handleParticipantCount = ({ count }: { count: number }) => {
      console.log(`Participant count updated: ${count}`);
      setParticipantCount(count);
    };
    socket.on('participant_count_update', handleParticipantCount);


    const handleRemoteUserJoined = (data: { username: string }) => {
        console.log(`Remote user joined: ${data.username}`);
        setRemoteUsername(data.username);
    };
    socket.on('remote_user_joined', handleRemoteUserJoined);

    return () => {
      socket.off('remote_video_status_change', handleRemoteVideoStatus);
      socket.off('remote_user_left', handleRemoteUserLeft);
      socket.off('participant_count_update', handleParticipantCount);
      socket.off('remote_user_joined', handleRemoteUserJoined);
    };
  }, [socket]);
  useEffect(() => {
    if (remoteStream) {
      const initialEnabled = remoteStream.getVideoTracks()[0]?.enabled ?? false;
      console.log(`Initial remote stream status on arrival: ${initialEnabled}`);
      setRemoteVideoEnabled(initialEnabled);
    } else {
      setRemoteVideoEnabled(false);
    }
  }, [remoteStream]);
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      const timer = setTimeout(() => {
        if (localVideoRef.current && localStream) {
          console.log('✅ Local stream forced assignment and play.');
          localVideoRef.current.srcObject = localStream;
          localVideoRef.current.play().catch(error => {
            console.error("Local video playback failed:", error);
          });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [localStream, localVideoRef]);

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
    username,
    webRTCService: webRTCServiceRef.current,
    remoteStream,
    remoteVideoEnabled,
    remoteUsername
  };
};
