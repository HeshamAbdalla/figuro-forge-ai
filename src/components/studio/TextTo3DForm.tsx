import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Settings, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TextTo3DFormProps {
  onGenerate: (prompt: string, artStyle: string, negativePrompt: string) => void;
  onOpenConfigModal: (prompt: string) => void;
  isGenerating: boolean;
}

export interface TextTo3DFormRef {
  focusInput: () => void;
}

const TextTo3DForm = forwardRef<TextTo3DFormRef, TextTo3DFormProps>(({ onGenerate, onOpenConfigModal, isGenerating }, ref) => {
  const [prompt, setPrompt] = useState("");
  
  // Create internal ref for the textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose focus method to parent component
  useImperativeHandle(ref, () => ({
    focusInput: () => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Add a helpful placeholder if empty
        if (!prompt.trim()) {
          setPrompt("Describe your 3D model...");
          // Select the placeholder text so user can immediately start typing
          setTimeout(() => {
            textareaRef.current?.select();
          }, 0);
        }
      }
    }
  }));

  const handleQuickGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      // Quick generate with default settings
      onGenerate(prompt.trim(), "realistic", "");
    }
  };

  const handleAdvancedGenerate = () => {
    if (prompt.trim() && !isGenerating) {
      onOpenConfigModal(prompt.trim());
    }
  };

  return (
    <Card className="glass-panel border-white/20 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-figuro-accent" size={20} />
          <h3 className="text-lg font-semibold text-white">Text to 3D</h3>
        </div>
        
        <form onSubmit={handleQuickGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Describe your 3D model</label>
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cute cartoon dragon sitting on a rock..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="bg-figuro-accent hover:bg-figuro-accent-hover disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Quick Generate
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleAdvancedGenerate}
              disabled={!prompt.trim() || isGenerating}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 disabled:opacity-50"
            >
              <Settings size={16} className="mr-2" />
              Advanced Options
            </Button>
          </div>
        </form>
      </motion.div>
    </Card>
  );
});

TextTo3DForm.displayName = "TextTo3DForm";

export default TextTo3DForm;
