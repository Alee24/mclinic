import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "M-Clinic - Healthcare Management Platform",
  description: "Comprehensive healthcare management platform for Kenya. Book appointments, access lab results, and manage your health.",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "M-Clinic",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

import { ThemeProvider } from "@/components/ThemeProvider";
import PWAInstallButton from "@/components/PWAInstallButton";
import PanicSystem from "@/components/PanicSystem";
import { PWAProvider } from "@/providers/PWAProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
        >
          <AuthProvider>
            <PWAProvider>
              <PWAInstallButton />
              <PanicSystem />
              <Toaster position="top-center" reverseOrder={false} />
              {children}
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
