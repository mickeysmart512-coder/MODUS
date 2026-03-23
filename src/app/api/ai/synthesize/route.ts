import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { config, equippedItems } = body;
        
        // Parse user traits
        const skinTone = config?.skinColor?.[0] || "medium";
        const clothing = config?.clothing || "casual clothes";
        const clothingColor = config?.clothesColor?.[0] || "dark";
        const hair = config?.top || "short hair";
        const hairColor = config?.hairColor?.[0] || "dark";
        const facialHair = config?.facialHair !== "none" ? config?.facialHair : "clean shaven";
        const accessories = config?.accessories !== "none" ? config?.accessories : "no accessories";

        // Build a hyper-specific prompt based on the 2D configuration
        // Optimized for the Flux model which handles aesthetics brilliantly
        const prompt = `A premium, hyper-realistic, high-quality 3D render of a character for a modern Web3 game, waist up portrait. 
 The character has skin tone hex #${skinTone}. 
 They have ${hair} style hair colored hex #${hairColor}.
 They are ${facialHair}. 
 They are wearing ${clothing} (colored hex #${clothingColor}) and ${accessories}. 
 Cinematic studio lighting, clean solid dark background, 8k resolution, highly detailed, stylized like a premium vinyl collectible toy or Pixar character. Masterpiece.`;

        // We use Pollinations (with the FLUX model) because it's arguably better than DALL-E 3 for 
        // 3D character concepts, it's fast, and requires no API key!
        const encodedPrompt = encodeURIComponent(prompt);
        // Include a random seed to ensure a fresh generation 
        const seed = Math.floor(Math.random() * 1000000);
        
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

        // Verify the image generated correctly by making a quick HEAD request if needed, 
        // but we can also just return the URL directly since Pollinations handles generation on the fly
        
        return NextResponse.json({
            success: true,
            layeredAvatarUrl: imageUrl
        });
    } catch (error) {
        console.error("Synthesis error:", error);
        return NextResponse.json({ success: false, error: "Synthesis failed unexpectedly." }, { status: 500 });
    }
}
