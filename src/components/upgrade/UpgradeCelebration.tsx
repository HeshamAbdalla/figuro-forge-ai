
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Star } from 'lucide-react';

interface UpgradeCelebrationProps {
  isVisible: boolean;
  onComplete: () => void;
  planName?: string;
}

const UpgradeCelebration: React.FC<UpgradeCelebrationProps> = ({
  isVisible,
  onComplete,
  planName = "Premium"
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  const confettiItems = Array.from({ length: 30 }, (_, i) => (
    <motion.div
      key={i}
      className={`absolute w-2 h-2 ${
        i % 3 === 0 ? 'bg-figuro-accent' : 
        i % 3 === 1 ? 'bg-purple-400' : 'bg-blue-400'
      } rounded-full`}
      initial={{
        x: Math.random() * window.innerWidth,
        y: -10,
        rotate: 0,
        scale: Math.random() * 0.5 + 0.5
      }}
      animate={{
        y: window.innerHeight + 10,
        rotate: 360,
        transition: {
          duration: Math.random() * 2 + 2,
          ease: "easeOut"
        }
      }}
    />
  ));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none"
        >
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden">
              {confettiItems}
            </div>
          )}

          {/* Celebration card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: -50 }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 200,
              delay: 0.2 
            }}
            className="bg-figuro-dark border border-figuro-accent/30 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl pointer-events-auto"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1] 
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-figuro-accent/20 rounded-full mb-6"
            >
              <Sparkles className="w-8 h-8 text-figuro-accent" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-3"
            >
              🎉 Welcome to {planName}!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white/80 mb-6 leading-relaxed"
            >
              Your creative journey just got supercharged! You now have access to unlimited possibilities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center gap-4 text-figuro-accent"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              >
                <Heart className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              >
                <Star className="w-5 h-5" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeCelebration;
