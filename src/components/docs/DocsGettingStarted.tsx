
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Lightbulb, Palette, ArrowRight, Play, Target, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DocsGettingStarted = () => {
  const navigate = useNavigate();

  const cards = [
    {
      icon: BookOpen,
      title: "Introduction to Figuro.AI",
      description: "Learn the basics and core concepts",
      content: "Discover what Figuro.AI can do, who can use it, and how our AI-powered platform transforms text into 3D figurines.",
      route: "/docs/introduction",
      gradient: "from-blue-500/20 to-purple-500/20",
      color: "text-blue-400"
    },
    {
      icon: Play,
      title: "Creating Your First Figurine",
      description: "Step-by-step tutorial",
      content: "Follow our detailed walkthrough to create your first 3D figurine, from writing prompts to downloading your model.",
      route: "/docs/creating-your-first-figurine",
      gradient: "from-figuro-accent/20 to-purple-500/20",
      color: "text-figuro-accent"
    },
    {
      icon: Palette,
      title: "Understanding Art Styles",
      description: "Master different visual styles",
      content: "Learn about Realistic, Cartoon, Anime, and Fantasy styles to choose the perfect look for your figurines.",
      route: "/docs/understanding-art-styles",
      gradient: "from-pink-500/20 to-red-500/20",
      color: "text-pink-400"
    },
    {
      icon: Target,
      title: "Prompt Engineering Tips",
      description: "Write better prompts",
      content: "Master the art of crafting effective prompts that generate exactly what you envision.",
      route: "/docs/prompt-engineering-tips",
      gradient: "from-green-500/20 to-emerald-500/20",
      color: "text-green-400"
    },
    {
      icon: Rocket,
      title: "Advanced Techniques",
      description: "Take your skills further",
      content: "Explore advanced features and techniques to create professional-quality 3D models.",
      route: "/docs/advanced-techniques",
      gradient: "from-orange-500/20 to-yellow-500/20",
      color: "text-orange-400"
    },
    {
      icon: Lightbulb,
      title: "Best Practices",
      description: "Expert recommendations",
      content: "Learn from experienced creators about optimizing workflows and achieving better results.",
      route: "/docs/best-practices",
      gradient: "from-purple-500/20 to-indigo-500/20",
      color: "text-purple-400"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-br from-white via-white/90 to-figuro-accent bg-clip-text text-transparent">
            Getting Started
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Everything you need to begin your journey with AI-powered 3D creation
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {cards.map((card, index) => {
            const IconComponent = card.icon;
            
            return (
              <motion.div
                key={card.title}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative group"
              >
                <div className="glass-panel h-full p-8 relative overflow-hidden hover:shadow-glow-sm transition-all duration-300">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 group-hover:opacity-70 transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 flex items-center justify-center">
                        <IconComponent size={32} className={card.color} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {card.title}
                      </h3>
                      <p className="text-figuro-accent text-sm font-medium mb-4">
                        {card.description}
                      </p>
                      <p className="text-white/70 text-sm leading-relaxed">
                        {card.content}
                      </p>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => navigate(card.route)}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 group-hover:shadow-glow-sm"
                    >
                      <span>Explore Guide</span>
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default DocsGettingStarted;
