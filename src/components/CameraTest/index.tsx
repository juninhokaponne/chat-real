import { useState, useRef, useEffect } from 'react';
import { MdClose, MdVideocam, MdVideocamOff, MdMic, MdMicOff } from 'react-icons/md';

import styles from './CameraTest.module.css';

interface CameraTestProps {
  onClose: () => void;
}

export const CameraTest = ({ onClose }: CameraTestProps) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<'testing' | 'success' | 'error' | 'idle'>('idle');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [message, setMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const startTest = async () => {
    setStatus('testing');
    setMessage('Requesting access to camera and microphone...');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStatus('success');
      setMessage('✅ Camera and microphone working perfectly!');
    } catch (error) {
      console.error('Error accessing media:', error);
      setStatus('error');
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setMessage('❌ Permission denied. Click on the camera icon in the address bar and allow access.');
        } else if (error.name === 'NotFoundError') {
          setMessage('❌ Camera or microphone not found. Check if they are connected.');
        } else if (error.name === 'NotReadableError') {
          setMessage('❌ Camera in use by another application. Close other apps using camera.');
        } else {
          setMessage(`❌ Error: ${error.message}`);
        }
      }
    }
  };

  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStatus('idle');
    setMessage('');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const getStatusClass = () => {
    switch (status) {
      case 'success': return styles.statusSuccess;
      case 'error': return styles.statusError;
      case 'testing': return styles.statusInfo;
      default: return '';
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <MdClose />
        </button>
        
        <h2 className={styles.title}>Camera and Microphone Test</h2>
        
        <div className={styles.videoPreview}>
          {stream ? (
            <video
              autoPlay
              muted
              playsInline
              className={styles.video}
              ref={videoRef}
              style={{ display: videoEnabled ? 'block' : 'none' }}
            />
          ) : (
            <div className={styles.placeholder}>
              <MdVideocam size={48} />
              <p>Click &quot;Start Test&quot; to test your camera</p>
            </div>
          )}
          
          {stream && !videoEnabled && (
            <div className={styles.placeholder}>
              <MdVideocamOff size={48} />
              <p>Camera off</p>
            </div>
          )}
        </div>

        {message && (
          <div className={`${styles.status} ${getStatusClass()}`}>
            {message}
          </div>
        )}

        <div className={styles.controls}>
          {!stream ? (
            <button 
              className={`${styles.controlButton} ${styles.primaryButton}`}
              disabled={status === 'testing'}
              onClick={startTest}
            >
              {status === 'testing' ? 'Testing...' : 'Start Test'}
            </button>
          ) : (
            <>
              <button 
                className={`${styles.controlButton} ${styles.secondaryButton}`}
                onClick={toggleVideo}
              >
                {videoEnabled ? <MdVideocam /> : <MdVideocamOff />}
                {videoEnabled ? 'Turn Off' : 'Turn On'} Camera
              </button>
              
              <button 
                className={`${styles.controlButton} ${styles.secondaryButton}`}
                onClick={toggleAudio}
              >
                {audioEnabled ? <MdMic /> : <MdMicOff />}
                {audioEnabled ? 'Turn Off' : 'Turn On'} Audio
              </button>
              
              <button 
                className={`${styles.controlButton} ${styles.secondaryButton}`}
                onClick={stopTest}
              >
                Stop Test
              </button>
            </>
          )}
        </div>

        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginTop: '16px' }}>
          This test checks if your camera and microphone are working properly 
          before joining a call.
        </p>
      </div>
    </div>
  );
};
