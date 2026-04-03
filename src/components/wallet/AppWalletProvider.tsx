"use client";

import { useMemo, useCallback } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletError } from "@solana/wallet-adapter-base";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

import { useAuthStore } from "@/store/useAuthStore";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";

function WalletConnectionSync() {
    const { publicKey, connected } = useWallet();
    const { setWallet, isXConnected, hasFollowedProject } = useAuthStore();

    useEffect(() => {
        // Automatically sync connected state
        if (connected && publicKey) {
            setWallet(publicKey.toString());
        } else if (!connected) {
            setWallet(null);
        }
    }, [connected, publicKey, setWallet]);

    return null;
}

export default function AppWalletProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // You can also provide a custom RPC endpoint
    const endpoint = useMemo(() => clusterApiUrl("devnet"), []);

    const wallets = useMemo(
        () => [
            // While modern providers like Phantom support Wallet Standard and don't strictly require these legacy adapter classes,
            // defining them here ensures they show up as options even if not immediately detected.
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [endpoint]
    );

    const onError = useCallback((error: WalletError) => {
        // Suppress MetaMask wallet connection errors that happen when Solana Wallet Adapter scans for injected providers
        if (error.name === 'WalletConnectionError' && error.message.includes('MetaMask')) {
            return;
        }

        console.error("Wallet Error:", error);

        if (error.name === 'WalletConnectionError' && error.message === 'Unexpected error') {
            // "Unexpected error" might happen if wallet popup is blocked, extensions conflict, or the extension needs to be unlocked.
            console.warn("Wallet Connection Warning:", error.message);
            // We use a more subtle warning or just let the user try again manually if autoConnect fails
            // alert("Connection error: Please ensure your Phantom/Solflare extension is installed, unlocked, and not blocked by popups. Try refreshing the page.");
        }
    }, []);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider
                wallets={wallets}
                autoConnect
                onError={onError}
            >
                <WalletModalProvider>
                    <WalletConnectionSync />
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
