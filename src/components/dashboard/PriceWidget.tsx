export function PriceWidget() {
    return (
        <div className="glass-panel flex flex-col h-full overflow-hidden h-[400px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-sm font-semibold text-white tracking-wide">Market Overview (SOL/USD)</h2>
                <span className="text-xs text-brand-secondary font-medium tracking-wide">Powered by Birdeye</span>
            </div>
            <div className="flex-1 w-full bg-[#0a0a0a]">
                <iframe
                    width="100%"
                    height="100%"
                    src="https://birdeye.so/tv-widget/So11111111111111111111111111111111111111112?chain=solana&viewMode=pair&theme=dark"
                    frameBorder="0"
                    allowFullScreen
                    title="Birdeye Chart"
                    className="grayscale-[0.2] contrast-[1.1]"
                ></iframe>
            </div>
        </div>
    );
}
