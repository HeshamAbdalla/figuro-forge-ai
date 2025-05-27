
// Extend the Performance interface to include Chrome-specific memory property
interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

// Extend the Window interface to include gc method
interface Window {
  gc?: () => void;
}
