import { useState, useRef } from 'react';
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';

import styles from './ScreenShare.module.css';

interface Props {
  onShareStart?: (stream: MediaStream) => void; // give the stream to parent
  onShareEnd?: () => void;
}

export const ScreenShare = ({ onShareStart, onShareEnd }: Props) => {
  const [sharing, setSharing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startShare = async () => {
    try {
      // @ts-expect-error – older TypeScript definitions
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      setSharing(true);
      onShareStart?.(stream);

      // auto-stop when user clicks “Stop sharing” in the browser bar
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        stopShare();
      });
    } catch (e) {
      console.warn('Screen-share cancelled or failed', e);
    }
  };

  const stopShare = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setSharing(false);
    onShareEnd?.();
  };

  return (
    <button
      className={`${styles.btn} ${sharing ? styles.active : ''}`}
      onClick={sharing ? stopShare : startShare}
      title={sharing ? 'Stop sharing' : 'Share screen'}
    >
      {sharing ? <MdStopScreenShare size={20} /> : <MdScreenShare size={20} />}
    </button>
  );
};