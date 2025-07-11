export interface TimelineNode {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  type: 'image-to-3d' | 'text-to-3d' | 'camera' | 'web-icons' | 'gallery';
  color: string;
  glowColor: string;
  popular?: boolean;
  new?: boolean;
  magic?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
}

export interface OrbitalTimelineConfig {
  radius: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableZoom: boolean;
  enablePan: boolean;
  minDistance: number;
  maxDistance: number;
}