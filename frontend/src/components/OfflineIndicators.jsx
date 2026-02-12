import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { offlineStorage, syncManager } from '../lib/offlineStorage';

/**
 * Prominent Offline Status Banner
 * Shows at top of screen when offline
 */
export function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="bg-gradient-to-r from-amber-600 to-orange-600 text-white"
    >
      <div className="px-4 py-3 flex items-center justify-center gap-3">
        <WifiOff className="w-5 h-5 animate-pulse" />
        <div className="text-center">
          <p className="font-semibold">You're Offline</p>
          <p className="text-xs opacity-90">Data will be saved locally and synced when connected</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Connection Status Pill
 * Compact indicator for headers
 */
export function ConnectionStatusPill({ isOnline, size = 'default' }) {
  const sizeClasses = size === 'small' 
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-sm px-3 py-1 gap-2';

  return (
    <div className={`flex items-center rounded-full font-medium ${sizeClasses} ${
      isOnline 
        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
        : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
    }`}>
      {isOnline ? (
        <>
          <Wifi className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}

/**
 * Floating Sync Status Widget
 * Shows pending submissions count and sync button
 */
export function FloatingSyncStatus({ isOnline }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadPendingCount();
    
    // Check pending count periodically
    const interval = setInterval(loadPendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      handleSync();
    }
  }, [isOnline]);

  const loadPendingCount = async () => {
    try {
      if (offlineStorage?.isReady) {
        const count = await offlineStorage.getPendingCount();
        setPendingCount(count);
      }
    } catch (error) {
      console.error('Failed to get pending count:', error);
    }
  };

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }
    
    if (syncing) return;
    
    setSyncing(true);
    try {
      if (syncManager) {
        const results = await syncManager.syncPendingSubmissions();
        await loadPendingCount();
        setLastSyncTime(new Date());
        
        if (results.synced > 0) {
          toast.success(`Synced ${results.synced} submission${results.synced > 1 ? 's' : ''}`);
        }
        if (results.failed > 0) {
          toast.error(`Failed to sync ${results.failed} submission${results.failed > 1 ? 's' : ''}`);
        }
      }
    } catch (error) {
      toast.error('Sync failed. Will retry later.');
    } finally {
      setSyncing(false);
    }
  };

  // Don't show if no pending items and online
  if (pendingCount === 0 && isOnline && !expanded) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="fixed bottom-20 right-4 z-50"
      >
        {expanded ? (
          <motion.div
            initial={{ width: 56, height: 56 }}
            animate={{ width: 'auto', height: 'auto' }}
            className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-4 min-w-[200px]">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">Sync Status</h4>
                <button 
                  onClick={() => setExpanded(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status */}
              <div className="space-y-3">
                {/* Connection */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Connection</span>
                  <ConnectionStatusPill isOnline={isOnline} size="small" />
                </div>

                {/* Pending */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Pending</span>
                  <span className={`font-semibold ${pendingCount > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                    {pendingCount} submission{pendingCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Last Sync */}
                {lastSyncTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Last sync</span>
                    <span className="text-slate-300 text-sm">
                      {lastSyncTime.toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {/* Sync Button */}
                {pendingCount > 0 && (
                  <Button
                    onClick={handleSync}
                    disabled={syncing || !isOnline}
                    className="w-full mt-2"
                    size="sm"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : !isOnline ? (
                      <>
                        <WifiOff className="w-4 h-4 mr-2" />
                        Waiting for connection
                      </>
                    ) : (
                      <>
                        <Cloud className="w-4 h-4 mr-2" />
                        Sync Now
                      </>
                    )}
                  </Button>
                )}

                {/* All synced message */}
                {pendingCount === 0 && isOnline && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    All data synced
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setExpanded(true)}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative ${
              pendingCount > 0 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : isOnline 
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600 animate-pulse'
            }`}
          >
            {syncing ? (
              <RefreshCw className="w-6 h-6 text-white animate-spin" />
            ) : pendingCount > 0 ? (
              <CloudOff className="w-6 h-6 text-white" />
            ) : isOnline ? (
              <Cloud className="w-6 h-6 text-white" />
            ) : (
              <WifiOff className="w-6 h-6 text-white" />
            )}
            
            {/* Badge for pending count */}
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </motion.button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Sync Progress Bar
 * Shows during active sync
 */
export function SyncProgressBar({ syncing, progress = 0 }) {
  if (!syncing) return null;

  return (
    <motion.div
      initial={{ height: 0 }}
      animate={{ height: 'auto' }}
      exit={{ height: 0 }}
      className="bg-primary/20 px-4 py-2"
    >
      <div className="flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-primary animate-spin" />
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-white mb-1">
            <span>Syncing data...</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-primary"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Offline Mode Explainer Card
 * Shows first-time users how offline mode works
 */
export function OfflineExplainerCard({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-xl p-4 mx-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <WifiOff className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">Works Offline!</h4>
          <p className="text-slate-400 text-sm mb-3">
            You can collect data even without internet. Your submissions will automatically sync when you're back online.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auto-save</span>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auto-sync</span>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>No data loss</span>
            </div>
          </div>
        </div>
        <button onClick={onDismiss} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default {
  OfflineBanner,
  ConnectionStatusPill,
  FloatingSyncStatus,
  SyncProgressBar,
  OfflineExplainerCard
};
