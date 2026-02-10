import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Zap,
  Building2,
  Rocket,
  Crown,
  CreditCard,
  Coins,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Globe,
  Smartphone,
  Cloud,
  HeadphonesIcon,
  Info,
  Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicHeader } from '../components/PublicHeader';
import { useAuthStore } from '../store';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Plan icons
const planIcons = {
  free: Zap,
  starter: Rocket,
  pro: Star,
  enterprise: Crown
};

// Plan colors
const planColors = {
  free: 'from-slate-500 to-slate-600',
  starter: 'from-blue-500 to-cyan-500',
  pro: 'from-violet-500 to-purple-500',
  enterprise: 'from-amber-500 to-orange-500'
};

const PricingCard = ({ plan, isCurrentPlan, onSelect, billingPeriod }) => {
  const Icon = planIcons[plan.id] || Zap;
  const gradientClass = planColors[plan.id] || planColors.free;
  const isPopular = plan.badge === 'Most Popular';
  
  const monthlyPrice = plan.price_monthly || 0;
  const yearlyPrice = plan.price_yearly || 0;
  const yearlySavings = plan.yearly_savings || 0;
  
  const displayPrice = billingPeriod === 'yearly' ? yearlyPrice : monthlyPrice;
  const monthlyEquivalent = billingPeriod === 'yearly' ? Math.round(yearlyPrice / 12) : monthlyPrice;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="relative"
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-3 py-1">
            Most Popular
          </Badge>
        </div>
      )}
      
      <Card className={`h-full border-2 transition-all ${
        isPopular ? 'border-violet-500 shadow-lg shadow-violet-500/20' : 
        isCurrentPlan ? 'border-primary' : 'border-border hover:border-primary/50'
      }`}>
        <CardHeader className="pb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          <div className="flex items-baseline gap-1 mt-2">
            {billingPeriod === 'yearly' && monthlyPrice > 0 ? (
              <>
                <span className="text-4xl font-bold">${monthlyEquivalent}</span>
                <span className="text-muted-foreground">/month</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-bold">${displayPrice}</span>
                {monthlyPrice > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </>
            )}
          </div>
          {billingPeriod === 'yearly' && monthlyPrice > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-sm text-muted-foreground">
                ${yearlyPrice}/year billed annually
              </p>
              <p className="text-sm text-emerald-500 font-medium">
                Save ${yearlySavings}/year (2 months free!)
              </p>
            </div>
          )}
          {plan.margin && (
            <Badge variant="outline" className="mt-2 text-xs">
              {plan.margin}% margin
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {plan.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          
          {/* Plan limits summary */}
          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Submissions</span>
              <span className="font-medium">
                {plan.submissions_limit === -1 ? 'Unlimited' : `${plan.submissions_limit.toLocaleString()}/mo`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium">{plan.storage_gb} GB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Users</span>
              <span className="font-medium">
                {plan.users_limit === -1 ? 'Unlimited' : plan.users_limit}
              </span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            className={`w-full ${isPopular ? 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600' : ''}`}
            variant={isCurrentPlan ? 'outline' : 'default'}
            onClick={() => onSelect(plan, billingPeriod)}
            disabled={isCurrentPlan}
            data-testid={`select-plan-${plan.id}`}
          >
            {isCurrentPlan ? 'Current Plan' : monthlyPrice === 0 ? 'Get Started Free' : 'Subscribe'}
            {!isCurrentPlan && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const CreditPackCard = ({ pack, onPurchase }) => {
  return (
    <Card className={`border-2 transition-all hover:border-primary/50 ${pack.popular ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-border'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${pack.popular ? 'bg-emerald-500' : 'bg-primary/10'} flex items-center justify-center`}>
              <Coins className={`w-5 h-5 ${pack.popular ? 'text-white' : 'text-primary'}`} />
            </div>
            <div>
              <p className="font-semibold">{pack.credits.toLocaleString()} Credits</p>
              <p className="text-sm text-muted-foreground">${pack.per_credit}/credit</p>
            </div>
          </div>
          <div className="text-right">
            {pack.popular && (
              <Badge className="bg-emerald-500 text-white border-0 mb-1">Best Value</Badge>
            )}
            {pack.margin && (
              <p className="text-xs text-muted-foreground">{pack.margin}% margin</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${pack.price}</span>
          <Button 
            variant={pack.popular ? 'default' : 'outline'}
            className={pack.popular ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            onClick={() => onPurchase(pack)}
            data-testid={`buy-credits-${pack.credits}`}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const UsageDashboard = ({ usage }) => {
  if (!usage) return null;
  
  return (
    <Card className="bg-card border border-border">
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
              {usage.submissions.used.toLocaleString()} / {usage.submissions.limit === -1 ? '∞' : usage.submissions.limit.toLocaleString()}
            </span>
          </div>
          <Progress value={Math.min(usage.submissions.percentage, 100)} className="h-2" />
          {usage.submissions.percentage > 80 && (
            <p className="text-xs text-amber-500 mt-1">⚠️ {Math.round(usage.submissions.percentage)}% used</p>
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
          <Progress value={Math.min(usage.storage.percentage, 100)} className="h-2" />
        </div>
        
        {/* Credits */}
        <div className="pt-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Credit Balance</p>
              <p className="text-2xl font-bold">{usage.credits.balance.toLocaleString()}</p>
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

export function PricingPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [plans, setPlans] = useState([]);
  const [creditPacks, setCreditPacks] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');

  useEffect(() => {
    fetchPricingData();
  }, []);

  const fetchPricingData = async () => {
    try {
      // Fetch plans
      const plansRes = await fetch(`${API_URL}/api/billing/plans`);
      const plansData = await plansRes.json();
      setPlans(plansData.plans || []);
      setCreditPacks(plansData.credit_packs || []);

      // Fetch current subscription if logged in
      if (token) {
        const subRes = await fetch(`${API_URL}/api/billing/subscription`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const subData = await subRes.json();
        setCurrentPlan(subData.current_plan);

        // Fetch usage
        const usageRes = await fetch(`${API_URL}/api/billing/usage`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const usageData = await usageRes.json();
        setUsage(usageData);
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          plan_id: plan.id,
          billing_period: billingPeriod
        })
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pack_id: pack.id })
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary border-0">
          80% cheaper than SurveyCTO
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free, scale as you grow. No hidden fees, no surprises.
        </p>
      </div>

      {/* Usage Dashboard (if logged in) */}
      {usage && (
        <div className="mb-12">
          <UsageDashboard usage={usage} />
        </div>
      )}

      {/* Billing Toggle */}
      <div className="flex justify-center mb-8">
        <Tabs value={billingPeriod} onValueChange={setBillingPeriod} className="w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="relative">
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">
                -17%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {plans.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={currentPlan?.id === plan.id}
            onSelect={handleSelectPlan}
            billingPeriod={billingPeriod}
          />
        ))}
      </div>

      {/* Pay-As-You-Go Section */}
      <div className="mb-16">
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
              onPurchase={handlePurchaseCredits}
            />
          ))}
        </div>

        {/* Credit Usage Info */}
        <Card className="mt-6 bg-muted/50 border-dashed">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium mb-2">How credits work:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1 submission (text/GPS) = 1 credit</li>
                  <li>• 1 submission with photos = 2 credits</li>
                  <li>• 1 submission with audio = 2 credits</li>
                  <li>• 1 submission with video = 5 credits</li>
                  <li>• 1 GB storage/month = 20 credits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {[
          { icon: Shield, title: 'Secure', desc: 'AES-256 encryption' },
          { icon: Clock, title: 'Reliable', desc: '99.9% uptime SLA' },
          { icon: Globe, title: 'Africa-First', desc: 'M-Pesa accepted' },
          { icon: HeadphonesIcon, title: 'Support', desc: '24/7 assistance' }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Preview */}
      <Card className="bg-card border border-border">
        <CardHeader className="text-center">
          <CardTitle>Questions?</CardTitle>
          <CardDescription>
            Contact us at support@fieldforce.io or use the chat widget
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button variant="outline">
            <Smartphone className="w-4 h-4 mr-2" />
            Schedule Demo
          </Button>
          <Button>
            <CreditCard className="w-4 h-4 mr-2" />
            Start Free Trial
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // If user is logged in, wrap in DashboardLayout
  if (token) {
    return (
      <DashboardLayout>
        <TooltipProvider>
          {content}
        </TooltipProvider>
      </DashboardLayout>
    );
  }

  // Public pricing page
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <TooltipProvider>
        {content}
      </TooltipProvider>
    </div>
  );
}

export default PricingPage;
