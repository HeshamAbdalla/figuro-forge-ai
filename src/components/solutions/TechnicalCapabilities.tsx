
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
    specs: ["Stable Diffusion XL", "Custom trained models", "Real-time inference"]
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description: "Scalable cloud architecture ensures fast generation times and 99.9% uptime for your creative projects.",
    specs: ["Auto-scaling servers", "Global CDN", "99.9% uptime SLA"]
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate images in seconds and convert to 3D models in minutes, not hours. Perfect for rapid iteration.",
    specs: ["<10s image generation", "<5min 3D conversion", "Real-time previews"]
  },
  {
    icon: Database,
    title: "Asset Management",
    description: "Secure cloud storage for all your creations with version control and team collaboration features.",
    specs: ["Unlimited storage", "Version history", "Team workspaces"]
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Your creations are protected with enterprise-grade security and privacy controls.",
    specs: ["SOC 2 compliant", "End-to-end encryption", "GDPR compliant"]
  },
  {
    icon: Globe,
    title: "API Integration",
    description: "Integrate Figuro.AI directly into your existing workflow with our comprehensive API.",
    specs: ["RESTful API", "SDKs available", "Webhook support"]
  }
];

export const TechnicalCapabilities = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-figuro-dark/50 to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Cutting-Edge Technology
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Built on enterprise-grade infrastructure with the latest AI models to deliver 
            professional results at scale.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => {
            const Icon = capability.icon;
            return (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass-panel h-full group hover:shadow-glow-sm transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-figuro-accent to-figuro-light rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white mb-2">
                      {capability.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4 leading-relaxed">
                      {capability.description}
                    </p>
                    <div className="space-y-2">
                      {capability.specs.map((spec, specIndex) => (
                        <div key={specIndex} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-figuro-accent to-figuro-light rounded-full" />
                          <span className="text-white/70">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {[
            { number: "1M+", label: "Images Generated" },
            { number: "100K+", label: "3D Models Created" },
            { number: "99.9%", label: "Uptime" },
            { number: "<10s", label: "Avg Generation Time" }
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                {stat.number}
              </div>
              <div className="text-white/70">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
