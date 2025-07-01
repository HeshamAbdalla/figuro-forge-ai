
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Clock, Users, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ModelViewer from "@/components/model-viewer";
import { Figurine } from "@/types/figurine";

const SharedModel = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [figurine, setFigurine] = useState<Figurine | null>(null);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    validateAccess();
  }, [shareToken]);

  const validateAccess = async (passwordInput?: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('shared-model-access', {
        body: {
          shareToken,
          password: passwordInput || password || null
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        if (data.error === 'Password required') {
          setPasswordRequired(true);
          if (passwordInput || password) {
            toast({
              title: "Incorrect Password",
              description: "Please check your password and try again.",
              variant: "destructive"
            });
          }
        } else {
          setError(data.error);
          toast({
            title: "Access Denied",
            description: data.error,
            variant: "destructive"
          });
        }
      } else {
        // Success - load the model
        setFigurine(data.figurine);
        setShareInfo(data.share_info);
        setPasswordRequired(false);
        toast({
          title: "Model Loaded",
          description: "You now have access to this shared 3D model."
        });
      }
    } catch (err) {
      console.error('❌ Error validating access:', err);
      setError("Failed to load shared model");
      toast({
        title: "Error",
        description: "Failed to load the shared model. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: "Password Required",
        description: "Please enter the password to access this model.",
        variant: "destructive"
      });
      return;
    }
    validateAccess(password);
  };

  const formatExpiration = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Expires soon';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-figuro-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading shared model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-gray-900/50 border-white/10">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-figuro-dark flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-gray-900/50 border-white/10">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-figuro-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-figuro-accent" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Protected</h2>
              <p className="text-white/70">This shared model requires a password to access.</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800/50 border-white/20 text-white placeholder:text-white/50 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-white/50 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-figuro-accent hover:bg-figuro-accent/80"
                disabled={!password.trim()}
              >
                Access Model
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!figurine) {
    return null;
  }

  return (
    <div className="min-h-screen bg-figuro-dark">
      {/* Header */}
      <div className="border-b border-white/10 bg-figuro-dark/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{figurine.title}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent">
                    Shared Model
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    {figurine.style}
                  </Badge>
                </div>
              </div>
            </div>
            
            {shareInfo && (
              <div className="flex items-center space-x-4 text-sm text-white/60">
                {shareInfo.view_count && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{shareInfo.view_count} view{shareInfo.view_count !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {shareInfo.expires_at && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatExpiration(shareInfo.expires_at)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Model Viewer */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Card className="bg-gray-900/50 border-white/10 overflow-hidden h-[80vh]">
            <div className="h-full relative">
              {figurine.model_url ? (
                <ModelViewer
                  modelUrl={figurine.model_url}
                  isLoading={false}
                  variant="gallery"
                  showControls={true}
                  autoRotate={true}
                  fillHeight={true}
                  className="w-full h-full [&_.glass-panel]:bg-transparent [&_.glass-panel]:border-0 [&_.glass-panel]:rounded-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center">
                    <img 
                      src={figurine.image_url} 
                      alt={figurine.title}
                      className="max-w-md max-h-96 mx-auto rounded-lg shadow-2xl"
                    />
                    <p className="text-white/60 mt-4">2D Preview</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
          
          {/* Model Info */}
          {figurine.prompt && (
            <Card className="mt-4 bg-gray-900/50 border-white/10">
              <CardContent className="p-4">
                <h3 className="text-white font-medium mb-2">Description</h3>
                <p className="text-white/70 text-sm leading-relaxed">{figurine.prompt}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedModel;
