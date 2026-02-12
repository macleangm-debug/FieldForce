import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  FolderKanban,
  FileText,
  Users,
  Smartphone,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Plus,
  Upload,
  Link2,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { toast } from 'sonner';
import { useAuthStore, useOrgStore } from '../store';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Haptic feedback utility
 */
const haptic = {
  light: () => navigator.vibrate?.(10),
  success: () => navigator.vibrate?.([30, 50, 30]),
  celebration: () => navigator.vibrate?.([30, 30, 30, 30, 50, 100, 50]),
};

/**
 * Onboarding Steps Configuration
 */
const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to FieldForce!',
    subtitle: 'Your complete field data collection platform',
    icon: Sparkles,
    color: 'from-primary to-cyan-500',
  },
  {
    id: 'organization',
    title: 'Create Your Organization',
    subtitle: 'Set up your team workspace',
    icon: Building2,
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 'project',
    title: 'Start Your First Project',
    subtitle: 'Organize your data collection',
    icon: FolderKanban,
    color: 'from-emerald-500 to-green-500',
  },
  {
    id: 'form',
    title: 'Create a Survey Form',
    subtitle: 'Build your first data collection form',
    icon: FileText,
    color: 'from-orange-500 to-amber-500',
  },
  {
    id: 'team',
    title: 'Invite Your Team',
    subtitle: 'Add enumerators to collect data',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'complete',
    title: "You're All Set!",
    subtitle: 'Start collecting data now',
    icon: Rocket,
    color: 'from-primary to-cyan-500',
  },
];

/**
 * Onboarding Wizard Component
 * Guides new users through initial setup
 */
export function OnboardingWizard({ onComplete, onSkip }) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { setCurrentOrg } = useOrgStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  // Form data for each step
  const [orgData, setOrgData] = useState({ name: '', description: '' });
  const [projectData, setProjectData] = useState({ name: '', description: '' });
  const [formChoice, setFormChoice] = useState(null); // 'scratch' | 'template' | 'skip'
  const [teamChoice, setTeamChoice] = useState(null); // 'invite' | 'link' | 'skip'
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Created resources
  const [createdOrg, setCreatedOrg] = useState(null);
  const [createdProject, setCreatedProject] = useState(null);
  
  const [loading, setLoading] = useState(false);

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const step = ONBOARDING_STEPS[currentStep];

  const goNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      haptic.light();
      setIsAnimating(true);
      setCompletedSteps(prev => [...prev, currentStep]);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      haptic.light();
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleCreateOrg = async () => {
    if (!orgData.name.trim()) {
      toast.error('Please enter an organization name');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: orgData.name,
          description: orgData.description
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setCreatedOrg(data);
        setCurrentOrg(data);
        haptic.success();
        toast.success('Organization created!');
        goNext();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to create organization');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          org_id: createdOrg?.id
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setCreatedProject(data);
        haptic.success();
        toast.success('Project created!');
        goNext();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to create project');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChoice = (choice) => {
    setFormChoice(choice);
    haptic.light();
    
    if (choice === 'scratch') {
      // Navigate to form builder after onboarding
      goNext();
    } else if (choice === 'template') {
      // Navigate to templates after onboarding
      goNext();
    } else {
      goNext();
    }
  };

  const handleTeamChoice = (choice) => {
    setTeamChoice(choice);
    haptic.light();
    goNext();
  };

  const handleComplete = () => {
    haptic.celebration();
    localStorage.setItem('fieldforce_onboarding_completed', 'true');
    
    // Navigate based on choices
    if (formChoice === 'scratch' && createdProject) {
      navigate(`/forms/new?project=${createdProject.id}`);
    } else if (formChoice === 'template') {
      navigate('/templates');
    } else if (teamChoice === 'link') {
      navigate('/collection-links');
    } else {
      navigate('/dashboard');
    }
    
    onComplete?.();
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'welcome':
        return <WelcomeStep user={user} onNext={goNext} />;
      
      case 'organization':
        return (
          <OrganizationStep
            data={orgData}
            onChange={setOrgData}
            onNext={handleCreateOrg}
            onSkip={goNext}
            loading={loading}
          />
        );
      
      case 'project':
        return (
          <ProjectStep
            data={projectData}
            onChange={setProjectData}
            orgName={createdOrg?.name}
            onNext={handleCreateProject}
            onSkip={goNext}
            loading={loading}
          />
        );
      
      case 'form':
        return (
          <FormChoiceStep
            selected={formChoice}
            onSelect={handleFormChoice}
          />
        );
      
      case 'team':
        return (
          <TeamStep
            selected={teamChoice}
            onSelect={handleTeamChoice}
            inviteEmail={inviteEmail}
            onEmailChange={setInviteEmail}
          />
        );
      
      case 'complete':
        return (
          <CompleteStep
            orgName={createdOrg?.name}
            projectName={createdProject?.name}
            formChoice={formChoice}
            teamChoice={teamChoice}
            onComplete={handleComplete}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-32px)] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      data-testid="onboarding-wizard"
    >
      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full bg-gradient-to-r ${step.color}`}
        />
      </div>

      {/* Header with step indicators and skip */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          {ONBOARDING_STEPS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: i === currentStep ? 1.2 : 1,
                opacity: i <= currentStep ? 1 : 0.3
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < currentStep 
                  ? 'bg-green-500' 
                  : i === currentStep 
                    ? 'bg-primary' 
                    : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        <button
          onClick={onSkip}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-xs"
          data-testid="onboarding-skip-btn"
        >
          Skip setup
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main content */}
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step icon and title */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${step.color} shadow-lg shrink-0`}>
                <step.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{step.title}</h2>
                <p className="text-slate-400 text-sm">{step.subtitle}</p>
              </div>
            </div>

            {/* Step content */}
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      {currentStep > 0 && currentStep < ONBOARDING_STEPS.length - 1 && (
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={goPrev}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Welcome Step
 */
function WelcomeStep({ user, onNext }) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <p className="text-lg text-slate-300">
          Hi <span className="text-primary font-semibold">{user?.name || 'there'}</span>! 👋
        </p>
        <p className="text-slate-400">
          Let's set up your workspace in just a few steps. You'll be collecting data in no time!
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 py-6">
        {[
          { icon: Building2, label: 'Organization' },
          { icon: FolderKanban, label: 'Project' },
          { icon: FileText, label: 'Forms' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
              <item.icon className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-xs text-slate-500">{item.label}</span>
          </motion.div>
        ))}
      </div>

      <Button onClick={onNext} size="lg" className="w-full">
        Let's Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

/**
 * Organization Step
 */
function OrganizationStep({ data, onChange, onNext, onSkip, loading }) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Organization Name *</Label>
            <Input
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              placeholder="Acme Research Ltd."
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Description (Optional)</Label>
            <Textarea
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="What does your organization do?"
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex-1 text-slate-400"
        >
          Skip for now
        </Button>
        <Button
          onClick={onNext}
          disabled={loading || !data.name.trim()}
          className="flex-1"
        >
          {loading ? 'Creating...' : 'Create Organization'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Project Step
 */
function ProjectStep({ data, onChange, orgName, onNext, onSkip, loading }) {
  return (
    <div className="space-y-6">
      {orgName && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Building2 className="w-4 h-4" />
          <span>Creating project in <span className="text-white">{orgName}</span></span>
        </div>
      )}

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Project Name *</Label>
            <Input
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
              placeholder="Household Survey 2025"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white">Description (Optional)</Label>
            <Textarea
              value={data.description}
              onChange={(e) => onChange({ ...data, description: e.target.value })}
              placeholder="What data will you collect?"
              className="bg-slate-700 border-slate-600 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="flex-1 text-slate-400"
        >
          Skip for now
        </Button>
        <Button
          onClick={onNext}
          disabled={loading || !data.name.trim()}
          className="flex-1"
        >
          {loading ? 'Creating...' : 'Create Project'}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Form Choice Step
 */
function FormChoiceStep({ selected, onSelect }) {
  const options = [
    {
      id: 'scratch',
      icon: Plus,
      title: 'Start from scratch',
      description: 'Build a custom form with our drag-and-drop builder',
      color: 'from-primary to-cyan-500',
    },
    {
      id: 'template',
      icon: FileText,
      title: 'Use a template',
      description: 'Start with a pre-built survey template',
      color: 'from-violet-500 to-purple-500',
    },
    {
      id: 'skip',
      icon: ArrowRight,
      title: 'I\'ll do this later',
      description: 'Skip and explore the dashboard first',
      color: 'from-slate-600 to-slate-700',
    },
  ];

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(option.id)}
          className={`w-full p-4 rounded-xl border transition-all text-left ${
            selected === option.id
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color}`}>
              <option.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">{option.title}</h3>
              <p className="text-sm text-slate-400">{option.description}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/**
 * Team Step
 */
function TeamStep({ selected, onSelect, inviteEmail, onEmailChange }) {
  const options = [
    {
      id: 'link',
      icon: Link2,
      title: 'Share collection link',
      description: 'Generate a link for enumerators (no account needed)',
      color: 'from-emerald-500 to-green-500',
    },
    {
      id: 'invite',
      icon: Users,
      title: 'Invite team members',
      description: 'Add users with full dashboard access',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      id: 'skip',
      icon: ArrowRight,
      title: 'I\'ll work solo for now',
      description: 'Skip team setup and continue',
      color: 'from-slate-600 to-slate-700',
    },
  ];

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(option.id)}
          className={`w-full p-4 rounded-xl border transition-all text-left ${
            selected === option.id
              ? 'border-primary bg-primary/10'
              : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${option.color}`}>
              <option.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-white">{option.title}</h3>
              <p className="text-sm text-slate-400">{option.description}</p>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/**
 * Complete Step
 */
function CompleteStep({ orgName, projectName, formChoice, teamChoice, onComplete }) {
  return (
    <div className="text-center space-y-6">
      {/* Celebration animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
        className="relative"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(i * 45 * Math.PI / 180) * 60,
              y: Math.sin(i * 45 * Math.PI / 180) * 60,
            }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.05 }}
            className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
            style={{ background: `hsl(${i * 45}, 70%, 60%)` }}
          />
        ))}
        <div className="text-6xl">🎉</div>
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Awesome! You're ready to go!</h2>
        <p className="text-slate-400">Here's what we set up for you:</p>
      </div>

      {/* Summary */}
      <div className="space-y-3 text-left">
        {orgName && (
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-white font-medium">Organization</p>
              <p className="text-sm text-slate-400">{orgName}</p>
            </div>
          </div>
        )}
        
        {projectName && (
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <Check className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-white font-medium">Project</p>
              <p className="text-sm text-slate-400">{projectName}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <Check className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-white font-medium">Next step</p>
            <p className="text-sm text-slate-400">
              {formChoice === 'scratch' && 'Create your first form'}
              {formChoice === 'template' && 'Browse form templates'}
              {formChoice === 'skip' && 'Explore the dashboard'}
              {!formChoice && 'Explore the dashboard'}
            </p>
          </div>
        </div>
      </div>

      <Button onClick={onComplete} size="lg" className="w-full">
        <Rocket className="w-4 h-4 mr-2" />
        Launch Dashboard
      </Button>
    </div>
  );
}

/**
 * Hook to check if onboarding is needed
 */
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      const completed = localStorage.getItem('fieldforce_onboarding_completed');
      if (!completed) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated]);

  return {
    showOnboarding,
    completeOnboarding: () => {
      localStorage.setItem('fieldforce_onboarding_completed', 'true');
      setShowOnboarding(false);
    },
    skipOnboarding: () => {
      localStorage.setItem('fieldforce_onboarding_completed', 'true');
      setShowOnboarding(false);
    },
    resetOnboarding: () => {
      localStorage.removeItem('fieldforce_onboarding_completed');
      setShowOnboarding(true);
    }
  };
}

export default OnboardingWizard;
