import React from 'react';

// Reusable Filters & Gradients for Equipment
const EquipmentDefs = () => (
    <defs>
        <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="metalDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id="plasma" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#be185d" />
        </linearGradient>
        <filter id="neonShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="15" floodColor="#10b981" floodOpacity="0.8" />
        </filter>
        <filter id="voidShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="20" floodColor="#8b5cf6" floodOpacity="0.9" />
        </filter>
        <filter id="plasmaGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#f43f5e" floodOpacity="0.9" />
        </filter>
    </defs>
);

// ==== HEADWEAR (IDs 1, 2, 3) ==== //

// 1. Neon Visor: wrap around the head area (y=80-90, x=150-250)
export const NeonVisorLayer = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full absolute inset-0 z-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <EquipmentDefs />
        <g filter="url(#neonShadow)">
            {/* Main Strap */}
            <path d="M 145 90 C 170 110 230 110 255 90 L 250 75 C 230 90 170 90 150 75 Z" fill="#0f172a" />
            {/* Glowing Visor Glass */}
            <path d="M 155 85 C 180 100 220 100 245 85 L 240 78 C 220 90 180 90 160 78 Z" fill="url(#neonGlow)" />
            {/* Specular Highlight */}
            <path d="M 165 80 C 180 88 190 88 200 80" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>
    </svg>
);

// 2. Cyber Helm: Full helmet enclosing the 150-250 radius
export const CyberHelmLayer = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full absolute inset-0 z-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <EquipmentDefs />
        {/* Helmet Base Dome */}
        <path d="M 140 100 C 140 20 260 20 260 100 C 265 140 230 165 200 165 C 170 165 135 140 140 100 Z" fill="url(#metalDark)" />
        {/* Sci-fi paneling lines */}
        <path d="M 150 50 C 180 40 220 40 250 50" stroke="#0f172a" strokeWidth="3" fill="none" />
        <path d="M 200 25 L 200 130" stroke="#0f172a" strokeWidth="3" fill="none" />
        <circle cx="150" cy="100" r="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        <circle cx="250" cy="100" r="15" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        {/* Visor Screen */}
        <path d="M 155 90 C 170 120 230 120 245 90 L 235 70 C 210 90 190 90 165 70 Z" fill="#0ea5e9" opacity="0.9" />
        <path d="M 175 80 L 190 80" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
);

// ==== ARMOR (IDs 4, 5) ==== //

// 4. Plasma Core: Center of chest (x=200, y=220)
export const PlasmaCoreLayer = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full absolute inset-0 z-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <EquipmentDefs />
        {/* Chest Plate holding the core */}
        <path d="M 150 180 Q 200 160 250 180 L 260 250 L 200 300 L 140 250 Z" fill="url(#metalDark)" />
        {/* Metal Trim */}
        <path d="M 150 180 Q 200 160 250 180" stroke="#0f172a" strokeWidth="6" fill="none" />
        <path d="M 140 250 L 200 300 L 260 250" stroke="#0f172a" strokeWidth="6" fill="none" strokeLinejoin="round" />
        {/* The Core Orb */}
        <g filter="url(#plasmaGlow)" className="animate-pulse">
            <circle cx="200" cy="230" r="30" fill="url(#plasma)" />
            <circle cx="200" cy="230" r="15" fill="#fff" opacity="0.8" />
        </g>
    </svg>
);

// 5. Titanium Shell: Heavy overlapping plates covering torso
export const TitaniumShellLayer = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full absolute inset-0 z-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <EquipmentDefs />
        {/* Neck piece */}
        <rect x="175" y="145" width="50" height="25" rx="5" fill="#64748b" />

        {/* Upper Chest Plate */}
        <path d="M 140 180 Q 200 160 260 180 L 270 230 Q 200 250 130 230 Z" fill="url(#metalDark)" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
        {/* Mid Plate */}
        <path d="M 134 220 Q 200 260 266 220 L 260 280 Q 200 300 140 280 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
        {/* Abdomen Plate */}
        <path d="M 142 270 Q 200 310 258 270 L 245 330 Q 200 350 155 330 Z" fill="url(#metalDark)" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />

        {/* Left shoulder pad */}
        <path d="M 120 180 C 130 150 160 160 140 200 C 100 220 100 190 120 180 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
        {/* Right shoulder pad */}
        <path d="M 280 180 C 270 150 240 160 260 200 C 300 220 300 190 280 180 Z" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
    </svg>
);

// ==== WEAPONS (ID 6) ==== //

// 6. Void Blade: Floating or held in the right hand (x=260, y=280)
export const VoidBladeLayer = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full absolute inset-0 z-50 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <EquipmentDefs />
        <g style={{ transformOrigin: '280px 320px', animation: 'float-weapon 4s ease-in-out infinite' }}>
            {/* The Blade Handle */}
            <rect x="270" y="320" width="16" height="60" rx="4" fill="url(#metalDark)" stroke="#0f172a" strokeWidth="2" />
            <rect x="260" y="310" width="36" height="15" rx="2" fill="#0f172a" />

            {/* Energy Blade with huge Void Shadow */}
            <g filter="url(#voidShadow)">
                <path d="M 270 310 L 286 310 L 286 100 L 278 60 L 270 100 Z" fill="#c4b5fd" />
                {/* Core White Energy */}
                <path d="M 275 310 L 281 310 L 281 120 L 278 80 L 275 120 Z" fill="#ffffff" />
            </g>
        </g>
        <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes float-weapon {
                0%, 100% { transform: translateY(0px) rotate(15deg); }
                50% { transform: translateY(-15px) rotate(15deg); }
            }
        `}} />
    </svg>
);
