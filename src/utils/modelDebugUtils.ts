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

class ModelDebugTracker {
  private logs: ModelDebugInfo[] = [];
  private maxLogs = 100;

  log(info: ModelDebugInfo) {
    this.logs.push(info);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    console.log(`🐛 [MODEL-DEBUG] ${info.id}:`, {
      url: info.model_url.substring(0, 50) + '...',
      title: info.title,
    });
  }

  getLogsForModel(modelId: string): ModelDebugInfo[] {
    return this.logs.filter(log => log.id === modelId);
  }

  getAllLogs(): ModelDebugInfo[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    console.log('🐛 [MODEL-DEBUG] Debug logs cleared');
  }

  getReloadingModels(): string[] {
    const recentTime = Date.now() - 5000; // Last 5 seconds
    const recentLogs = this.logs.filter(log => 
      new Date(log.created_at).getTime() > recentTime
    );
    
    const loadCounts = new Map<string, number>();
    
    recentLogs.forEach(log => {
      loadCounts.set(log.id, (loadCounts.get(log.id) || 0) + 1);
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

export const logModelDebugInfo = (info: ModelDebugInfo) => {
  modelDebugTracker.log(info);
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
