import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  BarChart3,
  FileText,
  Users,
  MapPin,
  Camera,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import { Button } from './ui/button';

// Tour steps configuration
const TOUR_STEPS = [
  {
    id: 'welcome',
    type: 'modal',
    title: 'Welcome to FieldForce!',
    emoji: '👋',
    description: 'Let us show you around the dashboard. This quick tour will help you discover all the powerful features available.',
    icon: Sparkles,
  },
  {
    id: 'dashboard',
    type: 'highlight',
    target: '[data-tour="dashboard-stats"]',
    title: 'Dashboard Overview',
    description: 'Track your data collection progress at a glance. View total submissions, active team members, validation rates, and pending reviews.',
    icon: BarChart3,
    position: 'bottom',
  },
  {
    id: 'projects',
    type: 'highlight',
    target: '[data-tour="projects-grid"]',
    title: 'Active Projects',
    description: 'See all your data collection projects with real-time progress tracking. Click any project card to view detailed information.',
    icon: FileText,
    position: 'top',
  },
  {
    id: 'navigation',
    type: 'highlight',
    target: '[data-tour="sidebar-nav"]',
    title: 'Easy Navigation',
    description: 'Access all features from the sidebar: Forms, Submissions, Team management, GPS Map, and Media gallery.',
    icon: FileText,
    position: 'right',
  },
  {
    id: 'forms',
    type: 'highlight',
    target: '[data-tour="forms-nav"]',
    title: 'Form Builder',
    description: 'Create powerful data collection forms with our drag-and-drop builder. Add skip logic, validations, and calculations.',
    icon: FileText,
    position: 'right',
  },
  {
    id: 'team',
    type: 'highlight',
    target: '[data-tour="team-nav"]',
    title: 'Team Management',
    description: 'Manage your field team, assign forms, track progress, and monitor real-time activity across all enumerators.',
    icon: Users,
    position: 'right',
  },
  {
    id: 'complete',
    type: 'modal',
    title: "You're All Set!",
    emoji: '🎉',
    description: "You've completed the tour! Explore the demo freely or start your free trial to unlock all features with your own data.",
    icon: Rocket,
    isFinal: true,
  },
];

// Tour Context for managing tour state
export const useTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const seen = localStorage.getItem('fieldforce_tour_completed');
    if (!seen) {
      // Auto-start tour after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setHasSeenTour(true);
    }
  }, []);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  const endTour = useCallback((completed = false) => {
    setIsOpen(false);
    setCurrentStep(0);
    if (completed) {
      localStorage.setItem('fieldforce_tour_completed', 'true');
      setHasSeenTour(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      endTour(true);
    }
  }, [currentStep, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    endTour(true);
  }, [endTour]);

  return {
    isOpen,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    currentStepData: TOUR_STEPS[currentStep],
    hasSeenTour,
    startTour,
    endTour,
    nextStep,
    prevStep,
    skipTour,
  };
};

// Main Tour Modal Component
export const TourModal = ({ 
  isOpen, 
  currentStep, 
  totalSteps, 
  stepData, 
  onNext, 
  onPrev, 
  onSkip, 
  onClose 
}) => {
  if (!isOpen || !stepData) return null;

  const isFirstStep = currentStep === 0;
  const isLastStep = stepData.isFinal;
  const Icon = stepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
          >
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-slate-700">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Header */}
              <div className="px-6 pt-5 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-500/20">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-sm font-medium text-cyan-400">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  {stepData.title}
                  {stepData.emoji && <span>{stepData.emoji}</span>}
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {stepData.description}
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 pb-5 flex items-center justify-between">
                {!isLastStep ? (
                  <button
                    onClick={onSkip}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Skip Tour
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex items-center gap-2">
                  {!isFirstStep && !isLastStep && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onPrev}
                      className="text-slate-300 hover:text-white"
                    >
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onNext}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/25"
                  >
                    {isLastStep ? (
                      <>
                        Start Exploring
                        <Rocket className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Tooltip highlight component for specific elements
export const TourHighlight = ({
  isOpen,
  currentStep,
  totalSteps,
  stepData,
  onNext,
  onPrev,
  onSkip,
  onClose,
}) => {
  const [targetRect, setTargetRect] = useState(null);

  useEffect(() => {
    if (isOpen && stepData?.target) {
      const findTarget = () => {
        const element = document.querySelector(stepData.target);
        if (element) {
          const rect = element.getBoundingClientRect();
          setTargetRect(rect);
          // Scroll element into view if needed
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      };
      
      // Small delay to allow for any animations
      const timer = setTimeout(findTarget, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, stepData]);

  if (!isOpen || !stepData || stepData.type !== 'highlight') return null;

  const Icon = stepData.icon;
  const isFirstStep = currentStep === 0;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    
    switch (stepData.position) {
      case 'bottom':
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'top':
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
      case 'right':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + padding}px`,
          transform: 'translateY(-50%)',
        };
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
          transform: 'translateY(-50%)',
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        };
    }
  };

  const tooltipStyle = getTooltipPosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay with cutout for highlighted element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-auto"
            onClick={onClose}
          >
            {/* Semi-transparent overlay */}
            <div className="absolute inset-0 bg-black/60" />
            
            {/* Cutout highlight for target element */}
            {targetRect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute rounded-lg"
                style={{
                  top: targetRect.top - 8,
                  left: targetRect.left - 8,
                  width: targetRect.width + 16,
                  height: targetRect.height + 16,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                  border: '2px solid rgba(34, 211, 238, 0.6)',
                  background: 'transparent',
                }}
              />
            )}
          </motion.div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[101] w-80"
            style={tooltipStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl shadow-black/50 overflow-hidden">
              {/* Progress bar */}
              <div className="h-1 bg-slate-700">
                <motion.div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Header */}
              <div className="px-4 pt-4 pb-0 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-cyan-500/20">
                    <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <span className="text-xs font-medium text-cyan-400">
                    Step {currentStep + 1} of {totalSteps}
                  </span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 rounded hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 py-3">
                <h3 className="text-base font-semibold text-white mb-1.5">
                  {stepData.title}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {stepData.description}
                </p>
              </div>

              {/* Actions */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <button
                  onClick={onSkip}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Skip Tour
                </button>
                
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onPrev}
                      className="text-slate-300 hover:text-white h-8 px-2"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onNext}
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white h-8"
                  >
                    Next
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Arrow pointer */}
            {stepData.position === 'bottom' && (
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-l border-t border-slate-700 rotate-45" />
            )}
            {stepData.position === 'top' && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800 border-r border-b border-slate-700 rotate-45" />
            )}
            {stepData.position === 'right' && (
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
            )}
            {stepData.position === 'left' && (
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-slate-800 border-r border-t border-slate-700 rotate-45" />
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main GuidedTour component that renders the appropriate step type
export const GuidedTour = ({ tourState }) => {
  const { 
    isOpen, 
    currentStep, 
    totalSteps, 
    currentStepData, 
    nextStep, 
    prevStep, 
    skipTour, 
    endTour 
  } = tourState;

  if (!isOpen) return null;

  // Render modal for welcome/final steps, highlight for feature steps
  if (currentStepData?.type === 'modal') {
    return (
      <TourModal
        isOpen={isOpen}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepData={currentStepData}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipTour}
        onClose={() => endTour(false)}
      />
    );
  }

  return (
    <TourHighlight
      isOpen={isOpen}
      currentStep={currentStep}
      totalSteps={totalSteps}
      stepData={currentStepData}
      onNext={nextStep}
      onPrev={prevStep}
      onSkip={skipTour}
      onClose={() => endTour(false)}
    />
  );
};

// Tour trigger button for restarting tour
export const TourButton = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors text-sm ${className}`}
  >
    <Sparkles className="w-4 h-4" />
    <span>Take a Tour</span>
  </button>
);

export default GuidedTour;
