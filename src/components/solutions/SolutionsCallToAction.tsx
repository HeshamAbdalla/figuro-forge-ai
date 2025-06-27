
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, MessageCircle, BookOpen, Users } from "lucide-react";
import { Link } from "react-router-dom";

export const SolutionsCallToAction = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          className="glass-panel p-12 text-center relative overflow-hidden max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-figuro-accent/10 via-purple-500/10 to-figuro-accent/10 opacity-50" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-8"
            >
              <Sparkles size={40} className="text-figuro-accent" />
            </motion.div>

            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Start Creating Amazing 3D Assets Today
            </motion.h2>
            
            <motion.p
              className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Join thousands of creators who are already using Figuros.AI to bring their ideas to life. 
              No credit card required to get started.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-figuro-accent hover:bg-figuro-accent-hover text-white font-semibold px-8 py-4 rounded-xl group shadow-glow-sm hover:shadow-glow transition-all duration-300 min-w-[200px]"
              >
                <Link to="/studio" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Start Creating Now 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-white/30 hover:border-white hover:bg-white/10 text-white px-8 py-4 rounded-xl min-w-[200px]"
              >
                <Link to="/pricing">View Pricing</Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-figuro-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold">Free to Start</p>
                  <p className="text-white/60 text-sm">No credit card required</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-figuro-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold">Instant Results</p>
                  <p className="text-white/60 text-sm">Generate in seconds</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-figuro-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold">Export Anywhere</p>
                  <p className="text-white/60 text-sm">All major formats supported</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
