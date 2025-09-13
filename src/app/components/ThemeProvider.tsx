'use client';

import React from 'react';
import { CssBaseline } from '@mui/material';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <>
      <CssBaseline />
      {children}
    </>
  );
}