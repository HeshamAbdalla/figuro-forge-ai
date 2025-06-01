// Debugging utilities for model loading issues

interface ModelDebugInfo {
  id: string;
  title: string;
  model_url: string;
  style: string;
  image_url: string;
  saved_image_url: string | null;
  prompt: string;
  created_at: string;
  is_public: boolean;
}

interface ModelDebugEvent {
  modelId: string;
  modelUrl: string;
  fileName: string;
  eventType: 'source_change' | 'load_start' | 'load_success' | 'load_error';
  metadata?: any;
}

class ModelDebugTracker {
  private logs: ModelDebugEvent[] = [];
  private maxLogs = 100;

  log(event: ModelDebugEvent) {
    this.logs.push({
      ...event,
      timestamp: Date.now()
    } as any);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.log(`🐛 [MODEL-DEBUG] ${event.modelId}:`, {
      event: event.eventType,
      url: event.modelUrl.substring(0, 50) + '...',
      fileName: event.fileName,
      metadata: event.metadata
    });
  }

  getLogsForModel(modelId: string): ModelDebugEvent[] {
    return this.logs.filter(log => log.modelId === modelId);
  }

  getAllLogs(): ModelDebugEvent[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    console.log('🐛 [MODEL-DEBUG] Debug logs cleared');
  }

  getReloadingModels(): string[] {
    const recentTime = Date.now() - 5000; // Last 5 seconds
    const recentLogs = this.logs.filter(log => 
      (log as any).timestamp > recentTime
    );
    
    const loadCounts = new Map<string, number>();
    
    recentLogs.forEach(log => {
      loadCounts.set(log.modelId, (loadCounts.get(log.modelId) || 0) + 1);
    });

    return Array.from(loadCounts.entries())
      .filter(([_, count]) => count > 2) // More than 2 loads in 5 seconds
      .map(([modelId]) => modelId);
  }

  detectInfiniteReloading(): boolean {
    const reloadingModels = this.getReloadingModels();
    if (reloadingModels.length > 0) {
      console.warn('🔄 [MODEL-DEBUG] Detected infinite reloading for models:', reloadingModels);
      return true;
    }
    return false;
  }
}

export const modelDebugTracker = new ModelDebugTracker();

// New function signature to match usage in SimplifiedModelPreview
export const logModelDebugInfo = (
  modelId: string,
  modelUrl: string,
  fileName: string,
  eventType: 'source_change' | 'load_start' | 'load_success' | 'load_error',
  metadata?: any
) => {
  modelDebugTracker.log({
    modelId,
    modelUrl,
    fileName,
    eventType,
    metadata
  });
};

// Global debugging functions for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).modelDebug = {
    getLogs: () => modelDebugTracker.getAllLogs(),
    clearLogs: () => modelDebugTracker.clearLogs(),
    getReloadingModels: () => modelDebugTracker.getReloadingModels(),
    detectInfiniteReloading: () => modelDebugTracker.detectInfiniteReloading()
  };
}
