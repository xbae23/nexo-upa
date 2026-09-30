import type { Metadata } from "next";
import "./globals.css";
import "./design-2026.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
