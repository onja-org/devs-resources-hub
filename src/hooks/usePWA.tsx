'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to detect if the app is running as an installed PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if running as iOS PWA
    const isIOSPWA = (window.navigator as any).standalone === true;
    
    // Check if app is in fullscreen mode
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    
    const isPWAMode = isStandalone || isIOSPWA || isFullscreen;
    
    setIsPWA(isPWAMode);
    setIsInstalled(isPWAMode);

    // Log for debugging
    if (isPWAMode) {
      console.log('🎉 Running as installed PWA');
    }
  }, []);

  return { isPWA, isInstalled };
}

/**
 * Hook to detect if PWA installation is available
 */
export function useCanInstallPWA() {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  return canInstall;
}

/**
 * Hook to get PWA install prompt
 */
export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const promptInstall = async () => {
    if (!prompt) return false;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      setPrompt(null);
      return true;
    }
    
    return false;
  };

  return { prompt, promptInstall, canInstall: !!prompt };
}

/**
 * Component to show PWA status indicator (for debugging)
 */
export function PWAStatus() {
  const { isPWA } = useIsPWA();
  const { canInstall } = useInstallPrompt();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-lg">
      <div>PWA: {isPWA ? '✅' : '❌'}</div>
      <div>Installable: {canInstall ? '✅' : '❌'}</div>
    </div>
  );
}
