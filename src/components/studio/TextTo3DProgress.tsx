
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle, Download, CloudDownload, Eye, FolderOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface TextTo3DProgressProps {
  taskId: string | null;
  status: string;
  progress: number;
  modelUrl?: string;
  thumbnailUrl?: string;
  downloadStatus?: string;
  onDownload?: () => void;
  onViewModel?: () => void;
  onRetry?: () => void;
}

const getStatusIcon = (status: string, downloadStatus?: string) => {
  if (status === 'completed' || status === 'succeeded' || status === 'SUCCEEDED') {
    if (downloadStatus === 'downloading') {
      return <CloudDownload className="animate-pulse text-figuro-accent" size={20} />;
    }
    if (downloadStatus === 'completed') {
      return <CheckCircle className="text-green-400" size={20} />;
    }
    if (downloadStatus === 'failed') {
      return <AlertCircle className="text-yellow-400" size={20} />;
    }
  }
  
  switch (status) {
    case 'processing':
    case 'pending':
    case 'IN_PROGRESS':
    case 'PENDING':
    case 'starting':
      return <Loader2 className="animate-spin text-figuro-accent" size={20} />;
    case 'completed':
    case 'succeeded':
    case 'SUCCEEDED':
      return <CheckCircle className="text-green-400" size={20} />;
    case 'failed':
    case 'error':
    case 'FAILED':
      return <AlertCircle className="text-red-400" size={20} />;
    default:
      return <Loader2 className="animate-spin text-figuro-accent" size={20} />;
  }
};

const getStatusText = (status: string, downloadStatus?: string) => {
  if (status === 'completed' || status === 'succeeded' || status === 'SUCCEEDED') {
    if (downloadStatus === 'downloading') {
      return 'Saving model to your collection...';
    }
    if (downloadStatus === 'completed') {
      return '3D model created and saved to your collection!';
    }
    if (downloadStatus === 'failed') {
      return '3D model created (saving to collection failed)';
    }
  }
  
  switch (status) {
    case 'starting':
      return 'Initializing 3D model generation...';
    case 'processing':
    case 'pending':
    case 'IN_PROGRESS':
    case 'PENDING':
      return 'Creating your 3D model...';
    case 'completed':
    case 'succeeded':
    case 'SUCCEEDED':
      return '3D model created successfully!';
    case 'failed':
    case 'error':
    case 'FAILED':
      return 'Failed to create 3D model';
    default:
      return 'Processing...';
  }
};

const getProgressDescription = (progress: number, status: string) => {
  if (status === 'starting') {
    return 'Setting up generation parameters...';
  }
  
  if (progress < 20) {
    return 'Analyzing your prompt...';
  } else if (progress < 40) {
    return 'Generating base geometry...';
  } else if (progress < 60) {
    return 'Adding details and features...';
  } else if (progress < 80) {
    return 'Applying textures and materials...';
  } else if (progress < 95) {
    return 'Finalizing model structure...';
  } else {
    return 'Almost ready...';
  }
};

const TextTo3DProgress = ({ 
  taskId, 
  status, 
  progress, 
  modelUrl, 
  thumbnailUrl,
  downloadStatus,
  onDownload, 
  onViewModel,
  onRetry
}: TextTo3DProgressProps) => {
  const navigate = useNavigate();
  
  if (!taskId && !status) return null;

  const isCompleted = status === 'completed' || status === 'succeeded' || status === 'SUCCEEDED';
  const isFailed = status === 'failed' || status === 'error' || status === 'FAILED';
  const isDownloading = downloadStatus === 'downloading';
  const isSavedToCollection = downloadStatus === 'completed';
  const isProcessing = status === 'processing' || status === 'pending' || status === 'IN_PROGRESS' || status === 'PENDING' || status === 'starting';

  const handleViewCollection = () => {
    navigate('/profile/figurines');
  };

  const estimatedTimeRemaining = () => {
    if (progress === 0) return '3-5 minutes';
    if (progress < 30) return '2-4 minutes';
    if (progress < 60) return '1-3 minutes';
    if (progress < 80) return '1-2 minutes';
    return 'Less than 1 minute';
  };

  return (
    <Card className="glass-panel border-white/20 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(status, downloadStatus)}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">
                {getStatusText(status, downloadStatus)}
              </h3>
              {taskId && (
                <p className="text-sm text-white/70">Task ID: {taskId.substring(0, 8)}...</p>
              )}
              {isProcessing && (
                <p className="text-xs text-white/50">
                  Estimated time: {estimatedTimeRemaining()}
                </p>
              )}
              {downloadStatus && downloadStatus !== 'pending' && (
                <p className="text-xs text-white/50">
                  Storage: {downloadStatus === 'completed' ? 'Saved to your collection' : 
                           downloadStatus === 'downloading' ? 'Saving to collection...' : 
                           downloadStatus === 'failed' ? 'Save failed' : downloadStatus}
                </p>
              )}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>{getProgressDescription(progress, status)}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={isDownloading ? 95 : progress} 
                className="bg-white/10" 
              />
              <p className="text-xs text-center text-white/50">
                Please keep this tab open while generation is in progress
              </p>
            </div>
          )}

          {isCompleted && modelUrl && !isDownloading && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onViewModel}
                className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                <Eye size={16} className="mr-2" />
                View 3D Model
              </Button>
              
              {isSavedToCollection && (
                <Button
                  onClick={handleViewCollection}
                  variant="outline"
                  className="border-white/20 hover:border-white/40 bg-white/5"
                >
                  <FolderOpen size={16} className="mr-2" />
                  View Collection
                </Button>
              )}
              
              {onDownload && (
                <Button
                  onClick={onDownload}
                  variant="outline"
                  className="border-white/20 hover:border-white/40 bg-white/5"
                >
                  <Download size={16} />
                </Button>
              )}
            </div>
          )}

          {isFailed && (
            <div className="space-y-3">
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 mb-2">
                  Something went wrong while creating your 3D model. This could be due to:
                </p>
                <ul className="text-xs text-red-300 space-y-1 ml-4">
                  <li>• Network connectivity issues</li>
                  <li>• Service temporarily unavailable</li>
                  <li>• Invalid prompt or settings</li>
                </ul>
              </div>
              
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="outline"
                  className="w-full border-white/20 hover:border-white/40 bg-white/5"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
              )}
            </div>
          )}

          {downloadStatus === 'failed' && modelUrl && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400">
                  Model created successfully but couldn't be saved to your collection. You can still view and download it, but the link may expire.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onViewModel}
                  size="sm"
                  className="bg-figuro-accent hover:bg-figuro-accent-hover"
                >
                  <Eye size={14} className="mr-2" />
                  View Model
                </Button>
                {onDownload && (
                  <Button
                    onClick={onDownload}
                    size="sm"
                    variant="outline"
                    className="border-white/20 hover:border-white/40 bg-white/5"
                  >
                    <Download size={14} className="mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

export default TextTo3DProgress;
