
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ModelViewer from '@/components/model-viewer';
import { Figurine } from '@/types/figurine';

interface FigurineModelDialogProps {
  figurine: Figurine | null;
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to get the best display title
const getDisplayTitle = (figurine: Figurine): string => {
  // First priority: use the prompt if it exists and isn't empty
  if (figurine.prompt && figurine.prompt.trim()) {
    return figurine.prompt.trim();
  }
  
  // Second priority: clean up the title
  let cleanTitle = figurine.title;
  
  // Remove common prefixes for text-to-3D models
  if (cleanTitle.startsWith('Text-to-3D: ')) {
    cleanTitle = cleanTitle.replace('Text-to-3D: ', '');
  }
  
  // Remove generic "3D Model - " prefixes
  if (cleanTitle.startsWith('3D Model - ')) {
    cleanTitle = cleanTitle.replace('3D Model - ', '');
  }
  
  return cleanTitle || 'Untitled Model';
};

const FigurineModelDialog = ({ 
  figurine, 
  isOpen, 
  onClose 
}: FigurineModelDialogProps) => {
  const modelName = figurine ? getDisplayTitle(figurine) : '3D Model';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">
          {modelName} - 3D Model Viewer
        </DialogTitle>
        {figurine?.model_url && (
          <ModelViewer 
            modelUrl={figurine.model_url} 
            isLoading={false}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FigurineModelDialog;
