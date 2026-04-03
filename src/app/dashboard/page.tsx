// . trigger rebuild
import Dashboard from "@/components/dashboard/Dashboard";
import { StatCards } from "@/components/dashboard/StatCards";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { DataTable } from "@/components/dashboard/DataTable";
import { PriceWidget } from "@/components/dashboard/PriceWidget";

export default function DashboardPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
            <div>
                <h1 className="text-3xl font-bold font-heading text-white mb-2">Command Center</h1>
                <p className="text-foreground/60">Overview of your Web3 journey and character progression.</p>
            </div>

            {/* Original Dashboard Code */}
            <Dashboard />

            {/* New DeFi Dashboard Extensions */}
            <div className="pt-8 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">DeFi Analytics</h2>
                <StatCards />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        <div className="h-[400px]">
                            <PriceWidget />
                        </div>
                        <div className="flex-1 min-h-[400px]">
                            <DataTable />
                        </div>
                    </div>

                    <div className="space-y-6 flex flex-col">
                        <div className="h-full">
                            <LiveActivityFeed />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
