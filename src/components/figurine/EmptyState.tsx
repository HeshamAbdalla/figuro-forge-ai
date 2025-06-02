
import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title = "No figurines yet. Create your first one!",
  description 
}) => {
  return (
    <div className="text-center py-8 text-white/70">
      <p className="text-lg mb-2">{title}</p>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
};

export default EmptyState;
