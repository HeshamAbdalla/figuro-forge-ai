
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Sparkles, Zap, Crown, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

interface EnhancedUpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actionType: "image_generation" | "model_conversion" | "model_remesh";
}

const EnhancedUpgradeModal: React.FC<EnhancedUpgradeModalProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  actionType,
}) => {
  console.log('🎯 [ENHANCED-UPGRADE-MODAL] Component rendering with props:', {
    isOpen,
    actionType,
    title,
    hasOnOpenChange: !!onOpenChange,
    timestamp: new Date().toISOString()
  });

  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getActionContent = () => {
    switch (actionType) {
      case "image_generation":
        return {
          icon: <Sparkles className="w-8 h-8 text-figuro-accent" />,
          title: "Unlock Unlimited Creativity",
          subtitle: "Your imagination shouldn't have limits",
          description: "You're creating amazing content! Ready to unleash your full creative potential?",
          benefits: [
            "Unlimited image generations",
            "Priority processing (2x faster)",
            "Exclusive premium art styles",
            "High-resolution outputs",
            "Commercial usage rights"
          ],
          cta: "Unlock Creative Freedom",
          badge: "Most Popular"
        };
      case "model_conversion":
        return {
          icon: <Zap className="w-8 h-8 text-figuro-accent" />,
          title: "Transform Ideas Into Reality",
          subtitle: "Don't let limits slow down your 3D journey",
          description: "Your 3D models are looking incredible! Time to take them to the next level.",
          benefits: [
            "More 3D model conversions",
            "Advanced model optimization",
            "Higher polygon counts",
            "Premium texturing options",
            "Professional export formats"
          ],
          cta: "Upgrade Your 3D Power",
          badge: "Recommended"
        };
      case "model_remesh":
        return {
          icon: <Crown className="w-8 h-8 text-figuro-accent" />,
          title: "Professional Model Refinement",
          subtitle: "Perfect your creations with advanced tools",
          description: "Take your models to professional standards with our advanced remeshing capabilities.",
          benefits: [
            "Advanced remeshing algorithms",
            "Topology optimization",
            "Quality enhancement tools",
            "Professional workflows",
            "Export to industry formats"
          ],
          cta: "Unlock Pro Tools",
          badge: "Pro Feature"
        };
      default:
        return {
          icon: <Sparkles className="w-8 h-8 text-figuro-accent" />,
          title: "Upgrade Your Experience",
          subtitle: "More features, more possibilities",
          description: "Ready to unlock your full potential?",
          benefits: ["Enhanced features", "Priority support"],
          cta: "Upgrade Now",
          badge: "Premium"
        };
    }
  };

  const content = getActionContent();

  const handleUpgrade = async () => {
    console.log('⬆️ [ENHANCED-UPGRADE-MODAL] Upgrade button clicked');
    
    if (!user) {
      console.log('🔄 [ENHANCED-UPGRADE-MODAL] No user, redirecting to auth');
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    console.log('🔄 [ENHANCED-UPGRADE-MODAL] Closing modal and navigating to pricing');
    onOpenChange(false);
    navigate("/pricing");
  };

  console.log('🎯 [ENHANCED-UPGRADE-MODAL] About to render Dialog with isOpen:', isOpen);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-figuro-dark border-figuro-accent/30 p-0 overflow-hidden">
        {console.log('🎯 [ENHANCED-UPGRADE-MODAL] DialogContent rendering!')}
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-figuro-accent/10 via-purple-500/5 to-blue-500/10" />
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ 
                duration: 20,
                repeat: Infinity,
                ease: "linear" 
              }}
              className="w-full h-full bg-gradient-to-r from-figuro-accent to-purple-500"
              style={{
                backgroundSize: "400% 400%"
              }}
            />
          </div>

          <div className="relative p-6">
            <DialogHeader className="text-center space-y-4">
              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                  delay: 0.1 
                }}
                className="flex justify-center"
              >
                <div className="p-4 bg-figuro-accent/20 rounded-2xl border border-figuro-accent/30">
                  {content.icon}
                </div>
              </motion.div>

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center"
              >
                <Badge className="bg-figuro-accent/20 text-figuro-accent border-figuro-accent/30 font-medium">
                  {content.badge}
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DialogTitle className="text-2xl font-bold text-white">
                  {content.title}
                </DialogTitle>
                <p className="text-figuro-accent font-medium mt-1">
                  {content.subtitle}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <DialogDescription className="text-white/80 leading-relaxed">
                  {content.description}
                </DialogDescription>
              </motion.div>
            </DialogHeader>

            {/* Benefits list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 space-y-3"
            >
              {content.benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-5 h-5 bg-figuro-accent/20 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-figuro-accent" />
                  </div>
                  <span className="text-white/90 text-sm">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            <DialogFooter className="mt-8 flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full"
              >
                <Button 
                  onClick={handleUpgrade} 
                  className="w-full bg-figuro-accent hover:bg-figuro-accent/90 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-figuro-accent/25 group"
                  disabled={isLoading}
                >
                  {isLoading ? "Redirecting..." : content.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="w-full"
              >
                <Button 
                  variant="ghost" 
                  onClick={() => onOpenChange(false)}
                  className="w-full text-white/60 hover:text-white/80 py-2"
                >
                  Maybe Later
                </Button>
              </motion.div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedUpgradeModal;
