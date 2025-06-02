
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import ModelViewer from '@/components/model-viewer';
import { Figurine } from '@/types/figurine';

interface FigurineModelDialogProps {
  figurine: Figurine | null;
  isOpen: boolean;
  onClose: () => void;
}

const FigurineModelDialog = ({ 
  figurine, 
  isOpen, 
  onClose 
}: FigurineModelDialogProps) => {
  const modelName = figurine?.title || '3D Model';

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
