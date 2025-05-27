
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface TextTo3DFormProps {
  onGenerate: (prompt: string, artStyle: string, negativePrompt: string) => void;
  isGenerating: boolean;
}

const artStyles = [
  { value: "realistic", label: "Realistic" },
  { value: "cartoon", label: "Cartoon" },
  { value: "low-poly", label: "Low Poly" },
  { value: "sculpture", label: "Sculpture" },
  { value: "pbr", label: "PBR Material" }
];

const TextTo3DForm = ({ onGenerate, isGenerating }: TextTo3DFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [artStyle, setArtStyle] = useState("realistic");
  const [negativePrompt, setNegativePrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt.trim(), artStyle, negativePrompt.trim());
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Describe your 3D model</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cute cartoon dragon sitting on a rock..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Art Style</label>
              <Select value={artStyle} onValueChange={setArtStyle} disabled={isGenerating}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-figuro-darker border-white/20">
                  {artStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Negative Prompt (Optional)</label>
            <Textarea
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="What you don't want in the model (low quality, blurry, etc.)"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[60px] resize-none"
              disabled={isGenerating}
            />
          </div>

          <Button
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-figuro-accent hover:bg-figuro-accent-hover disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Creating 3D Model...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Generate 3D Model
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </Card>
  );
};

export default TextTo3DForm;
