/**
 * PricingExamples.jsx - Ready-to-Use Example Components
 * Copy these examples for different use cases
 */

import React, { useState } from 'react';
import {
  PricingSection,
  PricingCard,
  PricingGrid,
  PricingToggle,
  PricingComparison,
  PricingFAQ,
  TrustBadges,
  CreditPackCard,
  CreditsInfo,
} from './PricingComponents';
import {
  PRICING_TIERS,
  FEATURE_CATEGORIES,
  FAQ_ITEMS,
  CREDIT_PACKS,
} from './PricingConfig';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// ============================================
// Example 1: Full Pricing Page
// ============================================
export const FullPricingPage = () => {
  const handleSelectPlan = (tier, billingCycle) => {
    console.log('Selected plan:', tier.name, billingCycle);
    // Navigate to checkout or handle subscription
  };

  const handlePurchaseCredits = (pack) => {
    console.log('Purchase credits:', pack.credits);
    // Handle credit purchase
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <PricingSection
        tiers={PRICING_TIERS}
        categories={FEATURE_CATEGORIES}
        faqItems={FAQ_ITEMS}
        creditPacks={CREDIT_PACKS}
        onSelectPlan={handleSelectPlan}
        onPurchaseCredits={handlePurchaseCredits}
        showComparison={true}
        showFAQ={true}
        showCredits={true}
      />
    </div>
  );
};

// ============================================
// Example 2: Landing Page Pricing Section
// ============================================
export const LandingPagePricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  // Show only main 3 tiers for landing page
  const mainTiers = PRICING_TIERS.filter(t => t.id !== 'enterprise');

  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with our free tier and upgrade as your team grows
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <PricingToggle value={billingCycle} onChange={setBillingCycle} />
        </div>

        <PricingGrid
          tiers={mainTiers}
          billingCycle={billingCycle}
          columns={3}
          onSelect={(tier) => console.log('Selected:', tier.name)}
        />

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Need more? Check out our{' '}
            <a href="/pricing" className="text-primary hover:underline">
              Enterprise plan
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

// ============================================
// Example 3: Dark Theme Pricing
// ============================================
export const DarkThemePricing = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');

  return (
    <div className="bg-slate-950 text-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Pricing That Scales With You
          </h1>
          <p className="text-slate-400 text-lg">
            From solo projects to enterprise deployments
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <PricingToggle value={billingCycle} onChange={setBillingCycle} />
        </div>

        <PricingGrid
          tiers={PRICING_TIERS}
          billingCycle={billingCycle}
          onSelect={(tier) => alert(`Selected: ${tier.name}`)}
        />
      </div>
    </div>
  );
};

// ============================================
// Example 4: Light Theme Pricing
// ============================================
export const LightThemePricing = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="bg-white text-slate-900 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-slate-300">
            Simple Pricing
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-slate-900">
            One Price, All Features
          </h1>
          <p className="text-slate-600 text-lg max-w-xl mx-auto">
            No surprise fees. Cancel anytime.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <PricingToggle value={billingCycle} onChange={setBillingCycle} />
        </div>

        <PricingGrid
          tiers={PRICING_TIERS}
          billingCycle={billingCycle}
          onSelect={(tier) => console.log('Selected:', tier.name)}
        />
      </div>
    </div>
  );
};

// ============================================
// Example 5: Minimal 3-Tier Pricing
// ============================================
export const MinimalPricing = () => {
  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      price_monthly: 9,
      price_yearly: 90,
      yearly_savings: 18,
      color: 'from-slate-500 to-slate-600',
      icon: 'Zap',
      features: ['10 projects', '5 GB storage', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Pro',
      price_monthly: 29,
      price_yearly: 290,
      yearly_savings: 58,
      badge: 'Most Popular',
      color: 'from-violet-500 to-purple-500',
      icon: 'Star',
      features: ['Unlimited projects', '100 GB storage', 'Priority support', 'API access'],
    },
    {
      id: 'team',
      name: 'Team',
      price_monthly: 79,
      price_yearly: 790,
      yearly_savings: 158,
      color: 'from-amber-500 to-orange-500',
      icon: 'Crown',
      features: ['Everything in Pro', 'Unlimited users', 'SSO', 'Dedicated support'],
    },
  ];

  return (
    <div className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Simple, Fair Pricing
        </h2>
        <PricingGrid tiers={tiers} columns={3} />
      </div>
    </div>
  );
};

// ============================================
// Example 6: Individual Components Demo
// ============================================
export const ComponentsDemo = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const sampleTier = PRICING_TIERS[2]; // Pro tier

  return (
    <div className="py-12 px-4 space-y-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pricing Components Library</h1>

        {/* Toggle */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Billing Toggle</h2>
          <PricingToggle value={billingCycle} onChange={setBillingCycle} />
          <p className="mt-2 text-muted-foreground text-sm">
            Current: {billingCycle}
          </p>
        </section>

        {/* Single Card */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Single Pricing Card</h2>
          <div className="max-w-sm">
            <PricingCard
              tier={sampleTier}
              billingCycle={billingCycle}
              onSelect={(t) => alert(`Selected: ${t.name}`)}
            />
          </div>
        </section>

        {/* Trust Badges */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Trust Badges</h2>
          <TrustBadges />
        </section>

        {/* Credits */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Credit Pack Card</h2>
          <div className="max-w-sm">
            <CreditPackCard
              pack={CREDIT_PACKS[2]}
              onPurchase={(p) => alert(`Buy ${p.credits} credits`)}
            />
          </div>
          <div className="mt-4 max-w-md">
            <CreditsInfo />
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">FAQ Component</h2>
          <div className="max-w-2xl">
            <PricingFAQ items={FAQ_ITEMS.slice(0, 3)} />
          </div>
        </section>

        {/* Comparison */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Feature Comparison</h2>
          <Card>
            <PricingComparison
              tiers={PRICING_TIERS}
              categories={FEATURE_CATEGORIES.slice(0, 3)}
            />
          </Card>
        </section>
      </div>
    </div>
  );
};

// ============================================
// Example 7: Custom Styled Pricing
// ============================================
export const CustomStyledPricing = () => {
  const customTiers = [
    {
      id: 'hobby',
      name: 'Hobby',
      description: 'For personal projects',
      price_monthly: 0,
      price_yearly: 0,
      color: 'from-emerald-400 to-teal-500',
      icon: 'Zap',
      submissions_limit: 100,
      storage_gb: 0.5,
      users_limit: 1,
      features: [
        '100 submissions/month',
        '500 MB storage',
        'Basic templates',
        'Community support',
      ],
    },
    {
      id: 'startup',
      name: 'Startup',
      description: 'For growing teams',
      price_monthly: 49,
      price_yearly: 490,
      yearly_savings: 98,
      badge: 'Most Popular',
      color: 'from-blue-500 to-indigo-600',
      icon: 'Rocket',
      submissions_limit: 10000,
      storage_gb: 50,
      users_limit: 10,
      features: [
        '10,000 submissions/month',
        '50 GB storage',
        'All templates',
        'API access',
        'Email support',
      ],
    },
    {
      id: 'scale',
      name: 'Scale',
      description: 'For large operations',
      price_monthly: 199,
      price_yearly: 1990,
      yearly_savings: 398,
      color: 'from-purple-500 to-pink-500',
      icon: 'Crown',
      submissions_limit: -1,
      storage_gb: 500,
      users_limit: -1,
      features: [
        'Unlimited submissions',
        '500 GB storage',
        'Unlimited users',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 text-sm font-medium mb-4">
            Launch Special
          </span>
          <h1 className="text-5xl font-bold text-white mb-4">
            Start Building Today
          </h1>
          <p className="text-slate-400 text-xl">
            Join 10,000+ teams already using our platform
          </p>
        </div>

        <PricingGrid
          tiers={customTiers}
          columns={3}
          onSelect={(tier) => console.log(tier)}
        />

        <div className="mt-16 text-center">
          <p className="text-slate-500">
            All plans include 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </div>
  );
};

export default {
  FullPricingPage,
  LandingPagePricing,
  DarkThemePricing,
  LightThemePricing,
  MinimalPricing,
  ComponentsDemo,
  CustomStyledPricing,
};
