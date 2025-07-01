
import React from "react";
import { Calendar, Palette, User, FileType } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Figurine } from "@/types/figurine";

interface MobileModelInfoProps {
  figurine: Figurine;
}

const MobileModelInfo: React.FC<MobileModelInfoProps> = ({ figurine }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-gray-900/50 border-white/10 p-4">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">{figurine.title}</h2>
          {figurine.prompt && (
            <p className="text-white/70 text-sm leading-relaxed">
              {figurine.prompt}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-figuro-accent" />
            <div>
              <p className="text-xs text-white/60">Style</p>
              <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent text-xs mt-1">
                {figurine.style}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-figuro-accent" />
            <div>
              <p className="text-xs text-white/60">Created</p>
              <p className="text-sm text-white/80">{formatDate(figurine.created_at)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <FileType className="w-4 h-4 text-figuro-accent" />
            <div>
              <p className="text-xs text-white/60">Type</p>
              <p className="text-sm text-white/80">
                {figurine.model_url ? '3D Model' : '2D Image'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-figuro-accent" />
            <div>
              <p className="text-xs text-white/60">Creator</p>
              <p className="text-sm text-white/80">
                {figurine.metadata?.creator_name || 'You'}
              </p>
            </div>
          </div>
        </div>

        {figurine.metadata?.conversion_type === 'text-to-3d' && (
          <div className="pt-2 border-t border-white/10">
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
              AI Generated 3D Model
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MobileModelInfo;
