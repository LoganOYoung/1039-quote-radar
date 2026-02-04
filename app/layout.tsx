import type { Metadata, Viewport } from "next";
import "./globals.css";
import WechatVisitLogger from "@/components/WechatVisitLogger";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "1039报价雷达",
  description: "发报价链接，客户一点开你马上知道，还能锁汇率、控查看。",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "1039报价雷达",
    description: "发报价链接，客户一点开你马上知道，还能锁汇率、控查看。",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "报价雷达",
  },
  formatDetection: { telephone: false, email: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#064e3b" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen app-shell">
        <WechatVisitLogger />
        {children}
        <AppNav />
      </body>
    </html>
  );
}
