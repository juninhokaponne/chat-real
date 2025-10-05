import { 
  MdMic, 
  MdMicOff, 
  MdVideocam, 
  MdVideocamOff, 
  MdCallEnd 
} from 'react-icons/md';

import styles from './Controls.module.css';

import type { MediaState } from '../../types';

interface ControlsProps {
  mediaState: MediaState;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export const Controls = ({ mediaState, onToggleAudio, onToggleVideo, onEndCall }: ControlsProps) => {
  return (
    <div className={styles.controls}>
      <button 
        className={`${styles.controlButton} ${styles.audioButton} ${!mediaState.audio ? styles.muted : ''}`}
        title={mediaState.audio ? 'Mutar microfone' : 'Ativar microfone'}
        onClick={onToggleAudio}
      >
        {mediaState.audio ? <MdMic size={20} /> : <MdMicOff size={20} />}
      </button>
      
      <button 
        className={`${styles.controlButton} ${styles.videoButton} ${!mediaState.video ? styles.disabled : ''}`}
        title={mediaState.video ? 'Desligar câmera' : 'Ligar câmera'}
        onClick={onToggleVideo}
      >
        {mediaState.video ? <MdVideocam size={20} /> : <MdVideocamOff size={20} />}
      </button>
      
      <button 
        className={`${styles.controlButton} ${styles.endCallButton}`}
        title="Encerrar chamada"
        onClick={onEndCall}
      >
        <MdCallEnd size={20} />
      </button>
    </div>
  );
};
