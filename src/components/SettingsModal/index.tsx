import { MdClose } from 'react-icons/md';

import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../ThemeToggle/index.tsx';

import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal = ({ onClose }: SettingsModalProps) => {
  const { setTheme } = useTheme();

  const resetToSystem = () => {
    try {
      localStorage.removeItem('chat-real-theme');
  } catch {
      // ignore storage errors (private mode or quota)
    }
    const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemPref as 'light' | 'dark');
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Settings">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h2>Settings</h2>
            <p>Customize your experience.</p>
          </div>
          <button className={styles.closeBtn} aria-label="Close settings" onClick={onClose}>
            <MdClose size={22} />
          </button>
        </div>

        <div className={styles.section}>
          <h3>Appearance</h3>
          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <strong>Color Theme</strong>
              <span>Switch between light and dark appearance.</span>
            </div>
            <div className={styles.inlineControls}>
              <div className={styles.themeToggleWrap}>
                <ThemeToggle />
              </div>
              <button className={styles.resetBtn} onClick={resetToSystem}>System</button>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Media</h3>
          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <strong>Autostart Camera (coming soon)</strong>
              <span>Automatically enable camera when joining a room.</span>
            </div>
            <div className={styles.inlineControls}>
              <span style={{fontSize:13, opacity:.55}}>Planned</span>
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.rowLabel}>
              <strong>Noise Suppression (coming soon)</strong>
              <span>Improve microphone clarity.</span>
            </div>
            <div className={styles.inlineControls}>
              <span style={{fontSize:13, opacity:.55}}>Planned</span>
            </div>
          </div>
        </div>

        <div className={styles.footerActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Close</button>
          <button className={styles.saveBtn} onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};
