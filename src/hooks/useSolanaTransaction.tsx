import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    VersionedTransaction,
    TransactionInstruction,
    TransactionMessage,
    ComputeBudgetProgram
} from '@solana/web3.js';
import toast from 'react-hot-toast';

export type TransactionStatus =
    | 'idle'
    | 'preparing'
    | 'signing'
    | 'sending'
    | 'confirming'
    | 'success'
    | 'error';

interface PriorityFeeResponse {
    id: string;
    jsonrpc: string;
    result: {
        priorityFeeLevels?: {
            min: number;
            low: number;
            medium: number;
            high: number;
            veryHigh: number;
            unsafeMax: number;
        };
    };
}

const ToastWithLink = ({ title, txSignature, message }: { title: string, txSignature?: string, message?: string }) => (
    <div className= "flex flex-col" >
    <span className="font-semibold" > { title } </span>
{ message && <span className="text-sm opacity-80" > { message } </span> }
{
    txSignature && (
        <a 
                href={ `https://solscan.io/tx/${txSignature}` }
    target = "_blank"
    rel = "noreferrer"
    className = "text-brand-primary hover:text-brand-secondary underline text-xs mt-1 transition-colors"
        >
        View on Solscan
            </a>
        )
}
</div>
);

export function useSolanaTransaction() {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const [status, setStatus] = useState<TransactionStatus>('idle');
    const [signature, setSignature] = useState<string | null>(null);

    const getHeliusPriorityFee = async (): Promise<number> => {
        try {
            const response = await fetch(connection.rpcEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'helius-priority-fee',
                    method: 'getPriorityFeeEstimate',
                    params: [{ "options": { "includeAllPriorityFeeLevels": true } }],
                }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data: PriorityFeeResponse = await response.json();
            return Math.floor(data.result?.priorityFeeLevels?.high || 100000);
        } catch (error) {
            console.warn('Failed to fetch priority fee, using fallback:', error);
            return 100000;
        }
    };

    const executeTransaction = useCallback(
        async (instructions: TransactionInstruction[], onSuccess?: (sig: string) => void) => {
            if (!publicKey || !signTransaction) {
                toast.error("Wallet not connected");
                return;
            }

            let txSignature: string | undefined;

            try {
                setStatus('preparing');
                setSignature(null);

                const priorityFee = await getHeliusPriorityFee();
                const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: priorityFee,
                });

                const finalInstructions = [computePriceIx, ...instructions];
                const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

                const messageV0 = new TransactionMessage({
                    payerKey: publicKey,
                    recentBlockhash: blockhash,
                    instructions: finalInstructions,
                }).compileToV0Message();

                const transaction = new VersionedTransaction(messageV0);

                setStatus('signing');
                toast.loading(
                    <ToastWithLink title="Awaiting Signature" message = "Please sign the transaction in your wallet..." />,
                    { id: 'tx-toast' }
                );

                const signedTx = await signTransaction(transaction);

                setStatus('sending');
                toast.loading(<ToastWithLink title="Sending Transaction..." />, { id: 'tx-toast' });

                txSignature = await connection.sendRawTransaction(signedTx.serialize(), {
                    skipPreflight: false,
                    maxRetries: 3,
                    preflightCommitment: 'confirmed'
                });

                setSignature(txSignature);

                setStatus('confirming');
                toast.loading(
                    <ToastWithLink title="Confirming Transaction..." txSignature = { txSignature } />,
                    { id: 'tx-toast' }
                );

                const confirmation = await connection.confirmTransaction({
                    signature: txSignature,
                    blockhash,
                    lastValidBlockHeight
                }, 'confirmed');

                if (confirmation.value.err) {
                    throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
                }

                setStatus('success');
                toast.success(
                    <ToastWithLink title="Transaction Confirmed!" txSignature = { txSignature } />,
                    { id: 'tx-toast' }
                );
                if (onSuccess) onSuccess(txSignature);

                return txSignature;

            } catch (error: any) {
                let errorMessage = 'An unknown error occurred';

                if (error?.message) {
                    const msg = error.message.toLowerCase();
                    if (msg.includes('user rejected')) {
                        errorMessage = 'Transaction rejected by user.';
                    } else if (msg.includes('slippage') || msg.includes('custom program error: 0x11')) {
                        errorMessage = 'Slippage tolerance exceeded. Please adjust your settings.';
                    } else if (msg.includes('simulation failed')) {
                        errorMessage = 'Simulation failed. The transaction would fail on-chain.';
                    } else if (msg.includes('blockhash not found')) {
                        errorMessage = 'Blockhash expired. Please try again.';
                    } else {
                        errorMessage = error.message;
                    }
                }

                setStatus('error');
                toast.error(
                    <ToastWithLink title="Transaction Failed" message = { errorMessage } txSignature = { txSignature } />,
                    { id: 'tx-toast', duration: 5000 }
                );
                console.error("Transaction Error:", error);
                throw error;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [connection, publicKey, signTransaction]
    );

    return {
        executeTransaction,
        status,
        signature
    };
}
