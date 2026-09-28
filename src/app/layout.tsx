import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "KAKA KH SHOP | Fresh Cambodian Produce & Delicacies 🇰🇭",
  description: "Telegram MiniApp & Online Shop for Fresh Cambodian Fruits, Food & Drinks",
  applicationName: "KAKA KH SHOP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KAKA KH SHOP",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased min-h-screen selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
