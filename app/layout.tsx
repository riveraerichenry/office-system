import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Treasury Management Systems",
  description: "Treasury Management Systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}