'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Unlock, ShieldAlert, MonitorX } from 'lucide-react';
import { useAuth } from '@shared/providers/AuthProvider';

interface KioskModeProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const KioskMode = ({ children, enabled = true }: KioskModeProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isKioskMode, setIsKioskMode] = useState(enabled);
  const [exitAttempts, setExitAttempts] = useState(0);
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent common exit shortcuts
  useEffect(() => {
    if (!isKioskMode) return;

    const preventExitShortcuts = (e: KeyboardEvent) => {
      // Prevent F11 (fullscreen), Alt+F4, Ctrl+Shift+I (DevTools), etc.
      if (
        e.key === 'F11' ||
        (e.altKey && e.key === 'F4') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J') ||
        (e.ctrlKey && e.key === 'U') ||
        (e.key === 'Escape' && showExitPrompt) // Prevent ESC from closing prompt
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (enabled) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (enabled) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', preventExitShortcuts);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('dragover', handleDragOver);

    return () => {
      window.removeEventListener('keydown', preventExitShortcuts);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, [isKioskMode, showExitPrompt]);

  // Handle exit attempts
  const handleExitAttempt = useCallback(() => {
    setExitAttempts(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setShowExitPrompt(true);
      }
      return newCount;
    });

    // Reset counter after 5 seconds
    setTimeout(() => {
      setExitAttempts(0);
    }, 5000);
  }, []);

  // Exit kiosk mode with admin credentials
  const exitKioskMode = useCallback(() => {
    // Strictly check for authorized roles
    if (user?.role === 'OWNER' || user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
      setIsKioskMode(false);
      setShowExitPrompt(false);
      setExitAttempts(0);
    } else {
      alert('Access Denied. You must be logged in as an Admin or Owner to exit Kiosk Mode.');
    }
  }, [user]);

  // If kiosk mode is disabled, render children normally
  if (!isKioskMode) {
    return <>{children}</>;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Kiosk overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-red-500"
        >
          <div className="text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Kiosk Mode Active</h2>
            <p className="text-gray-600 mb-6">
              This terminal is locked in kiosk mode. Only authorized personnel can exit.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <MonitorX className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-700 font-medium">Exit Attempts: {exitAttempts}/3</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitPrompt(false)}
                  className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => exitKioskMode()}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock size={18} />
                  Exit Kiosk
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Render the actual content behind the overlay */}
      <div
        className="relative z-10 h-full"
        onClick={handleExitAttempt}
        onMouseMove={handleExitAttempt}
        onKeyDown={(e) => {
          if (e.key !== 'Tab') handleExitAttempt();
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default KioskMode;