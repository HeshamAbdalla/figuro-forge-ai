
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const SolutionsHero = () => {
  return (
    <section className="pt-32 pb-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 via-transparent to-figuro-light/5" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-figuro-accent/10 border border-figuro-accent/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-figuro-accent" />
            <span className="text-sm text-figuro-accent font-medium">AI-Powered Design Solutions</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient leading-tight">
            Transform Your Creative Vision Into Reality
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
            From concept to creation, Figuro.AI empowers designers and developers 
            to build stunning 3D assets and experiences with the power of artificial intelligence.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-figuro-accent hover:bg-figuro-accent/90 text-white font-semibold px-8 py-4 rounded-xl"
            >
              <Link to="/studio" className="flex items-center gap-2">
                Start Creating <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-xl"
            >
              <Link to="/gallery">View Gallery</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
