export default function SecurityPage() {
    return (
        <div className="animation-fade-in">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Security & Oracles</h1>
            <p className="text-xl text-foreground/60 mb-8 border-b border-white/10 pb-8">
                Institutional-grade security protocols and trustless infrastructure powering the Modus platform.
            </p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">Decentralized Oracles: The Pyth Network Integration</h2>
            <p className="text-foreground/80 mb-4">
                Accurate, sub-second pricing data is the lifeblood of decentralized finance. Modus integrates exclusively with the <strong>Pyth Network</strong> to secure our clearinghouse and limit orders.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/80 mb-8">
                <li><strong>Sub-second Latency:</strong> Pyth provides high-fidelity, confidence-interval-backed price feeds on Solana every 400ms.</li>
                <li><strong>Confidence Intervals:</strong> Prices are supplied with a confidence band protecting users during periods of extreme volatility by auto-adjusting spread tolerances.</li>
                <li><strong>No Front-running:</strong> On-demand price updates ensure that MEV bots cannot exploit stale pricing data.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">Smart Contract Audits</h2>
            <p className="text-foreground/80">
                All Modus on-chain programs are heavily audited before deployment. Our "Defense in Depth" philosophy requires multiple independent reviews. We partner with Tier-1 auditing firms to ensure all isolated margin, routing, and token programs are formally verified.
            </p>
            <div className="glass-panel p-6 my-6 border border-white/10 rounded-xl bg-white/[0.02]">
                <h3 className="text-lg font-medium text-white mb-2">Bug Bounty Program</h3>
                <p className="text-sm text-foreground/70">
                    Modus operates an active bug bounty program on Immunefi with up to $1,000,000 available for critical vulnerability disclosures affecting user funds.
                </p>
            </div>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-white">Treasury & Multi-Sig Operations</h2>
            <p className="text-foreground/80">
                Administrative keys and treasury assets are secured using <strong>Squads Protocol</strong>. Any upgrade to the protocol or movement of treasury funds requires a 4-of-7 multi-signature consensus among trusted community delegates and the core founding team.
            </p>

            <div className="mt-12 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                <strong>Mission Statement:</strong> We prioritize user capital preservation above all else. Velocity of development is critical, but it will never come at the expense of infrastructure safety.
            </div>
        </div>
    );
}
