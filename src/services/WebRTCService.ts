import io from 'socket.io-client';
// Native WebRTC implementation without external dependencies
export class WebRTCService {
  public localStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private roomId: string;
  private isInitiator = false;
  private username: string;

  private signalingSocket: any = null;
  private iceCandidateQueue: RTCIceCandidateInit[] = [];

  // Public callbacks for the hook
  public onLocalStream: ((stream: MediaStream) => void) | null = null;
  public onRemoteStream: ((stream: MediaStream) => void) | null = null;
  public onDisconnected: (() => void) | null = null;
  public onConnected: (() => void) | null = null;

  private readonly configuration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  constructor(roomId: string, socket: any, username: string) {
    this.roomId = roomId;
    this.signalingSocket = socket;
    this.username = username;
  }

  async initialize(): Promise<void> {
    try {
      // First try with video and audio
      await this.tryGetUserMedia();
      console.log("done");
      this.createPeerConnection();
      this.setupSignalingListeners();
    } catch (error) {
      console.error('Erro ao acessar mídia:', error);
      throw error;
    }
  }

  private setupSignalingListeners(): void {

    this.signalingSocket.on('start-offer', () => {
      // When we receive this, we ARE the initiator for this session.
      this.isInitiator = true;
      this.createOffer(); 
    });

    this.signalingSocket.on('offer', (sdp: RTCSessionDescriptionInit) => {
      this.setRemoteDescriptionAndCreateAnswer(sdp);
    });

    this.signalingSocket.on('answer', (sdp: RTCSessionDescriptionInit) => {
      this.setRemoteDescription(sdp);
    });

    this.signalingSocket.on('candidate', (candidate: RTCIceCandidateInit) => {
      if (candidate) {
        if (this.peerConnection?.remoteDescription) {
          this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            .catch(e => console.error('Error adding ICE candidate:', e));
        } else {
          this.iceCandidateQueue.push(candidate);
          console.log('Candidate buffered:', this.iceCandidateQueue.length);
        }
      }
    });

    this.signalingSocket.on('disconnect', () => {
      console.log("Signaling socket disconnected.");
    });

    this.signalingSocket.emit('join', { roomId: this.roomId, username: this.username });
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

  public get peerConnectionInstance(): RTCPeerConnection | null {
    return this.peerConnection;
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
      console.log('✅ Remote track received! Stream ID:', event.streams[0].id);
      const [remoteStream] = event.streams;
      if (this.onRemoteStream) {
        this.onRemoteStream(remoteStream);
      }
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.handleIceCandidate(event.candidate);
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log("w");
      const state = this.peerConnection?.connectionState;
      console.log(state);
      console.log('Connection state:', state);

      if (state === 'connected') {
        if (this.onConnected) {
          this.onConnected(); 
        }
      }

      if (state === 'disconnected' ||
        state === 'failed') {
        if (this.onDisconnected) {
          this.onDisconnected();
        }
      }
    };
  }

  public async createOffer(): Promise<void> {
    if (!this.peerConnection || !this.signalingSocket) return;
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.signalingSocket.emit('offer', { sdp: this.peerConnection.localDescription, roomId: this.roomId });
  }

  public async createAnswer(): Promise<void> {
    if (!this.peerConnection || !this.signalingSocket) return;

    try {
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      console.log('Sending Answer SDP:', this.peerConnection.localDescription?.type);

      this.signalingSocket.emit('answer', { sdp: this.peerConnection.localDescription, roomId: this.roomId });

    } catch (error) {
      console.error('Error creating or sending Answer:', error);
    }
  }

  public async setRemoteDescriptionAndCreateAnswer(sdp: RTCSessionDescriptionInit): Promise<void> {
    console.log(this.peerConnection);
    if (!this.peerConnection) return;
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));

    } catch (error) {
      console.error('ERROR: Failed to set remote Offer description:', error);
      return; 
    }
    this.processIceCandidateQueue();
    await this.createAnswer();
  }

  public async setRemoteDescription(sdp: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) return;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    this.processIceCandidateQueue();
  }

  private processIceCandidateQueue(): void {
    while (this.iceCandidateQueue.length > 0) {
      const candidate = this.iceCandidateQueue.shift();
      if (candidate) {
        this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error('Error adding buffered ICE candidate:', e));
      }
    }
  }

  private handleIceCandidate(candidate: RTCIceCandidate): void {
    if (candidate && this.signalingSocket) {
      this.signalingSocket.emit('candidate', { candidate: candidate, roomId: this.roomId });
      console.log('ICE candidate generated:', candidate);
    } else {
      console.log('ICE candidate generated (Signaling not ready):', candidate);
    }
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
        this.signalingSocket.emit('video_status_change', { roomId: this.roomId, videoEnabled: videoTrack.enabled });
        return videoTrack.enabled;
      }
    }
    console.log('No video track available');
    return false;
  }
  disconnect(): void {
    if (this.signalingSocket) {
      this.signalingSocket.emit('user_leaving', { roomId: this.roomId });
    }
    localStorage.removeItem(`room_${this.roomId}_active`);
    this.cleanup(); 
  }

  cleanupRTCAndStreams(): void {

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    this.cleanupRTCAndStreams();
    if (this.signalingSocket) {
      this.signalingSocket.disconnect();
    }
  }

  public closeRemoteConnection(): void {
    console.log("Cleaning up RTC peer connection...");

    if (this.peerConnection) {
      // Close the peer connection
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
