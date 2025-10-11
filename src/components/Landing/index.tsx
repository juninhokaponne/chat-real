import { useState } from 'react';
import {
  MdVideoCall,
  MdMic,
  MdVideocam,
  MdSecurity,
  MdDevices,
  MdGroup,
  MdArrowForward,
  MdAccessTime,
} from 'react-icons/md';

import { useAuth } from '../../auth/authContext';
import { generateRoomId } from '../../utils/roomUtils';
import { CameraTest } from '../CameraTest';
import { Header } from '../Header';
import { HelpModal } from '../HelpModal';

import styles from './Landing.module.css';

interface LandingProps {
  onStartCall: (roomId?: string) => void;
  onOpenAuth?: () => void;
  isAuthenticated?: boolean;
  user?: { name?: string; email?: string } | null;
  onLogout?: () => void;
}

export const Landing = ({ onStartCall, onOpenAuth, isAuthenticated = false, onLogout }: LandingProps) => {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showCameraTest, setShowCameraTest] = useState(false);
  const auth = useAuth();
  const [showHelp, setShowHelp] = useState(false);

  const handleCreateRoom = () => {
    if (isAuthenticated) {
      const roomId = generateRoomId();
      onStartCall(roomId);
      return;
    }
    // require auth before creating: register a post-auth callback to create room
    if (auth?.registerPostAuth) {
      auth.registerPostAuth(() => {
        const roomId = generateRoomId();
        onStartCall(roomId);
      });
    }
    if (onOpenAuth) onOpenAuth();
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) return;
    let final = joinRoomId.trim();
    try {
      // If user pasted a full URL, extract the room query param
      const u = new URL(final);
      const r = u.searchParams.get('room');
      if (r) final = r;
    } catch (_e) { /* ignore invalid URL */ }
    if (isAuthenticated) {
      onStartCall(final);
      return;
    }
    if (onOpenAuth) onOpenAuth();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.trim()) {
      setTimeout(() => {
        let final = pastedText.trim();
        try {
          const u = new URL(final);
          const r = u.searchParams.get('room');
          if (r) final = r;
        } catch (_e) { /* ignore invalid URL */ }
        onStartCall(final);
      }, 100);
    }
  };

  const features = [
    {
      icon: <MdVideoCall />,
      title: 'HD Calls',
      description: 'High quality video with WebRTC technology'
    },
    {
      icon: <MdMic />,
      title: 'Crystal Clear Audio',
      description: 'Clear sound with noise cancellation'
    },
    {
      icon: <MdSecurity />,
      title: 'Private & Secure',
      description: 'Encrypted P2P connection, no data on server'
    },
    {
      icon: <MdDevices />,
      title: 'Multi-device',
      description: 'Works on desktop, tablet and mobile'
    },
    {
      icon: <MdGroup />,
      title: 'Instant Rooms',
      description: 'Create or join rooms quickly'
    },
    {
      icon: <MdAccessTime />,
      title: 'Unlimited time',
      description: 'Using for unlimited time without restrictions'
    }
  ];

  const handleHelpClick = () => {
    setShowHelp(true);
  };

  const handleSettingsClick = () => {
    // TODO: Navigate to settings page or open settings modal
    console.log('Settings clicked');
  };

  // login is handled via Header -> onOpenAuth

  return (
    <div className={styles.landing}>
      <Header 
        onHelpClick={handleHelpClick}
        onOpenAuth={onOpenAuth}
        onSettingsClick={handleSettingsClick}
        onLogout={onLogout}
        isLoggedIn={isAuthenticated}
        user={auth?.user}
      />
      
      <div className={styles.content}>
        <div className={styles.hero}>
        <h1 className={styles.title}>Video calls and meetings for everyone</h1>
        <p className={styles.subtitle}>
          Modern, secure and instant video chat.<br />
          Connect with anyone, anywhere.
        </p>
      </div>

      <div className={styles.features}>
        {features.map((feature, index) => (
          <div className={styles.feature} key={index}>
            <div className={styles.featureIcon}>
              {feature.icon}
            </div>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureDesc}>{feature.description}</p>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={handleCreateRoom}>
          <MdVideoCall size={24} />
          Create New Room
          <MdArrowForward size={20} />
        </button>

        <div className={styles.secondaryActions}>
          <button className={styles.secondaryButton} onClick={() => setShowHelp(true)}>
            <MdMic size={20} />
            How it Works?
          </button>
          <button 
            className={styles.secondaryButton}
            onClick={() => setShowCameraTest(true)}
          >
            <MdVideocam size={20} />
            Test Camera
          </button>
        </div>
      </div>

      <div className={styles.joinRoomSection}>
        <h3 className={styles.joinTitle}>Join Existing Room</h3>
        <input
          className={styles.joinInput}
          placeholder="Paste room ID here..."
          type="text"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
          onPaste={handlePaste}
        />
        <button 
          className={styles.joinButton}
          disabled={!joinRoomId.trim()}
          onClick={handleJoinRoom}
        >
          Join Room
        </button>
      </div>

      <div className={styles.footer}>
        🚀 Built with React + TypeScript + WebRTC
      </div>

        {showCameraTest && (
          <CameraTest onClose={() => setShowCameraTest(false)} />
        )}
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
      </div>
    </div>
  );
};
