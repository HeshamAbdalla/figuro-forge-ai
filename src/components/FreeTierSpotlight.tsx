
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Zap, Download, Users, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FreeTierSpotlight = () => {
  const navigate = useNavigate();

  const freeFeatures = [
    {
      icon: <Gift className="w-6 h-6 text-green-400" />,
      title: "10 Free Credits",
      description: "Generate up to 10 amazing figurines completely free"
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Instant Generation", 
      description: "Create figurines in seconds with AI-powered technology"
    },
    {
      icon: <Download className="w-6 h-6 text-blue-400" />,
      title: "Free Downloads",
      description: "Download your creations in multiple formats"
    },
    {
      icon: <Users className="w-6 h-6 text-purple-400" />,
      title: "Community Access",
      description: "Join thousands of creators sharing their work"
    }
  ];

  const benefits = [
    "No credit card required",
    "No hidden fees or charges",
    "Full commercial rights",
    "Multiple art styles",
    "3D model export",
    "Community gallery access"
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-figuro-accent/5 to-purple-500/5" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-400/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Gift className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">100% Free Forever</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Start Creating for{" "}
            <span className="text-gradient bg-gradient-to-r from-green-400 to-figuro-accent bg-clip-text text-transparent">
              Free
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Experience the full power of AI-driven 3D creation without any cost. 
            No trials, no limitations - just pure creative freedom.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {freeFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full">
                    <CardContent className="p-6 text-center">
                      <div className="mb-4 flex justify-center">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              What You Get for Free
            </h3>
            
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-white/80">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Button 
                onClick={() => navigate('/studio')}
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold group"
              >
                Start Creating Free Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-white/50 text-xs mt-3 text-center">
                Join 50,000+ creators who started for free
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FreeTierSpotlight;
