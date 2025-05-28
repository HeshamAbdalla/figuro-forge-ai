
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
    cta: "Start Building Game Assets"
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
    cta: "Enhance Your Art"
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
    cta: "Create Content Assets"
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
    cta: "Visualize Your Products"
  }
];

export const TargetAudiences = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Built for Creators Like You
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Whether you're building the next hit game or creating stunning visual content, 
            Figuro.AI adapts to your specific needs and workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {audiences.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <motion.div
                key={audience.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass-panel h-full hover:shadow-glow-sm transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-figuro-accent/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-figuro-accent" />
                      </div>
                      <CardTitle className="text-2xl text-white">
                        {audience.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-white/80 leading-relaxed">
                      {audience.description}
                    </p>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-3">Key Benefits:</h4>
                      <ul className="space-y-2">
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
                      className="w-full bg-figuro-accent/10 hover:bg-figuro-accent/20 text-figuro-accent border border-figuro-accent/30"
                      variant="outline"
                    >
                      <Link to="/studio" className="flex items-center justify-center gap-2">
                        {audience.cta} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
