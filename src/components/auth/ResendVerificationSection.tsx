
import { Button } from "@/components/ui/button";
import { Loader2, Mail, CheckCircle } from "lucide-react";

interface ResendVerificationSectionProps {
  onResend: () => void;
  isLoading: boolean;
  variant?: "signup" | "signin";
}

export function ResendVerificationSection({ 
  onResend, 
  isLoading, 
  variant = "signin" 
}: ResendVerificationSectionProps) {
  return (
    <div className="p-4 bg-figuro-accent/10 border border-figuro-accent/20 rounded-lg animate-fade-in">
      {variant === "signup" && (
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-figuro-accent" />
          <p className="text-sm text-white/90 font-medium">Account created successfully!</p>
        </div>
      )}
      <p className="text-sm mb-3 text-white/80">Haven't received the verification email?</p>
      <Button 
        variant="outline" 
        size="sm"
        onClick={onResend}
        disabled={isLoading}
        className="flex items-center gap-2 bg-transparent border-figuro-accent/30 text-figuro-accent hover:bg-figuro-accent/10"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        {isLoading ? "Sending..." : "Resend verification email"}
      </Button>
      <p className="text-xs mt-2 text-white/60">
        Make sure to check your spam/junk folder
      </p>
    </div>
  );
}
