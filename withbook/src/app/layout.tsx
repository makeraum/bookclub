import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * 아이콘은 public/logo의 PNG 하나로 통일합니다.
 * ?v=2는 캐시 무효화용 — 아이콘을 다시 바꾸면 이 숫자를 올리세요.
 * (manifest.json의 아이콘 경로에도 같은 값을 맞춰야 합니다)
 */
const ICON_VERSION = "2";

export const metadata: Metadata = {
  title: "WithBook — 책으로 만나는 기록",
  description: "책을 기록하고, 나누는 곳. 당신의 서재가 이야기가 되고, 이야기가 인연이 됩니다.",
  manifest: `/manifest.json?v=${ICON_VERSION}`,
  icons: {
    icon: [
      { url: `/favicon.ico?v=${ICON_VERSION}`, sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: `/logo/withbook-icon-32.png?v=${ICON_VERSION}`, sizes: "32x32", type: "image/png" },
      { url: `/logo/withbook-icon-192.png?v=${ICON_VERSION}`, sizes: "192x192", type: "image/png" },
      { url: `/logo/withbook-icon-512.png?v=${ICON_VERSION}`, sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: `/favicon.ico?v=${ICON_VERSION}` }],
    apple: [
      { url: `/logo/withbook-icon-180.png?v=${ICON_VERSION}`, sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WithBook",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
      </body>
    </html>
  );
}
