import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone,
  ClipboardList,
  LogIn,
  LogOut,
  RefreshCw,
  Wifi,
  WifiOff,
  Download,
  Cloud,
  CloudOff,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  User,
  Settings,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { useAuthStore } from '../store';
import { offlineStorage, syncManager } from '../lib/offlineStorage';
import { 
  OfflineBanner, 
  ConnectionStatusPill, 
  FloatingSyncStatus,
  OfflineExplainerCard 
} from '../components/OfflineIndicators';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Mobile Data Collection Page (Option A - Login Based)
 * Optimized for field enumerators
 */
export function CollectPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showLogin, setShowLogin] = useState(!isAuthenticated);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

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

  // Load forms when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false);
      loadForms();
      loadPendingCount();
    }
  }, [isAuthenticated]);

  const loadForms = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/collect/my-forms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms || []);
        
        // Cache forms for offline
        if (offlineStorage.isReady) {
          for (const form of data.forms) {
            await offlineStorage.cacheForm(form);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load forms:', error);
      // Try loading from cache
      if (offlineStorage.isReady) {
        const cachedForms = await offlineStorage.getCachedForms();
        setForms(cachedForms);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        const token = data.access_token || data.token;
        localStorage.setItem('token', token);
        setAuth(data.user, token);
        toast.success('Welcome back!');
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Login failed');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowLogin(true);
    setForms([]);
  };

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
    navigate(`/collect/form/${formId}`);
  };

  // Login Screen
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
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
                <span className="text-sm font-medium">Install app for offline use</span>
              </div>
              <Button size="sm" variant="secondary" onClick={handleInstall}>
                Install
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
            <ClipboardList className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white">FieldForce</h1>
          <p className="text-slate-400 mt-1">Data Collection</p>
        </div>

        {/* Login Form */}
        <div className="flex-1 px-6 pb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Sign In</CardTitle>
              <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <LogIn className="w-4 h-4 mr-2" />
                  )}
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Collection Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
                <p className="text-xs text-slate-400">{user?.name || user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Connection Status */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
              
              {/* Logout */}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sync Bar */}
      {pendingCount > 0 && (
        <div className="px-4 py-2 bg-amber-500/20 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <CloudOff className="w-4 h-4" />
              <span className="text-sm">{pendingCount} pending submission{pendingCount > 1 ? 's' : ''}</span>
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
              Sync Now
            </Button>
          </div>
        </div>
      )}

      {/* Forms List */}
      <main className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-medium">Your Forms</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadForms}
            disabled={loading}
            className="text-slate-400"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : forms.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <h3 className="text-white font-medium mb-1">No Forms Available</h3>
              <p className="text-slate-400 text-sm">
                Contact your supervisor to get forms assigned.
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

export default CollectPage;
