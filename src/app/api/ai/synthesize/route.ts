import { NextResponse } from 'next/server';

// Helper to map known hex codes to descriptive names for the AI prompt
const getColorName = (hex: string, type: 'skin' | 'hair' | 'clothes') => {
    const skinMap: Record<string, string> = { "ffdbb4": "pale", "edb98a": "light", "d08b5b": "medium", "ae5d29": "tan", "614335": "dark", "98dca8": "alien green" };
    const hairMap: Record<string, string> = { "2c1b18": "black", "724133": "brown", "d6b370": "blonde", "ece9e2": "platinum", "a55728": "red", "8672a7": "purple", "f59797": "pink", "4a7ebb": "blue" };
    const clothesMap: Record<string, string> = { "262e33": "black", "929598": "grey", "ffffff": "white", "ff5c5c": "red", "65c9ff": "blue", "a5e975": "green", "ffafb9": "pink", "ffa35c": "orange", "b19aff": "purple" };
    
    const cleanHex = hex.replace('#', '');
    if (type === 'skin') return skinMap[cleanHex] || "medium skin tone";
    if (type === 'hair') return hairMap[cleanHex] || "dark";
    return clothesMap[cleanHex] || "dark-colored";
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { config, equippedItems } = body;
        
        // Parse user traits and map to descriptive names for better AI understanding
        const skinTone = getColorName(config?.skinColor?.[0] || "d08b5b", 'skin');
        const clothing = config?.clothing || "casual clothes";
        const clothingColor = getColorName(config?.clothesColor?.[0] || "262e33", 'clothes');
        const hair = config?.top || "short hair";
        const hairColor = getColorName(config?.hairColor?.[0] || "2c1b18", 'hair');
        const facialHair = config?.facialHair !== "none" ? config?.facialHair : "clean shaven";
        const accessories = config?.accessories !== "none" ? config?.accessories : "no accessories";

        // Build a hyper-specific prompt based on the 2D configuration
        // Optimized for the Flux model which handles aesthetics brilliantly
        const prompt = `A premium, hyper-realistic, high-quality 3D render of a character for a modern Web3 game, waist up portrait. 
 The character has ${skinTone} skin. 
 They have ${hair} style hair colored ${hairColor}.
 They are ${facialHair}. 
 They are wearing ${clothingColor} ${clothing} and ${accessories}. 
 Cinematic studio lighting, clean solid dark background, 8k resolution, highly detailed, stylized like a premium vinyl collectible toy or Pixar character. Masterpiece.`;

        // We use Pollinations (with the FLUX model) because it's arguably better than DALL-E 3 for 
        // 3D character concepts, it's fast, and requires no API key!
        const encodedPrompt = encodeURIComponent(prompt.trim());
        const seed = Math.floor(Math.random() * 1000000);
        
        // The /p/ endpoint is the most stable direct-access image URL for Pollinations
        const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;

        return NextResponse.json({
            success: true,
            layeredAvatarUrl: imageUrl
        });
    } catch (error) {
        console.error("Synthesis error:", error);
        return NextResponse.json({ success: false, error: "Synthesis failed unexpectedly." }, { status: 500 });
    }
}
