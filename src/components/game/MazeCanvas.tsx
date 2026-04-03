"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { Shield, Crosshair, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MazeCanvasProps {
    onCheckpointReached: () => void;
    onCaught: () => void;
}

export function MazeCanvas({ onCheckpointReached, onCaught }: MazeCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Game State
    const [isPlaying, setIsPlaying] = useState(false);
    const [shieldsLeft, setShieldsLeft] = useState(3);

    // Mutable refs for RAF loop
    const pState = useRef({
        x: 40, y: 40, size: 15, speed: 3,
        keys: { w: false, a: false, s: false, d: false }
    });

    const aliens = useRef([
        { x: 500, y: 300, size: 15, speed: 1.5, freezeParams: 0 }
    ]);

    const shields = useRef<{ x: number, y: number, hp: number }[]>([]);
    const target = useRef({ x: 540, y: 40, size: 20 });
    const reqRef = useRef<number>(null);

    // Simple hardcoded walls [x, y, w, h]
    const walls = [
        [0, 0, 600, 10], [0, 390, 600, 10], [0, 0, 10, 400], [590, 0, 10, 400],
        [100, 0, 20, 200], [200, 200, 20, 200], [300, 0, 20, 250], [450, 150, 20, 250],
        [450, 150, 150, 20], [100, 280, 100, 20]
    ];

    const checkCollision = (rect1: any, rect2: any) => {
        return (
            rect1.x < rect2.x + (rect2.w || rect2.size) &&
            rect1.x + (rect1.w || rect1.size) > rect2.x &&
            rect1.y < rect2.y + (rect2.h || rect2.size) &&
            rect1.y + (rect1.h || rect1.size) > rect2.y
        );
    };

    const getWallCollision = (x: number, y: number, size: number) => {
        for (let w of walls) {
            if (checkCollision({ x, y, size }, { x: w[0], y: w[1], w: w[2], h: w[3] })) return true;
        }
        return false;
    };

    const initGame = () => {
        pState.current.x = 40;
        pState.current.y = 40;
        aliens.current = [{ x: 500, y: 300, size: 15, speed: 1.5, freezeParams: 0 }];
        shields.current = [];
        setShieldsLeft(3);
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
            const k = e.key.toLowerCase();
            if (k in pState.current.keys) pState.current.keys[k as keyof typeof pState.current.keys] = true;
            if (k === ' ') dropShield();
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k in pState.current.keys) pState.current.keys[k as keyof typeof pState.current.keys] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [dropShield]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let lastTime = performance.now();

        const loop = (time: number) => {
            const dt = (time - lastTime) / 16.66; // Normalize to 60fps
            lastTime = time;

            if (!isPlaying) {
                reqRef.current = requestAnimationFrame(loop);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Grid / Floor
            ctx.fillStyle = "#1A110D";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = "rgba(196, 155, 97, 0.05)"; // Brand primary very faint
            ctx.lineWidth = 1;
            for (let i = 0; i < 600; i += 40) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.stroke();
            }
            for (let i = 0; i < 400; i += 40) {
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(600, i); ctx.stroke();
            }

            // Move player
            const p = pState.current;
            let dx = 0, dy = 0;
            if (p.keys.w) dy -= p.speed * dt;
            if (p.keys.s) dy += p.speed * dt;
            if (p.keys.a) dx -= p.speed * dt;
            if (p.keys.d) dx += p.speed * dt;

            if (dx !== 0 && !getWallCollision(p.x + dx, p.y, p.size)) p.x += dx;
            if (dy !== 0 && !getWallCollision(p.x, p.y + dy, p.size)) p.y += dy;

            // Draw Walls
            ctx.fillStyle = "rgba(44, 30, 22, 1)"; // Brand surface equivalent
            ctx.shadowColor = "#000";
            ctx.shadowBlur = 10;
            walls.forEach(w => {
                ctx.fillRect(w[0], w[1], w[2], w[3]);
                // Add top highlight
                ctx.fillStyle = "rgba(196, 155, 97, 0.2)";
                ctx.fillRect(w[0], w[1], w[2], 2);
                ctx.fillStyle = "rgba(44, 30, 22, 1)";
            });
            ctx.shadowBlur = 0;

            // Draw Target (Checkpoint)
            ctx.fillStyle = "#A67C00"; // Brand Accent
            ctx.shadowColor = "#A67C00";
            ctx.shadowBlur = 15;
            ctx.fillRect(target.current.x, target.current.y, target.current.size, target.current.size);

            // Checkpoint Reached
            if (checkCollision(p, target.current)) {
                setIsPlaying(false);
                onCheckpointReached();
            }

            // Handle Aliens
            for (let alien of aliens.current) {
                if (alien.freezeParams > 0) {
                    alien.freezeParams -= dt;
                } else {
                    const angle = Math.atan2(p.y - alien.y, p.x - alien.x);
                    let ax = Math.cos(angle) * alien.speed * dt;
                    let ay = Math.sin(angle) * alien.speed * dt;

                    // Basic slide on walls
                    if (!getWallCollision(alien.x + ax, alien.y, alien.size)) alien.x += ax;
                    if (!getWallCollision(alien.x, alien.y + ay, alien.size)) alien.y += ay;
                }

                // Alien Collision with Player
                if (checkCollision({ x: alien.x, y: alien.y, size: alien.size }, p)) {
                    setIsPlaying(false);
                    onCaught();
                }

                // Check alien collision with shields
                for (let i = shields.current.length - 1; i >= 0; i--) {
                    let s = shields.current[i];
                    if (checkCollision({ x: alien.x, y: alien.y, size: alien.size }, { x: s.x, y: s.y, size: 20 })) {
                        s.hp -= 2 * dt;
                        alien.freezeParams = 10; // attack delay
                        if (s.hp <= 0) {
                            shields.current.splice(i, 1);
                        }
                    }
                }

                // Draw Alien
                ctx.fillStyle = "#FF4444";
                ctx.shadowColor = "#FF0000";
                ctx.shadowBlur = 8;
                ctx.fillRect(alien.x, alien.y, alien.size, alien.size);
            }

            // Draw Shields
            ctx.fillStyle = "rgba(196, 155, 97, 0.8)";
            ctx.shadowColor = "#C49B61";
            shields.current.forEach(s => {
                ctx.globalAlpha = s.hp / 100;
                ctx.fillRect(s.x, s.y, 20, 20);
            });
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;

            // Draw Player
            ctx.fillStyle = "#F5E6D3"; // Cream
            ctx.shadowColor = "#F5E6D3";
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.shadowBlur = 0;

            reqRef.current = requestAnimationFrame(loop);
        };

        reqRef.current = requestAnimationFrame(loop);
        return () => {
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [isPlaying, onCaught, onCheckpointReached]);

    return (
        <div className="glass-panel border-white/5 relative overflow-hidden group shadow-2xl flex flex-col bg-brand-background">
            {/* Header */}
            <div className="p-4 border-b border-brand-primary/20 flex justify-between items-center bg-brand-surface z-10 relative">
                <div className="flex items-center space-x-2 text-brand-secondary">
                    <Target className="w-5 h-5 text-brand-primary" />
                    <h2 className="font-heading font-bold tracking-widest uppercase text-sm">The Nexus Breach</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-xs font-mono text-brand-secondary bg-white/5 px-3 py-1 rounded-md border border-brand-primary/10">
                        <Shield className="w-3 h-3 text-brand-primary" />
                        <span>Shields: {shieldsLeft}</span>
                        <span className="text-foreground/40 ml-1">(SPACE key)</span>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative w-full overflow-hidden flex justify-center bg-[#0D0806] pt-4 pb-4">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={400}
                    className={`border border-white/10 rounded-lg shadow-inner ${isPlaying ? 'cursor-none' : ''}`}
                    style={{ maxWidth: "100%", height: "auto" }}
                />

                {/* Overlay if not playing */}
                <AnimatePresence>
                    {!isPlaying && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-brand-background/80 backdrop-blur-sm"
                        >
                            <div className="border border-brand-primary/20 bg-brand-surface p-8 rounded-2xl flex flex-col items-center shadow-2xl max-w-sm text-center">
                                <Crosshair className="w-12 h-12 text-brand-accent mb-4" />
                                <h3 className="font-heading text-2xl font-bold text-white mb-2">Secure The Sector</h3>
                                <p className="text-foreground/70 mb-6 text-sm">
                                    Navigate to the yellow checkpoint to lock in your daily passive $MODUS yield. Avoid the crimson Time-Aliens. Drop shields using SPACE.
                                </p>
                                <button
                                    onClick={initGame}
                                    className="w-full glass-button bg-brand-primary text-brand-background hover:bg-brand-primary/90 font-bold py-3 uppercase tracking-wider"
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
