
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Cpu, 
  Cloud, 
  Shield, 
  Zap,
  Database,
  Globe
} from "lucide-react";

const capabilities = [
  {
    icon: Cpu,
    title: "Advanced AI Models",
    description: "Powered by state-of-the-art diffusion models and neural networks trained on millions of high-quality images.",
    specs: ["Stable Diffusion XL", "Custom trained models", "Real-time inference"],
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description: "Scalable cloud architecture ensures fast generation times and 99.9% uptime for your creative projects.",
    specs: ["Auto-scaling servers", "Global CDN", "99.9% uptime SLA"],
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate images in seconds and convert to 3D models in minutes, not hours. Perfect for rapid iteration.",
    specs: ["<10s image generation", "<5min 3D conversion", "Real-time previews"],
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
  {
    icon: Database,
    title: "Asset Management",
    description: "Secure cloud storage for all your creations with version control and team collaboration features.",
    specs: ["Unlimited storage", "Version history", "Team workspaces"],
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your creations are protected with enterprise-grade security and privacy controls.",
    specs: ["SOC 2 compliant", "End-to-end encryption", "GDPR compliant"],
    gradient: "from-red-500/20 to-pink-500/20"
  },
  {
    icon: Globe,
    title: "API Integration",
    description: "Integrate Figuros.AI directly into your existing workflow with our comprehensive API.",
    specs: ["RESTful API", "SDKs available", "Webhook support"],
    gradient: "from-indigo-500/20 to-purple-500/20"
  }
];

export const TechnicalCapabilities = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">
            Cutting-Edge Technology
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Built on enterprise-grade infrastructure with the latest AI models to deliver 
            professional results at scale.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <div className="glass-panel h-full p-8 relative overflow-hidden hover:shadow-glow-sm transition-all duration-300">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${capability.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-figuro-accent to-figuro-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-figuro-accent/30">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      {capability.title}
                    </h3>
                    
                    <p className="text-white/80 mb-6 leading-relaxed text-center">
                      {capability.description}
                    </p>
                    
                    <div className="space-y-3">
                      {capability.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex items-center gap-3 text-sm">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-figuro-accent to-figuro-light rounded-full" />
                          <span className="text-white/70">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="glass-panel p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-figuro-accent/10 via-purple-500/10 to-figuro-accent/10 opacity-50" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-8">Performance at Scale</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { number: "1M+", label: "Images Generated" },
                { number: "100K+", label: "3D Models Created" },
                { number: "99.9%", label: "Uptime" },
                { number: "<10s", label: "Avg Generation Time" }
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
