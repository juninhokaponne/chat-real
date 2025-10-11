// Native WebRTC implementation without external dependencies
export class WebRTCService {
  public localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private roomId: string;
  private isInitiator = false;

  // Public callbacks for the hook
  public onLocalStream: ((stream: MediaStream) => void) | null = null;
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onDisconnected: (() => void) | null = null;

  private readonly configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(roomId: string) {
    this.roomId = roomId;
  }

  async initialize(): Promise<void> {
    try {
      // First try with video and audio
      await this.tryGetUserMedia();
      this.setupConnection();
    } catch (error) {
      console.error('Erro ao acessar mídia:', error);
      throw error;
    }
  }

  private async tryGetUserMedia(): Promise<void> {
    const constraints = [
      // First attempt: HD video + audio
      { video: { width: 1280, height: 720 }, audio: true },
      // Second attempt: SD video + audio
      { video: { width: 640, height: 480 }, audio: true },
      // Third attempt: basic video + audio
      { video: true, audio: true },
      // Fourth attempt: audio only
      { video: false, audio: true },
      // Last attempt: video without audio
      { video: true, audio: false }
    ];

    for (let i = 0; i < constraints.length; i++) {
      try {
        console.log(`Attempt ${i + 1}:`, constraints[i]);
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints[i]);
        this.originalCamStream = this.localStream;
        
        // Stream obtained successfully
        
        // Check if tracks are active
        const videoTracks = this.localStream.getVideoTracks();
        const audioTracks = this.localStream.getAudioTracks();
        
        // Validate video tracks are active
        
        if (this.onLocalStream) {
          // Debug: Local stream callback
          this.onLocalStream(this.localStream);
        }
        
        console.log('Media obtained successfully:', {
          video: videoTracks.length > 0,
          audio: audioTracks.length > 0,
          streamActive: this.localStream.active
        });
        
        return; // Success, exit function
      } catch (error) {
        console.log(`Attempt ${i + 1} failed:`, error);
        
        // If it's the last attempt, throw the error
        if (i === constraints.length - 1) {
          throw new Error(`Could not access camera/microphone: ${error}`);
        }
      }
    }
  }

  private setupConnection(): void {
    // Determines who is the initiator based on localStorage
    const existingPeer = localStorage.getItem(`room_${this.roomId}_active`);
    this.isInitiator = !existingPeer;

    if (this.isInitiator) {
      localStorage.setItem(`room_${this.roomId}_active`, 'true');
    }

    this.createPeerConnection();
    
    // Simula a descoberta de outro peer após um tempo
    setTimeout(() => {
      this.simulateSecondPeer();
    }, 2000);
  }

  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }

    // Peer connection events
    this.peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (this.onRemoteStream) {
        this.onRemoteStream(remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // In a real implementation, would send via signaling server
        this.handleIceCandidate(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'disconnected' || 
          this.peerConnection?.connectionState === 'failed') {
        if (this.onDisconnected) {
          this.onDisconnected();
        }
      }
    };
  }

  private async simulateSecondPeer(): Promise<void> {
    // For demonstration, simulates a connection after a few seconds
    // In real production, this would happen when another user enters the room
    setTimeout(() => {
      this.simulateRemotePeer();
    }, 3000);
  }

  private simulateRemotePeer(): void {
    // Simulates the arrival of a remote stream for demonstration
    // In production, this would come through WebRTC from another browser
    if (this.localStream && this.onRemoteStream) {
      // Create a mirrored version of local stream to simulate remote
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 320;
      canvas.height = 240;
      
      const video = document.createElement('video');
      video.srcObject = this.localStream;
      video.play();
      
      // Create simulated mirrored stream
      const drawFrame = () => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          // Draw mirrored video
          ctx.save();
          ctx.scale(-1, 1);
          ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
          ctx.restore();
          
          // Add visual indicator for "remote"
          ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
          ctx.fillRect(10, 10, 80, 30);
          ctx.fillStyle = 'white';
          ctx.font = '14px Arial';
          ctx.fillText('REMOTO', 15, 30);
        }
        requestAnimationFrame(drawFrame);
      };
      
      video.addEventListener('loadeddata', () => {
        drawFrame();
        
        // Create stream from canvas
        const simulatedStream = canvas.captureStream(30);
        
        // Add audio from original stream (cloned)
        const audioTrack = this.localStream!.getAudioTracks()[0];
        if (audioTrack) {
          simulatedStream.addTrack(audioTrack.clone());
        }
        
        if (this.onRemoteStream) {
          this.onRemoteStream(simulatedStream);
        }
      });
    }
  }

  private handleIceCandidate(candidate: RTCIceCandidate): void {
    // In a real implementation, would send to other peer via server
    // For demonstration, just log
    console.log('ICE candidate:', candidate);
  }

  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('Audio toggled:', audioTrack.enabled);
        return audioTrack.enabled;
      }
    }
    console.log('No audio track available');
    return false;
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('Video toggled:', videoTrack.enabled);
        return videoTrack.enabled;
      }
    }
    console.log('No video track available');
    return false;
  }

  disconnect(): void {
    localStorage.removeItem(`room_${this.roomId}_active`);
    this.cleanup();
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  // Method to recreate stream when there are problems
  async reinitializeStream(): Promise<void> {
    // Para todos os tracks atuais
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Tenta obter novo stream
    await this.tryGetUserMedia();
  }

  // Verifica se o stream está ativo
  isStreamActive(): boolean {
    if (!this.localStream) return false;
    
    return this.localStream.getTracks().some(track => 
      track.readyState === 'live' && track.enabled
    );
  }

  public originalCamStream: MediaStream | null = null;

public async replaceVideoTrack(newStream: MediaStream) {
  if (!this.peerConnection) return;

  const newVideoTrack = newStream.getVideoTracks()[0];
  if (!newVideoTrack) return;

  const sender = this.peerConnection
    .getSenders()
    .find((s) => s.track && s.track.kind === 'video');

  if (sender) {
    await sender.replaceTrack(newVideoTrack);
    this.localStream = newStream;
    if (this.onLocalStream) this.onLocalStream(newStream);
  }
}
}
