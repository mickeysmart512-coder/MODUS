"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
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
            if (config.skinColor) options.skinColor = config.skinColor;
            if (config.top) options.top = [config.top];
            if (config.hairColor) options.hairColor = config.hairColor;
            if (config.clothing) options.clothing = [config.clothing];
            if (config.clothesColor) options.clothesColor = config.clothesColor;
            if (config.eyes) options.eyes = [config.eyes];
            if (config.eyebrows) options.eyebrows = [config.eyebrows];
            if (config.mouth) options.mouth = [config.mouth];
            if (config.facialHair && config.facialHair !== "none") {
                options.facialHair = [config.facialHair];
                options.facialHairProbability = 100;
            } else {
                options.facialHairProbability = 0;
            }

            if (config.facialHairColor) options.facialHairColor = config.facialHairColor;

            if (config.accessories && config.accessories !== "none") {
                options.accessories = [config.accessories];
                options.accessoriesProbability = 100;
            } else {
                options.accessoriesProbability = 0;
            }
            if (config.accessoriesColor) options.accessoriesColor = config.accessoriesColor;
            options.backgroundColor = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
        } else {
            // Default look if no config yet
            options.skinColor = ["edb98a"];
            options.top = ["shortFlat"];
            options.clothing = ["hoodie"];
            options.backgroundColor = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
        }

        // We can still override things based on their equipped Forge Items if we want
        // For example, if they equip the Titanium Shell, force the clothing to be a grey sweater
        if (equippedItems?.body === 5) {
            options.clothing = ["collarAndSweater"];
            options.clothesColor = ["a5b1c2"];
        }
        if (equippedItems?.body === 4) {
            options.clothing = ["blazerAndShirt"];
            options.clothesColor = ["262e33"];
        }

        const avatar = createAvatar(avataaars, options as any);
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
