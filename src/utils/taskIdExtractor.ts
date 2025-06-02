
/**
 * Enhanced task ID extraction utility with multiple fallback strategies
 */

export interface TaskIdExtractionResult {
  taskId: string | null;
  confidence: 'high' | 'medium' | 'low';
  method: string;
}

/**
 * Extract task ID from filename or path using multiple strategies
 */
export const extractTaskId = (fullPath: string, fileName: string): TaskIdExtractionResult => {
  const strategies = [
    // Strategy 1: UUID pattern (highest confidence)
    {
      name: 'uuid',
      pattern: /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
      confidence: 'high' as const
    },
    
    // Strategy 2: Task prefix pattern
    {
      name: 'task_prefix',
      pattern: /task_([a-f0-9]+)/i,
      confidence: 'high' as const
    },
    
    // Strategy 3: Numeric ID at start
    {
      name: 'numeric_start',
      pattern: /^(\d+)_/,
      confidence: 'medium' as const
    },
    
    // Strategy 4: Alphanumeric task ID
    {
      name: 'alphanumeric',
      pattern: /([a-f0-9]{16,})/i,
      confidence: 'medium' as const
    },
    
    // Strategy 5: Any sequence of alphanumeric characters
    {
      name: 'general_id',
      pattern: /([a-zA-Z0-9]{8,})/,
      confidence: 'low' as const
    }
  ];

  // Try each strategy on both full path and filename
  for (const strategy of strategies) {
    // First try the filename
    const filenameMatch = fileName.match(strategy.pattern);
    if (filenameMatch) {
      return {
        taskId: filenameMatch[1],
        confidence: strategy.confidence,
        method: `${strategy.name}_filename`
      };
    }
    
    // Then try the full path
    const pathMatch = fullPath.match(strategy.pattern);
    if (pathMatch) {
      return {
        taskId: pathMatch[1],
        confidence: strategy.confidence,
        method: `${strategy.name}_path`
      };
    }
  }

  // Fallback: use filename without extension as task ID
  const fallbackTaskId = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, '');
  
  return {
    taskId: fallbackTaskId.length >= 4 ? fallbackTaskId : null,
    confidence: 'low' as const,
    method: 'filename_fallback'
  };
};

/**
 * Generate possible thumbnail paths for a given task ID and user ID
 */
export const generateThumbnailPaths = (taskId: string, userId: string): string[] => {
  const basePaths = [
    `${userId}/thumbnails`,
    `${userId}/models/thumbnails`,
    `${userId}`,
  ];
  
  const fileVariants = [
    `${taskId}_thumbnail.png`,
    `${taskId}_thumbnail.jpg`,
    `${taskId}.png`,
    `${taskId}.jpg`,
    `thumbnail_${taskId}.png`,
    `preview_${taskId}.png`,
  ];
  
  const paths: string[] = [];
  
  for (const basePath of basePaths) {
    for (const variant of fileVariants) {
      paths.push(`${basePath}/${variant}`);
    }
  }
  
  return paths;
};
