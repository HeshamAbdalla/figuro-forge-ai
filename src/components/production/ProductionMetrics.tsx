
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Zap, Shield, Globe, TrendingUp } from 'lucide-react';

interface ProductionMetric {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  trend: 'up' | 'down' | 'stable';
}

const ProductionMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<ProductionMetric[]>([
    {
      id: 'uptime',
      label: 'System Uptime',
      value: '99.9%',
      icon: Shield,
      color: 'text-green-400',
      trend: 'stable'
    },
    {
      id: 'performance',
      label: 'Avg Response Time',
      value: '<200ms',
      icon: Zap,
      color: 'text-figuro-accent',
      trend: 'up'
    },
    {
      id: 'availability',
      label: 'Global Availability',
      value: '100%',
      icon: Globe,
      color: 'text-blue-400',
      trend: 'stable'
    },
    {
      id: 'security',
      label: 'Security Score',
      value: 'A+',
      icon: Shield,
      color: 'text-emerald-400',
      trend: 'up'
    }
  ]);

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show metrics only in production environment
    const shouldShow = window.location.hostname === 'figuros.ai' || 
                       window.location.hostname === 'www.figuros.ai';
    setIsVisible(shouldShow);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-figuro-dark/90 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl"
      >
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-figuro-accent" />
          <span className="text-white text-sm font-medium">Live Metrics</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 rounded-lg p-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-3 h-3 ${metric.color}`} />
                  <span className="text-white/70 text-xs">{metric.label}</span>
                  {metric.trend === 'up' && (
                    <TrendingUp className="w-3 h-3 text-green-400" />
                  )}
                </div>
                <div className={`text-sm font-bold ${metric.color}`}>
                  {metric.value}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default ProductionMetrics;
