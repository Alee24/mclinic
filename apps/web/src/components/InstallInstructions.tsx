'use client';

import { useState, useEffect } from 'react';
import { FiX, FiShare, FiPlus, FiDownload } from 'react-icons/fi';

/**
 * Component to show installation instructions for iOS and Android
 * Appears when PWA is not installed and user is on mobile
 */
export default function InstallInstructions() {
    const [showInstructions, setShowInstructions] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;

        if (isStandalone || isIOSStandalone) {
            setIsInstalled(true);
            return;
        }

        // Detect device type
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iOS = /iphone|ipad|ipod/.test(userAgent);
        const android = /android/.test(userAgent);

        setIsIOS(iOS);
        setIsAndroid(android);

        // Check if user has dismissed instructions before
        const dismissed = localStorage.getItem('pwa-instructions-dismissed');
        const dismissedTime = dismissed ? parseInt(dismissed) : 0;
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

        // Show instructions if:
        // 1. On mobile (iOS or Android)
        // 2. Not installed
        // 3. Not dismissed in last 24 hours
        if ((iOS || android) && !isInstalled && dismissedTime < oneDayAgo) {
            // Show after 3 seconds to not overwhelm user
            setTimeout(() => {
                setShowInstructions(true);
            }, 3000);
        }
    }, []);

    const handleDismiss = () => {
        setShowInstructions(false);
        localStorage.setItem('pwa-instructions-dismissed', Date.now().toString());
    };

    const handleNeverShow = () => {
        setShowInstructions(false);
        localStorage.setItem('pwa-instructions-dismissed', (Date.now() + (365 * 24 * 60 * 60 * 1000)).toString());
    };

    if (!showInstructions || isInstalled) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" />

            {/* Modal */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[101] max-w-md mx-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#00C65E] to-[#1B4D3E] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />

                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <FiX className="w-5 h-5" />
                        </button>

                        <div className="relative">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                                <FiDownload className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Install M-Clinic App</h2>
                            <p className="text-white/90 text-sm">Get instant access from your home screen</p>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-6 space-y-6">
                        {isIOS && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                                            Tap the Share button
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                                <FiShare className="w-4 h-4 text-white" />
                                            </div>
                                            <span>at the bottom of Safari</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                                            Select "Add to Home Screen"
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <FiPlus className="w-4 h-4" />
                                            </div>
                                            <span>Scroll down if needed</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-400 font-bold">
                                        3
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                                            Tap "Add" to confirm
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            The app icon will appear on your home screen
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isAndroid && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400 font-bold">
                                        1
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                                            Tap the menu (⋮) in Chrome
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Located at the top-right corner
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400 font-bold">
                                        2
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                                            Select "Add to Home screen" or "Install app"
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <FiPlus className="w-4 h-4 text-white" />
                                            </div>
                                            <span>Look for this option</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 text-green-600 dark:text-green-400 font-bold">
                                        3
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 dark:text-gray-200 font-medium mb-1">
                                            Confirm installation
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            The app will be added to your home screen
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Benefits */}
                        <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <span className="text-green-600 dark:text-green-400">✓</span>
                                Why install?
                            </h3>
                            <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Instant access from home screen
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Works offline
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    Faster performance
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                    No app store required
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 flex gap-3">
                        <button
                            onClick={handleNeverShow}
                            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            Don't show again
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00C65E] to-[#1B4D3E] text-white rounded-xl font-bold hover:from-[#00A850] hover:to-[#164030] transition-all shadow-lg"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
