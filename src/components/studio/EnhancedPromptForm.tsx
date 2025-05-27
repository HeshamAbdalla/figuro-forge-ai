
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Shuffle, Star } from "lucide-react";

const ART_STYLES = [
  { id: "isometric", name: "Isometric", preview: "🎯" },
  { id: "anime", name: "Anime", preview: "🎨" },
  { id: "pixar", name: "Pixar", preview: "🎬" },
  { id: "steampunk", name: "Steampunk", preview: "⚙️" },
  { id: "lowpoly", name: "Low Poly", preview: "🔷" },
  { id: "cyberpunk", name: "Cyberpunk", preview: "🌆" },
  { id: "realistic", name: "Realistic", preview: "📸" },
  { id: "chibi", name: "Chibi", preview: "🐱" }
];

const QUICK_PROMPTS = [
  "Cyberpunk cat with laser sword",
  "Steampunk robot with brass gears", 
  "Cute anime girl with magic wand",
  "Low poly mountain landscape",
  "Futuristic space ship"
];

interface EnhancedPromptFormProps {
  onGenerate: (prompt: string, style: string) => void;
  isGenerating: boolean;
}

const EnhancedPromptForm = ({ onGenerate, isGenerating }: EnhancedPromptFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("isometric");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isSubmitting || isGenerating) return;
    
    console.log(`🎯 [FORM] Form submission started for prompt: "${prompt}"`);
    
    // Immediately set local submitting state to prevent multiple submissions
    setIsSubmitting(true);
    
    try {
      // Call the onGenerate function
      await onGenerate(prompt, style);
      console.log(`✅ [FORM] Form submission completed for prompt: "${prompt}"`);
    } catch (error) {
      console.error(`❌ [FORM] Form submission error for prompt: "${prompt}"`, error);
    } finally {
      // Reset submitting state after a short delay to prevent rapid resubmissions
      setTimeout(() => {
        setIsSubmitting(false);
        console.log(`🔓 [FORM] Form submission lock released for prompt: "${prompt}"`);
      }, 1000);
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    if (isSubmitting || isGenerating) return;
    setPrompt(quickPrompt);
  };

  const handleRandomPrompt = () => {
    if (isSubmitting || isGenerating) return;
    const randomPrompt = QUICK_PROMPTS[Math.floor(Math.random() * QUICK_PROMPTS.length)];
    setPrompt(randomPrompt);
  };

  // Determine if the form should be disabled
  const isDisabled = isGenerating || isSubmitting || !prompt.trim();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="glass-panel p-4 rounded-xl backdrop-blur-md border border-white/20 h-fit"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Describe your figurine..."
            className="bg-white/10 border-white/20 text-white resize-none h-20"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isSubmitting || isGenerating}
          />
          
          <div className="flex flex-wrap gap-1">
            {QUICK_PROMPTS.slice(0, 3).map((quickPrompt) => (
              <Button
                key={quickPrompt}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleQuickPrompt(quickPrompt)}
                disabled={isSubmitting || isGenerating}
                className="text-xs text-white/60 hover:text-white hover:bg-white/5 h-6 px-2 disabled:opacity-50"
              >
                {quickPrompt}
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRandomPrompt}
              disabled={isSubmitting || isGenerating}
              className="text-xs text-white/60 hover:text-white hover:bg-white/5 h-6 px-2 disabled:opacity-50"
            >
              <Shuffle size={12} className="mr-1" />
              Random
            </Button>
          </div>
        </div>
        
        <Select value={style} onValueChange={setStyle} disabled={isSubmitting || isGenerating}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white h-9 disabled:opacity-50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-figuro-darker border-white/20 backdrop-blur-md">
            {ART_STYLES.map((artStyle) => (
              <SelectItem key={artStyle.id} value={artStyle.id} className="focus:bg-figuro-accent/20">
                <div className="flex items-center gap-2">
                  <span>{artStyle.preview}</span>
                  <span>{artStyle.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          type="submit"
          className="w-full bg-figuro-accent hover:bg-figuro-accent-hover h-10 disabled:opacity-50"
          disabled={isDisabled}
        >
          {(isGenerating || isSubmitting) ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {isSubmitting ? "Starting..." : "Generating..."}
            </>
          ) : (
            <>
              <Wand2 size={16} className="mr-2" />
              Generate
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};

export default EnhancedPromptForm;
