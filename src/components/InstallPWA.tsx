import React, { useState, useEffect } from 'react';
import { Download, X, Share, Smartphone, CheckCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const checkStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (checkStandalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Handle beforeinstallprompt event (Android / Desktop Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show banner on iOS if not dismissed before
    if (isAppleDevice && !checkStandalone) {
      const dismissed = localStorage.getItem('pwa_ios_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
        setInstalled(true);
        setShowBanner(false);
      } else {
        console.log('User dismissed the PWA install prompt');
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Error launching PWA install prompt:', err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (isIOS) {
      localStorage.setItem('pwa_ios_banner_dismissed', 'true');
    }
  };

  if (isStandalone || !showBanner || installed) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 p-0.5 shadow-md flex-shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Smart Health Guide"
                className="w-full h-full object-cover rounded-[10px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                <span>Smart Health Guide</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-medium px-2 py-0.5 rounded-full border border-teal-500/30">
                  App
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Install as an app for fast access and offline health guide.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 flex items-center gap-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-medium text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>Install Smart Health Guide</span>
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Install on iPhone / iPad</h3>
                <p className="text-xs text-slate-400">Add Smart Health Guide to Home Screen</p>
              </div>
            </div>

            <ol className="space-y-3.5 text-xs text-slate-300 my-4">
              <li className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-teal-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">1</span>
                <div>
                  <span>Tap the <strong>Share button</strong> in Safari’s navigation bar.</span>
                  <div className="mt-1 flex items-center text-teal-400 gap-1 font-medium">
                    <Share className="w-4 h-4 inline" /> <span>Share Icon</span>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-teal-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">2</span>
                <div>
                  <span>Scroll down the menu options and select <strong>'Add to Home Screen'</strong>.</span>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-teal-400 flex items-center justify-center text-[11px] font-bold flex-shrink-0">3</span>
                <div>
                  <span>Tap <strong>'Add'</strong> in the top right corner. Smart Health Guide will appear on your home screen!</span>
                </div>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium py-2.5 rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
