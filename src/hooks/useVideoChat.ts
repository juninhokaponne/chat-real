import { useState, useEffect, useRef, useCallback } from 'react';

import { WebRTCService } from '../services/WebRTCService';

import type { VideoChatState } from '../types';

export const useVideoChat = (roomId: string) => {
  const [state, setState] = useState<VideoChatState>({
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isConnecting: false,
    mediaState: { audio: true, video: true },
    roomId,
    error: null
  });

  const webRTCService = useRef<WebRTCService | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const cleanup = useCallback(() => {
    console.log('Executing cleanup...');
    
    // Clean video elements first
    if (localVideoRef.current) {
      // Pause video and remove srcObject
      localVideoRef.current.pause();
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      // Pause video and remove srcObject
      remoteVideoRef.current.pause();
      remoteVideoRef.current.srcObject = null;
    }

    // Then clean WebRTC service
    if (webRTCService.current) {
      webRTCService.current.cleanup();
    }
    
    // Finally update state
    setState({
      localStream: null,
      remoteStream: null,
      isConnected: false,
      isConnecting: false,
      mediaState: { audio: true, video: true },
      roomId,
      error: null
    });
  }, [roomId]);

  const initializeVideoChat = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true }));
      
      // Initialize WebRTC service
      webRTCService.current = new WebRTCService(roomId);
      
      // Configure callbacks
      webRTCService.current.onLocalStream = (stream: MediaStream) => {
        console.log('Callback onLocalStream called with stream:', stream);
        setState(prev => ({ ...prev, localStream: stream }));
      };

      webRTCService.current.onRemoteStream = (stream: MediaStream) => {
        console.log('Callback onRemoteStream called with stream:', stream);
        setState(prev => ({ ...prev, remoteStream: stream, isConnected: true }));
      };

      webRTCService.current.onDisconnected = () => {
        console.log('Callback onDisconnected called');
        setState(prev => ({ 
          ...prev, 
          remoteStream: null, 
          isConnected: false,
          isConnecting: false 
        }));
      };

      // Start connection
      await webRTCService.current.initialize();
      setState(prev => ({ ...prev, isConnecting: false }));
    } catch (error) {
      console.error('Error initializing video chat:', error);
      setState(prev => ({ ...prev, isConnecting: false, error: (error as Error).message }));
    }
  }, [roomId]);

  useEffect(() => {
    initializeVideoChat();
    return () => {
      cleanup();
    };
  }, [initializeVideoChat, cleanup]);

  useEffect(() => {
    if (state.localStream && localVideoRef.current) {
      console.log('Assigning local stream to video element');
      localVideoRef.current.srcObject = state.localStream;
    }
  }, [state.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) {
      if (state.remoteStream) {
        console.log('Assigning remote stream to video element');
        remoteVideoRef.current.srcObject = state.remoteStream;
      } else {
        console.log('Removing remote stream from video element');
        remoteVideoRef.current.srcObject = null;
      }
    }
  }, [state.remoteStream]);

  const toggleAudio = useCallback(() => {
    if (webRTCService.current && webRTCService.current.localStream) {
      const newAudioState = webRTCService.current.toggleAudio();
      setState(prev => ({ 
        ...prev, 
        mediaState: { ...prev.mediaState, audio: newAudioState } 
      }));
      return newAudioState;
    }
    return false;
  }, []);

  const toggleVideo = useCallback(() => {
    if (webRTCService.current && webRTCService.current.localStream) {
      const newVideoState = webRTCService.current.toggleVideo();
      setState(prev => ({ 
        ...prev, 
        mediaState: { ...prev.mediaState, video: newVideoState } 
      }));
      return newVideoState;
    }
    return false;
  }, []);

  const endCall = useCallback(() => {
    if (webRTCService.current) {
      webRTCService.current.disconnect();
    }
    cleanup();
  }, [cleanup]);

  const reinitializeStream = useCallback(async () => {
    if (webRTCService.current) {
      try {
        await webRTCService.current.reinitializeStream();
        setState(prev => ({ ...prev, isConnecting: false }));
      } catch (error) {
        console.error('Error reinitializing stream:', error);
        setState(prev => ({ ...prev, isConnecting: false }));
      }
    }
  }, []);

  const retryConnection = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
    initializeVideoChat();
  }, [initializeVideoChat]);

  return {
    ...state,
    localVideoRef,
    remoteVideoRef,
    toggleAudio,
    toggleVideo,
    endCall,
    reconnect: initializeVideoChat,
    reinitializeStream,
    retryConnection
  };
};