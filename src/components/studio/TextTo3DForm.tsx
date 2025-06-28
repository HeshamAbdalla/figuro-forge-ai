
import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Settings, Loader2, AlertCircle } from "lucide-react";
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
  const [validationError, setValidationError] = useState<string | null>(null);
  
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

  // Enhanced validation with better error messages
  const validateInput = (input: string): string | null => {
    if (!input || input.trim().length === 0) {
      return null; // Don't show error for empty input until form submission
    }
    
    if (input.length > 1000) {
      return 'Prompt is too long. Maximum 1000 characters allowed.';
    }
    
    // Check for potentially problematic characters
    const problematicChars = /[<>{}[\]\\]/;
    if (problematicChars.test(input)) {
      return 'Prompt contains invalid characters. Please use only letters, numbers, and basic punctuation.';
    }
    
    return null;
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPrompt(newValue);
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError(null);
    }
    
    // Real-time validation for length and characters
    const error = validateInput(newValue);
    setValidationError(error);
  };

  const handleQuickGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedPrompt = prompt.trim();
    
    // Enhanced validation before submission
    if (!trimmedPrompt) {
      setValidationError('Please enter a description for your 3D model');
      textareaRef.current?.focus();
      return;
    }
    
    if (trimmedPrompt.length < 3) {
      setValidationError('Please provide a more detailed description (at least 3 characters)');
      textareaRef.current?.focus();
      return;
    }
    
    const error = validateInput(trimmedPrompt);
    if (error) {
      setValidationError(error);
      return;
    }
    
    if (!isGenerating) {
      console.log('📤 [FORM] Quick generate with prompt:', trimmedPrompt);
      // Quick generate with default settings - ensure proper parameters
      onGenerate(trimmedPrompt, "realistic", "");
    }
  };

  const handleAdvancedGenerate = () => {
    const trimmedPrompt = prompt.trim();
    
    // Enhanced validation before opening modal
    if (!trimmedPrompt) {
      setValidationError('Please enter a description for your 3D model');
      textareaRef.current?.focus();
      return;
    }
    
    if (trimmedPrompt.length < 3) {
      setValidationError('Please provide a more detailed description (at least 3 characters)');
      textareaRef.current?.focus();
      return;
    }
    
    const error = validateInput(trimmedPrompt);
    if (error) {
      setValidationError(error);
      return;
    }
    
    if (!isGenerating) {
      console.log('📤 [FORM] Opening config modal with prompt:', trimmedPrompt);
      onOpenConfigModal(trimmedPrompt);
    }
  };

  const characterCount = prompt.length;
  const isNearLimit = characterCount > 800;
  const isAtLimit = characterCount >= 1000;

  const isFormValid = prompt.trim() && !validationError && prompt.trim().length >= 3;

  return (
    <Card className="glass-panel border-white/20 backdrop-blur-sm p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-figuro-accent flex-shrink-0" size={20} />
          <h3 className="text-lg font-semibold text-white">Text to 3D</h3>
        </div>
        
        <form onSubmit={handleQuickGenerate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">Describe your 3D model</label>
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={handlePromptChange}
                placeholder="A cute cartoon dragon sitting on a rock..."
                className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[80px] sm:min-h-[100px] resize-none pr-16 ${
                  validationError ? 'border-red-400 focus:border-red-400' : ''
                } ${isAtLimit ? 'border-red-500' : isNearLimit ? 'border-yellow-400' : ''}`}
                disabled={isGenerating}
                maxLength={1000}
              />
              <div className={`absolute bottom-2 right-2 text-xs ${
                isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-white/50'
              }`}>
                {characterCount}/1000
              </div>
            </div>
            
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-red-400 text-sm"
              >
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="break-words">{validationError}</span>
              </motion.div>
            )}
          </div>

          {/* Mobile-first responsive button layout */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={!isFormValid || isGenerating}
              className="w-full sm:flex-1 bg-figuro-accent hover:bg-figuro-accent-hover disabled:opacity-50 min-h-[44px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2 flex-shrink-0" />
                  <span className="truncate">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2 flex-shrink-0" />
                  <span className="truncate">Quick Generate</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={handleAdvancedGenerate}
              disabled={!isFormValid || isGenerating}
              variant="outline"
              className="w-full sm:flex-1 border-white/20 text-white hover:bg-white/10 disabled:opacity-50 min-h-[44px]"
            >
              <Settings size={16} className="mr-2 flex-shrink-0" />
              <span className="truncate">Advanced Options</span>
            </Button>
          </div>
          
          {isFormValid && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-white/50 text-center px-2"
            >
              Generation typically takes 2-5 minutes
            </motion.p>
          )}
        </form>
      </motion.div>
    </Card>
  );
});

TextTo3DForm.displayName = "TextTo3DForm";

export default TextTo3DForm;
