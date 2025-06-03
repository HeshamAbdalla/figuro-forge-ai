
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, Play, Pause, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const InteractiveDemo = () => {
  const navigate = useNavigate();
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const demoSteps = [
    {
      prompt: "a mystical dragon warrior",
      description: "AI analyzes your prompt",
      image: "/placeholder.svg"
    },
    {
      prompt: "a mystical dragon warrior",
      description: "Generating 3D model structure",
      image: "/placeholder.svg"
    },
    {
      prompt: "a mystical dragon warrior", 
      description: "Adding textures and details",
      image: "/placeholder.svg"
    },
    {
      prompt: "a mystical dragon warrior",
      description: "Your figurine is ready!",
      image: "/placeholder.svg"
    }
  ];

  const examplePrompts = [
    "a mystical dragon warrior",
    "cute robot companion", 
    "steampunk adventurer",
    "cyberpunk cat ninja"
  ];

  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoSteps.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, demoSteps.length]);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPrompt.trim()) {
      navigate(`/studio?prompt=${encodeURIComponent(currentPrompt)}`);
    } else {
      navigate('/studio');
    }
  };

  const startDemo = (prompt: string) => {
    setCurrentPrompt(prompt);
    setCurrentStep(0);
    setIsAnimating(true);
    setIsAutoPlay(true);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsAnimating(false);
    setIsAutoPlay(false);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/5 via-transparent to-purple-500/5" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-figuro-accent/10 border border-figuro-accent/20 rounded-full px-4 py-2 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Play className="w-4 h-4 text-figuro-accent" />
            <span className="text-sm text-figuro-accent font-medium">Interactive Demo</span>
          </motion.div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            See the Magic in{" "}
            <span className="text-gradient bg-gradient-to-r from-figuro-accent to-purple-400 bg-clip-text text-transparent">
              Real-Time
            </span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Watch how your ideas transform into stunning 3D figurines through our AI-powered process.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Interactive Controls */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Try It Yourself
                </h3>
                <p className="text-white/70 mb-6">
                  Type your own prompt or click on the examples below to see the generation process.
                </p>

                <form onSubmit={handlePromptSubmit} className="mb-6">
                  <div className="flex rounded-lg overflow-hidden bg-white/5 border border-white/10 focus-within:border-figuro-accent/50">
                    <Input 
                      placeholder="Describe your figurine..."
                      value={currentPrompt}
                      onChange={(e) => setCurrentPrompt(e.target.value)}
                      className="bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white/90 flex-1 placeholder:text-white/50"
                    />
                    <Button 
                      type="submit"
                      className="bg-figuro-accent hover:bg-figuro-accent-hover rounded-none px-6"
                    >
                      Create Real
                    </Button>
                  </div>
                </form>

                <div className="space-y-3">
                  <p className="text-white/60 text-sm">Try these examples:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {examplePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        onClick={() => startDemo(prompt)}
                        variant="outline"
                        size="sm"
                        className="border-white/10 hover:border-figuro-accent/50 text-white/80 hover:text-white justify-start"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo Controls */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/80"
                >
                  {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={resetDemo}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white/80"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <span className="text-white/60 text-sm">
                  Step {currentStep + 1} of {demoSteps.length}
                </span>
              </div>
            </motion.div>

            {/* Demo Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-center space-y-6"
                  >
                    {/* Mock visualization */}
                    <div className="relative">
                      <div className="w-full h-64 bg-gradient-to-br from-figuro-accent/20 to-purple-500/20 rounded-lg border border-white/10 flex items-center justify-center">
                        <motion.div
                          className="w-32 h-32 bg-white/10 rounded-lg flex items-center justify-center"
                          animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="w-12 h-12 text-figuro-accent" />
                        </motion.div>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black/20 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className="h-full bg-figuro-accent"
                            initial={{ width: "0%" }}
                            animate={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-lg font-semibold text-white">
                        {demoSteps[currentStep].description}
                      </h4>
                      <p className="text-figuro-accent text-sm font-medium">
                        "{demoSteps[currentStep].prompt}"
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-16"
          >
            <Button 
              onClick={() => navigate('/studio')}
              size="lg"
              className="bg-figuro-accent hover:bg-figuro-accent-hover text-white font-semibold px-8 py-4 group"
            >
              Start Creating for Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <p className="text-white/50 text-sm mt-3">
              No signup required to try the demo
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
