"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { micah } from "@dicebear/collection";
import { motion } from "framer-motion";

interface DiceBearAvatarProps {
    seed: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    equippedItems?: {
        head: number | null,
        body: number | null,
        weapon: number | null
    }
}

export default function DiceBearAvatar({ seed, width = "100%", height = "100%", className = "", equippedItems }: DiceBearAvatarProps) {
    const avatarSvg = useMemo(() => {
        // We dynamically adjust the base Micah avatar depending on their exact equipped item
        // Even though we will ALSO render the glowing SVG items on top, changing the base 
        // clothing color or adding glasses makes the integration feel more complete.
        
        let clothing = ["collared"];
        let clothingColor = ["black"];
        let glasses: ("round" | "square")[] = [];

        // Plasma Core => Black Shirt
        if (equippedItems?.body === 4) { clothingColor = ["black"]; clothing = ["open"]; }
        // Titanium Shell => Gray Crew
        if (equippedItems?.body === 5) { clothingColor = ["grey"]; clothing = ["crew"]; }
        
        // Neon Visor => Square Glasses
        if (equippedItems?.head === 1) glasses = ["square"];
        // Cyber Helm => Round Glasses
        if (equippedItems?.head === 2) glasses = ["round"];

        const avatar = createAvatar(micah, {
            seed,
            backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
            clothing,
            clothingColor,
            glasses,
        });

        return avatar.toString();
    }, [seed, equippedItems]);

    // Create a data URL from the SVG string
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative ${className}`}
        >
            <img src={svgDataUrl} alt="Avatar" style={{ width, height }} className="object-contain w-full h-full drop-shadow-xl" />
        </motion.div>
    );
}
