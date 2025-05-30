
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Palette, Settings } from "lucide-react";
import { useWebIconsGeneration } from "@/hooks/useWebIconsGeneration";
import { useUpgradeModal } from "@/hooks/useUpgradeModal";
import UpgradeModal from "@/components/UpgradeModal";

interface WebIconsFormProps {
  onGenerate?: (prompt: string, options: { category: string; size: string; style: string }) => Promise<void>;
  isGenerating?: boolean;
}

const categories = [
  { value: "general", label: "General" },
  { value: "business", label: "Business" },
  { value: "technology", label: "Technology" },
  { value: "communication", label: "Communication" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "social", label: "Social Media" },
  { value: "travel", label: "Travel" },
  { value: "food", label: "Food & Drink" },
  { value: "health", label: "Health & Fitness" },
  { value: "education", label: "Education" },
];

const sizes = [
  { value: "128x128", label: "128×128 (Small)" },
  { value: "256x256", label: "256×256 (Medium)" },
  { value: "512x512", label: "512×512 (Large)" },
  { value: "1024x1024", label: "1024×1024 (XL)" },
];

const styles = [
  { value: "isometric", label: "Isometric 3D" },
  { value: "flat", label: "Flat Design" },
  { value: "outline", label: "Outline" },
  { value: "filled", label: "Filled" },
];

const WebIconsForm = ({ onGenerate, isGenerating: externalIsGenerating }: WebIconsFormProps) => {
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("general");
  const [size, setSize] = useState("256x256");
  const [style, setStyle] = useState("isometric");

  // Use internal generation hook with usage limits
  const { generateIcon, isGenerating: internalIsGenerating } = useWebIconsGeneration();
  
  // Add upgrade modal functionality
  const {
    isUpgradeModalOpen,
    upgradeModalAction,
    showUpgradeModal,
    hideUpgradeModal
  } = useUpgradeModal();

  // Use external isGenerating if provided, otherwise use internal
  const isGenerating = externalIsGenerating ?? internalIsGenerating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    // Use external onGenerate if provided, otherwise use internal generateIcon
    if (onGenerate) {
      await onGenerate(prompt.trim(), { category, size, style });
    } else {
      const result = await generateIcon(prompt.trim(), { category, size, style });
      
      // Handle upgrade needed scenario
      if (result.needsUpgrade) {
        showUpgradeModal("image_generation");
      }
    }
  };

  return (
    <>
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Sparkles className="w-5 h-5" />
            Generate Web Icons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Icon Description</Label>
              <Input
                id="prompt"
                placeholder="Describe your icon (e.g., shopping cart, user profile, settings gear)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                className="bg-white/5 border-white/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={size} onValueChange={setSize} disabled={isGenerating}>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Style
                </Label>
                <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="w-full bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 mr-2"
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>
                    Generating Icon...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Icon
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onOpenChange={hideUpgradeModal}
        actionType={upgradeModalAction}
        title="Generation Limit Reached"
        description="You've reached your daily image generation limit. Upgrade your plan to continue creating web icons."
      />
    </>
  );
};

export default WebIconsForm;
