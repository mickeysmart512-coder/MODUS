import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const newItems = [
            { name: "Neon Shades", description: "Sleek glowing eyewear for the metaverse", price: 300, currency_type: 'credits', image_url: "", power_bonus: 15 },
            { name: "Tech Vest", description: "Modular tactical outerwear with LEDs", price: 1200, currency_type: 'credits', image_url: "", power_bonus: 60 },
            { name: "Modus Drone", description: "Companion bot for the data-sphere", price: 2500, currency_type: 'crypto', image_url: "", power_bonus: 100 },
            { name: "Shadow Hoodie", description: "Stealth-ready premium apparel", price: 800, currency_type: 'credits', image_url: "", power_bonus: 40 },
            { name: "Data Tablet", description: "Holographic interface for power users", price: 1500, currency_type: 'credits', image_url: "", power_bonus: 85 }
        ];

        // Insert new items into Supabase
        const { data, error } = await supabase.from('items').insert(newItems).select();
        
        if (error) {
             console.error("Supabase insert error:", error);
             return NextResponse.json({ success: false, error: error.message });
        }
        
        return NextResponse.json({ success: true, inserted: data });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
