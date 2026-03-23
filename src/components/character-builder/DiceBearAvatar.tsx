"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { openPeeps } from "@dicebear/collection";
import { motion } from "framer-motion";

interface DiceBearAvatarProps {
    seed: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    // Base avatar configuration
    config?: any;
    // Fallbacks just in case we need to know what they are wearing from the shop
    equippedItems?: {
        head: number | null,
        body: number | null,
        weapon: number | null
    }
}

export default function DiceBearAvatar({ seed, width = "100%", height = "100%", className = "", config, equippedItems }: DiceBearAvatarProps) {
    const avatarSvg = useMemo(() => {
        // Prepare options with default fallbacks if no config is passed
        const options: Record<string, any> = { seed };

        if (config) {
            // Map the old avataaar colors to open-peeps body
            if (config.skinColor) options.skinColor = config.skinColor;
            if (config.clothesColor) options.clothingColor = config.clothesColor;
            if (config.hairColor) options.hairColor = config.hairColor;
            
            // Map shape properties if they perfectly overlap (most don't, so open-peeps will gracefully ignore invalid shapes and use default or seed-based)
            if (config.top) options.head = [config.top];
            if (config.clothing) options.body = [config.clothing];
            if (config.mouth) options.face = [config.mouth];
            if (config.accessories && config.accessories !== 'none') options.accessory = [config.accessories];
            
            options.backgroundColor = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
        } else {
            // Default look if no config yet
            options.skinColor = ["edb98a"];
            options.backgroundColor = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
        }

        // We can still override things based on their equipped Forge Items if we want
        // For example, if they equip the Titanium Shell, force the clothing to be a grey sweater
        if (equippedItems?.body === 5) {
            options.clothing = ["collarAndSweater"];
            options.clothesColor = ["a5b1c2"];
        }
        if (equippedItems?.body === 4) {
            options.body = ["blazerAndShirt", "tShirt"];
            options.clothingColor = ["262e33"];
        }

        const avatar = createAvatar(openPeeps, options as any);
        return avatar.toString();
    }, [seed, config, equippedItems]);

    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative ${className}`}
        >
            <img src={svgDataUrl} alt="Avatar" style={{ width, height }} className="object-contain w-full h-full drop-shadow-xl" />
        </motion.div>
    );
}
