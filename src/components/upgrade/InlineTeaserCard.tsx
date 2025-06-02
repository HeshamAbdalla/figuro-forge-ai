
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface InlineTeaserCardProps {
  limitType: 'image_generation' | 'model_conversion';
  onUpgrade: () => void;
  onDismiss?: () => void;
  className?: string;
}

const InlineTeaserCard: React.FC<InlineTeaserCardProps> = ({
  limitType,
  onUpgrade,
  onDismiss,
  className = ""
}) => {
  const getContent = () => {
    if (limitType === 'image_generation') {
      return {
        icon: <Sparkles className="w-6 h-6" />,
        title: "Unleash Your Creative Potential",
        description: "You're creating amazing content! Ready to take it to the next level?",
        benefits: ["Unlimited image generations", "Priority processing", "Exclusive art styles"],
        cta: "Unlock Unlimited Creativity"
      };
    } else {
      return {
        icon: <Zap className="w-6 h-6" />,
        title: "Transform More Into Reality",
        description: "Your 3D models are looking incredible! Don't let limits slow you down.",
        benefits: ["More 3D conversions", "Faster processing", "Advanced model options"],
        cta: "Upgrade Your 3D Power"
      };
    }
  };

  const content = getContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-figuro-accent/10 via-purple-500/5 to-blue-500/10 border-figuro-accent/30 backdrop-blur-sm">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-figuro-accent/20 via-transparent to-purple-500/20 animate-pulse" />
        
        {/* Sparkle decorations */}
        <div className="absolute top-4 right-4 text-figuro-accent/40">
          <motion.div
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
        </div>

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-figuro-accent/20 rounded-xl border border-figuro-accent/30">
              {content.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-2">
                {content.title}
              </h3>
              
              <p className="text-white/80 mb-4 leading-relaxed">
                {content.description}
              </p>
              
              <div className="space-y-2 mb-6">
                {content.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2 text-sm text-white/70"
                  >
                    <div className="w-1.5 h-1.5 bg-figuro-accent rounded-full" />
                    {benefit}
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onUpgrade}
                  className="bg-figuro-accent hover:bg-figuro-accent/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-figuro-accent/25 group"
                >
                  {content.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                {onDismiss && (
                  <Button
                    onClick={onDismiss}
                    variant="ghost"
                    className="text-white/60 hover:text-white/80 px-4 py-2.5"
                  >
                    Maybe Later
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default InlineTeaserCard;
