
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import VantaBackground from "@/components/VantaBackground";

export const SolutionsHero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
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
              <Sparkles size={40} className="text-figuro-accent" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent"
            >
              Transform Your Creative Vision Into Reality
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              From concept to creation, Figuros.AI empowers designers and developers 
              to build stunning 3D assets and experiences with the power of artificial intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 text-white/70 mb-12"
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
                <Crown className="w-5 h-5 text-figuro-accent" />
                <span>Professional quality</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white font-semibold px-8 py-4 rounded-xl shadow-glow-sm hover:shadow-glow transition-all duration-300 min-w-[200px]"
              >
                <Link to="/studio" className="flex items-center gap-2">
                  Start Creating <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/30 hover:border-white hover:bg-white/10 text-white px-8 py-4 rounded-xl min-w-[200px]"
              >
                <Link to="/gallery">View Gallery</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </VantaBackground>
    </section>
  );
};
