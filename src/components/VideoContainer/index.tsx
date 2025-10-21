import { useEffect, type RefObject } from 'react';
import { MdVideocamOff, MdPerson } from 'react-icons/md';

import styles from './VideoContainer.module.css';

interface VideoContainerProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  isConnected: boolean;
  isConnecting: boolean;
  mediaState: { audio: boolean; video: boolean };
  remoteStream: MediaStream | null;
  remoteVideoEnabled:boolean,
  remoteUsername:string
}

export const VideoContainer = ({
  localVideoRef,
  remoteVideoRef,
  isConnected,
  isConnecting,
  mediaState,
  remoteStream,
  remoteVideoEnabled,
  remoteUsername
}: VideoContainerProps) => {

const isRemotePeerPresent = remoteStream !== null;
const showRemoteVideo = isConnected && isRemotePeerPresent && remoteVideoEnabled === true;
const showRemotePlaceholder = isConnected && isRemotePeerPresent && remoteVideoEnabled === false;
const showWaitingMessage = !isRemotePeerPresent ||(isRemotePeerPresent && remoteVideoEnabled===undefined);

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteVideoRef.current?.srcObject]); 
  if (isConnecting) {
    return (
      <div className={styles.connectingMessage}>
        <div className={styles.spinner} />
        <p>Connecting to video room...</p>
      </div>
    );
  }

  return (
    <div className={`${styles.videoContainer} ${isConnected ? styles.connected : ''}`}>
      {/* Vídeo Local */}
      <div className={`${styles.videoWrapper} ${styles.localVideo}`}>
        <video
          autoPlay
          playsInline
          className={styles.video}
          controls={false}
          ref={localVideoRef}
          style={{ display: mediaState.video ? 'block' : 'none' }}
        />
        {!mediaState.video && (
          <div className={`${styles.placeholder} ${styles.localVideo}`}>
            <MdVideocamOff size={48} />
          </div>
        )}
        <div className={styles.videoLabel}>
          You
        </div>
      </div>

      {/* Vídeo Remote */}
      <div className={`${styles.videoWrapper} ${styles.remoteVideo}`}>
        
        <video
          autoPlay
          playsInline
          className={styles.video}
          ref={remoteVideoRef} 
          style={{ display: (showRemoteVideo) ? 'block' : 'none' }}
        />

        {showWaitingMessage && (
          <div className={`${styles.placeholder} ${styles.remoteVideo}`}>
            <div style={{ textAlign: 'center' }}>
              <MdPerson size={64} style={{ marginBottom: '16px' }} />
              <div
                style={{
                  fontSize: '16px',
                  color: '#9ca3af',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                }}
              >
                Waiting for participant media...
              </div>
            </div>
          </div>
        )}
        {showRemotePlaceholder && (
            <div className={`${styles.placeholder} ${styles.remoteVideo}`}>
                <MdVideocamOff size={48} />
                <div className={styles.videoLabel}>{remoteUsername}</div>
            </div>
        )}
        {showRemoteVideo && (
          <div className={styles.videoLabel}>{remoteUsername}</div>
        )}
      </div>
    </div>
  );
};
