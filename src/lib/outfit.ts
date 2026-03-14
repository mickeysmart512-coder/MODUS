// Encode physical equipment state to a shareable string
export function encodeOutfitCode(equippedItems: { head: number | null, body: number | null, weapon: number | null }): string {
    // Basic format: H{headId}-B{bodyId}-W{weaponId}
    const str = `H${equippedItems.head || 0}-B${equippedItems.body || 0}-W${equippedItems.weapon || 0}`;
    // Base64 encode for a cleaner "code" look
    return btoa(str);
}

// Decode shareable string back to equipment state
export function decodeOutfitCode(code: string): { head: number | null, body: number | null, weapon: number | null } | null {
    try {
        const decodedStr = atob(code);
        // Expecting format like: H1-B4-W6
        const parts = decodedStr.split('-');

        if (parts.length !== 3) return null;

        const head = parseInt(parts[0].replace('H', ''));
        const body = parseInt(parts[1].replace('B', ''));
        const weapon = parseInt(parts[2].replace('W', ''));

        return {
            head: head > 0 ? head : null,
            body: body > 0 ? body : null,
            weapon: weapon > 0 ? weapon : null
        };
    } catch (e) {
        console.error("Invalid Outfit Code", e);
        return null;
    }
}
