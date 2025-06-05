
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useEnhancedAuth } from './EnhancedAuthProvider';

interface EmailVerificationHandlerProps {
  email: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmailVerificationHandler({ email, onSuccess, onCancel }: EmailVerificationHandlerProps) {
  const { resendVerificationEmail } = useEnhancedAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const handleResendVerification = async () => {
    if (!email) {
      setResendError('Email address is required');
      return;
    }

    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      console.log('📧 [EMAIL-VERIFICATION] Resending verification email to:', email);
      
      const { error } = await resendVerificationEmail(email);
      
      if (error) {
        setResendError(error);
        console.error('❌ [EMAIL-VERIFICATION] Resend failed:', error);
      } else {
        setResendSuccess(true);
        console.log('✅ [EMAIL-VERIFICATION] Verification email resent successfully');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ [EMAIL-VERIFICATION] Resend exception:', error);
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-500/10 border-blue-500/30">
        <Mail className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-white/90">
          <strong>Email Verification Required</strong>
          <br />
          An account with this email exists but needs verification. Please check your inbox for the verification link.
        </AlertDescription>
      </Alert>

      {resendSuccess && (
        <Alert className="bg-green-500/10 border-green-500/30 animate-scale-in">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-white/90">
            Verification email sent successfully! Please check your inbox.
          </AlertDescription>
        </Alert>
      )}

      {resendError && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 animate-scale-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{resendError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button 
          onClick={handleResendVerification}
          disabled={isResending}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isResending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Resend Verification Email
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button 
            variant="outline"
            onClick={onCancel}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-white/70">
          Haven't received the email? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
}
