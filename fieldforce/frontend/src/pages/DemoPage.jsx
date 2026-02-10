import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Smartphone,
  Wifi,
  WifiOff,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Camera,
  Mic,
  Navigation,
  FileText,
  Users,
  Upload,
  Download,
  Database,
  BarChart3,
  Clock,
  Shield,
  Globe,
  Zap,
  ChevronRight,
  MousePointer,
  Send,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  GripVertical,
  Trash2,
  Type,
  Hash,
  Calendar,
  List,
  ToggleLeft,
  Star,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

// ==================== DEMO 1: FORM BUILDER VISUALIZATION ====================
const FormBuilderDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fields, setFields] = useState([]);
  
  const demoFields = [
    { id: 1, type: 'text', label: 'Respondent Name', icon: FileText },
    { id: 2, type: 'gps', label: 'GPS Location', icon: Navigation },
    { id: 3, type: 'photo', label: 'Site Photo', icon: Camera },
    { id: 4, type: 'select', label: 'Survey Type', icon: CheckCircle2 },
    { id: 5, type: 'audio', label: 'Audio Notes', icon: Mic },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoFields.length) {
          setFields([]);
          return 0;
        }
        setFields(f => [...f, demoFields[prev]]);
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Drag & Drop Form Builder</h3>
          <p className="text-sm text-slate-400">Watch forms come to life</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsPlaying(!isPlaying)}
            className="border-slate-600"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => { setFields([]); setCurrentStep(0); }}
            className="border-slate-600"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Toolbox */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-500 mb-3">FIELD TYPES</p>
          <div className="space-y-2">
            {demoFields.map((field, idx) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: idx < currentStep ? 0.3 : 1,
                  scale: idx === currentStep - 1 ? [1, 1.05, 1] : 1
                }}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  idx < currentStep ? 'bg-slate-700/50' : 'bg-slate-700'
                }`}
              >
                <field.icon className="w-4 h-4 text-sky-400" />
                <span className="text-sm text-slate-300">{field.type}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Form Preview */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-500 mb-3">FORM PREVIEW</p>
          <div className="space-y-3 min-h-[200px]">
            <AnimatePresence>
              {fields.map((field, idx) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -50, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="bg-slate-700 rounded-lg p-3 border border-slate-600"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <field.icon className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-white">{field.label}</span>
                  </div>
                  <div className="h-8 bg-slate-600 rounded animate-pulse" />
                </motion.div>
              ))}
            </AnimatePresence>
            {fields.length === 0 && (
              <div className="flex items-center justify-center h-[200px] text-slate-500 text-sm">
                <MousePointer className="w-4 h-4 mr-2" />
                Drag fields here...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DEMO 2: OFFLINE SYNC VISUALIZATION ====================
const OfflineSyncDemo = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState(5);
  const [syncedSubmissions, setSyncedSubmissions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [phase, setPhase] = useState('offline'); // offline, connecting, syncing, complete

  useEffect(() => {
    const cycle = async () => {
      // Phase 1: Offline with pending
      setPhase('offline');
      setIsOnline(false);
      setPendingSubmissions(5);
      setSyncedSubmissions(0);
      await new Promise(r => setTimeout(r, 3000));

      // Phase 2: Coming online
      setPhase('connecting');
      await new Promise(r => setTimeout(r, 1500));
      setIsOnline(true);

      // Phase 3: Syncing
      setPhase('syncing');
      setIsSyncing(true);
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 800));
        setPendingSubmissions(p => p - 1);
        setSyncedSubmissions(s => s + 1);
      }
      setIsSyncing(false);

      // Phase 4: Complete
      setPhase('complete');
      await new Promise(r => setTimeout(r, 2000));
    };

    const interval = setInterval(cycle, 12000);
    cycle();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Offline-First Sync</h3>
          <p className="text-sm text-slate-400">Data syncs automatically when online</p>
        </div>
        <Badge className={isOnline ? 'bg-emerald-500' : 'bg-amber-500'}>
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-8">
        {/* Device */}
        <motion.div 
          className="flex-1"
          animate={{ scale: isSyncing ? [1, 1.02, 1] : 1 }}
          transition={{ repeat: isSyncing ? Infinity : 0, duration: 0.5 }}
        >
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 relative">
            <div className="flex items-center gap-2 mb-4">
              <Smartphone className="w-5 h-5 text-sky-400" />
              <span className="text-sm font-medium text-white">Field Device</span>
              {!isOnline && (
                <WifiOff className="w-4 h-4 text-amber-500 ml-auto" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pending</span>
                <span className="text-amber-400 font-mono">{pendingSubmissions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Synced</span>
                <span className="text-emerald-400 font-mono">{syncedSubmissions}</span>
              </div>
              <Progress 
                value={(syncedSubmissions / 5) * 100} 
                className="h-2 mt-2"
              />
            </div>

            {/* Encrypted badge */}
            <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
              <Shield className="w-3 h-3" />
              AES-256 Encrypted
            </div>
          </div>
        </motion.div>

        {/* Sync Animation */}
        <div className="flex flex-col items-center gap-2">
          <AnimatePresence mode="wait">
            {phase === 'offline' && (
              <motion.div
                key="offline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-slate-500"
              >
                <WifiOff className="w-8 h-8" />
              </motion.div>
            )}
            {phase === 'connecting' && (
              <motion.div
                key="connecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="text-amber-500"
              >
                <Wifi className="w-8 h-8" />
              </motion.div>
            )}
            {phase === 'syncing' && (
              <motion.div
                key="syncing"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="text-sky-500"
              >
                <RefreshCw className="w-8 h-8" />
              </motion.div>
            )}
            {phase === 'complete' && (
              <motion.div
                key="complete"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-emerald-500"
              >
                <CheckCheck className="w-8 h-8" />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Data packets animation */}
          {isSyncing && (
            <div className="relative h-4 w-20">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-sky-500 rounded-full"
                  initial={{ left: 0, opacity: 0 }}
                  animate={{ left: 80, opacity: [0, 1, 0] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Cloud */}
        <motion.div 
          className="flex-1"
          animate={{ 
            boxShadow: phase === 'complete' 
              ? '0 0 30px rgba(16, 185, 129, 0.3)' 
              : '0 0 0px transparent' 
          }}
        >
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-5 h-5 text-sky-400" />
              <span className="text-sm font-medium text-white">FieldForce Cloud</span>
              <Wifi className="w-4 h-4 text-emerald-500 ml-auto" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Received</span>
                <span className="text-emerald-400 font-mono">{syncedSubmissions}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
                <Database className="w-3 h-3" />
                Real-time dashboard
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <BarChart3 className="w-3 h-3" />
                Instant analytics
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ==================== DEMO 3: GPS TRACKING VISUALIZATION ====================
const GPSTrackingDemo = () => {
  const [submissions, setSubmissions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ x: 50, y: 50 });
  const [isCollecting, setIsCollecting] = useState(true);

  useEffect(() => {
    if (!isCollecting) return;

    const moveInterval = setInterval(() => {
      setCurrentLocation(prev => ({
        x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 20)),
        y: Math.max(10, Math.min(90, prev.y + (Math.random() - 0.5) * 20))
      }));
    }, 1000);

    const submitInterval = setInterval(() => {
      setSubmissions(prev => {
        const newSub = {
          id: Date.now(),
          x: currentLocation.x + (Math.random() - 0.5) * 10,
          y: currentLocation.y + (Math.random() - 0.5) * 10,
          status: Math.random() > 0.2 ? 'valid' : 'warning'
        };
        return [...prev.slice(-9), newSub];
      });
    }, 2500);

    return () => {
      clearInterval(moveInterval);
      clearInterval(submitInterval);
    };
  }, [isCollecting, currentLocation]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Live GPS Tracking</h3>
          <p className="text-sm text-slate-400">Real-time field team locations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{submissions.length} submissions</span>
          <Badge className="bg-emerald-500 animate-pulse">LIVE</Badge>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative bg-slate-800 rounded-xl h-64 border border-slate-700 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div key={`h-${i}`} className="absolute w-full h-px bg-slate-500" style={{ top: `${i * 10}%` }} />
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={`v-${i}`} className="absolute h-full w-px bg-slate-500" style={{ left: `${i * 10}%` }} />
          ))}
        </div>

        {/* Geofence circle */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-dashed border-sky-500/30"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Submission points */}
        {submissions.map((sub, idx) => (
          <motion.div
            key={sub.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute w-3 h-3 rounded-full ${
              sub.status === 'valid' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ left: `${sub.x}%`, top: `${sub.y}%` }}
          />
        ))}

        {/* Current enumerator location */}
        <motion.div
          className="absolute"
          animate={{ left: `${currentLocation.x}%`, top: `${currentLocation.y}%` }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <div className="relative">
            <motion.div
              className="w-8 h-8 rounded-full bg-sky-500/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
              <Navigation className="w-3 h-3 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Valid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Outside geofence</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DEMO 4: SUBMISSION FLOW ====================
const SubmissionFlowDemo = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Form Started', icon: FileText, color: 'sky' },
    { label: 'GPS Captured', icon: Navigation, color: 'emerald' },
    { label: 'Photo Taken', icon: Camera, color: 'violet' },
    { label: 'Audio Recorded', icon: Mic, color: 'amber' },
    { label: 'Submitted', icon: Send, color: 'emerald' },
    { label: 'Synced to Cloud', icon: Cloud, color: 'sky' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => (prev + 1) % (steps.length + 2));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Submission Flow</h3>
          <p className="text-sm text-slate-400">End-to-end data journey</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <motion.div
              className="flex flex-col items-center"
              animate={{
                scale: idx === step ? 1.1 : 1,
                opacity: idx <= step ? 1 : 0.3
              }}
            >
              <motion.div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  idx < step 
                    ? `bg-${s.color}-500` 
                    : idx === step 
                      ? `bg-${s.color}-500/50 border-2 border-${s.color}-500`
                      : 'bg-slate-700'
                }`}
                animate={idx === step ? { boxShadow: ['0 0 0px transparent', '0 0 20px rgba(56, 189, 248, 0.5)', '0 0 0px transparent'] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <s.icon className={`w-5 h-5 ${idx <= step ? 'text-white' : 'text-slate-500'}`} />
              </motion.div>
              <span className={`text-xs mt-2 ${idx <= step ? 'text-white' : 'text-slate-500'}`}>
                {s.label}
              </span>
            </motion.div>
            
            {idx < steps.length - 1 && (
              <motion.div 
                className="flex-1 h-0.5 mx-2"
                initial={{ scaleX: 0 }}
                animate={{ 
                  scaleX: idx < step ? 1 : 0,
                  backgroundColor: idx < step ? '#10b981' : '#374151'
                }}
                style={{ originX: 0 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ==================== DEMO 5: LIVE DASHBOARD ====================
const LiveDashboardDemo = () => {
  const [stats, setStats] = useState({
    submissions: 1234,
    activeUsers: 23,
    avgTime: 4.2,
    quality: 94
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        submissions: prev.submissions + Math.floor(Math.random() * 5),
        activeUsers: 20 + Math.floor(Math.random() * 10),
        avgTime: (4 + Math.random()).toFixed(1),
        quality: 90 + Math.floor(Math.random() * 8)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Real-time Dashboard</h3>
          <p className="text-sm text-slate-400">Live field operations overview</p>
        </div>
        <Badge className="bg-emerald-500 animate-pulse">LIVE</Badge>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <motion.div
          className="bg-slate-800 rounded-xl p-4 border border-slate-700"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-xs text-slate-400 mb-1">Submissions Today</p>
          <p className="text-2xl font-bold text-white font-mono">{stats.submissions}</p>
          <p className="text-xs text-emerald-400">+12% from yesterday</p>
        </motion.div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Active Enumerators</p>
          <p className="text-2xl font-bold text-sky-400 font-mono">{stats.activeUsers}</p>
          <div className="flex -space-x-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800" />
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Avg Completion Time</p>
          <p className="text-2xl font-bold text-amber-400 font-mono">{stats.avgTime}m</p>
          <Progress value={70} className="h-1 mt-2" />
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Data Quality Score</p>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{stats.quality}%</p>
          <Progress value={stats.quality} className="h-1 mt-2" />
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DEMO PAGE ====================
export function DemoPage() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState('builder');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30">
            Interactive Demo
          </Badge>
          <h1 className="text-4xl font-bold text-white mb-4">
            See FieldForce in Action
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Experience our powerful data collection platform through interactive visualizations.
            No signup required.
          </p>
        </div>

        {/* Demo Tabs */}
        <Tabs value={activeDemo} onValueChange={setActiveDemo} className="mb-8">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto bg-slate-800 p-1">
            <TabsTrigger value="builder" className="data-[state=active]:bg-sky-500">
              Form Builder
            </TabsTrigger>
            <TabsTrigger value="sync" className="data-[state=active]:bg-sky-500">
              Offline Sync
            </TabsTrigger>
            <TabsTrigger value="gps" className="data-[state=active]:bg-sky-500">
              GPS Tracking
            </TabsTrigger>
            <TabsTrigger value="flow" className="data-[state=active]:bg-sky-500">
              Submission Flow
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-sky-500">
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-8">
            <FormBuilderDemo />
          </TabsContent>
          <TabsContent value="sync" className="mt-8">
            <OfflineSyncDemo />
          </TabsContent>
          <TabsContent value="gps" className="mt-8">
            <GPSTrackingDemo />
          </TabsContent>
          <TabsContent value="flow" className="mt-8">
            <SubmissionFlowDemo />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-8">
            <LiveDashboardDemo />
          </TabsContent>
        </Tabs>

        {/* All Demos View */}
        <div className="mt-16 space-y-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            All Features at a Glance
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FormBuilderDemo />
            <OfflineSyncDemo />
            <GPSTrackingDemo />
            <SubmissionFlowDemo />
          </div>
          
          <LiveDashboardDemo />
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-slate-400 mb-8">
            Start your free trial and transform your field operations today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800"
              onClick={() => navigate('/pricing')}
            >
              View Pricing
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoPage;
