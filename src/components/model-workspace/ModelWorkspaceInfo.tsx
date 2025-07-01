
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Hash, Palette } from "lucide-react";
import { Figurine } from "@/types/figurine";

interface ModelWorkspaceInfoProps {
  figurine: Figurine;
}

const ModelWorkspaceInfo: React.FC<ModelWorkspaceInfoProps> = ({ figurine }) => {
  return (
    <Card className="bg-gray-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Hash className="w-5 h-5 mr-2 text-figuro-accent" />
          Model Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-2">{figurine.title}</h3>
          {figurine.prompt && (
            <p className="text-white/70 text-sm leading-relaxed">
              {figurine.prompt}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 mr-2 text-white/50" />
            <span className="text-white/70">
              Created {new Date(figurine.created_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <User className="w-4 h-4 mr-2 text-white/50" />
            <span className="text-white/70">
              {figurine.metadata?.creator_name || 'Community Member'}
            </span>
          </div>

          <div className="flex items-center text-sm">
            <Palette className="w-4 h-4 mr-2 text-white/50" />
            <Badge variant="secondary" className="bg-figuro-accent/20 text-figuro-accent">
              {figurine.style}
            </Badge>
          </div>
        </div>

        {figurine.metadata && Object.keys(figurine.metadata).length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-white text-sm font-medium mb-2">Properties</h4>
            <div className="space-y-2">
              {figurine.metadata.art_style && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Art Style</span>
                  <span className="text-white/70">{figurine.metadata.art_style}</span>
                </div>
              )}
              {figurine.metadata.generation_mode && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Generation Mode</span>
                  <span className="text-white/70">{figurine.metadata.generation_mode}</span>
                </div>
              )}
              {figurine.metadata.topology_type && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Topology</span>
                  <span className="text-white/70">{figurine.metadata.topology_type}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModelWorkspaceInfo;
