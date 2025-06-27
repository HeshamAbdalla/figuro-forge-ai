import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useEnhancedAuth } from "./EnhancedAuthProvider";
import { cleanupAuthState, clearAuthRateLimits, isRateLimitError } from "@/utils/authUtils";
import { AlertCircle, Mail, Eye, EyeOff, Loader2, CheckCircle, RefreshCw, KeyRound, Shield, AlertTriangle, Info } from "lucide-react";
import { isEmailVerificationError } from "@/utils/authUtils";
import { EmailVerificationHandler } from "./EmailVerificationHandler";
import { ExistingAccountHandler } from "./ExistingAccountHandler";
import { initializeRecaptcha, isRecaptchaReady, getCurrentDomain, isDomainConfigured } from "@/utils/recaptchaUtils";
import { motion } from "framer-motion";

export function AuthForm() {
  const { signIn, signUp, signInWithGoogle, resendVerificationEmail, resetPassword } = useEnhancedAuth();
  const navigate = useNavigate();
  
  // Form state
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  // UI state
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [clearingLimits, setClearingLimits] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [domainConfigured, setDomainConfigured] = useState(true);

  // Enhanced validation state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showExistingAccount, setShowExistingAccount] = useState(false);

  // Check if reCAPTCHA is loaded and domain is configured
  useEffect(() => {
    const loadRecaptcha = async () => {
      try {
        console.log('🚀 [AUTH-FORM] Initializing reCAPTCHA...');
        
        // Check domain configuration
        const isDomainOk = isDomainConfigured();
        setDomainConfigured(isDomainOk);
        
        if (!isDomainOk) {
          console.warn(`⚠️ [AUTH-FORM] Domain ${getCurrentDomain()} not configured for reCAPTCHA`);
        }
        
        // Check if it's already ready
        if (isRecaptchaReady()) {
          console.log('✅ [AUTH-FORM] reCAPTCHA already ready');
          setRecaptchaLoaded(true);
          setRecaptchaError(false);
          return;
        }
        
        // Try to initialize with faster timeout
        const loaded = await initializeRecaptcha();
        
        // Always set to true to allow app to continue
        setRecaptchaLoaded(true);
        
        if (loaded) {
          console.log('✅ [AUTH-FORM] reCAPTCHA loaded successfully');
          setRecaptchaError(false);
        } else {
          console.log('⚠️ [AUTH-FORM] reCAPTCHA failed to load, continuing without it');
          setRecaptchaError(true);
        }
      } catch (error) {
        console.error('❌ [AUTH-FORM] reCAPTCHA initialization error:', error);
        setRecaptchaLoaded(true); // Allow app to continue
        setRecaptchaError(true);
      }
    };
    
    loadRecaptcha();
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 [AUTH-FORM] Starting sign-in...");
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setShowResendOption(false);
    setIsRateLimited(false);
    
    try {
      const { error } = await signIn(email, password, rememberMe);
      
      if (error) {
        console.error("❌ [AUTH-FORM] Sign-in failed:", error);
        setErrorMessage(error);
        if (isEmailVerificationError(error)) {
          setShowResendOption(true);
        } else if (isRateLimitError(error)) {
          setIsRateLimited(true);
        }
      } else {
        console.log("✅ [AUTH-FORM] Sign-in successful, navigating to studio...");
        navigate("/studio");
      }
    } catch (error) {
      console.error("❌ [AUTH-FORM] Sign-in exception:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    setIsRateLimited(false);
    setShowEmailVerification(false);
    setShowExistingAccount(false);
    
    try {
      console.log("🚀 [AUTH-FORM] Starting signup for:", email);
      
      const { error, data, accountExists } = await signUp(email, password);
      
      if (accountExists) {
        console.log("👤 [AUTH-FORM] Existing account detected, showing existing account handler");
        setShowExistingAccount(true);
      } else if (error) {
        console.log("❌ [AUTH-FORM] Signup error:", error);
        
        if (error.includes('email not confirmed') || 
            error.includes('verification') ||
            error.includes('Email not confirmed')) {
          console.log("📧 [AUTH-FORM] Email verification needed");
          setShowEmailVerification(true);
        } else if (isRateLimitError(error)) {
          setIsRateLimited(true);
          setErrorMessage(error);
        } else {
          setErrorMessage(error);
        }
      } else if (!data?.session) {
        console.log("✅ [AUTH-FORM] Signup successful, email verification required");
        setSuccessMessage("Account created successfully! Please check your email for the verification link.");
        setShowResendOption(true);
      } else {
        console.log("✅ [AUTH-FORM] Signup successful with immediate session");
        navigate("/studio");
      }
    } catch (error) {
      console.error("❌ [AUTH-FORM] Signup exception:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    setPasswordResetLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error);
      } else {
        setSuccessMessage("Password reset link sent! Please check your email.");
        setShowPasswordReset(false);
      }
    } catch (error) {
      setErrorMessage("Failed to send password reset email");
    } finally {
      setPasswordResetLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    setResendLoading(true);
    try {
      const { error } = await resendVerificationEmail(email);
      if (error) {
        setErrorMessage(error);
      } else {
        setShowResendOption(false);
        setSuccessMessage("Verification email sent successfully!");
      }
    } catch (error) {
      setErrorMessage("Failed to resend verification email");
    } finally {
      setResendLoading(false);
    }
  };

  const handleClearRateLimits = async () => {
    setClearingLimits(true);
    try {
      await clearAuthRateLimits();
      setIsRateLimited(false);
      setErrorMessage("");
      setTimeout(() => {
        setClearingLimits(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to clear rate limits:', error);
      setClearingLimits(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setIsRateLimited(false);
    try {
      await signInWithGoogle();
    } catch (error) {
      setErrorMessage("Failed to sign in with Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetFormState = () => {
    setShowEmailVerification(false);
    setShowExistingAccount(false);
    setErrorMessage("");
    setSuccessMessage("");
    setShowResendOption(false);
  };

  const isFormValid = email && password && password.length >= 6;

  // Show email verification handler
  if (showEmailVerification) {
    return (
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl rounded-xl">
          <div className="p-8 space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-4">
              <Mail size={32} className="text-figuro-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Verify Your Email 📧
              </h2>
              <p className="text-white/70">
                Your account is almost ready! Just need to verify your email address.
              </p>
            </div>
            <EmailVerificationHandler
              email={email}
              onSuccess={() => {
                setSuccessMessage("Verification email sent! Please check your inbox.");
                resetFormState();
              }}
              onCancel={resetFormState}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  // Show existing account handler
  if (showExistingAccount) {
    return (
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl rounded-xl">
          <div className="p-8 space-y-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-figuro-accent/20 border border-figuro-accent/30 mb-4">
              <Shield size={32} className="text-figuro-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Account Found! 👋
              </h2>
              <p className="text-white/70">
                Looks like you already have an account. Let's get you signed in!
              </p>
            </div>
            <ExistingAccountHandler
              email={email}
              onCancel={resetFormState}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
          <TabsTrigger 
            value="signin" 
            className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white transition-all duration-300 rounded-lg"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger 
            value="signup"
            className="data-[state=active]:bg-figuro-accent data-[state=active]:text-white transition-all duration-300 rounded-lg"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-0">
          <div className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl rounded-xl">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Welcome Back! 🎉
                </h2>
                <p className="text-white/70">
                  Ready to create something amazing? Let's get you signed in!
                </p>
                
                {recaptchaLoaded && !recaptchaError && domainConfigured && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-figuro-accent/80" />
                    <span className="text-xs text-white/50">Protected by Supabase + reCAPTCHA</span>
                  </div>
                )}
                
                {(!domainConfigured || recaptchaError) && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500/80" />
                    <span className="text-xs text-blue-400/70">
                      {!domainConfigured ? 'Using Supabase security (reCAPTCHA domain setup needed)' : 'Using Supabase security (reCAPTCHA not available)'}
                    </span>
                  </div>
                )}
              </div>

              {!domainConfigured && (
                <Alert className="bg-blue-500/10 border-blue-500/30 animate-scale-in rounded-lg">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-white/90 text-sm">
                    <strong>Optional:</strong> To enable full reCAPTCHA protection, add <strong>{getCurrentDomain()}</strong> to your Google reCAPTCHA console. Authentication still works securely through Supabase.
                  </AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 animate-scale-in rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="bg-green-500/10 border-green-500/30 animate-scale-in rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-white/90">{successMessage}</AlertDescription>
                </Alert>
              )}

              {isRateLimited && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-fade-in">
                  <p className="text-sm mb-3 text-white/90 font-medium">
                    Rate limit reached. You can try again in a few minutes, or clear the limit:
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearRateLimits}
                    disabled={clearingLimits}
                    className="flex items-center gap-2 bg-transparent border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                  >
                    {clearingLimits ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {clearingLimits ? "Clearing..." : "Clear rate limit"}
                  </Button>
                </div>
              )}
              
              {showResendOption && (
                <div className="p-4 bg-figuro-accent/10 border border-figuro-accent/20 rounded-lg animate-fade-in">
                  <p className="text-sm mb-3 text-white/90">Haven't received the verification email?</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="flex items-center gap-2 bg-transparent border-figuro-accent/30 text-figuro-accent hover:bg-figuro-accent/10 rounded-lg"
                  >
                    {resendLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {resendLoading ? "Sending..." : "Resend verification email"}
                  </Button>
                </div>
              )}
              
              {showPasswordReset ? (
                <form className="space-y-4" onSubmit={handlePasswordReset}>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                      <KeyRound className="h-4 w-4" />
                      Reset Your Password
                    </h3>
                    <p className="text-sm text-white/80 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        type="submit"
                        disabled={passwordResetLoading || !email}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                      >
                        {passwordResetLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Send Reset Link"
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordReset(false)}
                        className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleSignIn}>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent focus:ring-figuro-accent/30 transition-all duration-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent focus:ring-figuro-accent/30 transition-all duration-300 pr-10 rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white rounded-lg"
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-white/30 data-[state=checked]:bg-figuro-accent data-[state=checked]:border-figuro-accent"
                      />
                      <Label htmlFor="remember" className="text-sm text-white/80">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowPasswordReset(true)}
                      className="text-sm text-figuro-accent hover:text-figuro-accent-hover px-0"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  
                  <Button 
                    className="w-full bg-figuro-accent hover:bg-figuro-accent-hover text-white font-medium py-2.5 transition-all duration-300 disabled:opacity-50 rounded-lg shadow-glow-sm hover:shadow-glow" 
                    type="submit" 
                    disabled={isLoading || !isFormValid || clearingLimits}
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
                </form>
              )}
              
              {!showPasswordReset && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-figuro-dark px-3 text-white/60 font-medium">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleGoogleSignIn}
                    className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
                    disabled={isLoading || googleLoading || clearingLimits}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="signup" className="space-y-0">
          <div className="glass-panel border-white/10 bg-white/5 backdrop-blur-xl rounded-xl">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Start Creating! ✨
                </h2>
                <p className="text-white/70">
                  Join thousands of creators and start building your dreams with AI
                </p>
                
                {recaptchaLoaded && !recaptchaError && domainConfigured && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-figuro-accent/80" />
                    <span className="text-xs text-white/50">Protected by Supabase + reCAPTCHA</span>
                  </div>
                )}
                
                {(!domainConfigured || recaptchaError) && (
                  <div className="flex items-center justify-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-500/80" />
                    <span className="text-xs text-blue-400/70">
                      {!domainConfigured ? 'Using Supabase security (reCAPTCHA domain setup needed)' : 'Using Supabase security (reCAPTCHA not available)'}
                    </span>
                  </div>
                )}
              </div>

              {!domainConfigured && (
                <Alert className="bg-blue-500/10 border-blue-500/30 animate-scale-in rounded-lg">
                  <Info className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-white/90 text-sm">
                    <strong>Optional:</strong> To enable full reCAPTCHA protection, add <strong>{getCurrentDomain()}</strong> to your Google reCAPTCHA console. Authentication still works securely through Supabase.
                  </AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 animate-scale-in rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className="bg-green-500/10 border-green-500/30 animate-scale-in rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-white/90">{successMessage}</AlertDescription>
                </Alert>
              )}

              {isRateLimited && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg animate-fade-in">
                  <p className="text-sm mb-3 text-white/90 font-medium">
                    Rate limit reached. You can try again in a few minutes, or clear the limit:
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearRateLimits}
                    disabled={clearingLimits}
                    className="flex items-center gap-2 bg-transparent border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                  >
                    {clearingLimits ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    {clearingLimits ? "Clearing..." : "Clear rate limit"}
                  </Button>
                </div>
              )}
              
              {showResendOption && (
                <div className="p-4 bg-figuro-accent/10 border border-figuro-accent/20 rounded-lg animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-figuro-accent" />
                    <p className="text-sm text-white/90 font-medium">Account created successfully!</p>
                  </div>
                  <p className="text-sm mb-3 text-white/80">Haven't received the verification email?</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="flex items-center gap-2 bg-transparent border-figuro-accent/30 text-figuro-accent hover:bg-figuro-accent/10 rounded-lg"
                  >
                    {resendLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    {resendLoading ? "Sending..." : "Resend verification email"}
                  </Button>
                </div>
              )}
              
              <form className="space-y-4" onSubmit={handleSignUp}>
                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-white/90 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email-signup"
                    placeholder="Enter your email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent focus:ring-figuro-accent/30 transition-all duration-300 rounded-lg"
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
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-figuro-accent focus:ring-figuro-accent/30 transition-all duration-300 pr-10 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white/60 hover:text-white rounded-lg"
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
                  className="w-full bg-figuro-accent hover:bg-figuro-accent-hover text-white font-medium py-2.5 transition-all duration-300 disabled:opacity-50 rounded-lg shadow-glow-sm hover:shadow-glow" 
                  type="submit" 
                  disabled={isLoading || !isFormValid || clearingLimits}
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
              
              {domainConfigured && !recaptchaError && (
                <div className="p-4 bg-figuro-accent/5 border border-figuro-accent/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-figuro-accent" />
                    <h3 className="text-sm font-medium text-white/90">Enhanced Security</h3>
                  </div>
                  <p className="text-xs text-white/70">
                    Figuro uses Supabase authentication with reCAPTCHA protection to prevent fraud and abuse. Your data is securely processed.
                  </p>
                </div>
              )}
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-figuro-dark px-3 text-white/60 font-medium">Or continue with</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleGoogleSignIn}
                className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
                disabled={isLoading || googleLoading || clearingLimits}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign up with Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
