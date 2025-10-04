import { useState } from 'react';
import { 
  MdAccountCircle, 
  MdSettings, 
  MdLogin, 
  MdHelpOutline,
  MdKeyboardArrowDown,
  MdMenu,
  MdClose,
  MdPerson
} from 'react-icons/md';
import { ThemeToggle } from '../ThemeToggle';
import styles from './Header.module.css';

interface HeaderProps {
  onHelpClick?: () => void;
  onSettingsClick?: () => void;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
}

export const Header = ({ onHelpClick, onSettingsClick, onLoginClick, onProfileClick }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
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
    if (onSettingsClick) {
      onSettingsClick();
    }
    setShowUserMenu(false);
  };

  const handleHelp = () => {
    if (onHelpClick) {
      onHelpClick();
    }
  };

  const handleProfile = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    setShowUserMenu(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo/Brand */}
        <div className={styles.brand}>
          <h2 className={styles.logo} onClick={() => {
            window.location.href = '/';
          }}>Chat Real</h2>
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navItems}>
            <ThemeToggle />
            
            <button 
              className={styles.helpButton}
              onClick={handleHelp}
              title="Help & Support"
            >
              <MdHelpOutline size={20} />
            </button>

            <button 
              className={styles.settingsButton}
              onClick={handleSettings}
              title="Settings"
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
                      size={16} 
                      className={`${styles.dropdownIcon} ${showUserMenu ? styles.rotated : ''}`}
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
                      <button className={styles.dropdownItem} onClick={handleProfile}>
                        <MdPerson size={18} />
                        View Profile
                      </button>
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
              <div className={styles.mobileThemeToggle}>
                <ThemeToggle />
              </div>
              
              <button className={styles.mobileMenuItem} onClick={handleHelp}>
                <MdHelpOutline size={20} />
                Help & Support
              </button>
              
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
                  <button className={styles.mobileMenuItem} onClick={handleProfile}>
                    <MdPerson size={20} />
                    View Profile
                  </button>
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
    </header>
  );
};
