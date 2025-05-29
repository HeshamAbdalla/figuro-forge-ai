
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TabsContent } from "@/components/ui/tabs";
import { useAuth } from "./AuthProvider";
import { cleanupAuthState } from "@/utils/authUtils";
import { isEmailVerificationError } from "@/utils/authUtils";
import { AuthFormTabs } from "./AuthFormTabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

export function AuthForm() {
  const { signIn, signUp, signInWithGoogle, resendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setShowResendOption(false);
    
    cleanupAuthState();
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setErrorMessage(error);
      if (isEmailVerificationError(error)) {
        setShowResendOption(true);
      }
    } else {
      navigate("/");
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    cleanupAuthState();
    
    const { error, data } = await signUp(email, password);
    
    if (error) {
      setErrorMessage(error);
    } else if (!data?.session) {
      setErrorMessage("Please check your email (including spam folder) and click the verification link to complete your registration.");
      setShowResendOption(true);
    }
    
    setIsLoading(false);
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    
    setResendLoading(true);
    const { error } = await resendVerificationEmail(email);
    setResendLoading(false);
    
    if (error) {
      setErrorMessage(error);
    } else {
      setShowResendOption(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signInWithGoogle();
    setGoogleLoading(false);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <AuthFormTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <TabsContent value="signin" className="space-y-0">
        <SignInForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          onResendVerification={handleResendVerification}
          isLoading={isLoading}
          googleLoading={googleLoading}
          resendLoading={resendLoading}
          errorMessage={errorMessage}
          showResendOption={showResendOption}
        />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-0">
        <SignUpForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={handleSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          onResendVerification={handleResendVerification}
          isLoading={isLoading}
          googleLoading={googleLoading}
          resendLoading={resendLoading}
          errorMessage={errorMessage}
          showResendOption={showResendOption}
        />
      </TabsContent>
    </div>
  );
}
