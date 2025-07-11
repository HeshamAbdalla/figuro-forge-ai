
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, Heart, Eye, Copy, Edit } from "lucide-react";
import { Figurine } from "@/types/figurine";
import ShareModelModal from "./ShareModelModal";
import { useFigurineLikes } from "@/hooks/useFigurineLikes";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface ModelWorkspaceActionsProps {
  figurine: Figurine;
  onDownload: () => void;
  onShare: () => void;
}

const ModelWorkspaceActions: React.FC<ModelWorkspaceActionsProps> = ({
  figurine,
  onDownload,
  onShare
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const { isLiked, likeCount, toggleLike, isLoading: isLiking } = useFigurineLikes(
    figurine.id, 
    figurine.like_count || 0
  );

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleLike = async () => {
    await toggleLike();
  };

  return (
    <>
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
              <Eye className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Actions</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onDownload}
              className="w-full bg-figuro-accent hover:bg-figuro-accent/80 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download {figurine.model_url ? 'Model' : 'Image'}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleShareClick}
                className="border-border text-foreground hover:bg-muted"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>

              <Button
                variant="outline"
                onClick={handleLike}
                disabled={isLiking}
                className={cn(
                  "border-border",
                  isLiked 
                    ? 'text-red-400 border-red-400/50 hover:bg-red-400/10' 
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? `Liked (${likeCount})` : `Like (${likeCount})`}
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <h4 className="text-foreground text-sm font-medium mb-3">Create Similar</h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-foreground hover:bg-muted justify-start"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Use This Prompt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-border text-foreground hover:bg-muted justify-start"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Remix This Model
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareModelModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        figurine={figurine}
      />
    </>
  );
};

export default ModelWorkspaceActions;
