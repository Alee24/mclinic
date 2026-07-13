'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';

interface MpesaMiniAppContextType {
    isMiniApp: boolean;
    sdkLoaded: boolean;
    payInvoice: (invoiceId: number, amount: number, invoiceNumber: string) => void;
    getMiniAppAuthCode: () => Promise<string | null>;
    closeMiniApp: () => void;
}

const MpesaMiniAppContext = createContext<MpesaMiniAppContextType>({
    isMiniApp: false,
    sdkLoaded: false,
    payInvoice: () => {},
    getMiniAppAuthCode: async () => null,
    closeMiniApp: () => {},
});

export function MpesaMiniAppProvider({ children }: { children: ReactNode }) {
    const [isMiniApp, setIsMiniApp] = useState(false);
    const [sdkLoaded, setSdkLoaded] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check query param, sessionStorage, or userAgent
        const params = new URLSearchParams(window.location.search);
        const platformParam = params.get('platform');
        const miniappParam = params.get('miniapp');
        const isSessionMpesa = sessionStorage.getItem('isMpesaMiniApp') === 'true';
        const isUserAgentMpesa = /MiniProgram|AlipayClient/i.test(navigator.userAgent);

        const checkMiniApp = 
            platformParam === 'mpesa' || 
            miniappParam === 'true' || 
            isSessionMpesa || 
            isUserAgentMpesa;

        if (checkMiniApp) {
            setIsMiniApp(true);
            sessionStorage.setItem('isMpesaMiniApp', 'true');

            // Inject Alipay/M-Pesa Mini Program JS SDK for web-views
            if (!document.getElementById('mpesa-webview-sdk')) {
                const script = document.createElement('script');
                script.id = 'mpesa-webview-sdk';
                script.src = 'https://appx/web-view.min.js';
                script.onload = () => {
                    console.log('M-Pesa Webview SDK loaded successfully.');
                    setSdkLoaded(true);
                };
                script.onerror = () => {
                    console.warn('Failed to load M-Pesa Webview SDK. Running in mock/fallback mode.');
                    // Set sdkLoaded to true anyway to allow fallback postMessage or testing
                    setSdkLoaded(true);
                };
                document.head.appendChild(script);
            } else {
                setSdkLoaded(true);
            }

            // Check for SSO auth token in query parameters
            const queryToken = params.get('token');
            if (queryToken) {
                localStorage.setItem('token', queryToken);
                // Fetch user profile and save to local storage
                api.get('/auth/profile').then(async (res) => {
                    if (res && res.ok) {
                        const userData = await res.json();
                        localStorage.setItem('user', JSON.stringify(userData));
                        // Clean up query param from URL without reload
                        params.delete('token');
                        const cleanSearch = params.toString();
                        window.history.replaceState(
                            {}, 
                            '', 
                            window.location.pathname + (cleanSearch ? `?${cleanSearch}` : '')
                        );
                        // Trigger page refresh to update auth state globally
                        window.location.reload();
                    }
                }).catch(err => {
                    console.error('Failed to log in via token parameter:', err);
                });
            }
        }
    }, []);

    // Helper to send messages to the host Mini Program
    const postMessageToHost = (data: any) => {
        // @ts-ignore
        const my = window.my;
        if (my && typeof my.postMessage === 'function') {
            my.postMessage({ data });
        } else {
            console.warn('my.postMessage is not available in this environment. Simulating:', data);
        }
    };

    // Trigger native payment overlay
    const payInvoice = (invoiceId: number, amount: number, invoiceNumber: string) => {
        postMessageToHost({
            action: 'pay',
            invoiceId,
            amount,
            invoiceNumber
        });
    };

    // Retrieve authentication code from host
    const getMiniAppAuthCode = (): Promise<string | null> => {
        return new Promise((resolve) => {
            // @ts-ignore
            const my = window.my;
            if (my && typeof my.getAuthCode === 'function') {
                my.getAuthCode({
                    scopes: 'auth_base',
                    success: (res: any) => {
                        resolve(res.authCode || null);
                    },
                    fail: (err: any) => {
                        console.error('getAuthCode failed:', err);
                        resolve(null);
                    }
                });
            } else {
                console.warn('my.getAuthCode is not available. Simulating in sandbox.');
                resolve('test_code');
            }
        });
    };

    // Close the webview and navigate back
    const closeMiniApp = () => {
        // @ts-ignore
        const my = window.my;
        if (my && typeof my.navigateBack === 'function') {
            my.navigateBack();
        } else {
            window.close();
        }
    };

    return (
        <MpesaMiniAppContext.Provider value={{ isMiniApp, sdkLoaded, payInvoice, getMiniAppAuthCode, closeMiniApp }}>
            {children}
        </MpesaMiniAppContext.Provider>
    );
}

export const useMpesaMiniApp = () => useContext(MpesaMiniAppContext);
