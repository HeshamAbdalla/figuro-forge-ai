
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Camera, Palette } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeModalProps {
  isOpen: boolean;
  onStartTour: () => void;
  onSkip: () => void;
}

const WelcomeModal = ({ isOpen, onStartTour, onSkip }: WelcomeModalProps) => {
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}} // Prevent closing on background click
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-md bg-figuro-dark border-figuro-accent/20"
        onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click
        onEscapeKeyDown={(e) => e.preventDefault()} // Prevent closing on escape
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            Welcome to Figuro.AI! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 py-4"
        >
          <div className="text-center">
            <p className="text-white/80 text-lg mb-6">
              Transform your imagination into stunning 3D figurines with the power of AI!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-figuro-accent/10 rounded-lg p-4 text-center"
            >
              <Palette className="w-8 h-8 text-figuro-accent mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">AI Image Generation</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-figuro-accent/10 rounded-lg p-4 text-center"
            >
              <Rocket className="w-8 h-8 text-figuro-accent mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">3D Model Creation</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-figuro-accent/10 rounded-lg p-4 text-center"
            >
              <Camera className="w-8 h-8 text-figuro-accent mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Camera to 3D</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-figuro-accent/10 rounded-lg p-4 text-center"
            >
              <Sparkles className="w-8 h-8 text-figuro-accent mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Text to 3D</p>
            </motion.div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/90 text-sm text-center">
              ✨ <strong>Ready to create something amazing?</strong> Let us show you around!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={onStartTour}
              className="w-full bg-figuro-accent hover:bg-figuro-accent/90 text-white font-medium"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Quick Tour (2 minutes)
            </Button>
            
            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full text-white/70 hover:text-white hover:bg-white/10"
            >
              Skip Tour - I'll Explore On My Own
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
