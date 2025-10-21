import { useState } from 'react';
import {
  MdAccountCircle,
  MdSettings,
  MdLogin,
  MdHelpOutline,
  MdKeyboardArrowDown,
  MdMenu,
  MdClose,
} from 'react-icons/md';

import { HelpModal } from '../HelpModal';
import { SettingsModal } from '../SettingsModal';
import { ThemeToggle } from '../ThemeToggle/index.tsx';

import styles from './Header.module.css';

interface HeaderProps {
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
  onLoginClick?: () => void;
}

export const Header = ({ onHelpClick, onSettingsClick, onLoginClick }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Mock user state - later this will come from authentication
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const user = { name: 'John Doe', email: 'john@example.com' };

  const handleUserMenuToggle = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleMobileMenuToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick();
    }
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowUserMenu(false);
  };

  const handleSettings = () => {
    if (onSettingsClick) onSettingsClick();
    setShowUserMenu(false);
    setShowSettings(true);
  };

  const handleHelp = () => {
    if (onHelpClick) onHelpClick();
    setShowHelp(true);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <h2 
            className={styles.logo} 
            onClick={() => {
              window.location.href = '/';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                window.location.href = '/';
              }
            }}


          >
            Chat Real
          </h2>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navItems}>
            <button 
              className={styles.helpButton}
              title="Help & Support"
              onClick={handleHelp}
            >
              <MdHelpOutline size={20} />
            </button>

            <ThemeToggle />

            <button 
              className={styles.settingsButton}
              title="Settings"
              onClick={handleSettings}
            >
              <MdSettings size={20} />
            </button>
            

            {/* User Menu */}
            <div className={styles.userMenu}>
              {isLoggedIn ? (
                <div className={styles.userProfile}>
                  <button 
                    className={styles.profileButton}
                    onClick={handleUserMenuToggle}
                  >
                    <MdAccountCircle size={32} />
                    <span className={styles.userName}>{user.name}</span>
                    <MdKeyboardArrowDown 
                      className={`${styles.dropdownIcon} ${showUserMenu ? styles.rotated : ''}`} 
                      size={16}
                    />
                  </button>

                  {showUserMenu && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownHeader}>
                        <MdAccountCircle size={24} />
                        <div>
                          <div className={styles.dropdownName}>{user.name}</div>
                          <div className={styles.dropdownEmail}>{user.email}</div>
                        </div>
                      </div>
                      <hr className={styles.dropdownDivider} />
                      <button className={styles.dropdownItem} onClick={handleSettings}>
                        <MdSettings size={18} />
                        Settings
                      </button>
                      <button className={styles.dropdownItem} onClick={handleHelp}>
                        <MdHelpOutline size={18} />
                        Help & Support
                      </button>
                      <hr className={styles.dropdownDivider} />
                      <button className={styles.dropdownItem} onClick={handleLogout}>
                        <MdLogin size={18} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className={styles.loginButton}
                  onClick={handleLogin}
                >
                  <MdLogin size={20} />
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={handleMobileMenuToggle}
          >
            {showMobileMenu ? <MdClose size={24} /> : <MdMenu size={24} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuItems}>
              <button className={styles.mobileMenuItem} onClick={handleHelp}>
                <MdHelpOutline size={20} />
                Help & Support
              </button>
              <div style={{padding:'6px 4px'}}>
                <ThemeToggle />
              </div>
              
              <button className={styles.mobileMenuItem} onClick={handleSettings}>
                <MdSettings size={20} />
                Settings
              </button>
              
              {isLoggedIn ? (
                <>
                  <div className={styles.mobileUserInfo}>
                    <MdAccountCircle size={24} />
                    <div>
                      <div className={styles.mobileUserName}>{user.name}</div>
                      <div className={styles.mobileUserEmail}>{user.email}</div>
                    </div>
                  </div>
                  <button className={styles.mobileMenuItem} onClick={handleLogout}>
                    <MdLogin size={20} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button className={styles.mobileMenuItem} onClick={handleLogin}>
                  <MdLogin size={20} />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for dropdown/mobile menu */}
      {(showUserMenu || showMobileMenu) && (
        <div 
          className={styles.backdrop}
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    {showSettings && (
      <SettingsModal onClose={() => setShowSettings(false)} />
    )}
    {showHelp && (
      <HelpModal onClose={() => setShowHelp(false)} />
    )}
    </header>
  );
};
