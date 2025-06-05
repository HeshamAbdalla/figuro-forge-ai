
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useEnhancedAuth } from "./EnhancedAuthProvider";

interface EmailVerificationHandlerProps {
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EmailVerificationHandler = ({ email, onSuccess, onCancel }: EmailVerificationHandlerProps) => {
  const { resendVerificationEmail } = useEnhancedAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await resendVerificationEmail(email);
      if (error) {
        setError(error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      setError("Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-500/10 border-green-500/30">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-white/90">
            Verification email sent successfully! Please check your inbox.
          </AlertDescription>
        </Alert>
        
        <div className="text-center">
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Verification Required
        </h3>
        <p className="text-sm text-white/80 mb-4">
          Your account <strong>{email}</strong> exists but needs email verification. 
          We'll send you a new verification link.
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send Verification Email
              </>
            )}
          </Button>
          
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
