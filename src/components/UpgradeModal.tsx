
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
import { useOptimizedAuth } from "@/components/auth/OptimizedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

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
  const { user } = useOptimizedAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getDefaultDescription = () => {
    switch (actionType) {
      case "image_generation":
        return "You've reached your monthly limit for image generations.";
      case "model_conversion":
        return "You've reached your monthly limit for 3D model conversions.";
      case "model_remesh":
        return "You've reached your monthly limit for model remeshing operations.";
      default:
        return "You've reached your usage limit.";
    }
  };

  const getFeatureList = () => {
    const baseFeatures = [
      "More monthly image generations",
      "Additional 3D model conversions",
      "Higher resolution outputs",
      "Advanced art styles",
    ];

    if (actionType === "model_conversion") {
      baseFeatures.push("Priority rendering for faster conversion");
    } else if (actionType === "model_remesh") {
      baseFeatures.push("Model remeshing and optimization");
      baseFeatures.push("Advanced topology controls");
    }

    return baseFeatures;
  };

  const handleUpgrade = () => {
    // If user is not authenticated, send to login page first
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    
    onOpenChange(false);
    navigate("/pricing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || getDefaultDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4">
            Upgrade your plan to continue creating amazing figurines. Our paid plans offer:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            {getFeatureList().map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button 
            onClick={handleUpgrade} 
            className="bg-figuro-accent hover:bg-figuro-accent-hover"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "View Pricing Plans"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
