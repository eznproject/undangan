import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Invitation System - Sistem Undangan Digital dengan QR Code",
  description: "Sistem undangan digital profesional dengan QR Code unik untuk manajemen tamu acara",
  keywords: ["E-Invitation", "QR Code", "Undangan Digital", "Manajemen Tamu", "Check-in", "Next.js"],
  authors: [{ name: "E-Invitation Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "E-Invitation System",
    description: "Sistem undangan digital profesional dengan QR Code",
    url: "https://chat.z.ai",
    siteName: "E-Invitation",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          src="https://unpkg.com/html5-qrcode"
          async
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
