
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, ArrowLeft, KeyRound, User } from "lucide-react";
import { useEnhancedAuth } from "./EnhancedAuthProvider";
import { useNavigate } from "react-router-dom";

interface ExistingAccountHandlerProps {
  email: string;
  onCancel: () => void;
}

export const ExistingAccountHandler = ({ email, onCancel }: ExistingAccountHandlerProps) => {
  const { signIn, resetPassword } = useEnhancedAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const { error } = await signIn(email, password, false);
      if (error) {
        setError(error);
      } else {
        navigate("/studio");
      }
    } catch (error) {
      setError("Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetLoading(true);
    setError("");
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError(error);
      } else {
        setShowPasswordReset(false);
        // Show success and go back
        setTimeout(() => {
          onCancel();
        }, 1000);
      }
    } catch (error) {
      setError("Failed to send password reset email");
    } finally {
      setResetLoading(false);
    }
  };

  if (showPasswordReset) {
    return (
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2 flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Reset Your Password
          </h3>
          <p className="text-sm text-white/80 mb-4">
            We'll send a password reset link to <strong>{email}</strong>
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {resetLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
            
            <Button
              onClick={() => setShowPasswordReset(false)}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Back
            </Button>
          </div>
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

      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2">
          <User className="h-4 w-4" />
          Welcome Back!
        </h3>
        <p className="text-sm text-white/80 mb-4">
          An account with <strong>{email}</strong> already exists. Please enter your password to sign in.
        </p>
      </div>

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="existing-password" className="text-white/90 font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="existing-password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent focus:ring-figuro-accent/30 transition-all duration-300 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-figuro-accent hover:bg-figuro-accent-hover text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setShowPasswordReset(true)}
              variant="outline"
              className="flex-1 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Forgot Password?
            </Button>

            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
