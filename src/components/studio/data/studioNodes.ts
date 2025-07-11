import { TimelineNode } from '../types';

export const getStudioNodesWithModels = (galleryModels: any[] = []): TimelineNode[] => {
  const baseNodes: TimelineNode[] = [
    {
      id: 'image-to-3d',
      title: 'Photo Magic',
      description: "Transform images into stunning 3D models with AI-powered conversion",
      icon: '📸',
      path: '/studio/image-to-3d',
      type: 'image-to-3d',
      color: 'from-blue-400 via-cyan-500 to-teal-600',
      glowColor: 'shadow-blue-500/25',
      popular: true,
      magic: "Watch photos come alive in 3D space",
      modelUrl: galleryModels[0]?.model_url || undefined,
      thumbnailUrl: galleryModels[0]?.image_url || undefined
    },
    {
      id: 'text-to-3d',
      title: 'Dream Builder',
      description: 'Turn imagination into reality with magical text-to-3D creation',
      icon: '🎨',
      path: '/studio/text-to-3d',
      type: 'text-to-3d',
      color: 'from-purple-400 via-pink-500 to-rose-600',
      glowColor: 'shadow-purple-500/25',
      new: true,
      magic: "Words become worlds of possibility",
      modelUrl: galleryModels[1]?.model_url || undefined,
      thumbnailUrl: galleryModels[1]?.image_url || undefined
    },
    {
      id: 'camera',
      title: 'Instant Capture',
      description: 'Capture reality and transform it into digital masterpieces',
      icon: '📷',
      path: '/studio/camera',
      type: 'camera',
      color: 'from-green-400 via-emerald-500 to-teal-600',
      glowColor: 'shadow-green-500/25',
      magic: "Reality meets digital artistry",
      modelUrl: galleryModels[2]?.model_url || undefined,
      thumbnailUrl: galleryModels[2]?.image_url || undefined
    },
    {
      id: 'web-icons',
      title: 'Icon Workshop',
      description: 'Craft mesmerizing icons that captivate and inspire',
      icon: '🎭',
      path: '/studio/web-icons',
      type: 'web-icons',
      color: 'from-orange-400 via-red-500 to-pink-600',
      glowColor: 'shadow-orange-500/25',
      magic: "Every pixel tells a story",
      modelUrl: galleryModels[3]?.model_url || undefined,
      thumbnailUrl: galleryModels[3]?.image_url || undefined
    },
    {
      id: 'gallery',
      title: 'Creative Sanctuary',
      description: 'Your personal realm of artistic achievements and inspiration',
      icon: '🏛️',
      path: '/studio/gallery',
      type: 'gallery',
      color: 'from-indigo-400 via-purple-500 to-violet-600',
      glowColor: 'shadow-indigo-500/25',
      magic: "Where creativity finds its home",
      modelUrl: galleryModels[4]?.model_url || undefined,
      thumbnailUrl: galleryModels[4]?.image_url || undefined
    }
  ];

  return baseNodes;
};

// Fallback static nodes for when gallery data is loading
export const studioNodes: TimelineNode[] = getStudioNodesWithModels();