import { MdClose } from 'react-icons/md';

import styles from './HelpModal.module.css';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal = ({ onClose }: HelpModalProps) => {
  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Help and Support">
      <div className={styles.modal}>
        <button className={styles.closeBtn} aria-label="Close help" onClick={onClose}>
          <MdClose size={22} />
        </button>

        <div className={styles.header}>
          <h2>Help & Support</h2>
          <p>Quick answers and guidance for using Chat Real.</p>
        </div>

        <div className={styles.faq}>
          <div>
            <p className={styles.q}>How do I create a room?</p>
            <p className={styles.a}>On the landing page click “Create New Room”. A unique ID is generated and added to the URL – share that link.</p>
          </div>
          <div>
            <p className={styles.q}>People can’t see/hear me.</p>
            <p className={styles.a}>Check browser permission (camera & mic icon near address bar). Close other apps using your camera, then rejoin.</p>
          </div>
          <div>
            <p className={styles.q}>What does dark mode change?</p>
            <p className={styles.a}>We switch a set of CSS variables (colors, surfaces, shadows) so every themed component updates instantly.</p>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Resources</h3>
          <div className={styles.links}>
            <button className={styles.linkBtn} onClick={() => window.open('https://webrtc.org/get-started/','_blank')}>WebRTC Basics</button>
            <button className={styles.linkBtn} onClick={() => window.open('https://developer.chrome.com/docs/web-platform/site-capabilities/','_blank')}>Permissions Help</button>
            <button className={styles.linkBtn} onClick={() => window.open('https://github.com/your-username/chat-real/issues','_blank')}>Report Issue</button>
          </div>
        </div>

        <div className={styles.section}>
          <h3>Troubleshooting</h3>
          <div className={styles.faq}>
            <div>
              <p className={styles.q}>Video frozen?</p>
              <p className={styles.a}>Try turning video off/on using controls. If it persists, refresh the page (peer connection will renegotiate).</p>
            </div>
            <div>
              <p className={styles.q}>Audio echo?</p>
              <p className={styles.a}>Use headphones and ensure only one tab is in the same room.</p>
            </div>
          </div>
        </div>

        <div className={styles.footerNote}>More help coming soon · v1 help panel</div>
      </div>
    </div>
  );
};
