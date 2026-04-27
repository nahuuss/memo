import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeMoOoTV - Ultra Low Latency",
  description: "Experience the stream with the best quality and lowest latency possible.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
