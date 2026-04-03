export default function TokenomicsPage() {
    return (
        <div className="animation-fade-in">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Tokenomics</h1>
            <p className="text-xl text-foreground/60 mb-8 border-b border-white/10 pb-8">
                The economic engine powering the Modus ecosystem, designed for long-term sustainability and value accrual.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">1. Core Utility</h2>
            <p className="text-foreground/80">
                The <strong>$MODUS</strong> token serves as the foundational utility and governance vehicle for the protocol. It aligns the incentives of liquidity providers, active traders, and protocol developers.
                Holders can stake their tokens to receive veMODUS, granting them voting rights on parameter adjustments and revenue sharing from protocol fees.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">2. Token Distribution</h2>
            <div className="glass-panel p-6 my-6 border border-white/10 rounded-xl bg-white/[0.02]">
                <ul className="space-y-4">
                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-medium text-foreground/90">Community & Rewards</span>
                        <span className="text-brand-primary font-semibold">45%</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-medium text-foreground/90">Core Contributors</span>
                        <span className="text-brand-secondary font-semibold">20%</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-medium text-foreground/90">Ecosystem Fund / Treasury</span>
                        <span className="text-white font-semibold">20%</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="font-medium text-foreground/90">Strategic Investors</span>
                        <span className="text-brand-primary font-semibold">10%</span>
                    </li>
                    <li className="flex justify-between items-center">
                        <span className="font-medium text-foreground/90">Initial Liquidity</span>
                        <span className="text-white font-semibold">5%</span>
                    </li>
                </ul>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">3. Deflationary Mechanisms</h2>
            <p className="text-foreground/80">
                To ensure institutional-grade economics, Modus implements a programmatic buyback-and-burn mechanism. 20% of all priority fees captured by the routing engine and 15% of exchange fees are allocated to periodically purchase $MODUS on the open market and permanently remove it from circulation.
            </p>

            <div className="mt-12 p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary/90 text-sm">
                <strong>Note:</strong> Modus smart contracts and economic models undergo continuous auditing. Vesting schedules for core contributors are strictly enforced on-chain via Squads multi-signature wallets.
            </div>
        </div>
    );
}
