export interface MediaState {
  audio: boolean;
  video: boolean;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
}

export interface VideoChatState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  mediaState: MediaState;
  roomId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  lastActive?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}
