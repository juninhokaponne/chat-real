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

import { generateRoomId } from '../../utils/roomUtils';
import { CameraTest } from '../CameraTest';
import { Header } from '../Header';
import { HelpModal } from '../HelpModal';

import styles from './Landing.module.css';

interface LandingProps {
  onStartCall: (roomId?: string) => void;
}

export const Landing = ({ onStartCall }: LandingProps) => {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [showCameraTest, setShowCameraTest] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const handleCreateRoom = () => {
    const roomId = generateRoomId();
    onStartCall(roomId);
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      onStartCall(joinRoomId.trim());
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.trim()) {
      setTimeout(() => {
        onStartCall(pastedText.trim());
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

  const handleLoginClick = () => {
    // TODO: Navigate to login page or open login modal
    console.log('Login clicked');
  };

  return (
    <div className={styles.landing}>
      <Header 
        onHelpClick={handleHelpClick}
        onLoginClick={handleLoginClick}
        onSettingsClick={handleSettingsClick}
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
