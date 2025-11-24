import type { ReactNode } from 'react';
import styles from './AppShell.module.css';

export interface AppShellProps {
  title: string;
  nav?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ title, nav, children, footer }: AppShellProps) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand} data-testid="app-title">{title}</div>
        {nav ? <nav className={styles.nav}>{nav}</nav> : null}
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        {footer ?? <span>Powered by NBA Analytics Hub</span>}
      </footer>
    </div>
  );
}

export default AppShell;
