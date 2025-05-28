
import { motion } from "framer-motion";
import { Check, Wand2, Box, GalleryHorizontal } from "lucide-react";
import { TabKey } from "@/hooks/useTabNavigation";

interface StudioProgressHeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  hasGeneratedImage?: boolean;
  hasModelUrl?: boolean;
  className?: string;
}

const steps = [
  {
    key: 'image-to-3d' as TabKey,
    title: 'Generate Image',
    description: 'Create your figurine concept',
    icon: Wand2,
    step: 1
  },
  {
    key: 'text-to-3d' as TabKey,
    title: 'Text to 3D',
    description: 'Direct 3D model creation',
    icon: Box,
    step: 2
  },
  {
    key: 'gallery' as TabKey,
    title: 'Your Gallery',
    description: 'View your collection',
    icon: GalleryHorizontal,
    step: 3
  }
];

const StudioProgressHeader = ({ 
  activeTab, 
  onTabChange, 
  hasGeneratedImage = false,
  hasModelUrl = false,
  className = "" 
}: StudioProgressHeaderProps) => {
  const getStepStatus = (stepKey: TabKey) => {
    if (stepKey === activeTab) return 'current';
    if (stepKey === 'image-to-3d' && hasGeneratedImage) return 'completed';
    if (stepKey === 'text-to-3d' && hasModelUrl) return 'completed';
    return 'pending';
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="glass-panel border-white/20 backdrop-blur-sm rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gradient mb-6 text-center">
          Create Your 3D Figurine
        </h2>
        
        <div className="flex items-center justify-between max-w-3xl mx-auto relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/20">
            <motion.div
              className="h-full bg-figuro-accent"
              initial={{ width: "0%" }}
              animate={{ 
                width: activeTab === 'image-to-3d' ? "0%" : 
                       activeTab === 'text-to-3d' ? "50%" : "100%" 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {steps.map((step, index) => {
            const status = getStepStatus(step.key);
            const Icon = step.icon;
            
            return (
              <button
                key={step.key}
                onClick={() => onTabChange(step.key)}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                {/* Step Circle */}
                <motion.div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-200
                    ${status === 'current' 
                      ? 'bg-figuro-accent text-white shadow-lg shadow-figuro-accent/30' 
                      : status === 'completed'
                      ? 'bg-green-500 text-white'
                      : 'bg-white/10 text-white/60 group-hover:bg-white/20'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status === 'completed' ? (
                    <Check size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </motion.div>

                {/* Step Info */}
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-white' : 'text-white/70'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-white/50 mt-1 max-w-24">
                    {step.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudioProgressHeader;
