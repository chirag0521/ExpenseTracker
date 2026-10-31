import { useState, useEffect, useCallback } from 'react';

export function usePwa() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isPersisted, setIsPersisted] = useState(false);

  useEffect(() => {
    // 1. Request persistent storage on first load
    if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persisted) => {
        setIsPersisted(persisted);
        console.log(`[Storage] Persistent storage granted: ${persisted}`);
      }).catch((err) => {
        console.warn('[Storage] Failed to request persistent storage:', err);
      });
    }

    // 2. Capture install prompt (PWA Add to Home Screen)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 3. Register service worker and listen for updates
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('./sw.js').then((registration) => {
        // If an updated worker is already waiting
        if (registration.waiting) {
          setNeedRefresh(true);
        }

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New update available!
                setNeedRefresh(true);
              } else if (newWorker.state === 'installed') {
                setOfflineReady(true);
              }
            });
          }
        });
      }).catch((err) => {
        console.warn('[PWA] Service worker registration failed:', err);
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const updateServiceWorker = useCallback(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  }, []);

  const promptInstall = useCallback(() => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          console.log('[PWA] User accepted home screen install');
        }
        setInstallPrompt(null);
      });
    }
  }, [installPrompt]);

  return {
    needRefresh,
    offlineReady,
    canInstall: Boolean(installPrompt),
    isPersisted,
    updateServiceWorker,
    promptInstall
  };
}
