
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Heart, Eye, Copy, Edit } from "lucide-react";
import { Figurine } from "@/types/figurine";
import ShareModelModal from "./ShareModelModal";

interface ModelWorkspaceActionsProps {
  figurine: Figurine;
  isLiked: boolean;
  onDownload: () => void;
  onShare: () => void;
  onLike: () => void;
}

const ModelWorkspaceActions: React.FC<ModelWorkspaceActionsProps> = ({
  figurine,
  isLiked,
  onDownload,
  onShare,
  onLike
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  return (
    <>
      <Card className="bg-gray-900/50 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Eye className="w-5 h-5 mr-2 text-figuro-accent" />
            Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>

            <Button
              variant="outline"
              onClick={onLike}
              className={`border-white/20 ${
                isLiked 
                  ? 'text-red-400 border-red-400/50 hover:bg-red-400/10' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? 'Liked' : 'Like'}
            </Button>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-white text-sm font-medium mb-3">Create Similar</h4>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-white hover:bg-white/10 justify-start"
              >
                <Copy className="w-4 h-4 mr-2" />
                Use This Prompt
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/20 text-white hover:bg-white/10 justify-start"
              >
                <Edit className="w-4 h-4 mr-2" />
                Remix This Model
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareModelModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        figurine={figurine}
      />
    </>
  );
};

export default ModelWorkspaceActions;
