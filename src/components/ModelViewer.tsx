
import React, { useRef, useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Canvas } from "@react-three/fiber";
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment,
  Center,
  Html
} from "@react-three/drei";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import * as THREE from "three";
import { useToast } from "@/hooks/use-toast";
import { disposeModel, handleObjectUrl } from "@/components/model-viewer/utils/modelUtils";
import { useModelLoader } from "@/hooks/useModelLoader";
import { prioritizeUrls, validateModelUrl } from "@/utils/urlValidationUtils";
import { logModelDebugInfo } from "@/utils/modelDebugUtils";
import GenericModelViewer from "@/components/model-viewer/GenericModelViewer";

interface ModelViewerProps {
  modelUrl: string | null;
  isLoading: boolean;
  progress?: number;
  errorMessage?: string | null;
  onCustomModelLoad?: (url: string) => void;
  variant?: 'standard' | 'compact' | 'gallery';
  showControls?: boolean;
  autoRotate?: boolean;
  className?: string;
  fillHeight?: boolean;
}

// Enhanced loading component
const LoadingSpinner = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-figuro-accent rounded-full animate-spin"></div>
      <p className="mt-4 text-white text-sm">Loading model...</p>
    </div>
  </Html>
);

// Enhanced model content component
const Model = ({ url, onError }: { url: string; onError: (error: any) => void }) => {
  const { loading, model, error, loadModel } = useModelLoader();
  const previousModelRef = useRef<THREE.Group | null>(null);
  
  useEffect(() => {
    if (!url) return;
    
    console.log("🔄 [MODEL-VIEWER] Attempting to load model from URL:", url);
    
    // Validate URL before loading
    const validation = validateModelUrl(url);
    if (!validation.valid) {
      console.error("❌ [MODEL-VIEWER] URL validation failed:", validation.reason);
      onError(new Error(validation.reason || 'Invalid model URL'));
      return;
    }
    
    // Dispose previous model before loading new one
    if (previousModelRef.current) {
      console.log("🗑️ [MODEL-VIEWER] Disposing previous model before loading new one");
      disposeModel(previousModelRef.current);
      previousModelRef.current = null;
    }
    
    // Prioritize URLs if multiple options available
    const prioritizedUrl = prioritizeUrls([url]);
    const finalUrl = prioritizedUrl || url;
    
    console.log("🎯 [MODEL-VIEWER] Using prioritized URL:", finalUrl);
    
    // Load the model
    loadModel(finalUrl);
  }, [url, loadModel, onError]);

  useEffect(() => {
    if (error) {
      console.error("❌ [MODEL-VIEWER] Model loading error:", error);
      onError(new Error(error));
    }
  }, [error, onError]);

  useEffect(() => {
    if (model) {
      previousModelRef.current = model;
    }
  }, [model]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previousModelRef.current) {
        disposeModel(previousModelRef.current);
        previousModelRef.current = null;
      }
    };
  }, []);
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !model) {
    return (
      <Html center>
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-2">Failed to Load Model</div>
          <div className="text-sm text-white/70">
            {error || "Unknown error occurred"}
          </div>
        </div>
      </Html>
    );
  }
  
  return (
    <Center scale={[1.5, 1.5, 1.5]}>
      <primitive object={model} />
    </Center>
  );
};

// Fallback component shown when no model is available
const DummyBox = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="#9b87f5" />
  </mesh>
);

const ModelViewer = ({ 
  modelUrl, 
  isLoading, 
  progress = 0, 
  errorMessage = null,
  onCustomModelLoad,
  variant = 'standard',
  showControls = true,
  autoRotate: initialAutoRotate = true,
  className,
  fillHeight = false
}: ModelViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [modelError, setModelError] = useState<string | null>(null);
  const [modelLoadAttempted, setModelLoadAttempted] = useState(false);
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const customObjectUrlRef = useRef<string | null>(null);
  const originalUrlRef = useRef<string | null>(modelUrl);

  // Reset error state when modelUrl changes
  useEffect(() => {
    if (modelUrl) {
      console.log("🔄 [MODEL-VIEWER] Model URL changed, resetting state");
      setModelError(null);
      setModelLoadAttempted(false);
      originalUrlRef.current = modelUrl;
      
      // Log debug info for the new model URL
      if (modelUrl) {
        console.log("🔍 [MODEL-VIEWER] Debugging new model URL:", modelUrl);
      }
      
      // Reset custom model when a new model is provided
      if (customObjectUrlRef.current) {
        handleObjectUrl(null, customObjectUrlRef.current);
        customObjectUrlRef.current = null;
      }
      setCustomModelUrl(null);
      setCustomFile(null);
    }
  }, [modelUrl]);

  // Handle file upload click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check if file is a GLB format
    if (!file.name.toLowerCase().endsWith('.glb')) {
      toast({
        title: "Invalid file format",
        description: "Please select a GLB file",
        variant: "destructive",
      });
      return;
    }

    console.log("Selected file:", file.name, "size:", file.size);
    setCustomFile(file);
    
    // Create blob URL for the file using proper URL management
    const objectUrl = handleObjectUrl(file, customObjectUrlRef.current);
    customObjectUrlRef.current = objectUrl;
    console.log("Created blob URL:", objectUrl);
    setCustomModelUrl(objectUrl);
    setModelError(null);
    setModelLoadAttempted(false);
    
    toast({
      title: "Custom model loaded",
      description: `${file.name} has been loaded successfully`,
    });
    
    // Call the callback if provided
    if (onCustomModelLoad && objectUrl) {
      onCustomModelLoad(objectUrl);
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (customObjectUrlRef.current) {
        handleObjectUrl(null, customObjectUrlRef.current);
        customObjectUrlRef.current = null;
      }
    };
  }, []);

  if (!modelUrl && !customModelUrl && !isLoading) {
    return null;
  }

  // If we have a model URL, use the GenericModelViewer for better performance and features
  if (modelUrl || customModelUrl) {
    return (
      <GenericModelViewer
        modelInfo={{
          type: 'url',
          modelUrl: customModelUrl || modelUrl || '',
          fileName: customFile?.name || 'Model'
        }}
        isLoading={isLoading}
        progress={progress}
        errorMessage={errorMessage}
        onCustomModelLoad={onCustomModelLoad}
        variant={variant}
        showControls={showControls}
        className={className}
        fillHeight={fillHeight}
      />
    );
  }

  const handleDownload = () => {
    const downloadUrl = customModelUrl || originalUrlRef.current;
    if (!downloadUrl) return;
    
    try {
      // If custom file exists, download it directly
      if (customFile) {
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = customFile.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // For generated models, use the original URL for downloads
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `figurine-model-${new Date().getTime()}.glb`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      toast({
        title: "Download started",
        description: "Your 3D model download has started."
      });
    } catch (error) {
      console.error("❌ [MODEL-VIEWER] Download error:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the model. Try again or check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleModelError = (error: any) => {
    console.error("❌ [MODEL-VIEWER] Error loading 3D model:", error);
    
    let errorMsg = "Failed to load 3D model. The download may still work.";
    
    // Check for specific error types
    if (error?.message) {
      if (error.message.includes("Failed to fetch") || error.message.includes("Network error")) {
        errorMsg = "Network error loading 3D model. The model URL might be restricted by CORS policy. Try the download button instead.";
      } else if (error.message.includes("Cross-Origin") || error.message.includes("CORS")) {
        errorMsg = "CORS policy prevented loading the 3D model. Try the download button instead.";
      } else if (error.message.includes("expired")) {
        errorMsg = "Model URL has expired. Please regenerate the model.";
      } else if (error.message.includes("not found") || error.message.includes("404")) {
        errorMsg = "Model file not found. Please check if the model exists.";
      }
    }
    
    setModelError(errorMsg);
    setModelLoadAttempted(true);
  };

  // Determine if we should show an error message
  const shouldShowError = (errorMessage || modelError) && 
    ((!modelUrl && !customModelUrl) || 
    (modelLoadAttempted && modelError));

  // Determine which URL to use for the 3D model - custom uploaded model takes priority
  const displayModelUrl = customModelUrl || modelUrl;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-xl overflow-hidden"
      ref={containerRef}
    >
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-lg font-medium">3D Model Preview</h3>
        <div className="flex space-x-2">
          {displayModelUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-white/10 hover:border-white/30"
              onClick={() => setAutoRotate(!autoRotate)}
            >
              {autoRotate ? "Stop Rotation" : "Auto Rotate"}
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-white/30"
            onClick={handleUploadClick}
          >
            <Upload size={16} className="mr-1" />
            Upload Model
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".glb"
            className="hidden"
          />
        </div>
      </div>

      <div className="h-[400px] relative">
        {isLoading ? (
          <div className="w-full h-full p-4 flex flex-col items-center justify-center">
            <Skeleton className="w-full h-full rounded-lg bg-white/5 loading-shine" />
            {progress > 0 && (
              <div className="w-full mt-4 px-4 absolute bottom-4 left-0 right-0">
                <Progress 
                  value={progress} 
                  className="h-2 bg-white/10" 
                />
                <p className="text-center text-sm text-white/70 mt-2">
                  {progress < 100 ? `Converting: ${progress}%` : "Finalizing model..."}
                </p>
              </div>
            )}
          </div>
        ) : shouldShowError ? (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-red-400 text-lg mb-2">Failed to Load Model</div>
              <p className="text-white/70 text-sm mb-4">
                {errorMessage || modelError}
              </p>
              {displayModelUrl && (
                <Button
                  onClick={handleDownload}
                  className="bg-figuro-accent hover:bg-figuro-accent/80"
                >
                  <Download size={16} className="mr-2" />
                  Download Model
                </Button>
              )}
            </div>
          </div>
        ) : displayModelUrl ? (
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%)' }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[2, 2, 2]} intensity={0.8} />
            
            <Suspense fallback={<LoadingSpinner />}>
              <Model url={displayModelUrl} onError={handleModelError} />
            </Suspense>
            
            <OrbitControls 
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enablePan={false}
              maxDistance={10}
              minDistance={2}
            />
            
            <Environment preset="studio" />
          </Canvas>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 50 }}
              style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1b69 100%)' }}
            >
              <ambientLight intensity={0.4} />
              <directionalLight position={[2, 2, 2]} intensity={0.8} />
              <DummyBox />
              <OrbitControls enablePan={false} />
            </Canvas>
          </div>
        )}

        {displayModelUrl && !isLoading && !shouldShowError && (
          <div className="absolute bottom-4 right-4">
            <Button
              onClick={handleDownload}
              size="sm"
              className="bg-figuro-accent hover:bg-figuro-accent/80 text-white shadow-lg"
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ModelViewer;
