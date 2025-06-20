
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { AlertTriangle, Zap, Crown, Sparkles } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  actionType: "image_generation" | "model_conversion" | "model_remesh";
}

const UpgradeModal = ({
  isOpen,
  onOpenChange,
  title = "Upgrade Your Plan",
  description,
  actionType,
}: UpgradeModalProps) => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log('🔄 [UPGRADE-MODAL] Modal opened:', {
    isOpen,
    actionType,
    user: !!user
  });

  const getDefaultDescription = () => {
    switch (actionType) {
      case "image_generation":
        return "You've reached your daily limit for image generations. Upgrade to continue creating amazing figurines with unlimited generations.";
      case "model_conversion":
        return "You've reached your monthly limit for 3D model conversions. Upgrade to unlock unlimited conversions and priority processing.";
      case "model_remesh":
        return "You've reached your monthly limit for model remeshing operations. Upgrade for unlimited remeshing and advanced topology controls.";
      default:
        return "You've reached your usage limit. Upgrade to unlock unlimited access to all features.";
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case "image_generation":
        return <Sparkles className="w-5 h-5 text-figuro-accent" />;
      case "model_conversion":
        return <Zap className="w-5 h-5 text-figuro-accent" />;
      case "model_remesh":
        return <Crown className="w-5 h-5 text-figuro-accent" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-figuro-accent" />;
    }
  };

  const getFeatureList = () => {
    const baseFeatures = [
      "Unlimited monthly image generations",
      "Priority processing and faster results", 
      "Access to premium art styles",
      "Higher resolution outputs",
      "Advanced customization options"
    ];

    if (actionType === "model_conversion") {
      baseFeatures.push("Unlimited 3D model conversions");
      baseFeatures.push("Priority rendering queue");
      baseFeatures.push("Advanced model optimization");
    } else if (actionType === "model_remesh") {
      baseFeatures.push("Professional model remeshing");
      baseFeatures.push("Advanced topology controls");
      baseFeatures.push("Batch processing capabilities");
    }

    return baseFeatures;
  };

  const handleUpgrade = async () => {
    console.log('⬆️ [UPGRADE-MODAL] Upgrade button clicked');
    
    try {
      setIsLoading(true);

      // If user is not authenticated, send to login page first
      if (!user) {
        console.log('🚪 [UPGRADE-MODAL] No user, redirecting to auth');
        onOpenChange(false);
        navigate("/auth");
        return;
      }
      
      // Log the upgrade intention
      console.log('📊 [UPGRADE-MODAL] User upgrading from:', actionType);
      
      // Close modal and navigate to pricing
      onOpenChange(false);
      navigate("/pricing");
      
      toast({
        title: "Upgrade Your Plan",
        description: "Choose the perfect plan for your creative needs!",
      });

    } catch (error) {
      console.error('❌ [UPGRADE-MODAL] Upgrade error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaybeLater = () => {
    console.log('⏭️ [UPGRADE-MODAL] Maybe later clicked');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getActionIcon()}
            <DialogTitle className="text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {description || getDefaultDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="bg-gradient-to-r from-figuro-accent/10 to-purple-500/10 rounded-lg p-4 mb-4">
            <p className="text-white/90 font-medium mb-3">
              🚀 Unlock unlimited creativity with our Pro plan:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              {getFeatureList().map((feature, index) => (
                <li key={index} className="text-sm">{feature}</li>
              ))}
            </ul>
          </div>
          
          <div className="text-center p-3 bg-white/5 rounded-lg">
            <p className="text-figuro-accent font-semibold">
              ⚡ Limited Time: 50% off your first month!
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            variant="outline" 
            onClick={handleMaybeLater}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Maybe Later
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="bg-figuro-accent hover:bg-figuro-accent-hover flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <Crown className="w-4 h-4" />
                Upgrade Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
