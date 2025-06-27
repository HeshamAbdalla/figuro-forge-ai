
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gamepad2, 
  Brush, 
  Film, 
  Building,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const audiences = [
  {
    icon: Gamepad2,
    title: "Game Developers",
    description: "Create characters, props, and environments for your games without needing a full art team.",
    benefits: [
      "Rapid prototyping of game assets",
      "Consistent art style across projects",
      "Reduce development costs and time",
      "Perfect for indie developers"
    ],
    cta: "Start Building Game Assets",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    icon: Brush,
    title: "Digital Artists",
    description: "Enhance your creative workflow with AI-powered tools that complement your artistic vision.",
    benefits: [
      "Overcome creative blocks",
      "Explore new art styles quickly",
      "Generate reference materials",
      "Focus on refinement over creation"
    ],
    cta: "Enhance Your Art",
    gradient: "from-pink-500/20 to-red-500/20"
  },
  {
    icon: Film,
    title: "Content Creators",
    description: "Produce engaging visual content for your videos, streams, and social media platforms.",
    benefits: [
      "Custom thumbnails and graphics",
      "Unique character designs",
      "Background environments",
      "Branded visual elements"
    ],
    cta: "Create Content Assets",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Building,
    title: "Businesses",
    description: "Bring your products and ideas to life with professional 3D visualizations and marketing assets.",
    benefits: [
      "Product visualization",
      "Marketing materials",
      "Presentation assets",
      "Brand consistency"
    ],
    cta: "Visualize Your Products",
    gradient: "from-orange-500/20 to-yellow-500/20"
  }
];

export const TargetAudiences = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-figuro-dark/50 to-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">
            Built for Creators Like You
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Whether you're building the next hit game or creating stunning visual content, 
            Figuros.AI adapts to your specific needs and workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="glass-panel h-full p-8 relative overflow-hidden hover:shadow-glow-sm transition-all duration-300">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${audience.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-figuro-accent/20 rounded-xl flex items-center justify-center border border-figuro-accent/30">
                        <Icon className="w-8 h-8 text-figuro-accent" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {audience.title}
                      </h3>
                    </div>
                    
                    <p className="text-white/80 leading-relaxed">
                      {audience.description}
                    </p>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-4">Key Benefits:</h4>
                      <ul className="space-y-3">
                        {audience.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center gap-3 text-white/70">
                            <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button 
                      asChild 
                      className="w-full bg-figuro-accent/10 hover:bg-figuro-accent/20 text-figuro-accent border border-figuro-accent/30 hover:border-figuro-accent/50 transition-all duration-300"
                      variant="outline"
                    >
                      <Link to="/studio" className="flex items-center justify-center gap-2">
                        {audience.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
