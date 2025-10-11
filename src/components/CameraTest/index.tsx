import { useState, useRef, useEffect } from 'react';
// --- FIX: 'MdPlayArrow' has been removed from this line ---
import { MdClose, MdVideocam, MdVideocamOff, MdMic, MdMicOff, MdRecordVoiceOver } from 'react-icons/md';

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
  
  // Echo Test Logic State
  const [echoStatus, setEchoStatus] = useState<'idle' | 'recording' | 'playing' | 'success'>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  const startTest = async () => {
    setStatus('testing');
    setMessage('Requesting access to camera and microphone...');
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (mediaStream.getAudioTracks().length === 0) {
        throw new Error("No audio track found. Is your microphone enabled?");
      }
      
      setStream(mediaStream);
      setStatus('success');
      setMessage('✅ Camera and microphone permissions granted!');
    } catch (error) {
      console.error('Error accessing media:', error);
      setStatus('error');
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setMessage('❌ Permission denied. Please allow access in your browser.');
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
    }
    setEchoStatus('idle');
    audioChunksRef.current = [];
    setStatus('idle');
    setMessage('');
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

   const handleCloseAndStop = () => {
    stopTest(); 
    onClose(); 
};

  const handleEchoTest = () => {
    if (!stream) return;
    
    setEchoStatus('recording');
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      setEchoStatus('playing');
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => {
        setEchoStatus('success');
        URL.revokeObjectURL(audioUrl);
      };
    };

    mediaRecorderRef.current.start();

    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }, 3000); // Record for 3 seconds
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
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      stopTest();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <button className={styles.closeButton} onClick={handleCloseAndStop}>
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

        {stream && (
            <div className={styles.echoTestContainer}>
                <button 
                    onClick={handleEchoTest}
                    className={styles.echoButton}
                    disabled={echoStatus === 'recording' || echoStatus === 'playing'}
                >
                    <MdRecordVoiceOver />
                    {echoStatus === 'idle' && 'Test Microphone'}
                    {echoStatus === 'recording' && 'Recording... Speak now!'}
                    {echoStatus === 'playing' && 'Playing back...'}
                    {echoStatus === 'success' && 'Test Again'}
                </button>
                {echoStatus === 'success' && (
                    <p className={styles.echoSuccessMessage}>✅ Test complete! You should have heard your voice.</p>
                )}
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
                {audioEnabled ? 'Mute' : 'Unmute'} Mic
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
      </div>
    </div>
  );
};