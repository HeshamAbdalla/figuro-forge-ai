import { motion } from "framer-motion";
import { Sparkles, Shield, Zap, Users, Rocket, Heart } from "lucide-react";
import VantaBackground from "@/components/VantaBackground";
export const AuthHero = () => {
  return <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <VantaBackground>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center relative z-10">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="max-w-4xl mx-auto w-full">
            <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }} className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-6 sm:mb-8">
              <Heart size={32} className="sm:w-10 sm:h-10 text-figuro-accent" />
            </motion.div>

            <motion.h1 initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent leading-tight">
              Welcome to Your Creative Journey
            </motion.h1>
            
            <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }} className="text-lg sm:text-xl md:text-2xl text-white/80 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Join thousands of creators who are transforming their ideas into stunning 3D assets with the power of AI
            </motion.p>

            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.5
          }} className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 text-white/70 mb-6 sm:mb-8 px-4 sm:px-0">
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-figuro-accent flex-shrink-0" />
                <span>AI-powered generation</span>
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-figuro-accent flex-shrink-0" />
                <span>Lightning fast results</span>
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-figuro-accent flex-shrink-0" />
                <span>Vibrant community</span>
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-figuro-accent flex-shrink-0" />
                <span>Ideas to reality</span>
              </div>
            </motion.div>

            
          </motion.div>
        </div>
      </VantaBackground>
    </section>;
};