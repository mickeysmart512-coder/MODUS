/**
 * Chronos Trilogy: The Master Script (150-Day Campaign)
 */

export interface SeasonProtocol {
    name: string;
    vibe: string;
    opening: string[];
    fragments: string[];
    finale_title: string;
    finale_fragment: string;
    finale_briefing: string[];
    finale_success: string[];
    finale_failure: string[];
}

export const CHRONOS_TRILOGY: Record<number, SeasonProtocol> = {
    1: {
        name: "The Aegis Protocol",
        vibe: "High-stakes recovery / Despair",
        opening: [
            "Welcome back, Sentinel. The grid is dark, and the Time-Eaters are here.",
            "We have exactly 50 days to assemble the Aegis Weapon or our history is deleted.",
            "Each día, you must recover a fragment of the weapon blueprints. Good luck."
        ],
        fragments: ["Nexus Core", "Plasma Emitter", "Targeting Lens", "Chrono-Battery", "Trigger Mechanism"],
        finale_title: "The Final Stand",
        finale_fragment: "The Aegis Overload",
        finale_briefing: [
            "THIS IS IT, SENTINEL. THE FINAL PIECE.",
            "The maze is surging with ultra-fast Chronos entities. They know the Aegis is almost complete.",
            "If we fail today, the timeline collapses. Defend the core with everything you have!"
        ],
        finale_success: ["UNBELIEVABLE! Aegis Weapon is fully functional. Phase 1 Survivor badge awarded. Prepare for Season 2."],
        finale_failure: ["Command to Sentinel... the Aegis overloaded... we lost you. Sentinel is MIA. Timeline breached."]
    },
    2: {
        name: "Shadow of the Nexus",
        vibe: "Rebellion / Stealth / Guerrilla War",
        opening: [
            "Initialize new unit... Sentinel V2 online.",
            "Welcome back, soldier. You aren't the first to try this, but you must be the last.",
            "The aliens have occupied our grid. We're fighting from the shadows now.",
            "Our objective: Build the Resistance Network by recovering Encryption Keys and Data Nodes."
        ],
        fragments: ["Encryption Key", "Data Node", "Signal Jammer", "Network Relay", "Stealth Link"],
        finale_title: "The Deep Breach",
        finale_fragment: "The Alien Hive Key",
        finale_briefing: [
            "We are entering the heart of the Alien Hive. It is crawling with high-density temporal entities.",
            "The difficulty is extreme. Secure the Hive Key or the resistance dies tonight.",
            "Sentinel V2, do not let us down."
        ],
        finale_success: ["Breach successful! We've planted the virus. Resistance holds for now."],
        finale_failure: ["Signal lost. Unit V2 has been consumed by the Chronos-Void. Initializing final contingency..."]
    },
    3: {
        name: "The Eradication",
        vibe: "God-Mode / All-out War / Hunter",
        opening: [
            "Sentinel V3 initialized. Final Protocol: ERADICATE.",
            "This unit is built for one thing—ending this war once and for all.",
            "You aren't running anymore; you are hunting. Collect Omega Charges to power the final blast."
        ],
        fragments: ["Omega Charge", "Fusion Core", "Dark Matter Cell", "Targeting Matrix", "Detonation Clip"],
        finale_title: "The Grand Finale",
        finale_fragment: "The Paradox Bomb",
        finale_briefing: [
            "THE END IS HERE. THE PARADOX BOMB REQIRES FINAL ACTIVATION.",
            "Every alien in the timeline is converging on your position. Wipe them out.",
            "Eradicate the threat. Reclaim our future!"
        ],
        finale_success: ["VICTORY! The Chronos-Aliens are wiped from the timeline. Peace restored."],
        finale_failure: ["Critical Failure! Paradox loop initiated. The war restarts tomorrow..."]
    }
};

/**
 * Generates 50 days of unique missions for a specific season starting from a given date.
 */
export function generateSeasonMissions(seasonId: number, startDate: Date) {
    const protocol = CHRONOS_TRILOGY[seasonId];
    if (!protocol) return [];

    const missions = [];

    for (let day = 1; day <= 50; day++) {
        const activeDate = new Date(startDate);
        activeDate.setDate(startDate.getDate() + (day - 1));
        const dateStr = activeDate.toISOString().split('T')[0];

        if (day === 50) {
            // FINALE MISSION
            missions.push({
                active_date: dateStr,
                title: protocol.finale_title,
                fragment_name: protocol.finale_fragment,
                briefing_dialogue: protocol.finale_briefing,
                success_dialogue: protocol.finale_success,
                failure_dialogue: protocol.finale_failure
            });
        } else if (day === 1) {
            // OPENING MISSION
            missions.push({
                active_date: dateStr,
                title: `${protocol.name}: Initialization`,
                fragment_name: protocol.fragments[0],
                briefing_dialogue: protocol.opening,
                success_dialogue: [`${protocol.fragments[0]} secured. Phase 1 protocol initiated.`],
                failure_dialogue: [`System reboot required. Initialization failed.`]
            });
        } else {
            // INTERMEDIATE MISSIONS (Daily Grind)
            const fragIndex = (day - 1) % protocol.fragments.length;
            const fragment = protocol.fragments[fragIndex];
            
            missions.push({
                active_date: dateStr,
                title: `${protocol.name}: Day ${day}`,
                fragment_name: fragment,
                briefing_dialogue: [
                    `Sector ${day} secured. Proceeding to next node.`,
                    `We need the ${fragment} for the seasonal objective. Watch for alien scouts.`,
                    `Good luck, Sentinel. Time is running out.`
                ],
                success_dialogue: [`${fragment} secured. Good work.`],
                failure_dialogue: [`Mission failed. Try again tomorrow.`]
            });
        }
    }

    return missions;
}
