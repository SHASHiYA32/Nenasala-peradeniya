'use client';

import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
import { NavProvider } from '../context/NavContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NavProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
    </NavProvider>
  );
}