import type { Metadata } from "next";
import "./globals.css";
import "./design-2026.css";
import "./reference-feed.css";
import "./reference-chat.css";
import "./reference-story.css";
import "./reference-discover.css";
import "./reference-account.css";
import "./tokens.css";
import "./components.css";

export const metadata: Metadata = {
  title: "Nexo UPA · La red de tu comunidad",
  description: "Comparte, descubre y conecta con la comunidad de la Universidad Politécnica de Atlautla.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f8faf9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
