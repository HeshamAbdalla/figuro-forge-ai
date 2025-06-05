
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Loader2, Eye, EyeOff } from "lucide-react";
import { useEnhancedAuth } from './EnhancedAuthProvider';
import { useNavigate } from 'react-router-dom';

interface ExistingAccountHandlerProps {
  email: string;
  onCancel?: () => void;
}

export function ExistingAccountHandler({ email, onCancel }: ExistingAccountHandlerProps) {
  const { signIn } = useEnhancedAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setSignInError('Password is required');
      return;
    }

    setIsSigningIn(true);
    setSignInError('');

    try {
      console.log('🔑 [EXISTING-ACCOUNT] Attempting sign-in for existing account:', email);
      
      const { error } = await signIn(email, password);
      
      if (error) {
        setSignInError(error);
        console.error('❌ [EXISTING-ACCOUNT] Sign-in failed:', error);
      } else {
        console.log('✅ [EXISTING-ACCOUNT] Sign-in successful, redirecting...');
        navigate('/studio');
      }
    } catch (error: any) {
      console.error('❌ [EXISTING-ACCOUNT] Sign-in exception:', error);
      setSignInError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-orange-500/10 border-orange-500/30">
        <User className="h-4 w-4 text-orange-400" />
        <AlertDescription className="text-white/90">
          <strong>Account Already Exists</strong>
          <br />
          An account with this email already exists. Please sign in with your password.
        </AlertDescription>
      </Alert>

      {signInError && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 animate-scale-in">
          <AlertDescription>{signInError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="existing-email" className="text-white/90 font-medium">
            Email
          </Label>
          <Input
            id="existing-email"
            type="email"
            value={email}
            disabled
            className="bg-white/5 border-white/20 text-white/70"
          />
        </div>

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
              disabled={isSigningIn}
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
        </div>

        <div className="flex gap-3">
          <Button 
            type="submit"
            disabled={isSigningIn || !password}
            className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover text-white"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
          
          {onCancel && (
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          className="text-sm text-figuro-accent hover:text-figuro-accent-hover px-0"
          onClick={() => {
            // You could implement a forgot password flow here
            console.log('Forgot password clicked for:', email);
          }}
        >
          Forgot your password?
        </Button>
      </div>
    </div>
  );
}
