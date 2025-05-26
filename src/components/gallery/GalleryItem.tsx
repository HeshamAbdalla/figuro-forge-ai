
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Eye, Box, Loader2 } from "lucide-react";
import ModelPlaceholder from "./ModelPlaceholder";
import ModelPreview from "./ModelPreview";
import { useSecureDownload } from "@/hooks/useSecureDownload";
import AuthPromptModal from "@/components/auth/AuthPromptModal";

interface BucketImage {
  name: string;
  url: string;
  id: string;
  created_at: string;
  fullPath?: string;
  type: 'image' | '3d-model';
}

interface GalleryItemProps {
  file: BucketImage;
  onDownload: (url: string, name: string) => void;
  onViewModel: (url: string) => void;
  onGenerate3D?: (url: string, name: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ 
  file, 
  onDownload, 
  onViewModel,
  onGenerate3D 
}) => {
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  
  const { 
    secureDownload, 
    isDownloading, 
    authPromptOpen, 
    setAuthPromptOpen,
    isAuthenticated 
  } = useSecureDownload();

  // Load state handlers
  const handlePreviewLoaded = () => {
    setIsPreviewLoaded(true);
  };

  const handlePreviewFailed = () => {
    setPreviewFailed(true);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    secureDownload(file.url, file.name);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onViewModel(file.url);
  };

  const handleGenerate3DClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onGenerate3D) {
      onGenerate3D(file.url, file.name);
    }
  };

  return (
    <>
      <div className="glass-panel rounded-lg overflow-hidden group">
        <div className="aspect-square relative overflow-hidden bg-white/5">
          {file.type === 'image' ? (
            <img 
              src={`${file.url}?t=${Date.now()}`} 
              alt={file.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full">
              {!previewFailed ? (
                <div className="w-full h-full" onLoad={handlePreviewLoaded}>
                  <ModelPreview 
                    modelUrl={file.url} 
                    fileName={file.name} 
                  />
                </div>
              ) : (
                <ModelPlaceholder fileName={file.name} />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
            <div className="p-4 w-full">
              {file.type === 'image' ? (
                <div className="flex flex-col space-y-2 w-full">
                  <Button 
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    className="w-full bg-figuro-accent hover:bg-figuro-accent-hover"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" /> 
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" /> 
                        {isAuthenticated ? 'Download' : 'Sign in to Download'}
                      </>
                    )}
                  </Button>
                  {onGenerate3D && (
                    <Button 
                      onClick={handleGenerate3DClick}
                      variant="outline"
                      className="w-full border-white/10"
                    >
                      <Box size={16} className="mr-2" /> Generate 3D Model
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col space-y-2 w-full">
                  <Button 
                    onClick={handleViewClick}
                    className="w-full bg-figuro-accent hover:bg-figuro-accent-hover"
                  >
                    <Eye size={16} className="mr-2" /> View Model
                  </Button>
                  <Button 
                    onClick={handleDownloadClick}
                    disabled={isDownloading}
                    variant="outline"
                    className="w-full border-white/10"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" /> 
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download size={16} className="mr-2" /> 
                        {isAuthenticated ? 'Download' : 'Sign in to Download'}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
      />
    </>
  );
};

export default GalleryItem;
