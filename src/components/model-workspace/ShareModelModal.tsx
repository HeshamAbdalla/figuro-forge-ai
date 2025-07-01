
import React, { useState } from "react";
import { Share2, Copy, Lock, Clock, Eye, Users, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Figurine } from "@/types/figurine";

interface ShareModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  figurine: Figurine;
}

const ShareModelModal: React.FC<ShareModelModalProps> = ({
  isOpen,
  onClose,
  figurine
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Share settings
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [setExpiration, setSetExpiration] = useState(false);
  const [expirationTime, setExpirationTime] = useState("24");
  const [limitViews, setLimitViews] = useState(false);
  const [maxViews, setMaxViews] = useState("100");

  const createShare = async () => {
    console.log('🚀 Starting createShare function');
    console.log('📝 Figurine data:', {
      id: figurine.id,
      title: figurine.title,
      user_id: figurine.user_id
    });

    try {
      setLoading(true);
      
      // Step 1: Check session
      console.log('🔍 Step 1: Checking user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }

      if (!session) {
        console.error('❌ No session found');
        toast({
          title: "Authentication Required",
          description: "Please sign in to create shares.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Session found:', {
        userId: session.user.id,
        tokenLength: session.access_token.length,
        expiresAt: session.expires_at
      });

      // Step 2: Prepare share configuration
      const shareConfig = {
        figurineId: figurine.id,
        password: requirePassword ? password || null : null,
        expiresHours: setExpiration ? parseInt(expirationTime) : null,
        maxViews: limitViews ? parseInt(maxViews) : null
      };

      console.log('📋 Share configuration:', shareConfig);

      // Step 3: Call edge function with proper headers and body
      console.log('🌐 Calling edge function...');
      
      const { data, error } = await supabase.functions.invoke('create-model-share', {
        body: JSON.stringify(shareConfig),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      console.log('📥 Edge function response:', { data, error });

      if (error) {
        console.error('❌ Edge function error:', error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (data?.error) {
        console.error('❌ Edge function returned error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.shareToken) {
        console.error('❌ No share token in response:', data);
        throw new Error('No share token received from server');
      }

      console.log('✅ Share token received:', data.shareToken);

      const baseUrl = window.location.origin;
      const fullShareUrl = `${baseUrl}/shared/${data.shareToken}`;
      setShareUrl(fullShareUrl);
      
      toast({
        title: "Share Created!",
        description: "Your model share link has been generated successfully."
      });

      console.log('🎉 Share creation completed successfully');
      
    } catch (error) {
      console.error('💥 Critical error in createShare:', error);
      console.error('🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Failed to create share link. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('🏁 createShare function completed');
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to your clipboard."
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareViaApi = async (platform: string) => {
    if (!shareUrl) return;
    
    const shareData = {
      title: `Check out this 3D model: ${figurine.title}`,
      text: figurine.prompt ? `"${figurine.prompt}" - ` : '',
      url: shareUrl
    };

    if (navigator.share && platform === 'native') {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback to copying URL
      copyToClipboard();
    }
  };

  const resetModal = () => {
    setShareUrl(null);
    setRequirePassword(false);
    setPassword("");
    setSetExpiration(false);
    setExpirationTime("24");
    setLimitViews(false);
    setMaxViews("100");
    setCopied(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-figuro-dark border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-figuro-accent" />
            Share 3D Model
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <img 
              src={figurine.image_url} 
              alt={figurine.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{figurine.title}</h3>
              <p className="text-white/60 text-sm truncate">{figurine.style} style</p>
            </div>
          </div>

          {!shareUrl ? (
            /* Share Configuration */
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-white/60" />
                    <Label htmlFor="password-toggle" className="text-white">Password Protection</Label>
                  </div>
                  <Switch
                    id="password-toggle"
                    checked={requirePassword}
                    onCheckedChange={setRequirePassword}
                  />
                </div>
                
                {requirePassword && (
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-gray-800/50 border-white/20 text-white placeholder:text-white/50"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-white/60" />
                    <Label htmlFor="expiration-toggle" className="text-white">Set Expiration</Label>
                  </div>
                  <Switch
                    id="expiration-toggle"
                    checked={setExpiration}
                    onCheckedChange={setSetExpiration}
                  />
                </div>
                
                {setExpiration && (
                  <Select value={expirationTime} onValueChange={setExpirationTime}>
                    <SelectTrigger className="bg-gray-800/50 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-white/20">
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                      <SelectItem value="720">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-white/60" />
                    <Label htmlFor="views-toggle" className="text-white">Limit Views</Label>
                  </div>
                  <Switch
                    id="views-toggle"
                    checked={limitViews}
                    onCheckedChange={setLimitViews}
                  />
                </div>
                
                {limitViews && (
                  <Input
                    type="number"
                    placeholder="Maximum views"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    min="1"
                    className="bg-gray-800/50 border-white/20 text-white placeholder:text-white/50"
                  />
                )}
              </div>

              <Button 
                onClick={createShare}
                disabled={loading || (requirePassword && !password.trim())}
                className="w-full bg-figuro-accent hover:bg-figuro-accent/80"
              >
                {loading ? "Creating Share..." : "Create Share Link"}
              </Button>
            </div>
          ) : (
            /* Share URL Display */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Share URL</Label>
                <div className="flex space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-gray-800/50 border-white/20 text-white"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 px-3"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => shareViaApi('native')}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Share
                </Button>
                <Button
                  onClick={resetModal}
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Create Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModelModal;
