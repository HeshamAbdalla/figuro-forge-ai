
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
    title: 'Welcome to Figuro.AI! 🎉',
    description: 'Let\'s take a quick tour to help you get started with creating amazing 3D figurines.',
    target: '.studio-header',
    position: 'bottom',
    showSkip: true
  },
  {
    id: 'image-generation',
    title: 'Generate Images',
    description: 'Start by describing what you want to create. Our AI will generate a beautiful image for you.',
    target: '[data-tab="image-to-3d"]',
    position: 'bottom'
  },
  {
    id: 'prompt-form',
    title: 'Describe Your Vision',
    description: 'Type your creative prompt here. Be as detailed as you want - the more specific, the better the result!',
    target: '.prompt-form',
    position: 'top'
  },
  {
    id: 'generate-button',
    title: 'Create Your Image',
    description: 'Click here to generate your image. It usually takes 10-30 seconds.',
    target: '.generate-button',
    position: 'top'
  },
  {
    id: 'convert-to-3d',
    title: 'Convert to 3D',
    description: 'Once you have an image you love, convert it to a 3D model that you can download and 3D print!',
    target: '.convert-3d-button',
    position: 'top'
  },
  {
    id: 'camera-tab',
    title: 'Camera Feature',
    description: 'You can also take photos with your camera and convert them directly to 3D models.',
    target: '[data-tab="camera"]',
    position: 'bottom'
  },
  {
    id: 'text-to-3d',
    title: 'Text to 3D',
    description: 'Skip the image step entirely and go straight from text to 3D model!',
    target: '[data-tab="text-to-3d"]',
    position: 'bottom'
  },
  {
    id: 'gallery',
    title: 'Your Gallery',
    description: 'All your creations are saved here. You can view, download, and manage your 3D models.',
    target: '[data-tab="gallery"]',
    position: 'bottom'
  }
];
