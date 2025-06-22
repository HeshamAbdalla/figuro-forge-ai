
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEnhancedAuth } from "@/components/auth/EnhancedAuthProvider";
import { Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import type { UpgradeModalAction } from "@/hooks/useEnhancedUpgradeModal";

interface UpgradeNotificationProps {
  actionType: UpgradeModalAction;
  onDismiss: () => void;
}

const UpgradeNotification: React.FC<UpgradeNotificationProps> = ({
  actionType,
  onDismiss,
}) => {
  const navigate = useNavigate();
  const { user } = useEnhancedAuth();

  const getActionContent = () => {
    switch (actionType) {
      case "image_generation":
        return {
          icon: <Sparkles className="w-5 h-5 text-figuro-accent" />,
          title: "Unlock Unlimited Images",
          description: "You've hit your image generation limit. Upgrade for unlimited creativity!",
          cta: "Unlock Creative Freedom"
        };
      case "model_conversion":
        return {
          icon: <Zap className="w-5 h-5 text-figuro-accent" />,
          title: "More 3D Power Needed",
          description: "You've reached your 3D conversion limit. Upgrade to keep creating!",
          cta: "Upgrade Your 3D Power"
        };
      case "model_remesh":
        return {
          icon: <Crown className="w-5 h-5 text-figuro-accent" />,
          title: "Pro Tools Required",
          description: "Advanced remeshing requires a Pro plan. Upgrade to access pro features!",
          cta: "Unlock Pro Tools"
        };
      default:
        return {
          icon: <Sparkles className="w-5 h-5 text-figuro-accent" />,
          title: "Upgrade Required",
          description: "You've reached your usage limit. Upgrade to continue!",
          cta: "Upgrade Now"
        };
    }
  };

  const content = getActionContent();

  const handleUpgrade = () => {
    console.log('📈 [UPGRADE-NOTIFICATION] Upgrade clicked:', actionType);
    
    if (!user) {
      navigate("/auth");
      return;
    }
    
    onDismiss();
    navigate("/pricing");
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-figuro-dark border border-figuro-accent/30 rounded-lg">
      <div className="flex-shrink-0 p-2 bg-figuro-accent/20 rounded-lg">
        {content.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm">
          {content.title}
        </div>
        <div className="text-white/80 text-sm">
          {content.description}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleUpgrade}
          className="bg-figuro-accent hover:bg-figuro-accent/90 text-white font-medium px-4 py-2 h-auto"
        >
          {content.cta}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          className="text-white/60 hover:text-white/80 px-2 py-1 h-auto"
        >
          Later
        </Button>
      </div>
    </div>
  );
};

export default UpgradeNotification;
