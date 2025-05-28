
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PricingCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="glass-panel p-8 lg:p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 opacity-50" />
          
          <div className="relative z-10">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Crown size={32} className="text-figuro-accent" />
            </motion.div>

            <motion.h2
              className="text-3xl lg:text-4xl font-bold mb-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Ready to Create Something Amazing?
            </motion.h2>

            <motion.p
              className="text-white/70 max-w-2xl mx-auto mb-8 text-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Choose the perfect plan for your creative journey. Start free and upgrade anytime as your needs grow.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button
                onClick={() => navigate('/studio')}
                size="lg"
                className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-2 min-w-[200px]"
              >
                Start Free Now
                <ArrowRight size={20} />
              </Button>
              
              <Button
                onClick={() => navigate('/pricing')}
                size="lg"
                variant="outline"
                className="border-white/30 hover:border-white hover:bg-white/10 min-w-[200px]"
              >
                View All Plans
              </Button>
            </motion.div>

            <motion.p
              className="text-white/50 text-sm mt-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingCTA;
