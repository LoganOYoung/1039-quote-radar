import type { Metadata } from "next";
import "./globals.css";
import WechatVisitLogger from "@/components/WechatVisitLogger";

export const metadata: Metadata = {
  title: "1039报价雷达",
  description: "让你的报价单会说话 — 客户点开链接，实时查看动态",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen">
        <WechatVisitLogger />
        {children}
      </body>
    </html>
  );
}
