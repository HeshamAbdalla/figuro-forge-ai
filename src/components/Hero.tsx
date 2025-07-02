
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Sparkles, Gift } from "lucide-react";
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
    "fantasy wizard casting spells", 
    "steampunk adventurer", 
    "cyberpunk cat ninja"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Subtle overlay to enhance text readability against 3D background */}
      <div className="absolute inset-0 bg-gradient-to-b from-figuro-dark/40 via-figuro-dark/30 to-figuro-dark/50" />
      
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-figuro-accent/10 rounded-full blur-3xl" 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }} 
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }} 
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }} 
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }} 
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-24 h-24 bg-green-400/10 rounded-full blur-2xl" 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }} 
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }} 
        />
      </div>

      <motion.div 
        className="container mx-auto px-4 relative z-10 text-center" 
        initial={{
          opacity: 0
        }} 
        animate={{
          opacity: 1
        }} 
        transition={{
          duration: 0.8
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Badge with Free Emphasis */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-figuro-accent/10 border border-green-400/20 rounded-full px-6 py-3 mb-6 backdrop-blur-sm" 
            initial={{
              opacity: 0,
              y: 20
            }} 
            animate={{
              opacity: 1,
              y: 0
            }} 
            transition={{
              delay: 0.1,
              duration: 0.6
            }}
          >
            <Gift size={18} className="text-green-400" />
            <span className="text-green-400 text-sm font-medium">
              FREE AI-Powered 3D Creation
            </span>
            <Sparkles size={16} className="text-figuro-accent" />
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight" 
            initial={{
              y: 20
            }} 
            animate={{
              y: 0
            }} 
            transition={{
              delay: 0.2,
              duration: 0.8
            }}
          >
            Transform Your Ideas Into{" "}
            <span className="text-gradient bg-gradient-to-r from-figuro-accent via-purple-400 to-green-400 bg-clip-text text-transparent">
              Physical Art
            </span>
            <br />
            <span className="text-2xl md:text-3xl lg:text-4xl text-green-400 font-medium">
              Completely Free to Start
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-8" 
            initial={{
              y: 20,
              opacity: 0
            }} 
            animate={{
              y: 0,
              opacity: 1
            }} 
            transition={{
              delay: 0.4,
              duration: 0.8
            }}
          >
            Figuros.AI turns your imagination into stunning 3D figurines with just a text prompt. Start creating amazing figurines today - no credit card required, no hidden fees.
          </motion.p>
          
          <motion.div 
            className="max-w-xl mx-auto" 
            initial={{
              y: 20,
              opacity: 0
            }} 
            animate={{
              y: 0,
              opacity: 1
            }} 
            transition={{
              delay: 0.6,
              duration: 0.8
            }}
          >
            <form onSubmit={handleSubmit}>
              <div className="flex rounded-lg overflow-hidden bg-white/10 border border-white/20 focus-within:border-figuro-accent/50 transition-colors duration-300 backdrop-blur-sm">
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

            {/* Enhanced example prompts */}
            <div className="mt-4">
              <p className="text-white/60 text-sm mb-3">✨ Try these popular examples:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {examplePrompts.map((example, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 hover:border-figuro-accent/50 rounded-full px-3 py-1.5 text-white/70 hover:text-white transition-all duration-300 backdrop-blur-sm"
                    whileHover={{
                      scale: 1.05
                    }}
                    whileTap={{
                      scale: 0.95
                    }}
                    initial={{
                      opacity: 0,
                      y: 10
                    }}
                    animate={{
                      opacity: 1,
                      y: 0
                    }}
                    transition={{
                      delay: 0.7 + index * 0.1
                    }}
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Enhanced CTA */}
            <motion.div 
              className="mt-8 space-y-4" 
              initial={{
                opacity: 0,
                y: 20
              }} 
              animate={{
                opacity: 1,
                y: 0
              }} 
              transition={{
                delay: 0.8,
                duration: 0.6
              }}
            >
              <p className="text-green-400 text-sm font-medium">
                🎁 Start with 10 FREE credits • No credit card required
              </p>
              <p className="text-white/60 text-sm">
                From concept to collectible in minutes. No design skills needed.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
