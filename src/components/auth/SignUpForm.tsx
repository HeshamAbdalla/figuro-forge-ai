
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { ResendVerificationSection } from "./ResendVerificationSection";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface SignUpFormProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onGoogleSignIn: () => void;
  onResendVerification: () => void;
  isLoading: boolean;
  googleLoading: boolean;
  resendLoading: boolean;
  errorMessage: string;
  showResendOption: boolean;
}

export function SignUpForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onGoogleSignIn,
  onResendVerification,
  isLoading,
  googleLoading,
  resendLoading,
  errorMessage,
  showResendOption
}: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isFormValid = email && password && password.length >= 6;

  return (
    <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl font-bold text-white text-center">
          Create Account
        </CardTitle>
        <CardDescription className="text-white/70 text-center">
          Join Figuro.AI and start creating amazing 3D figurines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 animate-scale-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {showResendOption && (
          <ResendVerificationSection
            onResend={onResendVerification}
            isLoading={resendLoading}
            variant="signup"
          />
        )}
        
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email-signup" className="text-white/90 font-medium">
              Email
            </Label>
            <Input
              id="email-signup"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={isLoading}
              required
              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent focus:ring-figuro-accent/30 transition-all duration-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password-signup" className="text-white/90 font-medium">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password-signup"
                placeholder="Create a password (min. 6 characters)"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
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
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {password && password.length < 6 && (
              <p className="text-xs text-red-400">Password must be at least 6 characters long</p>
            )}
          </div>
          <Button 
            className="w-full bg-figuro-accent hover:bg-figuro-accent-hover text-white font-medium py-2.5 transition-all duration-300 disabled:opacity-50" 
            type="submit" 
            disabled={isLoading || !isFormValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-figuro-dark px-3 text-white/60 font-medium">Or continue with</span>
          </div>
        </div>
        
        <GoogleSignInButton
          onClick={onGoogleSignIn}
          isLoading={googleLoading}
          disabled={isLoading || googleLoading}
          variant="signup"
        />
      </CardContent>
    </Card>
  );
}
