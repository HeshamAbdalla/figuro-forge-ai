
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Globe, Shield, Zap, X } from 'lucide-react';
import { PRODUCTION_CONFIG } from '@/utils/productionConfig';

const ProductionReadyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Show banner only once and only in production environment
    const bannerShown = localStorage.getItem('production-ready-banner-shown');
    
    if (!bannerShown && PRODUCTION_CONFIG.environment.isProduction && !hasBeenShown) {
      setIsVisible(true);
      setHasBeenShown(true);
    }
  }, [hasBeenShown]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('production-ready-banner-shown', 'true');
  };

  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced security measures and data protection'
    },
    {
      icon: Zap,
      title: 'Optimized Performance',
      description: 'Lightning-fast 3D generation and processing'
    },
    {
      icon: Globe,
      title: 'Global Availability',
      description: 'Worldwide access with high availability'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-figuro-accent via-purple-600 to-figuro-accent p-4 shadow-lg"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
              >
                <CheckCircle className="w-5 h-5 text-white" />
              </motion.div>
              
              <div>
                <h3 className="text-white font-bold text-lg">
                  🎉 Figuro.AI is Now Production Ready!
                </h3>
                <p className="text-white/90 text-sm">
                  Experience enterprise-grade 3D generation with enhanced security and performance.
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-2 text-white"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{feature.title}</span>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductionReadyBanner;
