import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  DollarSign,
  Percent,
  Save,
  RefreshCw,
  TrendingUp,
  Server,
  Users,
  HardDrive,
  Headphones,
  ArrowRight,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { PublicHeader } from '../components/PublicHeader';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { toast } from 'sonner';

// Default cost structure (per month per unit)
const DEFAULT_COSTS = {
  // Infrastructure costs
  serverPerUser: 0.50,           // Cloud server cost per user
  storagePerGB: 0.10,            // Storage cost per GB
  bandwidthPerGB: 0.05,          // Data transfer cost per GB
  submissionProcessing: 0.002,   // Cost per submission processed
  
  // Support costs
  supportPerUser: 1.00,          // Support cost allocation per user
  
  // Fixed costs (amortized)
  developmentAmortized: 5.00,    // Development costs spread per customer
  compliancePerOrg: 2.00,        // Security/compliance per organization
  
  // Payment processing
  paymentProcessingRate: 0.029,  // 2.9% payment processing
  paymentFixedFee: 0.30,         // $0.30 fixed fee per transaction
};

// Plan configurations
const PLAN_CONFIGS = [
  {
    id: 'free',
    name: 'Free',
    submissions: 250,
    storage: 0.5,
    users: 3,
    support: 'community',
    features: ['Basic form builder', 'CSV export', 'Mobile app access']
  },
  {
    id: 'starter',
    name: 'Starter',
    submissions: 1500,
    storage: 5,
    users: 10,
    support: 'email',
    features: ['Everything in Free', 'Excel export', 'GPS tracking', 'Email support']
  },
  {
    id: 'pro',
    name: 'Pro',
    submissions: 5000,
    storage: 25,
    users: 30,
    support: 'priority',
    features: ['Everything in Starter', 'SPSS & Stata export', 'API access', 'Geofencing', 'Priority support']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    submissions: 20000,
    storage: 100,
    users: -1, // unlimited
    support: 'dedicated',
    features: ['Everything in Pro', 'SSO integration', 'Custom branding', 'Dedicated support', 'SLA guarantee']
  }
];

// Credit pack configurations
const CREDIT_PACK_CONFIGS = [
  { id: 'small', name: 'Small', credits: 500, baseCost: 5 },
  { id: 'medium', name: 'Medium', credits: 2000, baseCost: 18 },
  { id: 'large', name: 'Large', credits: 10000, baseCost: 75 },
  { id: 'xlarge', name: 'X-Large', credits: 50000, baseCost: 300 },
];

export function PricingCalculatorPage() {
  const navigate = useNavigate();
  
  // Cost inputs
  const [costs, setCosts] = useState(DEFAULT_COSTS);
  
  // Margin settings
  const [margins, setMargins] = useState({
    free: 0,
    starter: 87,
    pro: 87,
    enterprise: 86,
    credits: 87
  });
  
  // Calculated prices
  const [calculatedPrices, setCalculatedPrices] = useState({});
  const [creditPrices, setCreditPrices] = useState({});
  
  // Calculate plan costs and prices
  useEffect(() => {
    const newPrices = {};
    
    PLAN_CONFIGS.forEach(plan => {
      // Calculate base cost
      const userCount = plan.users === -1 ? 50 : plan.users; // Estimate 50 for unlimited
      const supportMultiplier = plan.support === 'dedicated' ? 3 : plan.support === 'priority' ? 2 : plan.support === 'email' ? 1 : 0;
      
      const serverCost = userCount * costs.serverPerUser;
      const storageCost = plan.storage * costs.storagePerGB;
      const submissionCost = plan.submissions * costs.submissionProcessing;
      const supportCost = userCount * costs.supportPerUser * supportMultiplier;
      const fixedCost = costs.developmentAmortized + costs.compliancePerOrg;
      
      const totalCost = serverCost + storageCost + submissionCost + supportCost + fixedCost;
      
      // Calculate selling price based on margin
      const margin = margins[plan.id] / 100;
      const sellingPrice = margin > 0 ? totalCost / (1 - margin) : 0;
      
      // Round to nearest whole dollar
      const roundedPrice = Math.round(sellingPrice);
      
      // Calculate yearly price with 2 months free
      const yearlyPrice = roundedPrice * 10; // 10 months instead of 12
      
      newPrices[plan.id] = {
        cost: totalCost,
        margin: margins[plan.id],
        monthlyPrice: roundedPrice,
        yearlyPrice: yearlyPrice,
        profit: roundedPrice - totalCost,
        profitMargin: roundedPrice > 0 ? ((roundedPrice - totalCost) / roundedPrice * 100) : 0
      };
    });
    
    setCalculatedPrices(newPrices);
    
    // Calculate credit pack prices
    const newCreditPrices = {};
    const creditMargin = margins.credits / 100;
    
    CREDIT_PACK_CONFIGS.forEach(pack => {
      const sellingPrice = creditMargin > 0 ? pack.baseCost / (1 - creditMargin) : pack.baseCost;
      const roundedPrice = Math.round(sellingPrice);
      const perCredit = (roundedPrice / pack.credits).toFixed(3);
      
      newCreditPrices[pack.id] = {
        cost: pack.baseCost,
        price: roundedPrice,
        perCredit: perCredit,
        profit: roundedPrice - pack.baseCost
      };
    });
    
    setCreditPrices(newCreditPrices);
    
  }, [costs, margins]);
  
  const handleMarginChange = (planId, value) => {
    setMargins(prev => ({
      ...prev,
      [planId]: value[0]
    }));
  };
  
  const handleCostChange = (costKey, value) => {
    setCosts(prev => ({
      ...prev,
      [costKey]: parseFloat(value) || 0
    }));
  };
  
  const resetToDefaults = () => {
    setCosts(DEFAULT_COSTS);
    setMargins({
      free: 0,
      starter: 87,
      pro: 87,
      enterprise: 86,
      credits: 87
    });
    toast.success('Reset to default values');
  };
  
  const applyPricing = () => {
    // In a real app, this would save to backend
    toast.success('Pricing configuration saved!');
    console.log('Calculated Prices:', calculatedPrices);
    console.log('Credit Prices:', creditPrices);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Pricing Calculator</h1>
                <p className="text-muted-foreground">Configure costs and margins to calculate selling prices</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Defaults
              </Button>
              <Button onClick={applyPricing}>
                <Save className="w-4 h-4 mr-2" />
                Apply Pricing
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cost Configuration */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Cost Structure
                </CardTitle>
                <CardDescription>Base costs per unit/month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Server per User ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={costs.serverPerUser}
                    onChange={(e) => handleCostChange('serverPerUser', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Storage per GB ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={costs.storagePerGB}
                    onChange={(e) => handleCostChange('storagePerGB', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Per Submission ($)</Label>
                  <Input 
                    type="number" 
                    step="0.001"
                    value={costs.submissionProcessing}
                    onChange={(e) => handleCostChange('submissionProcessing', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Support per User ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={costs.supportPerUser}
                    onChange={(e) => handleCostChange('supportPerUser', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Development (amortized) ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={costs.developmentAmortized}
                    onChange={(e) => handleCostChange('developmentAmortized', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Compliance per Org ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={costs.compliancePerOrg}
                    onChange={(e) => handleCostChange('compliancePerOrg', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Margin Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Profit Margins
                </CardTitle>
                <CardDescription>Set target profit margin for each plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {PLAN_CONFIGS.map(plan => (
                  <div key={plan.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{plan.name}</Label>
                      <Badge variant={margins[plan.id] >= 80 ? 'default' : margins[plan.id] >= 50 ? 'secondary' : 'outline'}>
                        {margins[plan.id]}% margin
                      </Badge>
                    </div>
                    <Slider
                      value={[margins[plan.id]]}
                      onValueChange={(value) => handleMarginChange(plan.id, value)}
                      max={95}
                      min={0}
                      step={1}
                      disabled={plan.id === 'free'}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                      <span>95%</span>
                    </div>
                  </div>
                ))}
                
                {/* Credits Margin */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Credit Packs</Label>
                    <Badge variant={margins.credits >= 80 ? 'default' : 'secondary'}>
                      {margins.credits}% margin
                    </Badge>
                  </div>
                  <Slider
                    value={[margins.credits]}
                    onValueChange={(value) => setMargins(prev => ({ ...prev, credits: value[0] }))}
                    max={95}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Calculated Subscription Prices */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Calculated Subscription Prices
              </CardTitle>
              <CardDescription>Based on costs and margins above</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Storage</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Base Cost</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Monthly Price</TableHead>
                    <TableHead className="text-right">Yearly Price</TableHead>
                    <TableHead className="text-right">Profit/mo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PLAN_CONFIGS.map(plan => {
                    const prices = calculatedPrices[plan.id] || {};
                    return (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.name}</TableCell>
                        <TableCell>{plan.submissions.toLocaleString()}/mo</TableCell>
                        <TableCell>{plan.storage} GB</TableCell>
                        <TableCell>{plan.users === -1 ? 'Unlimited' : plan.users}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${prices.cost?.toFixed(2) || '0.00'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{prices.margin || 0}%</Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          ${prices.monthlyPrice || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          ${prices.yearlyPrice || 0}/yr
                        </TableCell>
                        <TableCell className="text-right text-emerald-500">
                          +${prices.profit?.toFixed(2) || '0.00'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Calculated Credit Pack Prices */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Calculated Credit Pack Prices
              </CardTitle>
              <CardDescription>Pay-as-you-go credit pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pack</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead className="text-right">Base Cost</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Per Credit</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CREDIT_PACK_CONFIGS.map(pack => {
                    const prices = creditPrices[pack.id] || {};
                    return (
                      <TableRow key={pack.id}>
                        <TableCell className="font-medium">{pack.name}</TableCell>
                        <TableCell>{pack.credits.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          ${prices.cost || 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          ${prices.price || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          ${prices.perCredit || '0.000'}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500">
                          +${prices.profit || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Summary Card */}
          <Card className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Avg. Margin</p>
                  <p className="text-3xl font-bold">
                    {Math.round((margins.starter + margins.pro + margins.enterprise) / 3)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Starter Price</p>
                  <p className="text-3xl font-bold text-sky-400">
                    ${calculatedPrices.starter?.monthlyPrice || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Pro Price</p>
                  <p className="text-3xl font-bold text-violet-400">
                    ${calculatedPrices.pro?.monthlyPrice || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400 mb-1">Enterprise Price</p>
                  <p className="text-3xl font-bold text-amber-400">
                    ${calculatedPrices.enterprise?.monthlyPrice || 0}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Info className="w-4 h-4" />
                  <span>Yearly pricing includes 2 months free (17% discount)</span>
                </div>
                <Button 
                  onClick={() => navigate('/pricing')}
                  variant="secondary"
                >
                  View Public Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PricingCalculatorPage;
