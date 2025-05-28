
export interface PlanConfig {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  limits: {
    monthlyCredits: number;
    imageGenerationsPerDay: number;
    imageGenerationsPerMonth: number;
    modelConversionsPerMonth: number;
    isUnlimited: boolean;
  };
  stripeData: {
    priceId: string;
    productId: string;
  };
  order: number; // For upgrade/downgrade hierarchy
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Basic access to get started',
    features: [
      '3 credits per month',
      '3 image generations per day',
      '30 image generations per month',
      '1 3D model conversion per month',
      'Personal use license',
      'Access to basic gallery',
    ],
    limits: {
      monthlyCredits: 3,
      imageGenerationsPerDay: 3,
      imageGenerationsPerMonth: 30,
      modelConversionsPerMonth: 1,
      isUnlimited: false,
    },
    stripeData: {
      priceId: '',
      productId: '',
    },
    order: 0,
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 12.99,
    description: 'Perfect for hobbyists',
    features: [
      '25 credits per month',
      '20 image generations per day',
      '600 image generations per month',
      '5 3D model conversions per month',
      'Personal use license',
      'Access to full gallery',
      'Priority support',
    ],
    limits: {
      monthlyCredits: 25,
      imageGenerationsPerDay: 20,
      imageGenerationsPerMonth: 600,
      modelConversionsPerMonth: 5,
      isUnlimited: false,
    },
    stripeData: {
      priceId: 'price_starter',
      productId: 'prod_starter',
    },
    order: 1,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    description: 'For serious creators',
    features: [
      '120 credits per month',
      '100 image generations per day',
      '3000 image generations per month',
      '20 3D model conversions per month',
      'Personal use license',
      'Access to exclusive models',
      'Advanced controls',
      '24/7 Priority support',
    ],
    limits: {
      monthlyCredits: 120,
      imageGenerationsPerDay: 100,
      imageGenerationsPerMonth: 3000,
      modelConversionsPerMonth: 20,
      isUnlimited: false,
    },
    stripeData: {
      priceId: 'price_pro',
      productId: 'prod_pro',
    },
    order: 2,
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    price: 59.99,
    description: 'For professionals',
    features: [
      'Unlimited credits',
      'Unlimited image generations',
      'Unlimited 3D model conversions',
      'Commercial use license included',
      'Access to all premium content',
      'Advanced controls and customization',
      'Dedicated support team',
    ],
    limits: {
      monthlyCredits: 999999,
      imageGenerationsPerDay: 999999,
      imageGenerationsPerMonth: 999999,
      modelConversionsPerMonth: 999999,
      isUnlimited: true,
    },
    stripeData: {
      priceId: 'price_unlimited',
      productId: 'prod_unlimited',
    },
    order: 3,
  },
};

export const getPlanByOrder = (order: number): PlanConfig | null => {
  return Object.values(PLANS).find(plan => plan.order === order) || null;
};

export const isUpgrade = (fromPlan: string, toPlan: string): boolean => {
  return PLANS[toPlan]?.order > PLANS[fromPlan]?.order;
};

export const isDowngrade = (fromPlan: string, toPlan: string): boolean => {
  return PLANS[toPlan]?.order < PLANS[fromPlan]?.order;
};

export const getPlanByStripePrice = (priceId: string): PlanConfig | null => {
  return Object.values(PLANS).find(plan => plan.stripeData.priceId === priceId) || null;
};
