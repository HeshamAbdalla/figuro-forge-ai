
class WebGLContextManager {
  private static instance: WebGLContextManager;
  private activeContexts = new Set<HTMLCanvasElement>();
  private maxContexts = 4; // Conservative limit for gallery
  private queue: Array<() => void> = [];
  
  static getInstance(): WebGLContextManager {
    if (!WebGLContextManager.instance) {
      WebGLContextManager.instance = new WebGLContextManager();
    }
    return WebGLContextManager.instance;
  }
  
  canCreateContext(): boolean {
    return this.activeContexts.size < this.maxContexts;
  }
  
  requestContext(canvas: HTMLCanvasElement, callback: () => void): void {
    if (this.canCreateContext()) {
      this.activeContexts.add(canvas);
      callback();
      console.log(`WebGL context created. Active: ${this.activeContexts.size}/${this.maxContexts}`);
    } else {
      console.log('WebGL context limit reached, queuing request');
      this.queue.push(() => {
        this.activeContexts.add(canvas);
        callback();
      });
    }
  }
  
  releaseContext(canvas: HTMLCanvasElement): void {
    if (this.activeContexts.has(canvas)) {
      this.activeContexts.delete(canvas);
      console.log(`WebGL context released. Active: ${this.activeContexts.size}/${this.maxContexts}`);
      
      // Process queue
      if (this.queue.length > 0 && this.canCreateContext()) {
        const next = this.queue.shift();
        if (next) {
          next();
        }
      }
    }
  }
  
  getStats(): { active: number; max: number; queued: number } {
    return {
      active: this.activeContexts.size,
      max: this.maxContexts,
      queued: this.queue.length
    };
  }
  
  clear(): void {
    this.activeContexts.clear();
    this.queue.length = 0;
    console.log('WebGL context manager cleared');
  }
}

export const webGLContextManager = WebGLContextManager.getInstance();
