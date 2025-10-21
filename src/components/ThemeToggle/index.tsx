import { MdDarkMode, MdLightMode } from 'react-icons/md';

import { useTheme } from '../../hooks/useTheme';

import styles from './themeToggle.module.css';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={styles.toggle}
    >
      <span className={styles.iconWrapper} data-active={isDark}>
        <MdDarkMode size={18} />
      </span>
      <span className={styles.iconWrapper} data-active={!isDark}>
        <MdLightMode size={18} />
      </span>
      <span className={styles.knob} data-theme={theme} />
    </button>
  );
};
