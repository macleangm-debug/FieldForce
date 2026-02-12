import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Cloud,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
  ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { offlineStorage, syncManager } from '../lib/offlineStorage';

/**
 * Haptic Feedback Utility
 * Provides tactile feedback on supported mobile devices
 */
const haptic = {
  // Light tap - for button presses, selections
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  // Medium tap - for confirmations
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  // Success pattern - for sync complete, form submitted
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 30, 50, 50]);
    }
  },
  
  // Warning pattern - for errors, offline
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  },
  
  // Celebration pattern - for major achievements
  celebration: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 30, 30, 30, 50, 100, 50]);
    }
  }
};

/**
 * Data Vault - Offline Status Component
 * Shows a "vault" protecting your data when offline
 */
export function DataVault({ isOnline, pendingCount = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [particles, setParticles] = useState([]);
  const particleInterval = useRef(null);

  // Generate sync particles
  useEffect(() => {
    if (syncing) {
      particleInterval.current = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: Math.random() * 60 - 30,
          delay: Math.random() * 0.3
        };
        setParticles(prev => [...prev.slice(-20), newParticle]);
      }, 100);
    } else {
      if (particleInterval.current) {
        clearInterval(particleInterval.current);
      }
      setParticles([]);
    }
    return () => {
      if (particleInterval.current) {
        clearInterval(particleInterval.current);
      }
    };
  }, [syncing]);

  // Auto-sync when coming online with pending items
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !syncing) {
      handleSync();
    }
  }, [isOnline, pendingCount]);

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    setSyncProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      if (syncManager) {
        await syncManager.syncPendingSubmissions();
      }
      
      clearInterval(progressInterval);
      setSyncProgress(100);
      
      // Show celebration
      setTimeout(() => {
        setShowCelebration(true);
        toast.success('All data synced successfully!');
        setTimeout(() => {
          setShowCelebration(false);
          setSyncing(false);
          setSyncProgress(0);
        }, 2000);
      }, 500);
    } catch (error) {
      toast.error('Sync failed. Will retry.');
      setSyncing(false);
      setSyncProgress(0);
    }
  };

  // Don't show if online and no pending items and not syncing
  if (isOnline && pendingCount === 0 && !syncing && !showCelebration) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-20 left-4 right-4 z-50"
      >
        <motion.div
          layout
          className={`relative overflow-hidden rounded-2xl ${
            isOnline 
              ? 'bg-gradient-to-br from-slate-800 to-slate-900' 
              : 'bg-gradient-to-br from-amber-900/80 to-orange-900/80'
          } border ${
            isOnline ? 'border-slate-700' : 'border-amber-500/50'
          } shadow-2xl backdrop-blur-xl`}
        >
          {/* Glow effect for offline */}
          {!isOnline && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 blur-xl animate-pulse" />
            </div>
          )}

          {/* Sync particles */}
          {syncing && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  initial={{ 
                    bottom: 20, 
                    left: `calc(50% + ${particle.x}px)`,
                    opacity: 1,
                    scale: 1
                  }}
                  animate={{ 
                    bottom: 120, 
                    opacity: 0,
                    scale: 0.5
                  }}
                  transition={{ 
                    duration: 1.5, 
                    delay: particle.delay,
                    ease: "easeOut"
                  }}
                  className="absolute w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50"
                />
              ))}
            </div>
          )}

          {/* Celebration burst */}
          {showCelebration && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1, 0],
                    x: Math.cos(i * 30 * Math.PI / 180) * 80,
                    y: Math.sin(i * 30 * Math.PI / 180) * 80,
                  }}
                  transition={{ duration: 0.8, delay: i * 0.02 }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `hsl(${i * 30}, 80%, 60%)`
                  }}
                />
              ))}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="absolute"
              >
                <Sparkles className="w-12 h-12 text-yellow-400" />
              </motion.div>
            </motion.div>
          )}

          {/* Main content */}
          <div className="relative z-10 p-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Vault Icon */}
                <div className={`relative p-3 rounded-xl ${
                  isOnline 
                    ? 'bg-green-500/20' 
                    : 'bg-amber-500/20'
                }`}>
                  {isOnline ? (
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                  ) : (
                    <motion.div
                      animate={{ 
                        boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0.4)', '0 0 0 10px rgba(251, 191, 36, 0)']
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Shield className="w-6 h-6 text-amber-400" />
                    </motion.div>
                  )}
                  
                  {/* Pending badge */}
                  {pendingCount > 0 && !syncing && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    {syncing 
                      ? 'Syncing Your Data...' 
                      : showCelebration 
                        ? 'All Synced!' 
                        : isOnline 
                          ? `${pendingCount} Ready to Sync` 
                          : 'Data Vault Active'}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {syncing 
                      ? `${syncProgress}% complete`
                      : showCelebration
                        ? 'Your data is safe in the cloud'
                        : isOnline 
                          ? 'Tap to sync now' 
                          : 'Your data is safely stored locally'}
                  </p>
                </div>
              </div>

              {/* Expand/Collapse */}
              {!syncing && !showCelebration && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                  >
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  </motion.div>
                </button>
              )}
            </div>

            {/* Progress bar for syncing */}
            {syncing && (
              <div className="mt-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${syncProgress}%` }}
                    className="h-full bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_100%] animate-shimmer"
                    style={{
                      animation: 'shimmer 2s linear infinite'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Expanded content */}
            <AnimatePresence>
              {expanded && !syncing && !showCelebration && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
                    {/* Connection status */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Connection</span>
                      <div className={`flex items-center gap-2 ${
                        isOnline ? 'text-green-400' : 'text-amber-400'
                      }`}>
                        {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                        <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
                      </div>
                    </div>

                    {/* Pending items */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Pending submissions</span>
                      <span className="text-white font-medium">{pendingCount}</span>
                    </div>

                    {/* Sync button */}
                    {isOnline && pendingCount > 0 && (
                      <Button 
                        onClick={handleSync}
                        className="w-full mt-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/80 hover:to-cyan-500/80"
                      >
                        <Cloud className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                    )}

                    {/* Offline message */}
                    {!isOnline && (
                      <div className="p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-slate-300">
                          📱 Keep collecting data! Everything is safely stored on your device and will sync automatically when you're back online.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </AnimatePresence>
  );
}

/**
 * Minimal Offline Banner - Top of screen
 * Clean, non-intrusive design
 */
export function OfflineRibbon({ isOnline }) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      exit={{ y: -50 }}
      className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-[length:200%_100%] animate-gradient"
    >
      <div className="px-4 py-2 flex items-center justify-center gap-2">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <WifiOff className="w-4 h-4 text-white" />
        </motion.div>
        <span className="text-white text-sm font-medium">
          Offline Mode • Data saves locally
        </span>
      </div>
      
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </motion.div>
  );
}

/**
 * Sync Success Toast - Custom celebration
 */
export function SyncSuccessToast({ count }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <ShieldCheck className="w-8 h-8 text-green-400" />
        </motion.div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 0] }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 rounded-full bg-green-400/30"
        />
      </div>
      <div>
        <p className="font-semibold text-white">Sync Complete!</p>
        <p className="text-sm text-slate-400">
          {count} submission{count !== 1 ? 's' : ''} uploaded
        </p>
      </div>
    </div>
  );
}

/**
 * Connection Restored Celebration
 */
export function ConnectionRestoredBanner({ onDismiss }) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg"
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <Wifi className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <p className="text-white font-semibold">You're Back Online!</p>
            <p className="text-green-100 text-sm">Syncing your data now...</p>
          </div>
        </div>
        <button onClick={onDismiss} className="p-1 hover:bg-white/20 rounded">
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
      
      {/* Animated sync line */}
      <div className="h-1 bg-green-700">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2 }}
          className="h-full bg-white/50"
        />
      </div>
    </motion.div>
  );
}

export default {
  DataVault,
  OfflineRibbon,
  SyncSuccessToast,
  ConnectionRestoredBanner
};
