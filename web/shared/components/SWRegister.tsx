"use client";

import { useEffect } from 'react';

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('Service worker registered:', registration);
        },
        (error) => {
          console.log('Service worker registration failed:', error);
        }
      );
    }
  }, []);

  return null;
}