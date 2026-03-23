import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const newItems = [
            { name: "Aero Visor", description: "Aerodynamic headgear", price: 300, currency_type: 'credits', image_url: "", power_bonus: 15 },
            { name: "Obsidian Core", description: "Dark energy armor", price: 1200, currency_type: 'credits', image_url: "", power_bonus: 60 },
            { name: "Plasma Cannon", description: "Heavy artillery", price: 2500, currency_type: 'crypto', image_url: "", power_bonus: 100 },
            { name: "Stealth Suit", description: "Invisible armor coating", price: 800, currency_type: 'credits', image_url: "", power_bonus: 40 },
            { name: "Quantum Blade", description: "Slices through reality", price: 1500, currency_type: 'credits', image_url: "", power_bonus: 85 }
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
