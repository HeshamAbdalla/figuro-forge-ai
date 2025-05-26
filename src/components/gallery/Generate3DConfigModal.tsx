
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Zap, Palette, Cpu } from 'lucide-react';

export interface Generate3DConfig {
  art_style: 'realistic' | 'cartoon' | 'low-poly';
  negative_prompt?: string;
  ai_model: string;
  topology: 'quad' | 'triangle';
  target_polycount?: number;
  texture_richness: 'high' | 'medium' | 'low';
  moderation: boolean;
}

interface Generate3DConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: Generate3DConfig) => void;
  imageUrl: string;
  imageName: string;
}

const Generate3DConfigModal: React.FC<Generate3DConfigModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  imageUrl,
  imageName
}) => {
  const [config, setConfig] = useState<Generate3DConfig>({
    art_style: 'realistic',
    negative_prompt: '',
    ai_model: 'meshy-5',
    topology: 'quad',
    target_polycount: 20000,
    texture_richness: 'high',
    moderation: true
  });

  const handleGenerate = () => {
    onGenerate(config);
  };

  const updateConfig = (key: keyof Generate3DConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-figuro-dark border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Settings className="h-5 w-5" />
            Configure 3D Model Generation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="flex items-center gap-4 p-4 glass-panel rounded-lg">
            <img 
              src={imageUrl} 
              alt={imageName}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="text-white font-medium">{imageName}</h3>
              <p className="text-white/60 text-sm">Source image for 3D conversion</p>
            </div>
          </div>

          <Separator className="border-white/10" />

          {/* Quality Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-figuro-accent" />
              <Label className="text-white font-medium">Quality Settings</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80">Art Style</Label>
                <Select value={config.art_style} onValueChange={(value) => updateConfig('art_style', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-figuro-dark border-white/10">
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="low-poly">Low Poly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">AI Model</Label>
                <Select value={config.ai_model} onValueChange={(value) => updateConfig('ai_model', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-figuro-dark border-white/10">
                    <SelectItem value="meshy-5">Meshy-5 (Latest)</SelectItem>
                    <SelectItem value="meshy-4">Meshy-4</SelectItem>
                    <SelectItem value="meshy-3">Meshy-3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="border-white/10" />

          {/* Topology Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-figuro-accent" />
              <Label className="text-white font-medium">Topology Settings</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80">Topology Type</Label>
                <Select value={config.topology} onValueChange={(value) => updateConfig('topology', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-figuro-dark border-white/10">
                    <SelectItem value="quad">Quad (Better for editing)</SelectItem>
                    <SelectItem value="triangle">Triangle (Game-ready)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white/80">Target Polycount</Label>
                <Select 
                  value={config.target_polycount?.toString()} 
                  onValueChange={(value) => updateConfig('target_polycount', parseInt(value))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-figuro-dark border-white/10">
                    <SelectItem value="10000">10K (Low)</SelectItem>
                    <SelectItem value="20000">20K (Medium)</SelectItem>
                    <SelectItem value="30000">30K (High)</SelectItem>
                    <SelectItem value="50000">50K (Ultra)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="border-white/10" />

          {/* Texture Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-figuro-accent" />
              <Label className="text-white font-medium">Texture Settings</Label>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80">Texture Richness</Label>
                <Select value={config.texture_richness} onValueChange={(value) => updateConfig('texture_richness', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-figuro-dark border-white/10">
                    <SelectItem value="high">High (Most detailed)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="low">Low (Faster generation)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-white/80">Content Moderation</Label>
                <Switch 
                  checked={config.moderation} 
                  onCheckedChange={(checked) => updateConfig('moderation', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleGenerate}
              className="bg-figuro-accent hover:bg-figuro-accent-hover"
            >
              Generate 3D Model
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-white/60 border-t border-white/10 pt-4">
            <p>Generation typically takes 2-5 minutes depending on quality settings.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Generate3DConfigModal;
