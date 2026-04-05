"use client"; // . rebuild trigger

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const router = useRouter();
  const { isXConnected, setSocialModalOpen } = useAuthStore();

  const handleStartBuilding = () => {
    if (isXConnected) {
      router.push("/character-builder");
    } else {
      setSocialModalOpen(true);
    }
  };
  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-brand-secondary/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] rounded-full bg-brand-accent/10 blur-[80px] animate-pulse-slow" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6 lg:p-24 pt-32 lg:pt-24 space-y-24">

        {/* Hero Section Upgrade: 2-Column Layout */}
        <section className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">

          {/* Left Column: Headline & Action */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center lg:items-start space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 glass-panel px-4 py-2 rounded-full border-brand-primary/30">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium tracking-wide text-brand-primary/90 uppercase">
                The Next Evolution
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-7xl font-bold font-heading tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 leading-[1.1] sm:leading-tight">
              Build Your Legacy in <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-dynamic text-glow">
                Web3 Reality
              </span>
            </h1>

            <p className="max-w-2xl text-lg sm:text-xl text-foreground/70 leading-relaxed font-light">
              MODUS is a tap-to-earn ecosystem where your characters evolve based on your on-chain interactions. Start building today.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
              <button 
                onClick={handleStartBuilding}
                className="glass-button bg-brand-primary/20 hover:bg-brand-primary/30 border-brand-primary/50 text-white px-8 py-4 flex items-center justify-center space-x-2 group no-underline w-full sm:w-auto"
              >
                <span className="font-semibold text-lg">Start building your character</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Big Character Preview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center items-center"
          >
            <div className="glass-panel p-4 sm:p-8 rounded-[40px] relative w-full max-w-[500px] aspect-[4/5] flex items-center justify-center overflow-hidden border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.15)]">
              {/* Dynamic Glow Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-transparent to-brand-secondary/10 -z-10" />

              {/* Float & Scale Animation Wrapper */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-full h-full relative z-10 flex items-center justify-center pt-4"
              >
                <div className="relative w-full h-full flex items-center justify-center pointer-events-none drop-shadow-2xl">
                  <Image 
                    src="/hero_cartoon_character.png" 
                    alt="Hero Character" 
                    width={400} 
                    height={400} 
                    className="object-contain w-full h-full max-w-[90%] max-h-[90%]"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Feature Cards Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-32 relative z-10">
          {[
            {
              title: "Lightning Fast",
              desc: "Powered by Solana for sub-second finalized transactions and near-zero fees.",
              icon: Zap,
              color: "text-brand-primary"
            },
            {
              title: "Secure Ownership",
              desc: "Your characters and assets are fully verifiable on-chain NFTs.",
              icon: Shield,
              color: "text-brand-secondary"
            },
            {
              title: "Evolving Traits",
              desc: "Dynamic metadata updates as you progress through social tasks and referrals.",
              icon: Sparkles,
              color: "text-brand-accent"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-panel p-8 flex flex-col items-start space-y-4 hover:-translate-y-2 transition-transform duration-300"
            >
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white">{feature.title}</h3>
              <p className="text-foreground/60 text-left font-light leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </main>
    </div>
  );
}
