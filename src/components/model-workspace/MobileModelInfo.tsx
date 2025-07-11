
import React from "react";
import { Calendar, Palette, User, FileType } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Figurine } from "@/types/figurine";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

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
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">{figurine.title}</h2>
            {figurine.prompt && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {figurine.prompt}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-figuro-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Style</p>
                <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent text-xs mt-1">
                  {figurine.style}
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-figuro-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm text-foreground">{formatDate(figurine.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FileType className="w-4 h-4 text-figuro-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm text-foreground">
                  {figurine.model_url ? '3D Model' : '2D Image'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-figuro-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Creator</p>
                <p className="text-sm text-foreground">
                  {figurine.metadata?.creator_name || 'You'}
                </p>
              </div>
            </div>
          </div>

          {figurine.metadata?.conversion_type === 'text-to-3d' && (
            <div className="pt-2 border-t border-border">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-xs">
                AI Generated 3D Model
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileModelInfo;
