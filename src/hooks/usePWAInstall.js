import { useState, useEffect } from 'react';

const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = localStorage.getItem('pwa-installed') === 'true' ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsInstalled(isAppInstalled);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the default browser prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle appinstalled event to mark as installed
    const handleAppInstalled = () => {
      localStorage.setItem('pwa-installed', 'true');
      setIsInstalled(true);
      setDeferredPrompt(null); // Clear the prompt
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  return { canInstall: !!deferredPrompt && !isInstalled, promptInstall };
};

export default usePWAInstall;