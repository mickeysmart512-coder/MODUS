"use client";

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaars } from "@dicebear/collection";
import { motion } from "framer-motion";

interface AvatarTraits {
    skinColor: string;
    hair: string;
    hairColor: string;
    facialHair: string;
    clothing: string;
    clothingColor: string;
    eyes: string;
    eyebrows: string;
    mouth: string;
    accessories: string;
}

interface DiceBearAvatarProps {
    seed: string;
    width?: number | string;
    height?: number | string;
    className?: string;
    avatarTraits?: AvatarTraits;
    equippedItems?: {
        head: number | null,
        body: number | null,
        weapon: number | null
    };
    powerLevel?: number;
}

// Fallback default traits perfectly matching Bitmoji baseline
const defaultTraits: AvatarTraits = {
    skinColor: "pale",
    hair: "shortHairShortFlat",
    hairColor: "brownDark",
    facialHair: "blank",
    clothing: "hoodie",
    clothingColor: "black",
    eyes: "happy",
    eyebrows: "defaultNatural",
    mouth: "smile",
    accessories: "blank",
};

export default function DiceBearAvatar({ 
    seed, 
    width = "100%", 
    height = "100%", 
    className = "", 
    avatarTraits = defaultTraits,
    equippedItems 
}: DiceBearAvatarProps) {
    
    const avatarSvg = useMemo(() => {
        let activeClothing = avatarTraits.clothing;
        let activeClothingColor = avatarTraits.clothingColor;
        let activeAccessories = avatarTraits.accessories;

        // Dynamic Overrides for Web3 Items
        // Keep the base clothes mostly, but override if they wear full armor
        if (equippedItems?.body === 4) { activeClothing = "shirtCrewNeck"; activeClothingColor = "black"; }
        if (equippedItems?.body === 5) { activeClothing = "collarSweater"; activeClothingColor = "gray01"; }
        if (equippedItems?.head === 1 || equippedItems?.head === 2) {
            // Give them cool sunglasses under their glowing visor
            activeAccessories = "sunglassesWayfarer";
        }

        const avatar = createAvatar(avataaars, {
            seed,
            backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
            skinColor: [avatarTraits.skinColor],
            top: [avatarTraits.hair], 
            hairColor: [avatarTraits.hairColor],
            facialHair: [avatarTraits.facialHair],
            clothing: [activeClothing],
            clothingColor: [activeClothingColor],
            eyes: [avatarTraits.eyes],
            eyebrows: [avatarTraits.eyebrows],
            mouth: [avatarTraits.mouth],
            accessories: [activeAccessories]
        });

        return avatar.toString();
    }, [seed, avatarTraits, equippedItems]);

    // Create a data URL from the SVG string
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`relative ${className}`}
        >
            <img src={svgDataUrl} alt="Avatar" style={{ width, height }} className="object-contain w-full h-full drop-shadow-2xl" />
        </motion.div>
    );
}
