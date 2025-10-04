import React, { useState } from 'react';
import { 
  MdLightMode, 
  MdDarkMode, 
  MdSettingsBrightness,
  MdKeyboardArrowDown 
} from 'react-icons/md';
import { useTheme } from '../../contexts/ThemeContext';
import { Theme } from '../../types';
import styles from './ThemeToggle.module.css';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, actualTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setShowDropdown(false);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <MdLightMode size={20} />;
      case 'dark':
        return <MdDarkMode size={20} />;
      case 'system':
        return <MdSettingsBrightness size={20} />;
      default:
        return <MdSettingsBrightness size={20} />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const themes: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <MdLightMode size={18} />,
      description: 'Always use light mode'
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <MdDarkMode size={18} />,
      description: 'Always use dark mode'
    },
    {
      value: 'system',
      label: 'System',
      icon: <MdSettingsBrightness size={18} />,
      description: 'Follow system preference'
    }
  ];

  return (
    <div className={styles.themeToggle}>
      <button
        className={styles.themeButton}
        onClick={() => setShowDropdown(!showDropdown)}
        title={`Current theme: ${getThemeLabel()}`}
      >
        {getThemeIcon()}
        <span className={styles.themeLabel}>{getThemeLabel()}</span>
        <MdKeyboardArrowDown 
          size={16} 
          className={`${styles.dropdownIcon} ${showDropdown ? styles.rotated : ''}`}
        />
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          {themes.map((themeOption) => (
            <button
              key={themeOption.value}
              className={`${styles.themeOption} ${theme === themeOption.value ? styles.active : ''}`}
              onClick={() => handleThemeChange(themeOption.value)}
            >
              <div className={styles.themeOptionContent}>
                <div className={styles.themeOptionIcon}>
                  {themeOption.icon}
                </div>
                <div className={styles.themeOptionText}>
                  <span className={styles.themeOptionLabel}>{themeOption.label}</span>
                  <span className={styles.themeOptionDescription}>{themeOption.description}</span>
                </div>
                {theme === themeOption.value && (
                  <div className={styles.checkmark}>✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className={styles.backdrop}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};
