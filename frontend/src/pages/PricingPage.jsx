/**
 * PricingPage.jsx - Using Reusable Pricing Components
 * Fetches pricing data from API and displays using the components library
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Play, Cloud, Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { TooltipProvider } from '../components/ui/tooltip';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicHeader } from '../components/PublicHeader';
import { useAuthStore } from '../store';
import { toast } from 'sonner';

// Import reusable pricing components
import {
  PricingSection,
  PRICING_TIERS,
  FEATURE_CATEGORIES,
  FAQ_ITEMS,
  CREDIT_PACKS,
} from '../components/pricing';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Usage Dashboard Component
const UsageDashboard = ({ usage }) => {
  if (!usage) return null;

  return (
    <Card className="bg-card border border-border mb-12" data-testid="usage-dashboard">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Your Usage This Month
        </CardTitle>
        <CardDescription>
          Plan: {usage.plan?.name || 'Free'} • Resets monthly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Submissions */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Submissions</span>
            <span className="text-sm font-medium">
              {usage.submissions.used.toLocaleString()} /{' '}
              {usage.submissions.limit === -1
                ? '∞'
                : usage.submissions.limit.toLocaleString()}
            </span>
          </div>
          <Progress
            value={Math.min(usage.submissions.percentage, 100)}
            className="h-2"
          />
          {usage.submissions.percentage > 80 && (
            <p className="text-xs text-amber-500 mt-1">
              ⚠️ {Math.round(usage.submissions.percentage)}% used
            </p>
          )}
        </div>

        {/* Storage */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Storage</span>
            <span className="text-sm font-medium">
              {usage.storage.used_gb.toFixed(2)} GB / {usage.storage.limit_gb} GB
            </span>
          </div>
          <Progress
            value={Math.min(usage.storage.percentage, 100)}
            className="h-2"
          />
        </div>

        {/* Credits */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Credit Balance</p>
              <p className="text-2xl font-bold">
                {usage.credits.balance.toLocaleString()}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Coins className="w-4 h-4 mr-2" />
              Buy More
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Questions/CTA Card
const QuestionsCard = ({ navigate }) => (
  <Card className="bg-card border border-border mt-16" data-testid="questions-card">
    <CardHeader className="text-center">
      <CardTitle>Questions?</CardTitle>
      <CardDescription>
        Contact us at support@fieldforce.io or use the chat widget
      </CardDescription>
    </CardHeader>
    <CardContent className="flex justify-center gap-4">
      <Button variant="outline" onClick={() => navigate('/demo')} data-testid="try-demo-btn">
        <Play className="w-4 h-4 mr-2" />
        Try Interactive Demo
      </Button>
      <Button onClick={() => navigate('/register')} data-testid="start-trial-btn">
        <CreditCard className="w-4 h-4 mr-2" />
        Start Free Trial
      </Button>
    </CardContent>
  </Card>
);

export function PricingPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [plans, setPlans] = useState(PRICING_TIERS);
  const [creditPacks, setCreditPacks] = useState(CREDIT_PACKS);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      // Fetch plans from API
      const plansRes = await fetch(`${API_URL}/api/billing/plans`);
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.plans?.length) {
          setPlans(plansData.plans);
        }
        if (plansData.credit_packs?.length) {
          setCreditPacks(plansData.credit_packs);
        }
      }

      // Fetch current subscription if logged in
      if (token) {
        const subRes = await fetch(`${API_URL}/api/billing/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setCurrentPlan(subData.current_plan);
        }

        // Fetch usage
        const usageRes = await fetch(`${API_URL}/api/billing/usage`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usageRes.ok) {
          const usageData = await usageRes.json();
          setUsage(usageData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch pricing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan, billingPeriod) => {
    if (!token) {
      navigate('/register');
      return;
    }

    if (plan.price_monthly === 0) {
      toast.success('You are on the Free plan');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/billing/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_period: billingPeriod,
        }),
      });

      if (response.ok) {
        const period = billingPeriod === 'yearly' ? 'annual' : 'monthly';
        toast.success(`Subscribed to ${plan.name} (${period})!`);
        fetchPricingData();
      } else {
        toast.error('Failed to subscribe');
      }
    } catch (error) {
      toast.error('Subscription failed');
    }
  };

  const handlePurchaseCredits = async (pack) => {
    if (!token) {
      navigate('/register');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/billing/credits/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pack_id: pack.id }),
      });

      if (response.ok) {
        toast.success(`Purchased ${pack.credits.toLocaleString()} credits!`);
        fetchPricingData();
      } else {
        toast.error('Failed to purchase credits');
      }
    } catch (error) {
      toast.error('Purchase failed');
    }
  };

  const content = (
    <div className="max-w-7xl mx-auto" data-testid="pricing-page">
      {/* Usage Dashboard (if logged in) */}
      {usage && <UsageDashboard usage={usage} />}

      {/* Main Pricing Section using reusable components */}
      <PricingSection
        tiers={plans}
        categories={FEATURE_CATEGORIES}
        faqItems={FAQ_ITEMS}
        creditPacks={creditPacks}
        currentPlanId={currentPlan?.id}
        onSelectPlan={handleSelectPlan}
        onPurchaseCredits={handlePurchaseCredits}
        showComparison={true}
        showFAQ={true}
        showCredits={true}
      />

      {/* Questions CTA */}
      <QuestionsCard navigate={navigate} />
    </div>
  );

  // If user is logged in, wrap in DashboardLayout
  if (token) {
    return (
      <DashboardLayout>
        <TooltipProvider>{content}</TooltipProvider>
      </DashboardLayout>
    );
  }

  // Public pricing page
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="py-12 px-4">
        <TooltipProvider>{content}</TooltipProvider>
      </div>
    </div>
  );
}

export default PricingPage;
