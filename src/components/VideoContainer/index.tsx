import { useEffect, type RefObject } from 'react';
import { MdVideocamOff, MdPerson } from 'react-icons/md';

import styles from './VideoContainer.module.css';

interface VideoContainerProps {
  localVideoRef: RefObject<HTMLVideoElement>;
  remoteVideoRef: RefObject<HTMLVideoElement>;
  isConnected: boolean;
  isConnecting: boolean;
  mediaState: { audio: boolean; video: boolean };
}

export const VideoContainer = ({
  localVideoRef,
  remoteVideoRef,
  isConnected,
  isConnecting,
  mediaState
}: VideoContainerProps) => {

  useEffect(() => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.play().catch(console.error);
    }
  }, [localVideoRef.current?.srcObject]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.play().catch(console.error);
    }
  }, [remoteVideoRef.current?.srcObject]); // eslint-disable-line react-hooks/exhaustive-deps
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
          muted
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

      {/* Vídeo Remoto */}
      <div className={`${styles.videoWrapper} ${styles.remoteVideo}`}>
        {isConnected && remoteVideoRef.current?.srcObject ? (
          <video
            autoPlay
            playsInline
            className={styles.video}
            ref={remoteVideoRef}
          />
        ) : (
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
                Waiting for another participant...
              </div>
            </div>
          </div>
        )}
        {isConnected && remoteVideoRef.current?.srcObject && (
          <div className={styles.videoLabel}>Participant</div>
        )}
      </div>

    </div>
  );
};
