
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      navigate(`/studio?prompt=${encodeURIComponent(prompt)}`);
    } else {
      navigate('/studio');
    }
  };

  const examplePrompts = [
    "a mystical dragon warrior",
    "cute robot companion",
    "fantasy wizard casting spells"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };
  
  return (
    <section className="pt-32 pb-20 relative overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-figuro-accent/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div 
        className="container mx-auto px-4 relative z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Sparkles size={16} className="text-figuro-accent" />
            <span className="text-white/90 text-sm font-medium">
              AI-Powered 3D Figurine Creation
            </span>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Transform Your Ideas Into{" "}
            <span className="text-gradient bg-gradient-to-r from-figuro-accent to-purple-400 bg-clip-text text-transparent">
              Physical Art
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Figuro.AI turns your imagination into stunning 3D figurines with just a text prompt. Design, customize, and bring your creations to life.
          </motion.p>

          {/* Social proof indicators */}
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 mb-8 text-white/60"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span className="text-sm">50K+ creators</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} />
              <span className="text-sm">500K+ figurines made</span>
            </div>
          </motion.div>
          
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex rounded-lg overflow-hidden bg-white/5 border border-white/10 focus-within:border-figuro-accent/50 transition-colors duration-300">
                <Input 
                  placeholder="Describe your dream figurine..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white/90 flex-1 placeholder:text-white/50"
                />
                <Button 
                  type="submit" 
                  className="bg-figuro-accent hover:bg-figuro-accent-hover rounded-none px-6 transition-all duration-300 hover:scale-105"
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {/* Example prompts */}
            <div className="mt-4">
              <p className="text-white/50 text-sm mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {examplePrompts.map((example, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-figuro-accent/50 rounded-full px-3 py-1 text-white/70 hover:text-white transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </div>

            <p className="text-white/50 text-sm mt-4">
              From concept to collectible in minutes. No design skills needed.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
