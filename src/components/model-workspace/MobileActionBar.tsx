
import React, { useState } from "react";
import { Download, Share2, Heart, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ShareModelModal from "./ShareModelModal";
import { Figurine } from "@/types/figurine";

interface MobileActionBarProps {
  figurine: Figurine;
  onDownload: () => void;
  onShare: () => void;
  onLike: () => void;
  isLiked: boolean;
  className?: string;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({
  figurine,
  onDownload,
  onShare,
  onLike,
  isLiked,
  className
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <div className={cn(
        "sticky bottom-0 bg-figuro-dark/95 backdrop-blur-sm border-t border-white/10 p-4 safe-area-pb",
        className
      )}>
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            onClick={onLike}
            variant="ghost"
            className={cn(
              "flex-col space-y-1 h-auto py-2 px-4 transition-all duration-200",
              isLiked 
                ? "text-red-400 hover:text-red-300" 
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            <span className="text-xs">Like</span>
          </Button>

          <Button
            onClick={onDownload}
            variant="ghost"
            className="flex-col space-y-1 h-auto py-2 px-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </Button>

          <Button
            onClick={handleShareClick}
            variant="ghost"
            className="flex-col space-y-1 h-auto py-2 px-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-xs">Share</span>
          </Button>

          <Button
            variant="ghost"
            className="flex-col space-y-1 h-auto py-2 px-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            <MoreVertical className="w-5 h-5" />
            <span className="text-xs">More</span>
          </Button>
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

export default MobileActionBar;
