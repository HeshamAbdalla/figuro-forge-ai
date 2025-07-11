
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Hash, Palette } from "lucide-react";
import { Figurine } from "@/types/figurine";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface ModelWorkspaceInfoProps {
  figurine: Figurine;
}

const ModelWorkspaceInfo: React.FC<ModelWorkspaceInfoProps> = ({ figurine }) => {
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
            <Hash className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Model Details</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-foreground font-medium mb-2">{figurine.title}</h3>
            {figurine.prompt && (
              <p className="text-muted-foreground text-sm leading-relaxed">
                {figurine.prompt}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                Created {new Date(figurine.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center text-sm">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <span className="text-muted-foreground">
                {figurine.metadata?.creator_name || 'Community Member'}
              </span>
            </div>

            <div className="flex items-center text-sm">
              <Palette className="w-4 h-4 mr-2 text-muted-foreground" />
              <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent">
                {figurine.style}
              </Badge>
            </div>
          </div>

          {figurine.metadata && Object.keys(figurine.metadata).length > 0 && (
            <div className="pt-4 border-t border-border">
              <h4 className="text-foreground text-sm font-medium mb-2">Properties</h4>
              <div className="space-y-2">
                {figurine.metadata.art_style && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Art Style</span>
                    <span className="text-muted-foreground">{figurine.metadata.art_style}</span>
                  </div>
                )}
                {figurine.metadata.generation_mode && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Generation Mode</span>
                    <span className="text-muted-foreground">{figurine.metadata.generation_mode}</span>
                  </div>
                )}
                {figurine.metadata.topology_type && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Topology</span>
                    <span className="text-muted-foreground">{figurine.metadata.topology_type}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelWorkspaceInfo;
