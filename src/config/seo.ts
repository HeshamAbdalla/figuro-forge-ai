
export type PageSEO = {
  title: string;
  description: string;
  keywords: string[];
  ogType: 'website' | 'article' | 'product';
};

export const defaultSEO = {
  title: 'Figuros.AI - Design AI-powered Figurines, Download in 3D',
  description: 'Create custom 3D figurines from text prompts using AI. Select art styles, generate images, and download 3D models ready for printing.',
  keywords: ['AI figurines', '3D models', 'custom figurines', 'AI design', '3D printing'],
  ogImage: 'https://lovable.dev/opengraph-image-p98pqg.png',
  ogType: 'website',
};

export const pageSEO: Record<string, PageSEO> = {
  home: {
    title: 'Figuros.AI - Design AI-powered Figurines, Download in 3D',
    description: 'Create custom 3D figurines from text prompts using AI. Select art styles, generate images, and download 3D models ready for printing.',
    keywords: ['AI figurines', '3D models', 'custom figurines', 'AI design', '3D printing'],
    ogType: 'website',
  },
  studio: {
    title: 'Studio - Create Your Custom Figurines | Figuros.AI',
    description: 'Use our AI-powered studio to create custom figurines from text prompts. Choose art styles and download 3D models ready for printing.',
    keywords: ['AI studio', 'figurine design', '3D model generator', 'custom figurines', 'text to 3D'],
    ogType: 'website',
  },
  gallery: {
    title: 'Gallery - Explore AI-Generated Figurines | Figuros.AI',
    description: 'Browse our gallery of AI-generated 3D figurines. Get inspired and create your own unique designs with our AI-powered platform.',
    keywords: ['3D model gallery', 'AI figurines', 'inspiration', 'figurine examples', 'AI artwork'],
    ogType: 'website',
  },
  pricing: {
    title: 'Pricing - Affordable AI Figurine Creation | Figuros.AI',
    description: 'View our pricing plans for creating AI-generated figurines. Choose the perfect plan for your needs, from hobbyists to professionals.',
    keywords: ['AI figurine pricing', '3D model subscription', 'affordable 3D printing', 'AI generation cost'],
    ogType: 'website',
  },
  about: {
    title: 'About Us - The Future of 3D Creation | Figuros.AI',
    description: 'Learn about Figuros.AI\'s mission to democratize 3D creation through AI. Meet our team and discover our innovative approach to figurine design.',
    keywords: ['about Figuros.AI', 'AI company', '3D creation technology', 'team', 'mission'],
    ogType: 'website',
  },
  careers: {
    title: 'Careers - Join Our AI Innovation Team | Figuros.AI',
    description: 'Join the Figuros.AI team and help build the future of AI-powered 3D creation. Explore open positions and grow your career with us.',
    keywords: ['AI careers', 'tech jobs', 'machine learning jobs', 'startup careers', 'remote work'],
    ogType: 'website',
  },
  contact: {
    title: 'Contact Us - Get Support & Connect | Figuros.AI',
    description: 'Get in touch with Figuros.AI for support, partnerships, or general inquiries. We\'re here to help you succeed with our platform.',
    keywords: ['contact support', 'customer service', 'technical help', 'partnerships', 'feedback'],
    ogType: 'website',
  },
  terms: {
    title: 'Terms of Service - Legal Information | Figuros.AI',
    description: 'Read Figuros.AI\'s Terms of Service to understand your rights and responsibilities when using our AI-powered 3D creation platform.',
    keywords: ['terms of service', 'legal terms', 'user agreement', 'service conditions', 'legal information'],
    ogType: 'website',
  },
};

export const structuredData = {
  organization: {
    name: 'Figuros.AI',
    url: 'https://figuros.ai',
    logo: 'https://figuros.ai/logo.png',
    sameAs: [
      'https://twitter.com/figuros_ai',
      'https://github.com/figuros-ai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@figuros.ai',
      contactType: 'customer service',
    },
  },
  webApplication: {
    name: 'Figuros.AI',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
};
