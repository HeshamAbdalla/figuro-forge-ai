
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const SolutionsCallToAction = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 via-transparent to-figuro-light/10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-figuro-accent/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-figuro-accent/10 border border-figuro-accent/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-figuro-accent" />
            <span className="text-sm text-figuro-accent font-medium">Ready to Transform Your Workflow?</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gradient leading-tight">
            Start Creating Amazing 3D Assets Today
          </h2>
          
          <p className="text-xl text-white/80 mb-8 leading-relaxed">
            Join thousands of creators who are already using Figuro.AI to bring their ideas to life. 
            No credit card required to get started.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button 
              asChild 
              size="lg" 
              className="bg-figuro-accent hover:bg-figuro-accent/90 text-white font-semibold px-8 py-4 rounded-xl group"
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
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 rounded-xl"
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            {[
              { text: "Free to start", subtext: "No credit card required" },
              { text: "Instant results", subtext: "Generate in seconds" },
              { text: "Export anywhere", subtext: "All major formats supported" }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-white font-semibold mb-1">{feature.text}</div>
                <div className="text-white/60 text-sm">{feature.subtext}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
