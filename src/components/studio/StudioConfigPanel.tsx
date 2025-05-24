
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, Upload, Key, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StudioConfigPanelProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  showApiInput: boolean;
  setShowApiInput: (show: boolean) => void;
  onUploadModel: () => void;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

const StudioConfigPanel = ({
  apiKey,
  setApiKey,
  showApiInput,
  setShowApiInput,
  onUploadModel,
  user,
  onSignIn,
  onSignOut
}: StudioConfigPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="glass-panel border-white/20 backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 text-white hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <Settings size={16} />
              <span>Studio Configuration</span>
            </div>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="p-4 pt-0 space-y-4">
          {/* API Key Section */}
          {(showApiInput || apiKey) && (
            <div className="space-y-2">
              <label className="text-sm text-white/70 flex items-center gap-2">
                <Key size={14} />
                Hugging Face API Key
              </label>
              <Input
                type="password"
                placeholder="hf_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          )}

          {/* Generation Settings */}
          <div className="space-y-2">
            <label className="text-sm text-white/70">Image Quality</label>
            <Select defaultValue="standard">
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-figuro-darker border-white/20">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high">High Quality</SelectItem>
                <SelectItem value="ultra">Ultra High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model Upload */}
          <Button
            onClick={onUploadModel}
            variant="outline"
            className="w-full border-white/20 hover:border-white/40 bg-white/5"
            disabled={!user}
          >
            <Upload size={16} className="mr-2" />
            Upload Custom Model
          </Button>

          {/* Auth Section */}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <div className="space-y-2">
                <p className="text-xs text-white/70">Signed in as {user.email}</p>
                <Button
                  onClick={onSignOut}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 bg-white/5"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={onSignIn}
                className="w-full bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                Sign In to Create
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default StudioConfigPanel;
