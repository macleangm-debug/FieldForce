/**
 * PricingComponents.jsx - Core Reusable UI Components
 * Dark/Light theme support, responsive, animated
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  Rocket,
  Star,
  Crown,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Coins,
  Shield,
  Clock,
  Globe,
  HeadphonesIcon,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Icon mapping
const ICONS = {
  Zap,
  Rocket,
  Star,
  Crown,
  Shield,
  Clock,
  Globe,
  HeadphonesIcon,
};

const getIcon = (iconName) => ICONS[iconName] || Zap;

// ============================================
// PricingToggle - Monthly/Yearly Switch
// ============================================
export const PricingToggle = ({ value = 'monthly', onChange, discount = '17%' }) => {
  return (
    <div className="flex items-center justify-center gap-3 p-1 bg-muted rounded-full">
      <button
        onClick={() => onChange('monthly')}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
          value === 'monthly'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        data-testid="pricing-toggle-monthly"
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('yearly')}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
          value === 'yearly'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
        data-testid="pricing-toggle-yearly"
      >
        Yearly
        <Badge className="absolute -top-2 -right-3 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 border-0">
          -{discount}
        </Badge>
      </button>
    </div>
  );
};

// ============================================
// PricingCard - Individual Plan Card
// ============================================
export const PricingCard = ({
  tier,
  billingCycle = 'monthly',
  isCurrentPlan = false,
  onSelect,
  theme = 'dark',
}) => {
  const Icon = getIcon(tier.icon);
  const isPopular = tier.badge === 'Most Popular';
  
  const monthlyPrice = tier.price_monthly || 0;
  const yearlyPrice = tier.price_yearly || 0;
  const yearlySavings = tier.yearly_savings || 0;
  
  const displayPrice = billingCycle === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative h-full"
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-3 py-1 shadow-lg">
            Most Popular
          </Badge>
        </div>
      )}

      <Card
        className={`h-full flex flex-col border-2 transition-all duration-300 ${
          isPopular
            ? 'border-violet-500 shadow-lg shadow-violet-500/20'
            : isCurrentPlan
            ? 'border-primary'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <CardHeader className="pb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl">{tier.name}</CardTitle>
          {tier.description && (
            <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
          )}

          <div className="flex items-baseline gap-1 mt-4">
            <span className="text-4xl font-bold">${displayPrice}</span>
            {monthlyPrice > 0 && <span className="text-muted-foreground">/month</span>}
          </div>

          {billingCycle === 'yearly' && monthlyPrice > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                ${yearlyPrice}/year billed annually
              </p>
              <p className="text-sm text-emerald-500 font-medium">
                Save ${yearlySavings}/year
              </p>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1">
          <ul className="space-y-3">
            {tier.features?.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Plan limits summary */}
          {(tier.submissions_limit || tier.storage_gb || tier.users_limit) && (
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              {tier.submissions_limit !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submissions</span>
                  <span className="font-medium">
                    {tier.submissions_limit === -1
                      ? 'Unlimited'
                      : `${tier.submissions_limit.toLocaleString()}/mo`}
                  </span>
                </div>
              )}
              {tier.storage_gb !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="font-medium">
                    {tier.storage_gb >= 1000
                      ? `${tier.storage_gb / 1000} TB`
                      : `${tier.storage_gb} GB`}
                  </span>
                </div>
              )}
              {tier.users_limit !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Users</span>
                  <span className="font-medium">
                    {tier.users_limit === -1 ? 'Unlimited' : tier.users_limit}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className={`w-full ${
              isPopular
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600'
                : ''
            }`}
            variant={isCurrentPlan ? 'outline' : 'default'}
            onClick={() => onSelect?.(tier, billingCycle)}
            disabled={isCurrentPlan}
            data-testid={`select-plan-${tier.id}`}
          >
            {isCurrentPlan
              ? 'Current Plan'
              : monthlyPrice === 0
              ? 'Get Started Free'
              : 'Subscribe'}
            {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// ============================================
// PricingGrid - Grid of Plan Cards
// ============================================
export const PricingGrid = ({
  tiers,
  billingCycle = 'monthly',
  currentPlanId,
  onSelect,
  columns = 4,
}) => {
  const gridCols = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns] || gridCols[4]} gap-6`}>
      {tiers.map((tier, index) => (
        <motion.div
          key={tier.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PricingCard
            tier={tier}
            billingCycle={billingCycle}
            isCurrentPlan={currentPlanId === tier.id}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// PricingComparison - Feature Comparison Table
// ============================================
export const PricingComparison = ({ tiers, categories }) => {
  const [expandedCategories, setExpandedCategories] = useState(
    categories.map((_, i) => i === 0)
  );

  const toggleCategory = (index) => {
    setExpandedCategories((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const renderValue = (value) => {
    if (value === true) {
      return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-muted-foreground/40 mx-auto" />;
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 px-4 font-medium text-muted-foreground">
              Features
            </th>
            {tiers.map((tier) => (
              <th key={tier.id} className="py-4 px-4 text-center min-w-[120px]">
                <span className="font-semibold">{tier.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((category, catIndex) => (
            <React.Fragment key={category.name}>
              <tr
                className="border-b border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleCategory(catIndex)}
              >
                <td
                  colSpan={tiers.length + 1}
                  className="py-3 px-4 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories[catIndex] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {category.name}
                  </div>
                </td>
              </tr>
              <AnimatePresence>
                {expandedCategories[catIndex] &&
                  category.features.map((feature, featIndex) => (
                    <motion.tr
                      key={feature.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-b border-border/50"
                    >
                      <td className="py-3 px-4 text-sm text-muted-foreground pl-8">
                        {feature.name}
                      </td>
                      {tiers.map((tier) => (
                        <td key={tier.id} className="py-3 px-4 text-center">
                          {renderValue(feature[tier.id])}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// PricingFAQ - Collapsible FAQ Section
// ============================================
export const PricingFAQ = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={false}
          className="border border-border rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            data-testid={`faq-question-${index}`}
          >
            <span className="font-medium pr-4">{item.question}</span>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-4 text-muted-foreground text-sm">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================
// TrustBadges - Security & Trust Indicators
// ============================================
export const TrustBadges = ({ badges }) => {
  const defaultBadges = [
    { icon: 'Shield', title: 'Secure', description: 'AES-256 encryption' },
    { icon: 'Clock', title: 'Reliable', description: '99.9% uptime SLA' },
    { icon: 'Globe', title: 'Africa-First', description: 'M-Pesa accepted' },
    { icon: 'HeadphonesIcon', title: 'Support', description: '24/7 assistance' },
  ];

  const items = badges || defaultBadges;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = getIcon(item.icon);
        return (
          <div
            key={idx}
            className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// CreditPackCard - Pay-As-You-Go Credits
// ============================================
export const CreditPackCard = ({ pack, onPurchase }) => {
  return (
    <Card
      className={`border-2 transition-all hover:border-primary/50 ${
        pack.popular
          ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
          : 'border-border'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg ${
                pack.popular ? 'bg-emerald-500' : 'bg-primary/10'
              } flex items-center justify-center`}
            >
              <Coins
                className={`w-5 h-5 ${pack.popular ? 'text-white' : 'text-primary'}`}
              />
            </div>
            <div>
              <p className="font-semibold">{pack.credits.toLocaleString()} Credits</p>
              <p className="text-sm text-muted-foreground">${pack.per_credit}/credit</p>
            </div>
          </div>
          {pack.popular && (
            <Badge className="bg-emerald-500 text-white border-0">Best Value</Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${pack.price}</span>
          <Button
            variant={pack.popular ? 'default' : 'outline'}
            className={pack.popular ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            onClick={() => onPurchase?.(pack)}
            data-testid={`buy-credits-${pack.credits}`}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// CreditsInfo - How Credits Work
// ============================================
export const CreditsInfo = () => {
  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="p-6">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-2">How credits work:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1 submission (text/GPS) = 1 credit</li>
              <li>1 submission with photos = 2 credits</li>
              <li>1 submission with audio = 2 credits</li>
              <li>1 submission with video = 5 credits</li>
              <li>1 GB storage/month = 20 credits</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================
// PricingSection - Full Page Component
// ============================================
export const PricingSection = ({
  tiers,
  categories,
  faqItems,
  creditPacks,
  currentPlanId,
  onSelectPlan,
  onPurchaseCredits,
  showComparison = true,
  showFAQ = true,
  showCredits = true,
}) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary border-0">
          Enterprise Features, Startup Pricing
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free, scale as you grow. No hidden fees, no surprises.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <PricingToggle value={billingCycle} onChange={setBillingCycle} />
      </div>

      {/* Pricing Cards */}
      <PricingGrid
        tiers={tiers}
        billingCycle={billingCycle}
        currentPlanId={currentPlanId}
        onSelect={onSelectPlan}
      />

      {/* Credit Packs */}
      {showCredits && creditPacks && creditPacks.length > 0 && (
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Pay-As-You-Go Credits</h2>
            <p className="text-muted-foreground">
              Perfect for seasonal projects. Buy credits, use anytime. Never expires.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPacks.map((pack) => (
              <CreditPackCard
                key={pack.id}
                pack={pack}
                onPurchase={onPurchaseCredits}
              />
            ))}
          </div>
          <div className="mt-6">
            <CreditsInfo />
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-16">
        <TrustBadges />
      </div>

      {/* Feature Comparison */}
      {showComparison && categories && categories.length > 0 && (
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Compare Plans</h2>
            <p className="text-muted-foreground">
              See what's included in each plan
            </p>
          </div>
          <Card className="overflow-hidden">
            <PricingComparison tiers={tiers} categories={categories} />
          </Card>
        </div>
      )}

      {/* FAQ */}
      {showFAQ && faqItems && faqItems.length > 0 && (
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about our pricing
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <PricingFAQ items={faqItems} />
          </div>
        </div>
      )}
    </div>
  );
};
