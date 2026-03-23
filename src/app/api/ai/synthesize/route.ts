import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { config, equippedItems } = body;
        
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ 
                success: false, 
                error: "OPENAI_API_KEY is missing in your .env.local file! Please add it to enable dynamic, real-time 3D synthesis of the exact character." 
            }, { status: 400 });
        }

        // Parse user traits
        const skinTone = config?.skinColor?.[0] || "medium";
        const clothing = config?.clothing || "casual clothes";
        const clothingColor = config?.clothesColor?.[0] || "dark";
        const hair = config?.top || "short hair";
        const hairColor = config?.hairColor?.[0] || "dark";
        const facialHair = config?.facialHair !== "none" ? config?.facialHair : "clean shaven";
        const accessories = config?.accessories !== "none" ? config?.accessories : "no accessories";

        // Build a hyper-specific prompt based on the 2D configuration
        const prompt = `A premium, hyper-realistic, high-quality 3D render of a character for a modern Web3 game, waist up. 
The character has skin tone hex #${skinTone}. 
They have ${hair} style hair colored hex #${hairColor}.
They are ${facialHair}. 
They are wearing ${clothing} (colored hex #${clothingColor}) and ${accessories}. 
Cinematic studio lighting, clean solid dark background, 8k resolution, stylized like a premium vinyl toy or Pixar character. exactly matching the provided traits.`;

        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "url"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenAI Error:", data);
            return NextResponse.json({ success: false, error: data.error?.message || "OpenAI generation failed" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            layeredAvatarUrl: data.data[0].url
        });
    } catch (error) {
        console.error("Synthesis error:", error);
        return NextResponse.json({ success: false, error: "Synthesis failed unexpectedly." }, { status: 500 });
    }
}
