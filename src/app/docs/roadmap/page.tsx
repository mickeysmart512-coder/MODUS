export default function RoadmapPage() {
    const quarters = [
        {
            q: "Q1",
            title: "Foundation & Liquidity",
            status: "Active",
            items: [
                "Deployment of the highly optimized V1 Routing Engine.",
                "Integration of Helius Priority Fee architecture for flawless execution.",
                "Launch of the institutional-grade Dashboard interface.",
                "Initial liquidity bootstrapping and community outreach."
            ]
        },
        {
            q: "Q2",
            title: "Advanced Trading Primitives",
            status: "Upcoming",
            items: [
                "Implementation of trailing stop-losses and Dollar Cost Averaging (DCA) vaults.",
                "Launch of the Modus Analytics terminal (Whale watching, volume analysis).",
                "Integration of Pyth Network TWAP (Time-Weighted Average Price) feeds.",
                "First major Smart Contract Audit completion and publication."
            ]
        },
        {
            q: "Q3",
            title: "Tokenomics & Governance",
            status: "Planned",
            items: [
                "TGE (Token Generation Event) for the $MODUS token.",
                "Launch of the veMODUS staking module for protocol fee sharing.",
                "On-chain governance forum initialization via Solana Realms.",
                "Cross-chain messaging exploration (Wormhole integration)."
            ]
        },
        {
            q: "Q4",
            title: "Ecosystem Expansion",
            status: "Planned",
            items: [
                "Release of the Modus Mobile SDK for third-party developers.",
                "Margin trading features utilizing isolated lending pools.",
                "Institutional market maker onboarding program.",
                "Tier-1 Centralized Exchange (CEX) listings."
            ]
        }
    ];

    return (
        <div className="animation-fade-in">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Roadmap (Next 4 Quarters)</h1>
            <p className="text-xl text-foreground/60 mb-12 border-b border-white/10 pb-8">
                Our strategic vision for transforming the Solana DeFi landscape.
            </p>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-brand-primary before:via-brand-secondary before:to-transparent">
                {quarters.map((quarter, idx) => (
                    <div key={quarter.q} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        {/* Timeline dot */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-brand-surface shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110">
                            <span className="w-3 h-3 rounded-full bg-brand-primary shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
                        </div>

                        {/* Content Card */}
                        <div className="glass-panel border border-white/10 p-6 rounded-xl w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] hover:bg-white/[0.04] transition-colors relative">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-brand-primary font-bold text-lg">{quarter.q}: {quarter.title}</h3>
                                <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-semibold ${quarter.status === 'Active'
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse'
                                        : 'bg-white/5 text-foreground/50 border border-white/10'
                                    }`}>
                                    {quarter.status}
                                </span>
                            </div>
                            <ul className="list-disc pl-5 space-y-1.5 text-foreground/70 text-sm">
                                {quarter.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
