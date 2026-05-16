import type { Metadata, Viewport } from "next";
import "./globals.css";
// Font variables removed due to Docker build environment connectivity issues
const inter = { variable: 'font-inter' };
const outfit = { variable: 'font-outfit' };

export const metadata: Metadata = {
  title: "M-Clinic - Healthcare Management Platform",
  description: "Comprehensive healthcare management platform for Kenya. Book appointments, access lab results, and manage your health.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "M-Clinic",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/ThemeProvider";

import PanicSystem from "@/components/PanicSystem";
import MedicLocationFab from "@/components/MedicLocationFab";
import { PWAProvider } from "@/providers/PWAProvider";
import { MedicDashboardProvider } from "@/context/MedicDashboardContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const activeTheme = theme === 'system' ? systemTheme : theme;
                if (activeTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans transition-colors duration-300`}
      >
        {/* @ts-ignore */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
        >
          <AuthProvider>
            <PWAProvider>
              <MedicDashboardProvider>
                <PanicSystem />
                <MedicLocationFab />
                <Toaster position="top-center" reverseOrder={false} />
                {children}
              </MedicDashboardProvider>
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
