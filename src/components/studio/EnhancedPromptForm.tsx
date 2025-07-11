import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SlideButton } from "@/components/ui/slide-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Shuffle, Star, Sparkles, Dice6 } from "lucide-react";

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
  "Futuristic space ship",
  "Medieval knight with glowing armor",
  "Mystical forest creature with wings",
  "Retro robot with neon lights",
  "Dragon breathing colorful flames",
  "Fairy house in a mushroom"
];

const SMART_SUGGESTIONS = {
  fantasy: ["dragon", "wizard", "fairy", "unicorn", "magic crystal"],
  scifi: ["robot", "spaceship", "alien", "laser weapon", "futuristic city"],
  cute: ["puppy", "kitten", "bunny", "panda", "cartoon character"],
  nature: ["tree", "flower", "mountain", "ocean", "forest"],
  action: ["warrior", "ninja", "superhero", "racing car", "adventure"]
};

interface EnhancedPromptFormProps {
  onGenerate: (prompt: string, style: string) => void;
  isGenerating: boolean;
}

export interface EnhancedPromptFormRef {
  focusInput: () => void;
}

const EnhancedPromptForm = forwardRef<EnhancedPromptFormRef, EnhancedPromptFormProps>(({ onGenerate, isGenerating }, ref) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("isometric");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState(0);
  
  // Create internal ref for the textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose focus method to parent component
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Add a helpful placeholder if empty
        if (!prompt.trim()) {
          setPrompt("Describe your figurine...");
          // Select the placeholder text so user can immediately start typing
          setTimeout(() => {
            textareaRef.current?.select();
          }, 0);
        }
      }
    }
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation and rate limiting
    if (!prompt.trim() || isSubmitting || isGenerating) return;
    
    // Rate limiting: prevent submissions within 2 seconds
    const now = Date.now();
    if (now - lastSubmissionTime < 2000) {
      console.log(`🚫 [FORM] Submission rate limited - ${now - lastSubmissionTime}ms since last submission`);
      return;
    }
    
    console.log(`🎯 [FORM] Form submission started for prompt: "${prompt}"`);
    
    // Immediately set local submitting state and update timestamp
    setIsSubmitting(true);
    setLastSubmissionTime(now);
    
    try {
      // Call the onGenerate function
      await onGenerate(prompt, style);
      console.log(`✅ [FORM] Form submission completed for prompt: "${prompt}"`);
    } catch (error) {
      console.error(`❌ [FORM] Form submission error for prompt: "${prompt}"`, error);
    } finally {
      // Reset submitting state after a delay to prevent rapid resubmissions
      setTimeout(() => {
        setIsSubmitting(false);
        console.log(`🔓 [FORM] Form submission lock released for prompt: "${prompt}"`);
      }, 2000); // Increased delay for better stability
    }
  };

  const handleQuickPrompt = (quickPrompt: string) => {
    if (isSubmitting || isGenerating) return;
    setPrompt(quickPrompt);
  };

  const generateSmartPrompt = () => {
    if (isSubmitting || isGenerating) return;
    
    const categories = Object.keys(SMART_SUGGESTIONS);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const suggestions = SMART_SUGGESTIONS[randomCategory as keyof typeof SMART_SUGGESTIONS];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    // Create a more detailed prompt
    const adjectives = ["magical", "epic", "mysterious", "glowing", "ancient", "futuristic", "miniature"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const generatedPrompt = `${randomAdjective} ${randomSuggestion} figurine`;
    setPrompt(generatedPrompt);
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
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
          <Wand2 size={20} className="text-figuro-accent" />
          Image Generator
        </h3>
        <p className="text-sm text-white/60">
          Describe your figurine and we'll create it for you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            placeholder="Describe your figurine in detail..."
            className="bg-white/10 border-white/20 text-white resize-none h-20 placeholder:text-white/40"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isSubmitting || isGenerating}
          />
          
          {/* Smart Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-figuro-accent" />
              <span className="text-xs text-white/70">Quick Ideas:</span>
            </div>
            
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
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateSmartPrompt}
                disabled={isSubmitting || isGenerating}
                className="text-xs text-figuro-accent hover:text-white hover:bg-figuro-accent/20 h-7 px-3 disabled:opacity-50 flex items-center gap-1"
              >
                <Dice6 size={12} />
                Feeling Lucky?
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRandomPrompt}
                disabled={isSubmitting || isGenerating}
                className="text-xs text-white/60 hover:text-white hover:bg-white/5 h-7 px-3 disabled:opacity-50"
              >
                <Shuffle size={12} className="mr-1" />
                Random
              </Button>
            </div>
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
        
        <SlideButton
          type="submit"
          className="w-full h-10"
          disabled={isDisabled}
          isLoading={isGenerating || isSubmitting}
          loadingText={isSubmitting ? "Starting..." : "Generating..."}
          icon={<Wand2 size={16} />}
          variant="primary"
        >
          Generate Image
        </SlideButton>
      </form>
    </motion.div>
  );
});

EnhancedPromptForm.displayName = "EnhancedPromptForm";

export default EnhancedPromptForm;
