import React from 'react';
import styles from './ShareRoom.module.css';

export const ShareRoom: React.FC<{ roomId: string; onClose?: () => void }> = ({ roomId, onClose }) => {
  const link = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      alert('Room link copied to clipboard');
    } catch {
      alert('Could not copy link');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Room created</div>
      <div className={styles.body}>
        <input className={styles.input} readOnly value={link} />
        <div className={styles.actions}>
          <button className={styles.copyBtn} onClick={copy}>Copy link</button>
          <button className={styles.closeBtn} onClick={() => onClose && onClose()}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareRoom;
