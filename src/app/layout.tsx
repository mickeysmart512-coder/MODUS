import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import TopNav from "@/components/layout/TopNav";
import AppWalletProvider from "@/components/wallet/AppWalletProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MODUS - Web3 Character Platform",
  description: "Tap-to-Earn Web3 Character Building Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-brand-background text-foreground`}
      >
        <AppWalletProvider>
          <TopNav />
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
