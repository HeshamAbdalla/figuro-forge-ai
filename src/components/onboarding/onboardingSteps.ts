
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  showSkip?: boolean;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Creative Studio! 🎨',
    description: 'This is your command center for creating amazing 3D figurines. Let\'s explore the main features together.',
    target: '.studio-header',
    position: 'bottom',
    showSkip: true
  },
  {
    id: 'image-generation',
    title: 'Start with Image Generation',
    description: 'The "Image to 3D" tab is your starting point. Describe what you want to create and our AI will generate a beautiful image.',
    target: '[data-tab="image-to-3d"]',
    position: 'bottom'
  },
  {
    id: 'prompt-form',
    title: 'Describe Your Vision ✨',
    description: 'Type your creative prompt here. Try something like "a cute cartoon dragon" or "a medieval knight figurine". Be as detailed as you want!',
    target: '.prompt-form',
    position: 'top'
  },
  {
    id: 'generate-button',
    title: 'Generate Your Image 🚀',
    description: 'Click this button to bring your prompt to life! Image generation usually takes 10-30 seconds.',
    target: '.generate-button',
    position: 'top'
  },
  {
    id: 'convert-to-3d',
    title: 'Transform to 3D Magic! 🎯',
    description: 'Once you have an image you love, click here to convert it to a downloadable 3D model perfect for printing.',
    target: '.convert-3d-button',
    position: 'top'
  },
  {
    id: 'camera-tab',
    title: 'Camera to 3D Feature 📸',
    description: 'Got a photo on your phone? Use this tab to take pictures and convert them directly to 3D models.',
    target: '[data-tab="camera"]',
    position: 'bottom'
  },
  {
    id: 'text-to-3d',
    title: 'Skip Straight to 3D 🎲',
    description: 'Want to skip the image step entirely? This tab goes directly from text description to 3D model!',
    target: '[data-tab="text-to-3d"]',
    position: 'bottom'
  },
  {
    id: 'gallery',
    title: 'Your Personal Gallery 🖼️',
    description: 'All your creations are automatically saved here. Download, share, or get inspired by your previous work!',
    target: '[data-tab="gallery"]',
    position: 'bottom'
  }
];
