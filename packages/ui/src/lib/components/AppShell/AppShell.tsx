import type { ReactNode } from 'react';

export interface AppShellProps {
  title: string;
  nav?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function AppShell({ title, nav, children, footer }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background bg-[radial-gradient(1200px_600px_at_6%_-10%,rgb(254_215_170/0.35),transparent_60%),radial-gradient(900px_500px_at_90%_0%,rgb(191_219_254/0.4),transparent_55%)] font-sans text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/60 px-6 py-4 backdrop-blur-md">
        <div
          className="font-display text-lg font-semibold uppercase tracking-[0.08em]"
          data-testid="app-title"
        >
          {title}
        </div>
        {nav ? <nav className="flex gap-3 text-sm text-muted-foreground">{nav}</nav> : null}
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pt-8 pb-10">{children}</main>

      <footer className="flex justify-center border-t px-6 py-3 text-xs text-muted-foreground">
        {footer ?? <span>Powered by NBA Analytics Hub</span>}
      </footer>
    </div>
  );
}
