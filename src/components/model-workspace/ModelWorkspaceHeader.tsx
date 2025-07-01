
import React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Figurine } from "@/types/figurine";

interface ModelWorkspaceHeaderProps {
  figurine: Figurine;
  onBack: () => void;
}

const ModelWorkspaceHeader: React.FC<ModelWorkspaceHeaderProps> = ({
  figurine,
  onBack
}) => {
  return (
    <div className="border-b border-white/10 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
            
            <div className="h-6 w-px bg-white/20" />
            
            <div>
              <h1 className="text-xl font-semibold text-white line-clamp-1">
                {figurine.title}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent">
                  {figurine.style}
                </Badge>
                {figurine.model_url && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    3D Model
                  </Badge>
                )}
                {figurine.metadata?.conversion_type === 'text-to-3d' && (
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    AI Generated
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelWorkspaceHeader;
