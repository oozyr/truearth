import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TRUEARTH — Real-Time Global Intelligence",
  description: "Unbiased global intelligence dashboard with real-time news aggregation, live market data, and interactive 3D/2D visualization. No BS, straight to source.",
  keywords: ["global intelligence", "OSINT", "news dashboard", "market data", "3D globe", "geopolitics"],
  openGraph: {
    title: "TRUEARTH — Real-Time Global Intelligence",
    description: "Unbiased global intelligence dashboard with live news, markets, and interactive visualization.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#000511" />
      </head>
      <body className="min-h-full h-full flex flex-col overflow-hidden m-0 p-0 bg-[#000511]">{children}</body>
    </html>
  );
}
