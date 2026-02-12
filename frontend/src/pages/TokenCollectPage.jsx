import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle2,
  Lock,
  Key,
  Smartphone,
  Shield,
  ShieldCheck,
  ShieldX
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { offlineStorage, syncManager } from '../lib/offlineStorage';
import { 
  OfflineBanner, 
  ConnectionStatusPill, 
  FloatingSyncStatus,
  OfflineExplainerCard 
} from '../components/OfflineIndicators';
import { DataVault, OfflineRibbon, ConnectionRestoredBanner } from '../components/DataVaultIndicator';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Generate a unique device ID for this browser/device
 */
const getOrCreateDeviceId = () => {
  const storageKey = 'fieldforce_device_id';
  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
};

/**
 * Get device info for registration
 */
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';
  
  let browser = 'Unknown';
  if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';
  else if (/Edge/i.test(ua)) browser = 'Edge';
  
  let os = 'Unknown';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(ua)) os = 'iOS';
  
  return {
    device_id: getOrCreateDeviceId(),
    device_type: deviceType,
    browser,
    os,
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    user_agent: ua
  };
};

/**
 * Token-Based Data Collection Page (Option B - No Login Required)
 * Accessed via /collect/t/{token}
 * 
 * Supports three security modes:
 * 1. Standard: Simple link access
 * 2. Device Locked: First device to access locks the link
 * 3. PIN Protected: Requires 4-digit PIN + device lock
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
  const [showConnectionRestored, setShowConnectionRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  
  // Security state
  const [securityMode, setSecurityMode] = useState('standard');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [pin, setPin] = useState(['', '', '', '']);
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [deviceLocked, setDeviceLocked] = useState(false);
  const pinInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowConnectionRestored(true);
        setTimeout(() => setShowConnectionRestored(false), 5000);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

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
      setSecurityMode(data.security_mode || 'standard');
      
      // Check if this token is already verified on this device
      const verifiedTokens = JSON.parse(localStorage.getItem('fieldforce_verified_tokens') || '{}');
      const isAlreadyVerified = verifiedTokens[data.token_id] === getOrCreateDeviceId();
      
      // Determine if verification is needed
      if (data.security_mode === 'standard') {
        // Standard mode - no verification needed
        setIsVerified(true);
        setNeedsVerification(false);
        setForms(data.forms || []);
      } else if (data.security_mode === 'device_locked') {
        // Device locked mode - check if already locked to this device or needs registration
        if (data.device_locked && isAlreadyVerified) {
          setIsVerified(true);
          setNeedsVerification(false);
          setForms(data.forms || []);
        } else if (!data.device_locked) {
          // Not locked yet - will lock on first access
          setNeedsVerification(true);
          setIsVerified(false);
        } else {
          // Locked to another device
          setError('This link is locked to another device. Contact your supervisor.');
          return;
        }
      } else if (data.security_mode === 'pin_protected') {
        // PIN protected - need PIN entry
        if (isAlreadyVerified) {
          setIsVerified(true);
          setNeedsVerification(false);
          setForms(data.forms || []);
        } else {
          setNeedsVerification(true);
          setIsVerified(false);
        }
      }
      
      // Store token for later use
      localStorage.setItem('collection_token', token);
      
      // Cache forms for offline (only if verified)
      if (isAlreadyVerified && offlineStorage.isReady) {
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
          setIsVerified(true);
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
  
  // Handle PIN input
  const handlePinChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only take last digit
    setPin(newPin);
    setPinError('');
    
    // Auto-focus next input
    if (value && index < 3) {
      pinInputRefs[index + 1].current?.focus();
    }
  };
  
  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs[index - 1].current?.focus();
    }
  };
  
  // Register device / verify PIN
  const handleVerification = async () => {
    setVerifying(true);
    setPinError('');
    
    try {
      const deviceInfo = getDeviceInfo();
      
      // Add PIN if required
      if (securityMode === 'pin_protected') {
        const pinCode = pin.join('');
        if (pinCode.length !== 4) {
          setPinError('Please enter a 4-digit PIN');
          setVerifying(false);
          return;
        }
        deviceInfo.pin = pinCode;
      }
      
      const res = await fetch(`${API_URL}/api/collect/register-device/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceInfo)
      });
      
      if (!res.ok) {
        const err = await res.json();
        if (err.detail?.includes('PIN')) {
          setPinError('Invalid PIN. Please try again.');
        } else if (err.detail?.includes('locked')) {
          setError('This link is locked to another device. Contact your supervisor.');
        } else {
          setPinError(err.detail || 'Verification failed');
        }
        return;
      }
      
      const result = await res.json();
      
      // Store verification for this token
      const verifiedTokens = JSON.parse(localStorage.getItem('fieldforce_verified_tokens') || '{}');
      verifiedTokens[tokenData.token_id] = getOrCreateDeviceId();
      localStorage.setItem('fieldforce_verified_tokens', JSON.stringify(verifiedTokens));
      
      setIsVerified(true);
      setNeedsVerification(false);
      setDeviceLocked(result.device_locked);
      setForms(tokenData.forms || []);
      
      // Cache forms for offline
      if (offlineStorage.isReady && tokenData.forms) {
        for (const form of tokenData.forms) {
          await offlineStorage.cacheForm(form);
        }
      }
      
      toast.success('Access granted!');
    } catch (err) {
      console.error('Verification failed:', err);
      setPinError('Connection error. Please try again.');
    } finally {
      setVerifying(false);
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
  
  // Security Verification Screen (PIN Entry / Device Lock)
  if (needsVerification && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-8 pb-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  {securityMode === 'pin_protected' ? (
                    <Key className="w-10 h-10 text-primary" />
                  ) : (
                    <Smartphone className="w-10 h-10 text-primary" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {securityMode === 'pin_protected' ? 'Enter PIN' : 'Device Registration'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {securityMode === 'pin_protected' 
                    ? 'Enter the 4-digit PIN provided by your supervisor'
                    : 'This link will be locked to your device for security'
                  }
                </p>
              </div>
              
              {/* Enumerator Info */}
              {tokenData && (
                <div className="mb-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{tokenData.enumerator_name}</p>
                      <p className="text-slate-400 text-xs">{tokenData.forms?.length || 0} forms assigned</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* PIN Entry (for PIN mode) */}
              {securityMode === 'pin_protected' && (
                <div className="mb-6">
                  <div className="flex justify-center gap-3 mb-4">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        ref={pinInputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={pin[index]}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        className={`w-14 h-14 text-center text-2xl font-bold rounded-lg border-2 bg-slate-700/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                          pinError ? 'border-red-500' : 'border-slate-600 focus:border-primary'
                        }`}
                        data-testid={`pin-input-${index}`}
                      />
                    ))}
                  </div>
                  {pinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm text-center"
                    >
                      {pinError}
                    </motion.p>
                  )}
                </div>
              )}
              
              {/* Device Lock Notice (for device_locked mode) */}
              {securityMode === 'device_locked' && (
                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                  <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-400 text-sm font-medium">Device Lock Active</p>
                      <p className="text-slate-400 text-xs mt-1">
                        Once you continue, this link will only work on this device. 
                        You won't be able to access it from another phone or computer.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Badge */}
              <div className="flex justify-center mb-6">
                <Badge 
                  variant="outline" 
                  className={`${
                    securityMode === 'pin_protected' 
                      ? 'border-green-500/50 text-green-400' 
                      : 'border-orange-500/50 text-orange-400'
                  }`}
                >
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {securityMode === 'pin_protected' ? 'PIN Protected' : 'Device Locked'}
                </Badge>
              </div>
              
              {/* Submit Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleVerification}
                disabled={verifying || (securityMode === 'pin_protected' && pin.join('').length !== 4)}
                data-testid="verify-access-btn"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    {securityMode === 'pin_protected' ? 'Verify PIN' : 'Register Device'}
                  </>
                )}
              </Button>
              
              {/* Help Text */}
              <p className="text-slate-500 text-xs text-center mt-4">
                {securityMode === 'pin_protected' 
                  ? "Didn't receive a PIN? Contact your supervisor."
                  : "Having trouble? Contact your supervisor for a new link."
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Main Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Connection Restored Banner */}
      <AnimatePresence>
        {showConnectionRestored && (
          <ConnectionRestoredBanner onDismiss={() => setShowConnectionRestored(false)} />
        )}
      </AnimatePresence>

      {/* Offline Ribbon */}
      <AnimatePresence>
        <OfflineRibbon isOnline={isOnline} />
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
            <ConnectionStatusPill isOnline={isOnline} size="small" />
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

      {/* Offline Explainer - First Time */}
      <AnimatePresence>
        {showOfflineExplainer && (
          <OfflineExplainerCard 
            onDismiss={() => {
              setShowOfflineExplainer(false);
              localStorage.setItem('fieldforce_seen_offline_explainer', 'true');
            }} 
          />
        )}
      </AnimatePresence>

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

      {/* Data Vault - Floating Sync Status */}
      <DataVault isOnline={isOnline} pendingCount={pendingCount} />

      {/* Bottom Safe Area */}
      <div className="h-24" />
    </div>
  );
}

export default TokenCollectPage;
