
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Image, 
  Box, 
  Palette, 
  Zap, 
  Download, 
  Share2 
} from "lucide-react";

const solutions = [
  {
    icon: Image,
    title: "Text-to-Image Generation",
    description: "Transform your written descriptions into stunning visual concepts. Perfect for initial ideation and rapid prototyping.",
    features: ["Multiple art styles", "High-resolution output", "Instant generation"]
  },
  {
    icon: Box,
    title: "Image-to-3D Conversion",
    description: "Convert your 2D designs into fully-realized 3D models ready for games, animations, and interactive experiences.",
    features: ["Automated mesh generation", "Optimized topology", "Game-ready assets"]
  },
  {
    icon: Palette,
    title: "Style Customization",
    description: "Choose from various artistic styles or create your own unique aesthetic to match your project's vision.",
    features: ["Anime & cartoon styles", "Realistic rendering", "Custom style training"]
  },
  {
    icon: Zap,
    title: "Rapid Iteration",
    description: "Quickly iterate on designs with our fast generation pipeline. Go from concept to final asset in minutes, not hours.",
    features: ["Real-time previews", "Batch processing", "Version control"]
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Export your creations in industry-standard formats compatible with all major 3D software and game engines.",
    features: ["GLB/GLTF support", "FBX & OBJ formats", "Unity & Unreal ready"]
  },
  {
    icon: Share2,
    title: "Team Collaboration",
    description: "Share your creations with team members, gather feedback, and maintain a centralized asset library.",
    features: ["Public galleries", "Team workspaces", "Asset sharing"]
  }
];

export const CoreSolutions = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-figuro-dark/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient">
            Complete Creative Workflow
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Everything you need to bring your ideas to life, from initial concept to production-ready assets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="glass-panel h-full hover:shadow-glow-sm transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-figuro-accent/20 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-figuro-accent" />
                    </div>
                    <CardTitle className="text-xl text-white mb-2">
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 mb-4 leading-relaxed">
                      {solution.description}
                    </p>
                    <ul className="space-y-2">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm text-white/70">
                          <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
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
