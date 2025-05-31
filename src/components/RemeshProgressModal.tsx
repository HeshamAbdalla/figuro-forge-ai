
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, CheckCircle, XCircle } from "lucide-react";
import { RemeshProgress } from "@/hooks/useRemesh";

interface RemeshProgressModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  progress: RemeshProgress;
  onDownload?: (modelUrl: string) => void;
  onViewModel?: (modelUrl: string) => void;
}

const RemeshProgressModal = ({
  isOpen,
  onOpenChange,
  progress,
  onDownload,
  onViewModel,
}: RemeshProgressModalProps) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'processing':
        return <Loader2 className="h-6 w-6 animate-spin text-figuro-accent" />;
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'processing':
        return 'Remeshing in Progress';
      case 'completed':
        return 'Remesh Completed';
      case 'failed':
        return 'Remesh Failed';
      default:
        return 'Remesh Status';
    }
  };

  const handleDownload = () => {
    if (progress.remeshedModelUrl && onDownload) {
      onDownload(progress.remeshedModelUrl);
    }
  };

  const handleViewModel = () => {
    if (progress.remeshedModelUrl && onViewModel) {
      onViewModel(progress.remeshedModelUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            {getStatusText()}
          </DialogTitle>
          <DialogDescription>
            {progress.status === 'processing' && "Please wait while we optimize your 3D model..."}
            {progress.status === 'completed' && "Your model has been successfully remeshed!"}
            {progress.status === 'failed' && "There was an error processing your model."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="w-full" />
          </div>

          {/* Status Message */}
          {progress.message && (
            <div className="text-sm text-muted-foreground text-center">
              {progress.message}
            </div>
          )}

          {/* Task ID */}
          {progress.taskId && (
            <div className="text-xs text-muted-foreground text-center font-mono">
              Task: {progress.taskId}
            </div>
          )}
        </div>

        <DialogFooter>
          {progress.status === 'completed' && progress.remeshedModelUrl && (
            <>
              <Button variant="outline" onClick={handleViewModel}>
                View Model
              </Button>
              <Button onClick={handleDownload} className="bg-figuro-accent hover:bg-figuro-accent-hover">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </>
          )}
          
          {(progress.status === 'failed' || progress.status === 'completed') && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
          
          {progress.status === 'processing' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continue in Background
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemeshProgressModal;
