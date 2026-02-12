import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Cloud,
  CloudOff,
  ChevronRight,
  FileText,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { offlineStorage, syncManager } from '../lib/offlineStorage';
import { 
  OfflineBanner, 
  ConnectionStatusPill, 
  FloatingSyncStatus,
  OfflineExplainerCard 
} from '../components/OfflineIndicators';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Token-Based Data Collection Page (Option B - No Login Required)
 * Accessed via /collect/t/{token}
 */
export function TokenCollectPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tokenData, setTokenData] = useState(null);
  const [forms, setForms] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showOfflineExplainer, setShowOfflineExplainer] = useState(false);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PWA Install prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Verify token and load forms
  useEffect(() => {
    verifyToken();
    
    // Show offline explainer first time
    const hasSeenExplainer = localStorage.getItem('fieldforce_seen_offline_explainer');
    if (!hasSeenExplainer) {
      setShowOfflineExplainer(true);
    }
  }, [token]);

  const verifyToken = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`${API_URL}/api/collect/verify/${token}`);
      
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Invalid or expired token');
        return;
      }
      
      const data = await res.json();
      setTokenData(data);
      setForms(data.forms || []);
      
      // Store token for later use
      localStorage.setItem('collection_token', token);
      
      // Cache forms for offline
      if (offlineStorage.isReady) {
        for (const form of data.forms) {
          await offlineStorage.cacheForm(form);
        }
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      
      // Try loading from cache if offline
      if (!isOnline && offlineStorage.isReady) {
        const cachedForms = await offlineStorage.getCachedForms();
        if (cachedForms.length > 0) {
          setForms(cachedForms);
          setTokenData({ enumerator_name: 'Offline Mode' });
          toast.info('Working offline with cached forms');
        } else {
          setError('Cannot verify token offline. Please connect to the internet.');
        }
      } else {
        setError('Failed to verify token. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      if (offlineStorage.isReady) {
        const count = await offlineStorage.getPendingCount();
        setPendingCount(count);
      }
    } catch (error) {
      console.error('Failed to get pending count:', error);
    }
  };

  useEffect(() => {
    loadPendingCount();
  }, []);

  const handleSync = async () => {
    if (!isOnline) {
      toast.error('You are offline. Sync when connected.');
      return;
    }
    
    setSyncing(true);
    try {
      if (syncManager) {
        await syncManager.syncAll();
        await loadPendingCount();
        toast.success('Sync complete!');
      }
    } catch (error) {
      toast.error('Sync failed. Will retry later.');
    } finally {
      setSyncing(false);
    }
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed successfully!');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const openForm = (formId) => {
    navigate(`/collect/t/${token}/form/${formId}`);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-white">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-slate-800/50 border-slate-700 max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button onClick={verifyToken} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Offline Banner - Prominent */}
      <AnimatePresence>
        <OfflineBanner isOnline={isOnline} />
      </AnimatePresence>

      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-primary text-white px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Install for offline use</span>
            </div>
            <Button size="sm" variant="secondary" onClick={handleInstall}>
              Install
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-white font-semibold">FieldForce</h1>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <User className="w-3 h-3" />
                  {tokenData?.enumerator_name || 'Data Collector'}
                </div>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </header>

      {/* Submission Counter */}
      {tokenData?.max_submissions && (
        <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Submissions</span>
            <span className="text-white font-medium">
              {tokenData.submission_count || 0} / {tokenData.max_submissions}
            </span>
          </div>
          <div className="mt-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ 
                width: `${Math.min(100, ((tokenData.submission_count || 0) / tokenData.max_submissions) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Sync Bar */}
      {pendingCount > 0 && (
        <div className="px-4 py-2 bg-amber-500/20 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <CloudOff className="w-4 h-4" />
              <span className="text-sm">{pendingCount} pending</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSync}
              disabled={syncing || !isOnline}
              className="border-amber-500 text-amber-400 hover:bg-amber-500/20"
            >
              {syncing ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Cloud className="w-4 h-4 mr-1" />
              )}
              Sync
            </Button>
          </div>
        </div>
      )}

      {/* Forms List */}
      <main className="p-4 space-y-4">
        <h2 className="text-white font-medium">Available Forms</h2>

        {forms.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-white font-medium mb-1">No Forms Available</h3>
              <p className="text-slate-400 text-sm">
                No forms have been assigned to this collection link.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {forms.map((form) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="bg-slate-800/50 border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors"
                  onClick={() => openForm(form.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">{form.name}</h3>
                        {form.description && (
                          <p className="text-slate-400 text-sm truncate mt-1">{form.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {form.field_count} fields
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 ml-2 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Safe Area */}
      <div className="h-20" />
    </div>
  );
}

export default TokenCollectPage;
