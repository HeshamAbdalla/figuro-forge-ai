
import { motion } from "framer-motion";
import { Check, Wand2, Box, Palette, Camera, GalleryHorizontal } from "lucide-react";
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
    key: 'camera' as TabKey,
    title: 'Camera',
    description: 'Take a photo',
    icon: Camera,
    step: 2
  },
  {
    key: 'text-to-3d' as TabKey,
    title: 'Text to 3D',
    description: 'Direct 3D model creation',
    icon: Box,
    step: 3
  },
  {
    key: 'web-icons' as TabKey,
    title: 'Web Icons',
    description: 'Generate custom icons',
    icon: Palette,
    step: 4
  },
  {
    key: 'gallery' as TabKey,
    title: 'Your Gallery',
    description: 'View your collection',
    icon: GalleryHorizontal,
    step: 5
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
    if (stepKey === 'camera' && hasGeneratedImage) return 'completed';
    return 'pending';
  };

  return (
    <div className={`mb-8 ${className}`}>
      <div className="glass-panel border-white/20 backdrop-blur-sm rounded-xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gradient mb-4 sm:mb-6 text-center px-2">
          Create Your 3D Figurine & Web Icons
        </h2>
        
        {/* Desktop and tablet layout */}
        <div className="hidden sm:flex items-center justify-between max-w-5xl mx-auto relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-white/20">
            <motion.div
              className="h-full bg-figuro-accent"
              initial={{ width: "0%" }}
              animate={{ 
                width: activeTab === 'image-to-3d' ? "0%" : 
                       activeTab === 'camera' ? "20%" :
                       activeTab === 'text-to-3d' ? "40%" : 
                       activeTab === 'web-icons' ? "60%" : "80%" 
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
                  <div className="text-xs text-white/50 mt-1 max-w-20">
                    {step.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mobile layout */}
        <div className="sm:hidden">
          {/* Mobile progress indicator */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {steps.map((step, index) => {
                const status = getStepStatus(step.key);
                return (
                  <div
                    key={step.key}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      status === 'current' 
                        ? 'bg-figuro-accent w-6' 
                        : status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-white/20'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Mobile step grid */}
          <div className="grid grid-cols-2 gap-3">
            {steps.map((step, index) => {
              const status = getStepStatus(step.key);
              const Icon = step.icon;
              
              return (
                <button
                  key={step.key}
                  onClick={() => onTabChange(step.key)}
                  className={`
                    relative p-3 rounded-lg border transition-all duration-200 text-left
                    ${status === 'current' 
                      ? 'bg-figuro-accent/20 border-figuro-accent/50 shadow-sm' 
                      : status === 'completed'
                      ? 'bg-green-500/20 border-green-500/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    {/* Mobile Step Circle */}
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${status === 'current' 
                          ? 'bg-figuro-accent text-white' 
                          : status === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white/60'
                        }
                      `}
                    >
                      {status === 'completed' ? (
                        <Check size={14} />
                      ) : (
                        <Icon size={14} />
                      )}
                    </div>

                    {/* Mobile Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${
                        status === 'current' ? 'text-white' : 'text-white/70'
                      }`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-white/50 truncate">
                        {step.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioProgressHeader;
