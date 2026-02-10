import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Video,
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
import { PublicHeader } from '../components/PublicHeader';
import { VideoModal } from '../components/VideoModal';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// ==================== INTERACTIVE FORM BUILDER SANDBOX ====================
const InteractiveFormBuilderSandbox = () => {
  const [formFields, setFormFields] = useState([]);
  const [draggedField, setDraggedField] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const availableFieldTypes = [
    { id: 'text', type: 'text', label: 'Text Input', icon: Type, defaultLabel: 'Text Question', color: 'sky' },
    { id: 'number', type: 'number', label: 'Number', icon: Hash, defaultLabel: 'Number Question', color: 'violet' },
    { id: 'select', type: 'select', label: 'Dropdown', icon: List, defaultLabel: 'Select Option', color: 'emerald' },
    { id: 'date', type: 'date', label: 'Date', icon: Calendar, defaultLabel: 'Date Question', color: 'amber' },
    { id: 'gps', type: 'gps', label: 'GPS Location', icon: Navigation, defaultLabel: 'Capture Location', color: 'rose' },
    { id: 'photo', type: 'photo', label: 'Photo', icon: Camera, defaultLabel: 'Take Photo', color: 'cyan' },
    { id: 'audio', type: 'audio', label: 'Audio', icon: Mic, defaultLabel: 'Record Audio', color: 'orange' },
    { id: 'checkbox', type: 'checkbox', label: 'Checkbox', icon: ToggleLeft, defaultLabel: 'Yes/No Question', color: 'lime' },
  ];

  const handleDragStart = (e, fieldType) => {
    setDraggedField(fieldType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (draggedField) {
      const newField = {
        ...draggedField,
        instanceId: `${draggedField.id}-${Date.now()}`,
        label: draggedField.defaultLabel,
        required: false,
      };
      setFormFields(prev => [...prev, newField]);
      setDraggedField(null);
    }
  };

  const handleRemoveField = (instanceId) => {
    setFormFields(prev => prev.filter(f => f.instanceId !== instanceId));
  };

  const handleToggleRequired = (instanceId) => {
    setFormFields(prev => prev.map(f => 
      f.instanceId === instanceId ? { ...f, required: !f.required } : f
    ));
  };

  const handlePreviewForm = () => {
    if (formFields.length > 0) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleClearForm = () => {
    setFormFields([]);
  };

  const DraggableFormField = ({ field, index }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [labelValue, setLabelValue] = useState(field.label);

    const handleLabelSave = () => {
      setFormFields(prev => prev.map(f => 
        f.instanceId === field.instanceId ? { ...f, label: labelValue } : f
      ));
      setIsEditing(false);
    };

    const IconComponent = field.icon;
    const colorClasses = {
      sky: 'bg-sky-500/20 text-sky-400',
      violet: 'bg-violet-500/20 text-violet-400',
      emerald: 'bg-emerald-500/20 text-emerald-400',
      amber: 'bg-amber-500/20 text-amber-400',
      rose: 'bg-rose-500/20 text-rose-400',
      cyan: 'bg-cyan-500/20 text-cyan-400',
      orange: 'bg-orange-500/20 text-orange-400',
      lime: 'bg-lime-500/20 text-lime-400',
    };

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, x: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="group bg-slate-700/80 backdrop-blur rounded-xl p-4 border-2 border-slate-600 hover:border-slate-500 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <GripVertical className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
          </div>
          
          <div className={`p-2 rounded-lg ${colorClasses[field.color]?.split(' ')[0] || 'bg-slate-600'}`}>
            <IconComponent className={`w-4 h-4 ${colorClasses[field.color]?.split(' ')[1] || 'text-slate-400'}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={labelValue}
                  onChange={(e) => setLabelValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLabelSave()}
                  onBlur={handleLabelSave}
                  className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>
            ) : (
              <div 
                className="text-sm font-medium text-white cursor-text hover:text-sky-300 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {field.label}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-500 uppercase tracking-wide">{field.type}</span>
              <button
                onClick={() => handleToggleRequired(field.instanceId)}
                className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
                  field.required 
                    ? 'bg-rose-500/20 text-rose-400' 
                    : 'bg-slate-600 text-slate-400 hover:text-slate-300'
                }`}
              >
                {field.required ? 'Required' : 'Optional'}
              </button>
            </div>
          </div>
          
          <button
            onClick={() => handleRemoveField(field.instanceId)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">Try Form Builder</h3>
            <p className="text-sm text-slate-400">Drag fields to build your survey</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleClearForm}
            className="px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors text-sm flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button 
            onClick={handlePreviewForm}
            disabled={formFields.length === 0}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:from-sky-600 hover:to-cyan-600 transition-all"
          >
            <Play className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Field Types Toolbox */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Field Types</p>
          <div className="grid grid-cols-2 gap-2">
            {availableFieldTypes.map((fieldType) => {
              const IconComponent = fieldType.icon;
              const colorClasses = {
                sky: 'bg-sky-500/20 text-sky-400 hover:border-sky-500/50 group-hover:bg-sky-500/30',
                violet: 'bg-violet-500/20 text-violet-400 hover:border-violet-500/50 group-hover:bg-violet-500/30',
                emerald: 'bg-emerald-500/20 text-emerald-400 hover:border-emerald-500/50 group-hover:bg-emerald-500/30',
                amber: 'bg-amber-500/20 text-amber-400 hover:border-amber-500/50 group-hover:bg-amber-500/30',
                rose: 'bg-rose-500/20 text-rose-400 hover:border-rose-500/50 group-hover:bg-rose-500/30',
                cyan: 'bg-cyan-500/20 text-cyan-400 hover:border-cyan-500/50 group-hover:bg-cyan-500/30',
                orange: 'bg-orange-500/20 text-orange-400 hover:border-orange-500/50 group-hover:bg-orange-500/30',
                lime: 'bg-lime-500/20 text-lime-400 hover:border-lime-500/50 group-hover:bg-lime-500/30',
              };
              const [bgClass, textClass] = (colorClasses[fieldType.color] || '').split(' ');
              
              return (
                <motion.div
                  key={fieldType.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, fieldType)}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700 cursor-grab active:cursor-grabbing hover:bg-slate-800 hover:border-slate-600 transition-all group"
                >
                  <div className={`p-1.5 rounded-lg ${bgClass} transition-colors`}>
                    <IconComponent className={`w-4 h-4 ${textClass}`} />
                  </div>
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{fieldType.label}</span>
                </motion.div>
              );
            })}
          </div>
          
          {/* Tips */}
          <div className="mt-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <p className="text-xs text-sky-300 flex items-start gap-2">
              <Zap className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Drag fields to the form canvas, click labels to edit!</span>
            </p>
          </div>
        </div>

        {/* Form Canvas */}
        <div className="lg:col-span-3">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Form Canvas</p>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`min-h-[300px] sm:min-h-[350px] rounded-xl border-2 border-dashed transition-all p-4 ${
              isDraggingOver 
                ? 'border-sky-500 bg-sky-500/10' 
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            {formFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[280px] sm:h-[320px] text-slate-500">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <MousePointer className="w-10 h-10 mb-4 text-slate-600" />
                </motion.div>
                <p className="text-base font-medium mb-1">Drag & drop fields here</p>
                <p className="text-sm text-slate-600">Start building your survey form</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {formFields.map((field, index) => (
                    <DraggableFormField 
                      key={field.instanceId} 
                      field={field} 
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
          
          {/* Field Count */}
          {formFields.length > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-slate-400">
                {formFields.length} field{formFields.length !== 1 ? 's' : ''} added
              </span>
              <span className="text-xs text-slate-500">
                {formFields.filter(f => f.required).length} required
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-semibold">Form Preview Ready!</p>
              <p className="text-sm text-emerald-100">Sign up to deploy this form to your team</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {fields.map((field) => (
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
                <span className="hidden sm:inline">Drag fields here...</span>
                <span className="sm:hidden">Fields appear here</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== DEMO 2: OFFLINE SYNC WITH LIVE API ====================
const OfflineSyncDemo = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState(5);
  const [syncedSubmissions, setSyncedSubmissions] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [phase, setPhase] = useState('offline');
  const [liveStats, setLiveStats] = useState(null);

  // Fetch live stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/billing/plans`);
        if (response.ok) {
          setLiveStats({ connected: true });
        }
      } catch (e) {
        setLiveStats({ connected: false });
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cycle = async () => {
      setPhase('offline');
      setIsOnline(false);
      setPendingSubmissions(5);
      setSyncedSubmissions(0);
      await new Promise(r => setTimeout(r, 3000));

      setPhase('connecting');
      await new Promise(r => setTimeout(r, 1500));
      setIsOnline(true);

      setPhase('syncing');
      setIsSyncing(true);
      for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 800));
        setPendingSubmissions(p => p - 1);
        setSyncedSubmissions(s => s + 1);
      }
      setIsSyncing(false);

      setPhase('complete');
      await new Promise(r => setTimeout(r, 2000));
    };

    const interval = setInterval(cycle, 12000);
    cycle();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Offline-First Sync</h3>
          <p className="text-sm text-slate-400">Data syncs automatically when online</p>
        </div>
        <div className="flex items-center gap-2">
          {liveStats?.connected && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              API Connected
            </Badge>
          )}
          <Badge className={isOnline ? 'bg-emerald-500' : 'bg-amber-500'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8">
        {/* Device */}
        <motion.div 
          className="w-full sm:flex-1"
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
              <Progress value={(syncedSubmissions / 5) * 100} className="h-2 mt-2" />
            </div>

            <div className="mt-4 flex items-center gap-1 text-xs text-slate-500">
              <Shield className="w-3 h-3" />
              AES-256 Encrypted
            </div>
          </div>
        </motion.div>

        {/* Sync Animation */}
        <div className="flex sm:flex-col items-center gap-2 py-4">
          <AnimatePresence mode="wait">
            {phase === 'offline' && (
              <motion.div key="offline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-slate-500">
                <WifiOff className="w-6 sm:w-8 h-6 sm:h-8" />
              </motion.div>
            )}
            {phase === 'connecting' && (
              <motion.div key="connecting" initial={{ opacity: 0 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="text-amber-500">
                <Wifi className="w-6 sm:w-8 h-6 sm:h-8" />
              </motion.div>
            )}
            {phase === 'syncing' && (
              <motion.div key="syncing" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="text-sky-500">
                <RefreshCw className="w-6 sm:w-8 h-6 sm:h-8" />
              </motion.div>
            )}
            {phase === 'complete' && (
              <motion.div key="complete" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-emerald-500">
                <CheckCheck className="w-6 sm:w-8 h-6 sm:h-8" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cloud */}
        <motion.div 
          className="w-full sm:flex-1"
          animate={{ boxShadow: phase === 'complete' ? '0 0 30px rgba(16, 185, 129, 0.3)' : '0 0 0px transparent' }}
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

// ==================== DEMO 3: GPS TRACKING WITH LIVE DATA ====================
const GPSTrackingDemo = () => {
  const [submissions, setSubmissions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ x: 50, y: 50 });
  const [liveCount, setLiveCount] = useState(0);

  // Fetch live submission count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        if (response.ok) {
          setLiveCount(prev => prev + Math.floor(Math.random() * 3));
        }
      } catch (e) {}
    };
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
  }, [currentLocation]);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Live GPS Tracking</h3>
          <p className="text-sm text-slate-400">Real-time field team locations</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{submissions.length + liveCount} submissions</span>
          <Badge className="bg-emerald-500 animate-pulse">LIVE</Badge>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative bg-slate-800 rounded-xl h-48 sm:h-64 border border-slate-700 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <React.Fragment key={i}>
              <div className="absolute w-full h-px bg-slate-500" style={{ top: `${i * 10}%` }} />
              <div className="absolute h-full w-px bg-slate-500" style={{ left: `${i * 10}%` }} />
            </React.Fragment>
          ))}
        </div>

        {/* Geofence circle */}
        <motion.div
          className="absolute w-20 h-20 sm:w-32 sm:h-32 rounded-full border-2 border-dashed border-sky-500/30"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Submission points */}
        {submissions.map((sub) => (
          <motion.div
            key={sub.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
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
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-sky-500/30"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-sky-500 flex items-center justify-center">
              <Navigation className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
            </div>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-3 text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Valid</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Outside fence</span>
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
    { label: 'Started', icon: FileText, color: 'sky' },
    { label: 'GPS', icon: Navigation, color: 'emerald' },
    { label: 'Photo', icon: Camera, color: 'violet' },
    { label: 'Audio', icon: Mic, color: 'amber' },
    { label: 'Submit', icon: Send, color: 'emerald' },
    { label: 'Synced', icon: Cloud, color: 'sky' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => (prev + 1) % (steps.length + 2));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Submission Flow</h3>
        <p className="text-sm text-slate-400">End-to-end data journey</p>
      </div>

      {/* Mobile: Vertical flow */}
      <div className="sm:hidden space-y-3">
        {steps.map((s, idx) => (
          <motion.div
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              idx <= step ? 'bg-slate-800' : 'bg-slate-800/50'
            }`}
            animate={{ opacity: idx <= step ? 1 : 0.3 }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              idx < step ? 'bg-emerald-500' : idx === step ? 'bg-sky-500' : 'bg-slate-700'
            }`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <span className={`text-sm ${idx <= step ? 'text-white' : 'text-slate-500'}`}>
              {s.label}
            </span>
            {idx < step && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
          </motion.div>
        ))}
      </div>

      {/* Desktop: Horizontal flow */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((s, idx) => (
          <React.Fragment key={idx}>
            <motion.div
              className="flex flex-col items-center"
              animate={{ scale: idx === step ? 1.1 : 1, opacity: idx <= step ? 1 : 0.3 }}
            >
              <motion.div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  idx < step ? 'bg-emerald-500' : idx === step ? 'bg-sky-500/50 border-2 border-sky-500' : 'bg-slate-700'
                }`}
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
                animate={{ scaleX: idx < step ? 1 : 0, backgroundColor: idx < step ? '#10b981' : '#374151' }}
                style={{ originX: 0 }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ==================== DEMO 5: LIVE DASHBOARD WITH API ====================
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
        avgTime: +(4 + Math.random()).toFixed(1),
        quality: 90 + Math.floor(Math.random() * 8)
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Real-time Dashboard</h3>
          <p className="text-sm text-slate-400">Live field operations overview</p>
        </div>
        <Badge className="bg-emerald-500 animate-pulse w-fit">LIVE</Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div
          className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Submissions</p>
          <p className="text-xl sm:text-2xl font-bold text-white font-mono">{stats.submissions}</p>
          <p className="text-[10px] sm:text-xs text-emerald-400">+12%</p>
        </motion.div>

        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Active Users</p>
          <p className="text-xl sm:text-2xl font-bold text-sky-400 font-mono">{stats.activeUsers}</p>
          <div className="flex -space-x-1 mt-1 sm:mt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-600 border-2 border-slate-800" />
            ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Avg Time</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">{stats.avgTime}m</p>
          <Progress value={70} className="h-1 mt-1 sm:mt-2" />
        </div>

        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Quality</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">{stats.quality}%</p>
          <Progress value={stats.quality} className="h-1 mt-1 sm:mt-2" />
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN DEMO PAGE ====================
export function DemoPage() {
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState('builder');
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <PublicHeader />
      
      <div className="py-8 sm:py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30">
              Interactive Demo
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              See FieldForce in Action
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto mb-6">
              Experience our powerful data collection platform through interactive visualizations.
            </p>
            
            {/* Video Walkthrough Button */}
            <Button
              onClick={() => setVideoOpen(true)}
              className="bg-violet-500 hover:bg-violet-600"
            >
              <Video className="w-4 h-4 mr-2" />
              Watch Video Walkthrough
            </Button>
          </div>

          {/* Demo Tabs */}
          <Tabs value={activeDemo} onValueChange={setActiveDemo} className="mb-8">
            <TabsList className="grid grid-cols-3 sm:grid-cols-5 w-full max-w-3xl mx-auto bg-slate-800 p-1 h-auto">
              <TabsTrigger value="builder" className="data-[state=active]:bg-sky-500 text-xs sm:text-sm py-2">
                <span className="hidden sm:inline">Form Builder</span>
                <span className="sm:hidden">Builder</span>
              </TabsTrigger>
              <TabsTrigger value="sync" className="data-[state=active]:bg-sky-500 text-xs sm:text-sm py-2">
                <span className="hidden sm:inline">Offline Sync</span>
                <span className="sm:hidden">Sync</span>
              </TabsTrigger>
              <TabsTrigger value="gps" className="data-[state=active]:bg-sky-500 text-xs sm:text-sm py-2">
                GPS
              </TabsTrigger>
              <TabsTrigger value="flow" className="data-[state=active]:bg-sky-500 text-xs sm:text-sm py-2 hidden sm:block">
                Flow
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-sky-500 text-xs sm:text-sm py-2 hidden sm:block">
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="mt-6 sm:mt-8">
              <FormBuilderDemo />
            </TabsContent>
            <TabsContent value="sync" className="mt-6 sm:mt-8">
              <OfflineSyncDemo />
            </TabsContent>
            <TabsContent value="gps" className="mt-6 sm:mt-8">
              <GPSTrackingDemo />
            </TabsContent>
            <TabsContent value="flow" className="mt-6 sm:mt-8">
              <SubmissionFlowDemo />
            </TabsContent>
            <TabsContent value="dashboard" className="mt-6 sm:mt-8">
              <LiveDashboardDemo />
            </TabsContent>
          </Tabs>

          {/* All Demos View - Only on larger screens */}
          <div className="hidden lg:block mt-16 space-y-8">
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
          <div className="text-center mt-12 sm:mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-slate-400 mb-6 sm:mb-8">
              Start your free trial and transform your field operations today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

      {/* Video Modal */}
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </div>
  );
}

export default DemoPage;
