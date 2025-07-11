
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SlideButton } from '@/components/ui/slide-button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Settings, Zap, Palette, Cpu, Image as ImageIcon } from 'lucide-react';

export interface ImageTo3DConfig {
  art_style: 'realistic' | 'cartoon' | 'low-poly';
  negative_prompt?: string;
  ai_model: string;
  topology: 'quad' | 'triangle';
  target_polycount?: number;
  texture_richness: 'high' | 'medium' | 'low';
  moderation: boolean;
}

interface ImageTo3DConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (config: ImageTo3DConfig) => void;
  imageUrl: string | null;
  isGenerating?: boolean;
}

const ImageTo3DConfigModal: React.FC<ImageTo3DConfigModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  imageUrl,
  isGenerating = false
}) => {
  const [config, setConfig] = useState<ImageTo3DConfig>({
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

  const updateConfig = (key: keyof ImageTo3DConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-figuro-dark border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-3">
            <Settings className="h-5 w-5" />
            Configure Image-to-3D Conversion
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Image Preview */}
          {imageUrl && (
            <div className="flex items-center gap-4 p-4 glass-panel rounded-lg">
              <img 
                src={imageUrl} 
                alt="Source image"
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-white font-medium flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Source Image
                </h3>
                <p className="text-white/60 text-sm">Ready for 3D conversion</p>
              </div>
            </div>
          )}

          <Separator className="border-white/10" />

          {/* Quality Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-figuro-accent" />
              <Label className="text-white font-medium">Quality Settings</Label>
            </div>
            
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
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
              className="border-white/10"
            >
              Cancel
            </Button>
            
            <SlideButton
              onClick={handleGenerate}
              disabled={isGenerating || !imageUrl}
              isLoading={isGenerating}
              loadingText="Generating..."
              icon={<Settings className="h-4 w-4" />}
              variant="primary"
            >
              Generate 3D Model
            </SlideButton>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-white/60 border-t border-white/10 pt-4">
            <p>Generation uses Meshy-5 AI model with content moderation enabled.</p>
            <p>Typically takes 2-5 minutes depending on quality settings.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageTo3DConfigModal;
