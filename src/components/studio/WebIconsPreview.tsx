
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RotateCcw, Image } from "lucide-react";

interface WebIconsPreviewProps {
  iconUrl: string | null;
  isLoading: boolean;
  onClear: () => void;
  onDownload: (format: string) => void;
}

const downloadFormats = [
  { format: "png", label: "PNG", description: "Best for web" },
  { format: "svg", label: "SVG", description: "Vector format" },
  { format: "ico", label: "ICO", description: "Favicon" },
];

const WebIconsPreview = ({ iconUrl, isLoading, onClear, onDownload }: WebIconsPreviewProps) => {
  if (isLoading) {
    return (
      <Card className="glass-panel border-white/20 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Image className="w-5 h-5" />
            Generating Icon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-figuro-accent border-t-transparent rounded-full"
            />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-figuro-accent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-sm text-white/70 text-center">Creating your web icon...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!iconUrl) {
    return (
      <Card className="glass-panel border-white/20 h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <Image className="w-5 h-5" />
            Icon Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center border-2 border-dashed border-white/20">
            <div className="text-center text-white/50">
              <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Your generated icon will appear here</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-panel border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gradient">
              <Image className="w-5 h-5" />
              Generated Icon
            </CardTitle>
            <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
              Ready
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-square bg-white rounded-lg p-4 flex items-center justify-center">
            <img
              src={iconUrl}
              alt="Generated web icon"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white/90">Download Options</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="text-white/70 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {downloadFormats.map((item) => (
                <Button
                  key={item.format}
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(item.format)}
                  className="justify-between bg-white/5 border-white/20 hover:bg-white/10"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-xs text-white/60">{item.description}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WebIconsPreview;
