
import React, { useState } from "react";
import { ArrowLeft, Info, Share2, Download, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Figurine } from "@/types/figurine";
import { cn } from "@/lib/utils";

interface MobileModelWorkspaceHeaderProps {
  figurine: Figurine;
  onBack: () => void;
  onDownload: () => void;
  onShare: () => void;
  onLike: () => void;
  isLiked: boolean;
}

const MobileModelWorkspaceHeader: React.FC<MobileModelWorkspaceHeaderProps> = ({
  figurine,
  onBack,
  onDownload,
  onShare,
  onLike,
  isLiked
}) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-50 bg-figuro-dark/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white/70 hover:text-white hover:bg-white/10 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-white truncate">
                {figurine.title}
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent text-xs">
                  {figurine.style}
                </Badge>
                {figurine.model_url && (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                    3D
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onLike}
              className={cn(
                "p-2 transition-all duration-200",
                isLiked 
                  ? "text-red-400 hover:text-red-300" 
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/10 p-2"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-figuro-dark border-white/10">
                <div className="space-y-4 pt-6">
                  <div className="space-y-3">
                    <Button
                      onClick={() => setShowInfo(!showInfo)}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                    >
                      <Info className="w-4 h-4 mr-3" />
                      Model Information
                    </Button>
                    
                    <Button
                      onClick={onDownload}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-3" />
                      Download Model
                    </Button>
                    
                    <Button
                      onClick={onShare}
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-white/10"
                    >
                      <Share2 className="w-4 h-4 mr-3" />
                      Share Model
                    </Button>
                  </div>

                  {showInfo && (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                      <div className="text-sm text-white/80">
                        <div className="mb-2">
                          <span className="text-white/60">Style:</span> {figurine.style}
                        </div>
                        <div className="mb-2">
                          <span className="text-white/60">Created:</span> {new Date(figurine.created_at).toLocaleDateString()}
                        </div>
                        {figurine.prompt && (
                          <div className="mb-2">
                            <span className="text-white/60">Prompt:</span>
                            <p className="text-white/70 text-xs mt-1 leading-relaxed">{figurine.prompt}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileModelWorkspaceHeader;
