
import React from "react";
import { Info, FileText, Layers, Zap } from "lucide-react";
import { Figurine } from "@/types/figurine";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface ModelWorkspaceSpecsProps {
  figurine: Figurine;
}

const ModelWorkspaceSpecs: React.FC<ModelWorkspaceSpecsProps> = ({ figurine }) => {
  const formatFileSize = (url: string) => {
    // This is a placeholder - in a real app you'd fetch the actual file size
    return figurine.model_url ? "~2.5 MB" : "~500 KB";
  };

  const getFileFormat = () => {
    if (figurine.model_url) {
      return figurine.model_url.includes('.glb') ? 'GLB' : '3D Model';
    }
    return 'PNG Image';
  };

  return (
    <div className="relative rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={3}
      />
      <div className="relative flex flex-col overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
        <div className="flex items-center mb-4">
          <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2 mr-3">
            <Info className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Specifications</h2>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">Format</span>
              </div>
              <span className="text-foreground text-sm font-medium">{getFileFormat()}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">File Size</span>
              </div>
              <span className="text-foreground text-sm">{formatFileSize(figurine.model_url || figurine.image_url)}</span>
            </div>

            {figurine.model_url && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Quality</span>
                  </div>
                  <span className="text-foreground text-sm">High</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Layers className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">Polygons</span>
                  </div>
                  <span className="text-foreground text-sm">~10K</span>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-foreground text-sm font-medium mb-2">Compatibility</h4>
            <div className="flex flex-wrap gap-2">
              {figurine.model_url ? (
                <>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Blender
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Unity
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    Unreal
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                    3D Print
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    Web
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    Print
                  </span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    Design
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelWorkspaceSpecs;
