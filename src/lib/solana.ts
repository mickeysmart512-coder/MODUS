import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const MODUS_PROGRAM_ID = new PublicKey('11111111111111111111111111111111'); // Mock IDL for now
export const TREASURY_WALLET = new PublicKey('DpRwzmkkR13rnnAFWU7Uy4UDSqgEM2GiUTPoBzXQatzN');

/**
 * Helper to convert a string like "400 MOD" into a flat SOL equivalent.
 * For testing, we use a very cheap conversion rate so users don't spend much.
 * 100 MOD = 0.001 SOL
 */
function calculateSolCostFromModString(priceStr: string): number {
    const modValueMatch = priceStr.match(/\d+/);
    if (!modValueMatch) return 0.001; // fallback default

    const modInt = parseInt(modValueMatch[0], 10);
    return (modInt / 100) * 0.001;
}

export async function createUpgradeTransaction(
    connection: Connection,
    walletPublicKey: PublicKey,
    itemPrice: number,
    treasuryAddress: string
): Promise<Transaction> {

    // Usually 1 SOL = large amount, for test we assume itemPrice is the SOL amount directly
    // or we divide by whatever conversion rate. Let's assume itemPrice is in SOL if crypto.
    const lamports = Math.floor(itemPrice * LAMPORTS_PER_SOL);
    const targetWallet = new PublicKey(treasuryAddress);

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: walletPublicKey,
            toPubkey: targetWallet,
            lamports: lamports,
        })
    );

    // Set fee payer and blockhash
    transaction.feePayer = walletPublicKey;
    const { blockhash } = await connection.getLatestBlockhash('finalized');
    transaction.recentBlockhash = blockhash;

    return transaction;
}
