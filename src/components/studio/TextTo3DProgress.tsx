
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TextTo3DProgressProps {
  taskId: string | null;
  status: string;
  progress: number;
  modelUrl?: string;
  onDownload?: () => void;
  onViewModel?: () => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'processing':
    case 'pending':
      return <Loader2 className="animate-spin text-figuro-accent" size={20} />;
    case 'completed':
    case 'succeeded':
      return <CheckCircle className="text-green-400" size={20} />;
    case 'failed':
    case 'error':
      return <AlertCircle className="text-red-400" size={20} />;
    default:
      return <Loader2 className="animate-spin text-figuro-accent" size={20} />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'processing':
    case 'pending':
      return 'Creating your 3D model...';
    case 'completed':
    case 'succeeded':
      return '3D model created successfully!';
    case 'failed':
    case 'error':
      return 'Failed to create 3D model';
    default:
      return 'Processing...';
  }
};

const TextTo3DProgress = ({ 
  taskId, 
  status, 
  progress, 
  modelUrl, 
  onDownload, 
  onViewModel 
}: TextTo3DProgressProps) => {
  if (!taskId) return null;

  const isCompleted = status === 'completed' || status === 'succeeded';
  const isFailed = status === 'failed' || status === 'error';

  return (
    <Card className="glass-panel border-white/20 backdrop-blur-sm p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(status)}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {getStatusText(status)}
              </h3>
              <p className="text-sm text-white/70">Task ID: {taskId.substring(0, 8)}...</p>
            </div>
          </div>

          {!isFailed && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress 
                value={progress} 
                className="bg-white/10" 
              />
            </div>
          )}

          {isCompleted && modelUrl && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={onViewModel}
                className="flex-1 bg-figuro-accent hover:bg-figuro-accent-hover"
              >
                View 3D Model
              </Button>
              <Button
                onClick={onDownload}
                variant="outline"
                className="border-white/20 hover:border-white/40 bg-white/5"
              >
                <Download size={16} />
              </Button>
            </div>
          )}

          {isFailed && (
            <p className="text-sm text-red-400">
              Something went wrong while creating your 3D model. Please try again.
            </p>
          )}
        </div>
      </motion.div>
    </Card>
  );
};

export default TextTo3DProgress;
