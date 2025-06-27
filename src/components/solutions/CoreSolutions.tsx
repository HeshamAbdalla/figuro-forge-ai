
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
    features: ["Multiple art styles", "High-resolution output", "Instant generation"],
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: Box,
    title: "Image-to-3D Conversion",
    description: "Convert your 2D designs into fully-realized 3D models ready for games, animations, and interactive experiences.",
    features: ["Automated mesh generation", "Optimized topology", "Game-ready assets"],
    gradient: "from-figuro-accent/20 to-purple-500/20"
  },
  {
    icon: Palette,
    title: "Style Customization",
    description: "Choose from various artistic styles or create your own unique aesthetic to match your project's vision.",
    features: ["Anime & cartoon styles", "Realistic rendering", "Custom style training"],
    gradient: "from-pink-500/20 to-red-500/20"
  },
  {
    icon: Zap,
    title: "Rapid Iteration",
    description: "Quickly iterate on designs with our fast generation pipeline. Go from concept to final asset in minutes, not hours.",
    features: ["Real-time previews", "Batch processing", "Version control"],
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Export your creations in industry-standard formats compatible with all major 3D software and game engines.",
    features: ["GLB/GLTF support", "FBX & OBJ formats", "Unity & Unreal ready"],
    gradient: "from-orange-500/20 to-yellow-500/20"
  },
  {
    icon: Share2,
    title: "Team Collaboration",
    description: "Share your creations with team members, gather feedback, and maintain a centralized asset library.",
    features: ["Public galleries", "Team workspaces", "Asset sharing"],
    gradient: "from-purple-500/20 to-indigo-500/20"
  }
];

export const CoreSolutions = () => {
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
            Complete Creative Workflow
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to bring your ideas to life, from initial concept to production-ready assets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <motion.div
                key={solution.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                <div className="glass-panel h-full p-8 relative overflow-hidden hover:shadow-glow-sm transition-all duration-300">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                        <Icon size={32} className="text-figuro-accent" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      {solution.title}
                    </h3>
                    
                    <p className="text-white/80 mb-6 leading-relaxed text-center">
                      {solution.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-white/70">
                          <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
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
