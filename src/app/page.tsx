import { StatCards } from "@/components/dashboard/StatCards";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { DataTable } from "@/components/dashboard/DataTable";
import { PriceWidget } from "@/components/dashboard/PriceWidget";

export default function DashboardPage() {
  return (
    <div className="min-h-screen p-6 pt-24 max-w-7xl mx-auto space-y-6">

      {/* Header section with brand typography */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          Dashboard <span className="text-glow text-brand-primary">Overview</span>
        </h1>
        <p className="text-foreground/60 text-lg">Your DeFi command center for the Solana Ecosystem.</p>
      </div>

      {/* Top Stat Cards row */}
      <StatCards />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Wider */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          <div className="h-[400px]">
            <PriceWidget />
          </div>
          <div className="flex-1 min-h-[400px]">
            <DataTable />
          </div>
        </div>

        {/* Right Column - Narrower */}
        <div className="space-y-6 flex flex-col">
          <div className="h-full">
            <LiveActivityFeed />
          </div>
        </div>

      </div>
    </div>
  );
}
