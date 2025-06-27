
import { motion } from "framer-motion";
import { BookOpen, Lightbulb, Code, Zap } from "lucide-react";
import VantaBackground from "@/components/VantaBackground";

const DocsHero = () => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <VantaBackground>
        <div className="container mx-auto px-4 py-24 text-center relative z-10">
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
              <BookOpen size={40} className="text-figuro-accent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent"
            >
              Master Figuro.AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Complete guides, tutorials, and resources to unleash the full potential of AI-powered 3D creation
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 text-white/70"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-figuro-accent" />
                <span>Step-by-step guides</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-figuro-accent" />
                <span>API reference</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-figuro-accent" />
                <span>Expert tips</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </VantaBackground>
    </section>
  );
};

export default DocsHero;
