
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocsCallToAction = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
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
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to Start Creating?
            </motion.h2>

            <motion.p
              className="text-xl text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Jump into the studio and bring your ideas to life, or connect with our community for support and inspiration.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                onClick={() => navigate('/studio')}
                size="lg"
                className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-3 min-w-[200px] shadow-glow-sm hover:shadow-glow transition-all duration-300"
              >
                <BookOpen size={20} />
                Open Studio
                <ArrowRight size={20} />
              </Button>
              
              <Button
                onClick={() => navigate('/community')}
                size="lg"
                variant="outline"
                className="border-white/30 hover:border-white hover:bg-white/10 min-w-[200px] flex items-center gap-3"
              >
                <Users size={20} />
                Join Community
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-figuro-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold">Comprehensive Guides</p>
                  <p className="text-white/60 text-sm">Step-by-step tutorials</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-figuro-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold">Expert Support</p>
                  <p className="text-white/60 text-sm">Get help when needed</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                  <Users className="w-6 h-6 text-figuro-accent" />
                </div>
                <div>
                  <p className="text-white font-semibold">Active Community</p>
                  <p className="text-white/60 text-sm">Connect with creators</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DocsCallToAction;
