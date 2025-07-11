import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Shield, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
const PricingCTA = () => {
  const navigate = useNavigate();
  return <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div className="glass-panel p-12 text-center relative overflow-hidden max-w-4xl mx-auto" initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }}>
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-figuro-accent/10 via-purple-500/10 to-figuro-accent/10 opacity-50" />
          
          <div className="relative z-10">
            <motion.h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.2
          }}>
              Ready to Transform Your Ideas?
            </motion.h2>

            <motion.p className="text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }}>Join thousands of creators who are already bringing their imagination to life with Figuros.AI</motion.p>

            <motion.div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.4
          }}>
              <Button onClick={() => navigate('/auth')} size="lg" className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-3 min-w-[200px] shadow-glow-sm hover:shadow-glow transition-all duration-300">
                Start Creating Now
                <ArrowRight size={20} />
              </Button>
              
              <Button onClick={() => navigate('/contact')} size="lg" variant="outline" className="border-white/30 hover:border-white hover:bg-white/10 min-w-[200px] flex items-center gap-3">
                <MessageCircle size={20} />
                Contact Sales
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6,
            delay: 0.5
          }}>
              

              

              
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>;
};
export default PricingCTA;