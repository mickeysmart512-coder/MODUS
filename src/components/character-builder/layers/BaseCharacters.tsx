import React from 'react';

// Shared Gradients & Filters
export const SvgDefs = () => (
    <defs>
        {/* Skin Gradients */}
        <linearGradient id="skinBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />    {/* light yellow/amber */}
            <stop offset="100%" stopColor="#d97706" />  {/* warm shading */}
        </linearGradient>

        <linearGradient id="skinFemale" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />    {/* soft peach */}
            <stop offset="100%" stopColor="#c2410c" />  {/* warm orange/brown shading */}
        </linearGradient>

        <linearGradient id="fabricDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="fabricLight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Drop Shadow Filter for depth */}
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>
        <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#fff" floodOpacity="0.3" />
        </filter>
    </defs>
);

export const MaleBase = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <SvgDefs />
        <g id="male-base" filter="url(#dropShadow)">
            {/* Back Arm (Left) */}
            <path d="M 120 180 Q 90 280 100 350 Q 110 360 125 350 Q 115 280 140 190 Z" fill="url(#skinBase)" />

            {/* Back Leg (Left) */}
            <path d="M 150 350 L 140 520 Q 135 540 150 540 L 165 540 Q 170 520 175 350 Z" fill="url(#skinBase)" />

            {/* Torso */}
            <path d="M 140 170 Q 200 160 260 170 C 270 200 280 250 250 330 C 230 360 170 360 150 330 C 120 250 130 200 140 170 Z" fill="url(#skinBase)" />
            {/* Chest Definition */}
            <path d="M 160 220 Q 200 240 240 220" stroke="#b45309" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
            <path d="M 200 230 L 200 300" stroke="#b45309" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round" />

            {/* Front Leg (Right) */}
            <path d="M 190 350 L 195 530 Q 195 550 215 550 L 235 550 Q 240 530 230 350 Z" fill="url(#skinBase)" />

            {/* Front Arm (Right) */}
            <path d="M 260 180 Q 290 260 270 360 Q 255 370 245 355 Q 260 260 235 190 Z" fill="url(#skinBase)" />

            {/* Default Shorts (Underwear) */}
            <path d="M 135 320 Q 200 340 265 320 L 255 380 Q 230 390 210 380 Q 200 370 190 380 Q 170 390 145 380 Z" fill="url(#fabricDark)" />
            <path d="M 135 320 Q 200 340 265 320" stroke="#0f172a" strokeWidth="4" fill="none" />

            {/* Neck & Head */}
            <rect x="180" y="140" width="40" height="40" rx="10" fill="url(#skinBase)" />
            <path d="M 150 80 C 150 30 250 30 250 80 C 255 120 230 160 200 160 C 170 160 145 120 150 80 Z" fill="url(#skinBase)" />

            {/* Hair */}
            <path d="M 140 70 C 140 20 200 0 250 40 C 260 60 260 90 250 100 C 250 60 180 30 140 70 Z" fill="#1e293b" />
            <path d="M 150 50 Q 170 20 210 30 Q 190 40 170 60 Z" fill="#334155" />

            {/* Face Features */}
            {/* Eyebrows */}
            <path d="M 165 75 Q 180 70 190 75" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 210 75 Q 220 70 235 75" stroke="#1e293b" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="178" cy="90" r="5" fill="#0f172a" />
            <circle cx="222" cy="90" r="5" fill="#0f172a" />
            <circle cx="180" cy="88" r="1.5" fill="#fff" />
            <circle cx="224" cy="88" r="1.5" fill="#fff" />
            {/* Nose */}
            <path d="M 200 95 L 200 110 L 195 110" stroke="#b45309" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            {/* Mouth */}
            <path d="M 185 130 Q 200 140 215 130" stroke="#b45309" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
    </svg>
);

export const FemaleBase = () => (
    <svg viewBox="0 0 400 600" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <SvgDefs />
        <g id="female-base" filter="url(#dropShadow)">
            {/* Back Arm (Left) */}
            <path d="M 130 180 Q 110 260 120 340 Q 130 350 140 340 Q 130 260 150 190 Z" fill="url(#skinFemale)" />

            {/* Back Leg (Left) */}
            <path d="M 160 360 L 155 520 Q 150 540 165 540 L 175 540 Q 180 520 185 360 Z" fill="url(#skinFemale)" />

            {/* Torso & Hips (Hourglass curve) */}
            <path d="M 150 170 Q 200 170 250 170 C 260 210 230 260 240 320 C 255 360 230 380 200 380 C 170 380 145 360 160 320 C 170 260 140 210 150 170 Z" fill="url(#skinFemale)" />

            {/* Chest Definition */}
            <path d="M 160 210 C 160 240 195 240 195 210" fill="url(#skinFemale)" stroke="#ea580c" strokeWidth="1" opacity="0.5" />
            <path d="M 205 210 C 205 240 240 240 240 210" fill="url(#skinFemale)" stroke="#ea580c" strokeWidth="1" opacity="0.5" />

            {/* Front Leg (Right) */}
            <path d="M 195 360 L 200 520 Q 200 540 215 540 L 225 540 Q 235 520 225 360 Z" fill="url(#skinFemale)" />

            {/* Front Arm (Right) */}
            <path d="M 250 180 Q 275 260 260 350 Q 248 358 240 348 Q 255 260 235 190 Z" fill="url(#skinFemale)" />

            {/* Default Top (Underwear) */}
            <path d="M 150 170 C 160 210 190 220 200 190 C 210 220 240 210 250 170 Q 200 185 150 170 Z" fill="url(#fabricLight)" />

            {/* Default Shorts (Underwear) */}
            <path d="M 155 320 Q 200 340 245 320 C 255 360 230 365 200 365 C 170 365 145 360 155 320 Z" fill="url(#fabricLight)" />

            {/* Neck & Head */}
            <rect x="185" y="140" width="30" height="40" rx="10" fill="url(#skinFemale)" />
            <path d="M 155 80 C 150 30 250 30 245 80 C 250 120 225 155 200 155 C 175 155 150 120 155 80 Z" fill="url(#skinFemale)" />

            {/* Hair (Long sleek violet) */}
            <path d="M 140 80 C 130 0 270 0 260 80 C 270 180 280 200 250 180 C 240 100 230 110 240 100 C 240 30 160 30 160 100 C 170 110 160 100 150 180 C 120 200 130 180 140 80 Z" fill="#6d28d9" filter="url(#dropShadow)" />
            <path d="M 160 20 Q 200 10 240 40 Q 200 30 160 50 Z" fill="#8b5cf6" />

            {/* Face Features */}
            {/* Eyebrows (Arched) */}
            <path d="M 165 70 Q 180 60 190 70" stroke="#4c1d95" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 210 70 Q 220 60 235 70" stroke="#4c1d95" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Eyes (Lashes) */}
            <circle cx="178" cy="85" r="5" fill="#0f172a" />
            <circle cx="222" cy="85" r="5" fill="#0f172a" />
            <circle cx="180" cy="83" r="1.5" fill="#fff" />
            <circle cx="224" cy="83" r="1.5" fill="#fff" />
            {/* Eyelashes */}
            <path d="M 170 82 Q 178 78 185 82" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 215 82 Q 222 78 230 82" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Nose */}
            <path d="M 200 95 L 200 105 L 195 105" stroke="#ea580c" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
            {/* Mouth (Fuller lips) */}
            <path d="M 185 125 Q 200 135 215 125 Q 200 120 185 125" fill="#be123c" />
            <path d="M 185 125 Q 200 135 215 125 Q 200 140 185 125" fill="#e11d48" />
        </g>
    </svg>
);
