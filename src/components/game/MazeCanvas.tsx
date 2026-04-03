"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Shield, Crosshair, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

interface MazeCanvasProps {
    onCheckpointReached: () => void;
    onCaught: () => void;
}

// Pseudo-random generator for consistent daily levels
const mulberry32 = (a: number) => {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function MazeCanvas({ onCheckpointReached, onCaught }: MazeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const { accountLevel, avatarConfig } = useAuthStore();

    const [isPlaying, setIsPlaying] = useState(false);
    const [shieldsLeft, setShieldsLeft] = useState(3);
    const [mazeAssetsLoaded, setMazeAssetsLoaded] = useState(false);

    // Images
    const floorImg = useRef<HTMLImageElement | null>(null);
    const wallImg = useRef<HTMLImageElement | null>(null);
    const dinoImg = useRef<HTMLImageElement | null>(null);

    // Logic Refs
    const pState = useRef({
        x: 40, y: 40, size: 20, speed: 3.5,
        keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, w: false, a: false, s: false, d: false }
    });

    const aliens = useRef<{ x: number, y: number, size: number, speed: number, freezeParams: number, frame: number }[]>([]);
    const shields = useRef<{ x: number, y: number, hp: number }[]>([]);
    const target = useRef({ x: 540, y: 340, size: 30 });
    const reqRef = useRef<number>(null);
    const walls = useRef<number[][]>([]);

    useEffect(() => {
        // Load images
        const loadImages = Promise.all([
            new Promise<void>((res) => { const img = new Image(); img.src = "/grass_ruins_floor.png"; img.onload = () => { floorImg.current = img; res(); }; }),
            new Promise<void>((res) => { const img = new Image(); img.src = "/stone_ruin_wall.png"; img.onload = () => { wallImg.current = img; res(); }; }),
            new Promise<void>((res) => { const img = new Image(); img.src = "/top_down_dinosaur.png"; img.onload = () => { dinoImg.current = img; res(); }; }),
        ]);
        loadImages.then(() => setMazeAssetsLoaded(true));
    }, []);

    const generateMaze = useCallback(() => {
        // Generate daily/level-based random 
        const today = new Date().toDateString();
        const seedStr = today + accountLevel;
        let hash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
        }
        const rand = mulberry32(hash);

        let generatedWalls: number[][] = [];
        const cols = 600 / 40;
        const rows = 400 / 40;

        // Bounds
        generatedWalls.push([0, 0, 600, 10], [0, 390, 600, 10], [0, 0, 10, 400], [590, 0, 10, 400]);

        for (let i = 2; i < cols - 2; i += 2) {
            for (let j = 2; j < rows - 2; j += 2) {
                if (rand() > 0.4) {
                    generatedWalls.push([i * 40, j * 40, 40, rand() > 0.5 ? 80 : 40]);
                }
            }
        }
        walls.current = generatedWalls;

        pState.current.x = 20;
        pState.current.y = 20;

        // The higher the level, the more aggressive the dino
        const alienSpeed = 1.0 + (accountLevel * 0.1);
        aliens.current = [{ x: 500, y: 300, size: 24, speed: alienSpeed, freezeParams: 0, frame: 0 }];

        shields.current = [];
        setShieldsLeft(3 + Math.floor(accountLevel / 5)); // Reward high levels
    }, [accountLevel]);

    const checkCollision = (rect1: any, rect2: any) => {
        return (
            rect1.x < rect2.x + (rect2.w || rect2.size) &&
            rect1.x + (rect1.w || rect1.size) > rect2.x &&
            rect1.y < rect2.y + (rect2.h || rect2.size) &&
            rect1.y + (rect1.h || rect1.size) > rect2.y
        );
    };

    const getWallCollision = (x: number, y: number, size: number) => {
        for (let w of walls.current) {
            if (checkCollision({ x, y, size }, { x: w[0], y: w[1], w: w[2], h: w[3] })) return true;
        }
        return false;
    };

    const initGame = () => {
        generateMaze();
        setIsPlaying(true);
    };

    const dropShield = useCallback(() => {
        if (shieldsLeft > 0 && isPlaying) {
            shields.current.push({ x: pState.current.x, y: pState.current.y, hp: 100 });
            setShieldsLeft(s => s - 1);
        }
    }, [shieldsLeft, isPlaying]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key;
            const kl = e.key.toLowerCase();
            if (kl in pState.current.keys) pState.current.keys[kl as keyof typeof pState.current.keys] = true;
            if (k in pState.current.keys) pState.current.keys[k as keyof typeof pState.current.keys] = true;

            if (k === ' ') {
                e.preventDefault();
                dropShield();
            }

            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key) && isPlaying) {
                e.preventDefault(); // Prevent scrolling while playing
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const k = e.key;
            const kl = e.key.toLowerCase();
            if (kl in pState.current.keys) pState.current.keys[kl as keyof typeof pState.current.keys] = false;
            if (k in pState.current.keys) pState.current.keys[k as keyof typeof pState.current.keys] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp, { passive: false });
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [dropShield, isPlaying]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !mazeAssetsLoaded) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Pattern for floor
        let floorPat: CanvasPattern | null = null;
        if (floorImg.current) {
            floorPat = ctx.createPattern(floorImg.current, 'repeat');
        }

        let lastTime = performance.now();

        const loop = (time: number) => {
            const dt = (time - lastTime) / 16.66;
            lastTime = time;

            if (!isPlaying) {
                reqRef.current = requestAnimationFrame(loop);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Floor
            if (floorPat) {
                ctx.fillStyle = floorPat;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = "#1A251D";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Move player
            const p = pState.current;
            let dx = 0, dy = 0;
            if (p.keys.w || p.keys.ArrowUp) dy -= p.speed * dt;
            if (p.keys.s || p.keys.ArrowDown) dy += p.speed * dt;
            if (p.keys.a || p.keys.ArrowLeft) dx -= p.speed * dt;
            if (p.keys.d || p.keys.ArrowRight) dx += p.speed * dt;

            if (dx !== 0 && !getWallCollision(p.x + dx, p.y, p.size)) p.x += dx;
            if (dy !== 0 && !getWallCollision(p.x, p.y + dy, p.size)) p.y += dy;

            // Draw Walls (Ruins)
            walls.current.forEach(w => {
                if (wallImg.current) {
                    // Draw image tiled or stretched
                    ctx.drawImage(wallImg.current, w[0], w[1], w[2], w[3]);
                } else {
                    ctx.fillStyle = "#3a3a3a";
                    ctx.fillRect(w[0], w[1], w[2], w[3]);
                }
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.fillRect(w[0], w[1], w[2], w[3]);
            });

            // Draw Target (Checkpoint)
            ctx.shadowColor = "#14F195";
            ctx.shadowBlur = 15;
            ctx.fillStyle = "rgba(20,241,149,0.8)";
            ctx.fillRect(target.current.x, target.current.y, target.current.size, target.current.size);
            ctx.shadowBlur = 0;

            // Checkpoint Reached
            if (checkCollision(p, target.current)) {
                setIsPlaying(false);
                onCheckpointReached();
            }

            // Handle Aliens (Dinosaurs)
            for (let alien of aliens.current) {
                if (alien.freezeParams > 0) {
                    alien.freezeParams -= dt;
                } else {
                    const angle = Math.atan2(p.y - alien.y, p.x - alien.x);
                    let ax = Math.cos(angle) * alien.speed * dt;
                    let ay = Math.sin(angle) * alien.speed * dt;

                    if (!getWallCollision(alien.x + ax, alien.y, alien.size)) alien.x += ax;
                    if (!getWallCollision(alien.x, alien.y + ay, alien.size)) alien.y += ay;
                    alien.frame += dt * 0.1; // Animation wobble rate
                }

                if (checkCollision({ x: alien.x, y: alien.y, size: alien.size }, p)) {
                    setIsPlaying(false);
                    onCaught();
                }

                for (let i = shields.current.length - 1; i >= 0; i--) {
                    let s = shields.current[i];
                    if (checkCollision({ x: alien.x, y: alien.y, size: alien.size }, { x: s.x, y: s.y, size: 24 })) {
                        s.hp -= 2 * dt;
                        alien.freezeParams = 10;
                        if (s.hp <= 0) shields.current.splice(i, 1);
                    }
                }

                // Draw Dinosaur Alien with bobbing run effect
                ctx.save();
                ctx.translate(alien.x + alien.size / 2, alien.y + alien.size / 2);
                // rotate towards player roughly
                const rot = Math.atan2(p.y - alien.y, p.x - alien.x);
                ctx.rotate(rot);

                // Bobbing effect
                const bob = Math.sin(alien.frame) * 3;

                if (dinoImg.current) {
                    ctx.drawImage(dinoImg.current, -alien.size / 2 + bob, -alien.size / 2, alien.size * 1.5, alien.size * 1.5);
                } else {
                    ctx.fillStyle = "red";
                    ctx.fillRect(-alien.size / 2, -alien.size / 2, alien.size, alien.size);
                }
                ctx.restore();
            }

            // Draw Shields
            shields.current.forEach(s => {
                ctx.fillStyle = `rgba(139, 92, 246, ${s.hp / 100})`;
                ctx.shadowColor = "#8B5CF6";
                ctx.shadowBlur = 10;
                ctx.fillRect(s.x, s.y, 24, 24);
                ctx.shadowBlur = 0;
            });

            // Draw Top-Down Player using User's Avatar Config
            const skinCol = avatarConfig?.skinColor?.[0] ? `#${avatarConfig.skinColor[0]}` : "#edb98a";
            const clotheCol = avatarConfig?.clothesColor?.[0] ? `#${avatarConfig.clothesColor[0]}` : "#2C1B18";

            ctx.save();
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);

            // Calculate rotation based on movement vector
            if (dx !== 0 || dy !== 0) {
                pState.current.keys['lastRot'] = Math.atan2(dy, dx) as any;
            }
            ctx.rotate((pState.current.keys['lastRot'] as any) || 0);

            // Draw Shoulders
            ctx.fillStyle = clotheCol;
            ctx.beginPath();
            ctx.roundRect(-p.size * 0.6, -p.size * 0.8, p.size * 1.2, p.size * 1.6, 5);
            ctx.fill();

            // Draw Head
            ctx.fillStyle = skinCol;
            ctx.beginPath();
            ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2);
            ctx.fill();

            // Draw Hair abstract shape
            const hairCol = avatarConfig?.hairColor?.[0] ? `#${avatarConfig.hairColor[0]}` : "#111";
            ctx.fillStyle = hairCol;
            ctx.beginPath();
            ctx.arc(0, -p.size * 0.2, p.size * 0.55, 0, Math.PI);
            ctx.fill();

            ctx.restore();

            reqRef.current = requestAnimationFrame(loop);
        };

        reqRef.current = requestAnimationFrame(loop);
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [isPlaying, onCaught, onCheckpointReached, mazeAssetsLoaded, avatarConfig]);

    return (
        <div className="glass-panel border-white/5 relative overflow-hidden group shadow-2xl flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-brand-surface z-10 relative">
                <div className="flex items-center space-x-2 text-white">
                    <Target className="w-5 h-5 text-brand-primary" />
                    <h2 className="font-heading font-bold tracking-widest uppercase text-sm">The Nexus Breach</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-xs font-mono text-white/70 bg-white/5 px-3 py-1 rounded-md border border-white/10">
                        <Shield className="w-3 h-3 text-brand-secondary" />
                        <span>Shields: {shieldsLeft}</span>
                        <span className="text-white/40 ml-1">(SPACE key)</span>
                    </div>
                </div>
            </div>

            <div className="relative w-full overflow-hidden flex justify-center bg-black pt-4 pb-4">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className={`border border-white/10 rounded-lg shadow-inner ${isPlaying ? 'cursor-none' : ''}`}
                    style={{ maxWidth: "100%", height: "auto" }}
                />

                <AnimatePresence>
                    {!isPlaying && mazeAssetsLoaded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                        >
                            <div className="border border-brand-primary/20 bg-brand-surface p-8 rounded-2xl flex flex-col items-center shadow-2xl max-w-sm text-center">
                                <Crosshair className="w-12 h-12 text-brand-primary mb-4" />
                                <h3 className="font-heading text-2xl font-bold text-white mb-2">Sector Lvl {accountLevel}</h3>
                                <p className="text-white/70 mb-6 text-sm">
                                    Use WASD or ARROW KEYS to navigate to the green checkpoint. Dinosaurs will track your movement. Drop shields using SPACE.
                                </p>
                                <button
                                    onClick={initGame}
                                    className="w-full glass-button bg-brand-primary text-white hover:bg-brand-primary/90 font-bold py-3 uppercase tracking-wider"
                                >
                                    Initiate Breach
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
