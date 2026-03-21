import CharacterBuilder from "@/components/character-builder/CharacterBuilder";

export default function CharacterBuilderPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-heading text-white mb-2">Character Forge</h1>
                <p className="text-foreground/60">Customize and upgrade your Web3 avatar with unique NFT assets.</p>
            </div>
            <CharacterBuilder />
        </div>
    );
}
