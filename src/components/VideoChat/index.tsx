import { useState } from 'react';
import { MdSync, MdCheckCircle, MdError, MdArrowBack } from 'react-icons/md';

// Internal imports
import ChatPanel from '../../components/chat/ChatPanel';
import { useAuth } from '../../auth/authContext';
import { useVideoChat } from '../../hooks/useVideoChat';
import { Controls } from '../Controls';
import { ShareButton } from '../ShareButton';
import { VideoContainer } from '../VideoContainer';

// Styles
import styles from './VideoChat.module.css';

interface VideoChatProps {
  roomId: string;
  onBackToLanding: () => void;
}

export const VideoChat = ({ roomId, onBackToLanding }: VideoChatProps) => {
  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isConnecting,
    mediaState,
    error,
  toggleAudio,
  toggleVideo,
  endCall,
  retryConnection,
    socket,
    username
  } = useVideoChat(roomId);

  // Local chat UI state (chat driven by socket provided by hook)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const toggleChat = () => setIsChatOpen((v) => !v);

  // get user name from auth provider so local video label is correct
  const auth = useAuth();
  const userName = auth?.user?.displayName || auth?.user?.email;

  const handleEndCall = () => {
    endCall();
    onBackToLanding();
  };

  const handleRetry = () => {
    retryConnection();
  };

  const getConnectionStatus = () => {
    if (isConnecting)
      return {
        icon: <MdSync className={styles.spinIcon} size={16} />,
        text: 'Connecting...',
        class: styles.statusConnecting
      };
    if (isConnected)
      return {
        icon: <MdCheckCircle size={16} />,
        text: 'Connected',
        class: styles.statusConnected
      };
    return {
      icon: <MdError size={16} />,
      text: 'Waiting',
      class: styles.statusDisconnected
    };
  };

  if (!roomId) {
    return <div className={styles.videoChat}>Loading...</div>;
  }

  const status = getConnectionStatus();

  return (
    <div className={styles.videoChat}>
      <button className={styles.backButton} title="Back to home" onClick={onBackToLanding}>
        <MdArrowBack size={20} />
      </button>

      <div className={styles.roomInfo}>
        Room: {roomId.substring(0, 8)}...
        <ShareButton roomId={roomId} />
      </div>

      <div className={`${styles.connectionStatus} ${status.class}`}>
        {status.icon}
        {status.text}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <h3>Media Error</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <button className={styles.retryButton} onClick={handleRetry}>
              Try Again
            </button>
          </div>
        </div>
      )}

      <VideoContainer
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        isConnected={isConnected}
        isConnecting={isConnecting}
        mediaState={mediaState}
        userName={userName}
      />

      <Controls
        mediaState={mediaState}
        onEndCall={handleEndCall}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
      />

      {isChatOpen && socket && (
        <ChatPanel socket={socket} roomId={roomId} username={username || 'Guest'} />
      )}
    </div>
  );
};
