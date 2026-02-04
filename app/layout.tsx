import type { Metadata, Viewport } from "next";
import "./globals.css";
import WechatVisitLogger from "@/components/WechatVisitLogger";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "1039报价雷达",
  description: "让你的报价单会说话 — 客户点开链接，实时查看动态",
  manifest: "/manifest.webmanifest",
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
