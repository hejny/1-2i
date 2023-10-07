/**
 * Pricing plan type
 */
export type PricingPlan = keyof typeof PricingPlans;

/**
 * Pricing plans for WebGPT
 */
export const PricingPlans = {
    FREE: 'Free',
    SIMPLE: 'Simple',
    ADVANCED: 'Advanced',
    ENTERPRISE: 'Enterprise',
} as const;
