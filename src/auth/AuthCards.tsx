import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { useToast } from '../ui/toastContext';

import styles from './AuthCards.module.css';
import { useAuth } from './authContext';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

// Clean, accessible modal using Radix Dialog + Framer Motion for entry/exit animations
export const AuthCards: React.FC<{ onClose?: () => void; pushUrl?: boolean }> = ({ onClose, pushUrl = false }) => {
  const [showSignUp, setShowSignUp] = useState(false);
  const [open, setOpen] = useState(true);
  
  const firstFocusable = useRef<HTMLButtonElement | HTMLInputElement | null>(null);
  const previouslyFocused = useRef<Element | null>(null);

  const toast = useToast();

  const handleClose = React.useCallback(() => {
    toast?.push?.('Closing dialog');
    setOpen(false);
    try {
      if (onClose) {
        onClose();
      }
    } catch (_e) {
      // ignore; best-effort close
    }
  }, [onClose, toast]);

  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    setTimeout(() => firstFocusable.current?.focus(), 10);

    const path = showSignUp ? '/signup' : '/signin';
    // only push URL for deep-linked modals (pushUrl=true). In-app opens should not change the URL.
    if (pushUrl) {
      try {
        window.history.pushState({ modal: true }, '', path);
      } catch (_e) {
        // ignore history push failures (e.g., sandboxed env)
      }
    }

    const onPop = () => { if (onClose) onClose(); };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      try {
        (previouslyFocused.current as HTMLElement | null)?.focus?.();
      } catch (_e) {
        // ignore focus restore errors
      }
    };
  }, [showSignUp, onClose, pushUrl]);

  // auto-close when auth state indicates a logged in user (fallback)
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      console.debug('[AuthCards] detected user logged in — closing modal');
      handleClose();
    }
  }, [user, handleClose]);


  const [success, setSuccess] = useState(false);

  const handleSuccess = React.useCallback(() => {
    // brief success state then close
    setSuccess(true);
    toast?.push?.('Success', 'success');
    setTimeout(() => {
      setSuccess(false);
      handleClose();
    }, 300);
  }, [handleClose, toast]);

  return (
  <Dialog.Root open={open} onOpenChange={(val) => { setOpen(val); if (!val) { try { if (onClose) { onClose(); } } catch (_e) { /* ignore */ } } }}>
      {(() => {
        // create or reuse a single modal root attached to the body. This avoids
        // creating duplicate DOM roots when the component mounts repeatedly.
        const getModalRoot = (() => {
          let cached: HTMLElement | null = null;
          return () => {
            if (cached && document.body.contains(cached)) return cached;
            let el = document.getElementById('modal-root');
            if (!el) {
              el = document.createElement('div');
              el.id = 'modal-root';
              document.body.appendChild(el);
            }
            cached = el as HTMLElement;
            return cached;
          };
        })();

        const modalRoot = getModalRoot();

        const content = (
          <div className={styles.dialogWrapper}>
            <Dialog.Overlay className={styles.dialogBackdrop} />
            <Dialog.Content
              className={styles.card}
              style={{ zIndex: 10000, maxHeight: '85vh', overflow: 'auto' }}
              onEscapeKeyDown={() => { handleClose(); }}
              onPointerDownOutside={() => { handleClose(); }}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Dialog.Close asChild>
                  <button ref={el => { firstFocusable.current = el; }} aria-label="Close" className={styles.closeBtn} onClick={() => { handleClose(); }}>✕</button>
                </Dialog.Close>

                <div className={styles.header}>
                  <div>
                    <Dialog.Title asChild>
                      <div className={styles.title}>{showSignUp ? 'Create your account' : 'Sign in to Chat Real'}</div>
                    </Dialog.Title>
                    <Dialog.Description asChild>
                      <div className={styles.subtitle}>{showSignUp ? 'Welcome \u2014 create an account to save sessions' : 'Welcome back \u2014 sign in to continue'}</div>
                    </Dialog.Description>
                  </div>
                </div>

                <div className={styles.accentBar} />

                <AnimatePresence mode="wait">
                  <motion.div key={showSignUp ? 'signup' : 'signin'} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.995 }} transition={{ duration: 0.22 }}>
                    <div style={{ marginBottom: 12 }}>
                      <button className={`${styles.googleBtn} ${styles.googleFilled}`} onClick={() => { const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google?popup=1`; window.open(url, 'google-login', 'width=600,height=700'); }}>
                        <img src="/call.svg" alt="google" style={{ width: 18, height: 18 }} />
                        <span>Continue with Google</span>
                      </button>
                    </div>

                    <div className={styles.orText}>or use your email</div>

                    <div className={styles.form}>
                      {showSignUp ? <SignUp onSuccess={() => handleSuccess()} /> : <SignIn onSuccess={() => handleSuccess()} />}
                    </div>

                    <div className={styles.footerPrompt}>
                      {showSignUp ? (
                        <span>Already have an account? <button className={styles.switchBtn} onClick={() => setShowSignUp(false)}>Sign in</button></span>
                      ) : (
                        <span>New user? <button className={styles.switchBtn} onClick={() => setShowSignUp(true)}>Create account</button></span>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
              {success && (
                <div className={styles.successOverlay}>
                  <div className={styles.checkmark}>
                    <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="26" cy="26" r="25" fill="none" stroke="#fff" strokeWidth="2"/>
                      <path fill="none" stroke="#fff" strokeWidth="4" d="M14 27 l7 7 l17 -17" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </div>
        );

        return createPortal(content, modalRoot);
      })()}
    </Dialog.Root>
  );
};

export default AuthCards;
