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
  const isEnvMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-brand-background text-foreground`}
      >
        {isEnvMissing && (
          <div className="fixed top-0 left-0 w-full z-[100] bg-brand-accent text-white px-4 py-2 text-center text-xs font-bold uppercase tracking-widest animate-pulse border-b border-white/20">
            ⚠️ Deployment Warning: Supabase Credentials Missing. Run 'vercel env pull .env.local' to sync.
          </div>
        )}
        <AppWalletProvider>
          <TopNav />
          <div className={isEnvMissing ? "pt-10" : ""}>
            {children}
          </div>
        </AppWalletProvider>
      </body>
    </html>
  );
}
