
import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, Users, Rocket, Heart } from "lucide-react";
import VantaBackground from "@/components/VantaBackground";

export const AuthHero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <VantaBackground>
        <div className="container mx-auto px-4 py-16 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-8"
            >
              <Heart size={40} className="text-figuro-accent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent"
            >
              Welcome to Your Creative Journey
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of creators who are transforming their ideas into stunning 3D assets with the power of AI
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 text-white/70 mb-8"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-figuro-accent" />
                <span>AI-powered generation</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-figuro-accent" />
                <span>Lightning fast results</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-figuro-accent" />
                <span>Vibrant community</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-figuro-accent" />
                <span>Ideas to reality</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="glass-panel p-6 max-w-2xl mx-auto"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 text-figuro-accent" />
                What You Can Create Today
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                  Fantasy characters & creatures
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                  Custom action figures
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                  Game assets & props
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                  Architectural models
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                  Personalized gifts
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                  Educational models
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </VantaBackground>
    </section>
  );
};
