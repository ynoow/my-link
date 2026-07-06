import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    template: "%s | MyLink",
    default: "MyLink - One Link to Rule Them All",
  },
  description: "단 3초만에 로그인하고, 나만의 멋진 프로필 페이지를 만들어 세상에 공유하세요.",
  keywords: ["멀티링크", "프로필 링크", "링크트리", "인스타그램 링크", "바이오 링크", "MyLink"],
  metadataBase: new URL("https://my-link.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "MyLink",
    title: "MyLink - One Link to Rule Them All",
    description: "단 3초만에 로그인하고, 나만의 멋진 프로필 페이지를 만들어 세상에 공유하세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyLink - One Link to Rule Them All",
    description: "단 3초만에 로그인하고, 나만의 멋진 프로필 페이지를 만들어 세상에 공유하세요.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", inter.variable)}>
      <body
        className={`antialiased`}
      >
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
