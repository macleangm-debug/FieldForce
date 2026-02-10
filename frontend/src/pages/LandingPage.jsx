import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Smartphone,
  Wifi,
  WifiOff,
  Cloud,
  Shield,
  Globe,
  Users,
  FileText,
  Camera,
  Mic,
  Navigation,
  CheckCircle2,
  ArrowRight,
  Play,
  ChevronRight,
  Database,
  BarChart3,
  Clock,
  Zap,
  Building2,
  Heart,
  Leaf,
  GraduationCap,
  Droplets,
  Star,
  Quote
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { PublicHeader } from '../components/PublicHeader';
import { VideoModal } from '../components/VideoModal';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Hero Section
const HeroSection = ({ onWatchDemo }) => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-20 left-20 w-16 h-16 rounded-2xl bg-sky-500/20 backdrop-blur-sm border border-sky-500/30 flex items-center justify-center"
      >
        <MapPin className="w-8 h-8 text-sky-400" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
        className="absolute top-40 right-32 w-14 h-14 rounded-xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 flex items-center justify-center"
      >
        <Camera className="w-7 h-7 text-emerald-400" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute bottom-32 left-40 w-12 h-12 rounded-lg bg-violet-500/20 backdrop-blur-sm border border-violet-500/30 flex items-center justify-center"
      >
        <Mic className="w-6 h-6 text-violet-400" />
      </motion.div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/30">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">FieldForce</span>
          </div>
          
          <Badge className="mb-6 bg-sky-500/20 text-sky-300 border-sky-500/30 px-4 py-1.5">
            By DataVision International
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Mobile Data Collection
            <br />
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
            Powerful offline-first data collection for field teams. GPS tracking, photo capture, 
            and seamless sync - all in one platform trusted by researchers across Africa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-lg px-8 py-6"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-600 text-white hover:bg-slate-800 text-lg px-8 py-6"
              onClick={onWatchDemo}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '87%', label: 'Cheaper than competitors' },
              { value: '100%', label: 'Offline capable' },
              { value: '256-bit', label: 'AES Encryption' },
              { value: '24/7', label: 'Support available' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronRight className="w-8 h-8 text-slate-500 rotate-90" />
      </motion.div>
    </section>
  );
};

// How It Works Section with Visual Flow
const HowItWorksSection = () => {
  const steps = [
    {
      step: 1,
      title: 'Design Forms',
      description: 'Create surveys with our drag-and-drop builder. Add skip logic, calculations, and validations.',
      icon: FileText,
      color: 'sky',
      visual: (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="space-y-2">
            <div className="h-3 bg-sky-500/30 rounded w-3/4" />
            <div className="h-8 bg-slate-700 rounded" />
            <div className="h-3 bg-sky-500/30 rounded w-1/2" />
            <div className="h-8 bg-slate-700 rounded" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-emerald-500/30 rounded" />
              <div className="h-8 w-8 bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: 'Deploy to Field',
      description: 'Enumerators download forms to their devices. Works completely offline in remote areas.',
      icon: Smartphone,
      color: 'emerald',
      visual: (
        <div className="relative">
          <div className="bg-slate-800 rounded-2xl p-3 border border-slate-700 w-32 mx-auto">
            <div className="bg-slate-900 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-2">
                <WifiOff className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] text-amber-500">Offline</span>
              </div>
              <div className="h-2 bg-emerald-500/30 rounded w-full" />
              <div className="h-6 bg-slate-700 rounded" />
              <div className="h-6 bg-slate-700 rounded" />
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        </div>
      )
    },
    {
      step: 3,
      title: 'Collect Data',
      description: 'Capture GPS, photos, audio, signatures. All data encrypted and stored securely on device.',
      icon: Camera,
      color: 'violet',
      visual: (
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Navigation className="w-6 h-6 text-violet-400 mb-1" />
            <span className="text-[10px] text-slate-400">GPS</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Camera className="w-6 h-6 text-violet-400 mb-1" />
            <span className="text-[10px] text-slate-400">Photo</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Mic className="w-6 h-6 text-violet-400 mb-1" />
            <span className="text-[10px] text-slate-400">Audio</span>
          </div>
          <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 flex flex-col items-center">
            <Shield className="w-6 h-6 text-violet-400 mb-1" />
            <span className="text-[10px] text-slate-400">Encrypted</span>
          </div>
        </div>
      )
    },
    {
      step: 4,
      title: 'Sync & Analyze',
      description: 'Data syncs automatically when online. View submissions, export reports, track quality.',
      icon: Cloud,
      color: 'amber',
      visual: (
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-500">Synced</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Submissions</span>
              <span className="text-xs text-white font-mono">1,234</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
              />
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-slate-900 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-sky-500/20 text-sky-300 border-sky-500/30">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            From Design to Insights in 4 Steps
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            FieldForce simplifies the entire data collection workflow - from form creation to analysis.
          </p>
        </div>

        {/* Visual Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative"
            >
              {/* Connector Line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent z-0" />
              )}
              
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all h-full">
                <CardContent className="p-6">
                  {/* Step Number */}
                  <div className={`w-12 h-12 rounded-xl bg-${step.color}-500/20 flex items-center justify-center mb-4`}>
                    <span className={`text-xl font-bold text-${step.color}-400`}>{step.step}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{step.description}</p>
                  
                  {/* Visual */}
                  <div className="mt-4">
                    {step.visual}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'Collect data in remote areas with no internet. Sync when back online.',
      color: 'sky'
    },
    {
      icon: Navigation,
      title: 'GPS Tracking',
      description: 'Automatic location capture with geofencing validation.',
      color: 'emerald'
    },
    {
      icon: Camera,
      title: 'Media Capture',
      description: 'Photos, audio recordings, video, and signatures.',
      color: 'violet'
    },
    {
      icon: Shield,
      title: 'Encrypted Storage',
      description: 'AES-256 encryption protects all data on device.',
      color: 'amber'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Assign forms, track progress, manage permissions.',
      color: 'rose'
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'English, Swahili, and more. Easy translations.',
      color: 'cyan'
    },
    {
      icon: BarChart3,
      title: 'Real-time Analytics',
      description: 'Dashboard with submission trends and quality metrics.',
      color: 'orange'
    },
    {
      icon: Smartphone,
      title: 'Device Management',
      description: 'Remote wipe, lock devices, track activity.',
      color: 'indigo'
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-800 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            Features
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need for Field Data Collection
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <Card className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-all h-full">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Use Cases Section
const UseCasesSection = () => {
  const useCases = [
    {
      icon: Heart,
      title: 'Health Surveys',
      description: 'Community health assessments, vaccination tracking, maternal health monitoring.',
      example: 'Used by USAID for health program M&E across East Africa.',
      color: 'rose'
    },
    {
      icon: Leaf,
      title: 'Agriculture',
      description: 'Crop yield assessments, farmer interviews, livestock census, food security.',
      example: 'FAO uses for agricultural surveys in 15 countries.',
      color: 'emerald'
    },
    {
      icon: GraduationCap,
      title: 'Education',
      description: 'School audits, enrollment verification, learning assessments (EGRA/EGMA).',
      example: 'Room to Read literacy evaluations worldwide.',
      color: 'amber'
    },
    {
      icon: Droplets,
      title: 'WASH Programs',
      description: 'Water point surveys, sanitation inspections, hygiene behavior studies.',
      example: 'UNICEF WASH monitoring in rural communities.',
      color: 'cyan'
    }
  ];

  return (
    <section id="use-cases" className="py-24 bg-slate-900 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30">
            Use Cases
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            Trusted Across Industries
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            From health programs to agricultural research, FieldForce powers data collection for organizations worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-${useCase.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                      <useCase.icon className={`w-7 h-7 text-${useCase.color}-400`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{useCase.title}</h3>
                      <p className="text-slate-400 mb-3">{useCase.description}</p>
                      <p className="text-sm text-slate-500 italic">"{useCase.example}"</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Pricing Preview Section
const PricingPreviewSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-gradient-to-br from-sky-900/20 via-slate-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">
            Pricing
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            87% Cheaper Than SurveyCTO
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Enterprise features at startup prices. Start free, scale as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {[
            { name: 'Starter', price: '$69', period: '/month', features: ['1,500 submissions', '5 GB storage', '10 users'] },
            { name: 'Pro', price: '$189', period: '/month', features: ['5,000 submissions', '25 GB storage', '30 users', 'API access'], popular: true },
            { name: 'Enterprise', price: '$499', period: '/month', features: ['20,000 submissions', '100 GB storage', 'Unlimited users', 'SSO'] }
          ].map((plan, idx) => (
            <Card key={idx} className={`bg-slate-800/50 border-slate-700 ${plan.popular ? 'border-sky-500 shadow-lg shadow-sky-500/20' : ''}`}>
              <CardContent className="p-6 text-center">
                {plan.popular && (
                  <Badge className="mb-4 bg-sky-500 text-white border-0">Most Popular</Badge>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
            onClick={() => navigate('/pricing')}
          >
            View Full Pricing
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Pay-as-you-go credits also available. M-Pesa accepted.
          </p>
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 bg-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-sky-500/30">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Field Operations?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Join hundreds of organizations collecting better data with FieldForce.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-lg px-8 py-6"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 text-lg px-8 py-6"
              onClick={() => navigate('/pricing')}
            >
              View Pricing
            </Button>
          </div>
          
          <p className="text-sm text-slate-500 mt-6">
            No credit card required • 500 free submissions • Full onboarding wizard included
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FieldForce</span>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Mobile data collection platform built for field teams. Offline-first, secure, and affordable.
            </p>
            <p className="text-sm text-slate-500">
              Powered by <span className="text-white">DataVision International</span>
              <br />
              Research & Statistics Consultancy
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/pricing" className="text-slate-400 hover:text-white text-sm">Pricing</Link></li>
              <li><Link to="/login" className="text-slate-400 hover:text-white text-sm">Login</Link></li>
              <li><Link to="/register" className="text-slate-400 hover:text-white text-sm">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="text-slate-400 text-sm">support@fieldforce.io</li>
              <li className="text-slate-400 text-sm">Dar es Salaam, Tanzania</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center">
          <p className="text-sm text-slate-500">
            © 2026 FieldForce by DataVision International. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
export function LandingPage() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <PublicHeader />
      <HeroSection onWatchDemo={() => setVideoOpen(true)} />
      <HowItWorksSection />
      <FeaturesSection />
      <UseCasesSection />
      <PricingPreviewSection />
      <CTASection />
      <Footer />
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}

export default LandingPage;
