
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, FileText, Layers, Zap } from "lucide-react";
import { Figurine } from "@/types/figurine";

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
    <Card className="bg-gray-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Info className="w-5 h-5 mr-2 text-figuro-accent" />
          Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-white/50" />
              <span className="text-white/70 text-sm">Format</span>
            </div>
            <span className="text-white text-sm font-medium">{getFileFormat()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Layers className="w-4 h-4 mr-2 text-white/50" />
              <span className="text-white/70 text-sm">File Size</span>
            </div>
            <span className="text-white text-sm">{formatFileSize(figurine.model_url || figurine.image_url)}</span>
          </div>

          {figurine.model_url && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-white/50" />
                  <span className="text-white/70 text-sm">Quality</span>
                </div>
                <span className="text-white text-sm">High</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-white/50" />
                  <span className="text-white/70 text-sm">Polygons</span>
                </div>
                <span className="text-white text-sm">~10K</span>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-white/10">
          <h4 className="text-white text-sm font-medium mb-2">Compatibility</h4>
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
      </CardContent>
    </Card>
  );
};

export default ModelWorkspaceSpecs;
