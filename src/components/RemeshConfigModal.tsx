
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RemeshSettings } from "@/hooks/useRemesh";

interface RemeshConfigModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (settings: RemeshSettings) => void;
  modelUrl?: string;
}

const RemeshConfigModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  modelUrl,
}: RemeshConfigModalProps) => {
  const [settings, setSettings] = useState<RemeshSettings>({
    targetPolycount: 1000,
    topologyType: 'triangle',
    preserveUVs: true,
    preserveNormals: true,
  });

  const handleConfirm = () => {
    onConfirm(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Remesh 3D Model</DialogTitle>
          <DialogDescription>
            Configure the remeshing settings for your 3D model. This will optimize the mesh topology and reduce polygon count.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Target Polycount */}
          <div className="space-y-2">
            <Label htmlFor="polycount">Target Polygon Count</Label>
            <Input
              id="polycount"
              type="number"
              min={100}
              max={50000}
              value={settings.targetPolycount}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                targetPolycount: parseInt(e.target.value) || 1000
              }))}
              placeholder="1000"
            />
            <p className="text-sm text-muted-foreground">
              Lower values create simpler models, higher values preserve more detail.
            </p>
          </div>

          {/* Topology Type */}
          <div className="space-y-3">
            <Label>Topology Type</Label>
            <RadioGroup
              value={settings.topologyType}
              onValueChange={(value: 'quad' | 'triangle') => 
                setSettings(prev => ({ ...prev, topologyType: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="triangle" id="triangle" />
                <Label htmlFor="triangle">Triangle (Recommended)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quad" id="quad" />
                <Label htmlFor="quad">Quad</Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Triangle topology is better for 3D printing and game engines.
            </p>
          </div>

          {/* Preserve Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="preserve-uvs">Preserve UV Mapping</Label>
              <Switch
                id="preserve-uvs"
                checked={settings.preserveUVs}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, preserveUVs: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="preserve-normals">Preserve Normals</Label>
              <Switch
                id="preserve-normals"
                checked={settings.preserveNormals}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, preserveNormals: checked }))
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="bg-figuro-accent hover:bg-figuro-accent-hover">
            Start Remesh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemeshConfigModal;
