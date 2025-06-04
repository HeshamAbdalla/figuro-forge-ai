
import type { TextTo3DModelInfo } from '@/utils/textTo3DModelUtils';

// Discriminated union for model viewer props
export type EnhancedModelViewerProps = {
  isLoading: boolean;
  progress?: number;
  errorMessage?: string | null;
  onCustomModelLoad?: (url: string, file: File) => void;
  variant?: "standard" | "compact" | "gallery";
  showControls?: boolean;
  autoRotate?: boolean;
  className?: string;
} & (
  | {
      // Standard model viewer with simple URL
      modelUrl: string | null;
      modelInfo?: never;
      viewerType?: 'standard';
    }
  | {
      // Text-to-3D model viewer with enhanced model info
      modelInfo: TextTo3DModelInfo | null;
      modelUrl?: never;
      viewerType: 'text-to-3d';
    }
);

export interface ModelViewerBaseProps {
  isLoading: boolean;
  progress?: number;
  errorMessage?: string | null;
  onCustomModelLoad?: (url: string, file: File) => void;
  variant?: "standard" | "compact" | "gallery";
  showControls?: boolean;
  autoRotate?: boolean;
  className?: string;
}
