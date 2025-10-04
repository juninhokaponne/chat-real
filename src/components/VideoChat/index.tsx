import { useState } from 'react';
import { MdSync, MdCheckCircle, MdError, MdArrowBack } from 'react-icons/md';
import { VideoContainer } from '../VideoContainer';
import { Controls } from '../Controls';
import { ShareButton } from '../ShareButton';
import { Header } from '../Header';
import { useVideoChat } from '../../hooks/useVideoChat';
import styles from './VideoChat.module.css';

interface VideoChatProps {
  roomId: string;
  onBackToLanding: () => void;
  onShowProfile?: () => void;
}

export const VideoChat = ({ roomId, onBackToLanding, onShowProfile }: VideoChatProps) => {
  const [error, setError] = useState<string>('');

  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isConnecting,
    mediaState,
    toggleAudio,
    toggleVideo,
    endCall,
    reconnect
  } = useVideoChat(roomId);

  const handleEndCall = () => {
    endCall();
    // Go back to landing page
    onBackToLanding();
  };

  // Function for audio-only mode
  const handleAudioOnly = () => {
    setError('');
    // Implement audio-only mode if needed
    console.log('Trying audio-only mode...');
  };

  const handleRetry = () => {
    setError('');
    reconnect().catch((err) => {
      console.error('Detailed error:', err);
      
      // More specific error messages
      let errorMessage = 'Unknown error accessing media.';
      
      if (err.message.includes('NotReadableError') || err.message.includes('Could not start video source')) {
        errorMessage = 'Camera in use by another application or hardware unavailable. Close other apps using camera and reload the page.';
      } else if (err.message.includes('NotAllowedError') || err.message.includes('Permission denied')) {
        errorMessage = 'Permission denied. Click on the camera icon in the address bar and allow access.';
      } else if (err.message.includes('NotFoundError') || err.message.includes('DevicesNotFoundError')) {
        errorMessage = 'Camera or microphone not found. Check if they are connected.';
      } else if (err.message.includes('OverconstrainedError')) {
        errorMessage = 'Configuration not supported by camera. Trying more basic configuration...';
      }
      
      setError(errorMessage);
    });
  };

  const getConnectionStatus = () => {
    if (isConnecting) return { 
      icon: <MdSync className={styles.spinIcon} size={16} />, 
      text: 'Connecting...', 
      class: styles.statusConnecting 
    };
    if (isConnected) return { 
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

  const handleHelpClick = () => {
    console.log('Help clicked');
  };

  const handleSettingsClick = () => {
    console.log('Settings clicked');
  };

  const handleLoginClick = () => {
    console.log('Login clicked');
  };

  return (
    <div className={styles.videoChat}>
      <Header 
        onHelpClick={handleHelpClick}
        onSettingsClick={handleSettingsClick}
        onLoginClick={handleLoginClick}
        onProfileClick={onShowProfile}
      />
      
      <button className={styles.backButton} onClick={onBackToLanding} title="Back to home">
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
            <button className={styles.audioOnlyButton} onClick={handleAudioOnly}>
              Audio Only
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
      />

      <Controls 
        mediaState={mediaState}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={handleEndCall}
      />

      
    </div>
  );
};
