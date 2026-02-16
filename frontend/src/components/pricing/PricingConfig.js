/**
 * Pricing Configuration - Customizable Data
 * 80% profit margin pricing tiers
 */

export const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Community',
    description: 'Perfect for individuals and small projects',
    price_monthly: 0,
    price_yearly: 0,
    yearly_savings: 0,
    badge: null,
    icon: 'Zap',
    color: 'from-slate-500 to-slate-600',
    submissions_limit: 500,
    storage_gb: 1,
    users_limit: 1,
    features: [
      '500 submissions/month',
      '1 GB storage',
      '1 user',
      'Basic form builder',
      'GPS tracking',
      'Offline data capture',
      'Email support',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Great for growing teams',
    price_monthly: 29,
    price_yearly: 290,
    yearly_savings: 58,
    badge: null,
    icon: 'Rocket',
    color: 'from-blue-500 to-cyan-500',
    submissions_limit: 5000,
    storage_gb: 10,
    users_limit: 5,
    features: [
      '5,000 submissions/month',
      '10 GB storage',
      '5 team members',
      'Advanced form logic',
      'Photo & audio capture',
      'Real-time sync',
      'Basic analytics',
      'Priority email support',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For professional field operations',
    price_monthly: 99,
    price_yearly: 990,
    yearly_savings: 198,
    badge: 'Most Popular',
    icon: 'Star',
    color: 'from-violet-500 to-purple-500',
    submissions_limit: 50000,
    storage_gb: 100,
    users_limit: 25,
    features: [
      '50,000 submissions/month',
      '100 GB storage',
      '25 team members',
      'Video capture',
      'AI-powered insights',
      'Custom branding',
      'API access',
      'Advanced analytics',
      'Phone & chat support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Organization',
    description: 'For large-scale deployments',
    price_monthly: 299,
    price_yearly: 2990,
    yearly_savings: 598,
    badge: 'Enterprise',
    icon: 'Crown',
    color: 'from-amber-500 to-orange-500',
    submissions_limit: -1,
    storage_gb: 1000,
    users_limit: -1,
    features: [
      'Unlimited submissions',
      '1 TB storage',
      'Unlimited team members',
      'Dedicated infrastructure',
      'Custom integrations',
      'SSO & SAML',
      'SLA guarantee',
      'Dedicated account manager',
      '24/7 priority support',
    ],
  },
];

export const FEATURE_CATEGORIES = [
  {
    name: 'Data Collection',
    features: [
      { name: 'Monthly Submissions', free: '500', starter: '5,000', pro: '50,000', enterprise: 'Unlimited' },
      { name: 'Offline Data Capture', free: true, starter: true, pro: true, enterprise: true },
      { name: 'GPS Tracking', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Photo Capture', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Audio Capture', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Video Capture', free: false, starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Form Builder',
    features: [
      { name: 'Basic Form Builder', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Conditional Logic', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Calculations', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Form Templates', free: '5', starter: '20', pro: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Custom Branding', free: false, starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Team & Collaboration',
    features: [
      { name: 'Team Members', free: '1', starter: '5', pro: '25', enterprise: 'Unlimited' },
      { name: 'Role-Based Access', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Team Analytics', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Activity Logs', free: false, starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Storage & Sync',
    features: [
      { name: 'Cloud Storage', free: '1 GB', starter: '10 GB', pro: '100 GB', enterprise: '1 TB' },
      { name: 'Real-time Sync', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Data Encryption', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Auto-backup', free: false, starter: true, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Analytics & Reports',
    features: [
      { name: 'Basic Dashboard', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Export to CSV/Excel', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Advanced Analytics', free: false, starter: false, pro: true, enterprise: true },
      { name: 'AI-Powered Insights', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Custom Reports', free: false, starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: 'Integrations',
    features: [
      { name: 'API Access', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Webhooks', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Zapier Integration', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Custom Integrations', free: false, starter: false, pro: false, enterprise: true },
      { name: 'SSO/SAML', free: false, starter: false, pro: false, enterprise: true },
    ],
  },
  {
    name: 'Support',
    features: [
      { name: 'Email Support', free: true, starter: true, pro: true, enterprise: true },
      { name: 'Priority Support', free: false, starter: true, pro: true, enterprise: true },
      { name: 'Phone Support', free: false, starter: false, pro: true, enterprise: true },
      { name: 'Dedicated Account Manager', free: false, starter: false, pro: false, enterprise: true },
      { name: 'SLA Guarantee', free: false, starter: false, pro: false, enterprise: true },
    ],
  },
];

export const FAQ_ITEMS = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the new rate applies at your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my submission limit?',
    answer: 'We\'ll notify you when you reach 80% of your limit. If you exceed it, additional submissions are charged at $0.01 per submission, or you can upgrade to a higher plan.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 14-day money-back guarantee for annual plans. Monthly plans can be cancelled anytime, but we don\'t offer partial refunds for unused days.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II certified and GDPR compliant.',
  },
  {
    question: 'Do you support M-Pesa payments?',
    answer: 'Yes! We support M-Pesa, mobile money, and all major credit cards. Enterprise customers can also pay via bank transfer.',
  },
  {
    question: 'What\'s included in the free plan?',
    answer: 'The Community plan includes 500 submissions/month, 1 GB storage, basic form builder, GPS tracking, offline data capture, and email support. Perfect for getting started!',
  },
  {
    question: 'Do credits expire?',
    answer: 'No, pay-as-you-go credits never expire. Use them whenever you need extra capacity beyond your plan limits.',
  },
];

export const CREDIT_PACKS = [
  { id: 'credits_100', credits: 100, price: 9, per_credit: 0.09, popular: false },
  { id: 'credits_500', credits: 500, price: 39, per_credit: 0.078, popular: false },
  { id: 'credits_1000', credits: 1000, price: 69, per_credit: 0.069, popular: true },
  { id: 'credits_5000', credits: 5000, price: 299, per_credit: 0.06, popular: false },
];

export const TRUST_BADGES = [
  { icon: 'Shield', title: 'Secure', description: 'AES-256 encryption' },
  { icon: 'Clock', title: 'Reliable', description: '99.9% uptime SLA' },
  { icon: 'Globe', title: 'Africa-First', description: 'M-Pesa accepted' },
  { icon: 'HeadphonesIcon', title: 'Support', description: '24/7 assistance' },
];

// Helper functions
export const calculatePrice = (tier, billingCycle = 'monthly') => {
  if (billingCycle === 'yearly') {
    return tier.price_yearly;
  }
  return tier.price_monthly;
};

export const calculateAnnualPrice = (tier) => {
  return Math.round(tier.price_yearly / 12);
};

export const getAnnualDiscount = () => '17%';

export const formatLimit = (limit) => {
  if (limit === -1) return 'Unlimited';
  return limit.toLocaleString();
};
