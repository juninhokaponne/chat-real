import { useState } from 'react';
import { MdContentCopy, MdCheck } from 'react-icons/md';

import { shareRoomUrl } from '../../utils/roomUtils';

import styles from './ShareButton.module.css';

interface ShareButtonProps {
  roomId: string;
}

export const ShareButton = ({ roomId }: ShareButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const url = shareRoomUrl(roomId);
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const url = shareRoomUrl(roomId);
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button 
      className={`${styles.shareButton} ${copied ? styles.copied : ''}`}
      title="Copy room link"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <MdCheck size={16} />
          Copied!
        </>
      ) : (
        <>
          <MdContentCopy size={16} />
          Copy Link
        </>
      )}
    </button>
  );
};
