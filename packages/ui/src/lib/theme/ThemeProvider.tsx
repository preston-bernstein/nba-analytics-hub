import type { ReactNode } from 'react';

export interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Thin wrapper for future global theming (e.g. MUI, Tailwind, Chakra).
 * For now it just renders children.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
}
