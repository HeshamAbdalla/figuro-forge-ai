
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, LogIn } from "lucide-react";

interface AuthPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  open,
  onOpenChange,
  title = "Authentication Required",
  description = "You must be signed in to download images from the community gallery."
}) => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onOpenChange(false);
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-figuro-darker border border-white/10">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-figuro-accent/20 rounded-full flex items-center justify-center mb-4"
          >
            <Lock className="w-8 h-8 text-figuro-accent" />
          </motion.div>
          <DialogTitle className="text-white text-xl">{title}</DialogTitle>
          <DialogDescription className="text-white/70">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-6">
          <Button
            onClick={handleSignIn}
            className="w-full bg-figuro-accent hover:bg-figuro-accent-hover"
          >
            <LogIn size={16} className="mr-2" />
            Sign In to Download
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/5"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPromptModal;
