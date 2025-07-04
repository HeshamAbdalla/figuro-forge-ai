
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import ExamplePrompts from "@/components/ExamplePrompts";
import { Sparkles, Wand2, Stars, Zap } from "lucide-react";

const ART_STYLES = [
  { id: "isometric", name: "Isometric Skeuomorphic" },
  { id: "anime", name: "Anime" },
  { id: "pixar", name: "Pixar" },
  { id: "steampunk", name: "Steampunk" },
  { id: "lowpoly", name: "Low Poly" },
  { id: "cyberpunk", name: "Cyberpunk" },
  { id: "realistic", name: "Realistic" },
  { id: "chibi", name: "Chibi" }
];

interface PromptFormProps {
  onGenerate: (prompt: string, style: string) => void;
  isGenerating: boolean;
}

const PromptForm = ({ onGenerate, isGenerating }: PromptFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("isometric"); // Isometric is already the default
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onGenerate(prompt, style);
  };

  const handleExampleSelect = (examplePrompt: string) => {
    setPrompt(examplePrompt);
    // Optionally auto-submit the form with the example
    // onGenerate(examplePrompt, style);
  };

  // Floating particles for magical effect
  const magicParticles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="relative">
      {/* Magical floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {magicParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-figuro-accent rounded-full opacity-40"
            style={{
              left: `${10 + (particle.id * 10)}%`,
              top: `${20 + (particle.id * 8)}%`,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, Math.sin(particle.id) * 10, 0],
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 to-white/10 p-8 rounded-2xl border border-white/20 overflow-hidden"
      >
        {/* Background magical glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-figuro-accent/5 via-purple-500/5 to-figuro-accent/5"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.05), transparent 70%)",
              "radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.05), transparent 70%)",
              "radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.05), transparent 70%)",
              "radial-gradient(circle at 50% 80%, rgba(168, 85, 247, 0.05), transparent 70%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />

        {/* Header with magical elements */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Wand2 className="w-6 h-6 text-figuro-accent" />
            </motion.div>
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-white to-figuro-accent bg-clip-text">
              ✨ Describe Your Magical Creation
            </h3>
          </motion.div>
          
          <motion.span 
            className="text-xs px-4 py-2 rounded-full bg-gradient-to-r from-figuro-accent/20 to-purple-500/20 text-figuro-accent border border-figuro-accent/30 font-semibold backdrop-blur-sm"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎨 Step 1
          </motion.span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Magical prompt input */}
          <motion.div 
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="relative group">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r from-figuro-accent/20 to-purple-500/20 rounded-xl blur-sm transition-all duration-300 ${
                  isFocused ? 'opacity-100' : 'opacity-0'
                }`}
                animate={{ 
                  scale: isFocused ? [1, 1.02, 1] : 1,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              <Input
                id="prompt"
                placeholder="e.g. Mystical dragon guardian with glowing crystals..."
                className="relative bg-white/10 border-white/20 text-white focus:border-figuro-accent pl-6 pr-12 py-6 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              
              {/* Animated sparkle icon */}
              <motion.div
                className="absolute right-4 top-1/2 -translate-y-1/2"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: prompt ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="text-figuro-accent/70 w-5 h-5" />
              </motion.div>

              {/* Floating mini sparkles when focused */}
              <AnimatePresence>
                {isFocused && (
                  <>
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-figuro-accent rounded-full"
                        style={{
                          left: `${20 + i * 20}%`,
                          top: "10%",
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          y: [0, -20],
                        }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <motion.p 
              className="text-sm text-white/60 leading-relaxed flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Stars className="w-4 h-4 text-figuro-accent/50" />
              Let your imagination soar! Describe any character, creature, or object you dream of.
            </motion.p>
          </motion.div>
          
          {/* Enhanced style selector */}
          <motion.div 
            className="space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="style" className="text-sm text-white/80 flex items-center gap-3 font-medium">
              <Zap className="w-4 h-4 text-figuro-accent" />
              <span>✨ Art Style Magic</span>
              <motion.span 
                className="h-px flex-grow bg-gradient-to-r from-white/20 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              />
            </label>
            
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl py-6 hover:bg-white/15 transition-all duration-300">
                <SelectValue placeholder="Choose your magical style..." />
              </SelectTrigger>
              <SelectContent className="bg-figuro-darker/95 border-white/20 backdrop-blur-2xl rounded-xl">
                {ART_STYLES.map((artStyle) => (
                  <SelectItem 
                    key={artStyle.id} 
                    value={artStyle.id} 
                    className="focus:bg-figuro-accent/20 text-white rounded-lg my-1 transition-all duration-200 hover:text-figuro-accent"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-figuro-accent rounded-full animate-pulse"></span>
                      {artStyle.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          
          {/* Magical generate button */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className={`
                w-full bg-gradient-to-r from-figuro-accent via-purple-500 to-figuro-accent 
                hover:from-figuro-accent-hover hover:via-purple-600 hover:to-figuro-accent-hover 
                border-0 font-bold text-lg py-6 rounded-xl
                shadow-lg hover:shadow-figuro-accent/25 transition-all duration-300
                relative overflow-hidden group/btn
                ${isGenerating ? 'animate-pulse' : ''}
              `}
              disabled={isGenerating || !prompt.trim()}
              style={{ backgroundSize: '200% 200%' }}
            >
              {/* Button shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: "-100%" }}
                animate={{ x: isGenerating ? ["100%", "-100%"] : "-100%" }}
                transition={{ 
                  duration: isGenerating ? 1.5 : 0.6,
                  repeat: isGenerating ? Infinity : 0,
                  ease: "linear"
                }}
              />
              
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </motion.div>
                    <span>✨ Crafting Magic...</span>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>🪄 Cast Creation Spell</span>
                    <Stars className="w-5 h-5" />
                  </>
                )}
              </span>
            </Button>
          </motion.div>
        </form>

        {/* Magical corner elements */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1] 
            }}
            transition={{ 
              rotate: { duration: 6, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Stars className="w-6 h-6 text-figuro-accent/30" />
          </motion.div>
        </div>
        
        <div className="absolute bottom-4 left-4">
          <motion.div
            animate={{ 
              rotate: -360,
              y: [0, -5, 0] 
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Sparkles className="w-5 h-5 text-purple-400/30" />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <ExamplePrompts onSelectPrompt={handleExampleSelect} />
      </motion.div>
    </div>
  );
};

export default PromptForm;
