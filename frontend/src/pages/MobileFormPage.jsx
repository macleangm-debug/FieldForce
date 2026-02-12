import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Save,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Camera,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { offlineStorage } from '../lib/offlineStorage';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Haptic Feedback Utility
 */
const haptic = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(25),
  success: () => navigator.vibrate?.([30, 50, 30, 50, 50]),
  warning: () => navigator.vibrate?.([50, 30, 50]),
};

/**
 * Mobile Form Filling Page
 * Optimized for field data collection
 */
export function MobileFormPage() {
  const { formId, token } = useParams();
  const navigate = useNavigate();
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [responses, setResponses] = useState({});
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [location, setLocation] = useState(null);

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

  // Load form
  useEffect(() => {
    loadForm();
    getLocation();
  }, [formId, token]);

  const loadForm = async () => {
    setLoading(true);
    try {
      let endpoint;
      let headers = {};
      
      if (token) {
        // Token-based access
        endpoint = `${API_URL}/api/collect/forms/${token}/${formId}`;
      } else {
        // Login-based access
        const authToken = localStorage.getItem('token');
        endpoint = `${API_URL}/api/forms/${formId}/public`;
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      
      const res = await fetch(endpoint, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setForm(data);
        
        // Organize fields into pages
        const formPages = organizeIntoPages(data.fields || []);
        setPages(formPages);
        
        // Cache form
        if (offlineStorage.isReady) {
          await offlineStorage.cacheForm(data);
        }
      } else {
        throw new Error('Form not found');
      }
    } catch (error) {
      console.error('Failed to load form:', error);
      
      // Try loading from cache
      if (offlineStorage.isReady) {
        const cachedForm = await offlineStorage.getCachedForm(formId);
        if (cachedForm) {
          setForm(cachedForm);
          const formPages = organizeIntoPages(cachedForm.fields || []);
          setPages(formPages);
          toast.info('Working offline with cached form');
        } else {
          toast.error('Form not available offline');
          goBack();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const organizeIntoPages = (fields) => {
    const pages = [];
    let currentPageFields = [];
    
    for (const field of fields) {
      if (field.type === 'page_break' || field.settings?.startNewPage) {
        if (currentPageFields.length > 0) {
          pages.push({ fields: currentPageFields });
          currentPageFields = [];
        }
      } else {
        currentPageFields.push(field);
      }
    }
    
    if (currentPageFields.length > 0) {
      pages.push({ fields: currentPageFields });
    }
    
    if (pages.length === 0 && fields.length > 0) {
      pages.push({ fields });
    }
    
    return pages;
  };

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  const handleChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateCurrentPage = () => {
    const currentPageData = pages[currentPage];
    if (!currentPageData) return true;
    
    const newErrors = {};
    
    for (const field of currentPageData.fields) {
      if (field.required && !responses[field.id]) {
        newErrors[field.id] = 'Required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentPage()) {
      haptic.warning();
      toast.error('Please fill required fields');
      return;
    }
    
    haptic.light();
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goPrevious = () => {
    haptic.light();
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    if (token) {
      navigate(`/collect/t/${token}`);
    } else {
      navigate('/collect');
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
      haptic.warning();
      toast.error('Please fill required fields');
      return;
    }
    
    setSubmitting(true);
    
    const submission = {
      form_id: formId,
      data: responses,
      location,
      device_info: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language
      },
      submitted_at: new Date().toISOString()
    };
    
    try {
      if (isOnline) {
        let endpoint;
        let headers = { 'Content-Type': 'application/json' };
        
        if (token) {
          endpoint = `${API_URL}/api/collect/submit/${token}`;
        } else {
          const authToken = localStorage.getItem('token');
          endpoint = `${API_URL}/api/submissions/`;
          headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const res = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(submission)
        });
        
        if (res.ok) {
          haptic.success(); // Success haptic on submission!
          toast.success('Submitted successfully!');
          goBack();
        } else {
          throw new Error('Submission failed');
        }
      } else {
        // Save offline
        if (offlineStorage.isReady) {
          await offlineStorage.saveSubmission(submission);
          haptic.medium(); // Medium haptic for offline save
          toast.success('Saved offline. Will sync when connected.');
          goBack();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      haptic.warning();
      
      // Save offline as fallback
      if (offlineStorage.isReady) {
        await offlineStorage.saveSubmission(submission);
        toast.info('Saved offline. Will sync when connected.');
        goBack();
      } else {
        toast.error('Failed to submit. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-white mb-2">Form Not Found</h2>
            <Button onClick={goBack} variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentPage + 1) / pages.length) * 100;
  const currentPageData = pages[currentPage];
  const primaryColor = form.settings?.primaryColor || '#0ea5e9';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Dynamic Primary Color Styles */}
      <style>{`
        .primary-btn { background-color: ${primaryColor} !important; }
        .primary-btn:hover { opacity: 0.9; }
        .progress-bar > div { background-color: ${primaryColor} !important; }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button onClick={goBack} className="flex items-center text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="text-sm">Back</span>
            </button>
            
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            </div>
          </div>
          
          <h1 className="text-white font-semibold truncate">{form.name}</h1>
          
          {/* Progress */}
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Page {currentPage + 1} of {pages.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 progress-bar" />
          </div>
        </div>
      </header>

      {/* Form Content */}
      <main className="p-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 space-y-6">
            {currentPageData?.fields.map((field) => (
              <MobileField
                key={field.id}
                field={field}
                value={responses[field.id]}
                onChange={(value) => handleChange(field.id, value)}
                error={errors[field.id]}
              />
            ))}
          </CardContent>
        </Card>

        {/* Location indicator */}
        {location && (
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
          </div>
        )}
      </main>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/90 backdrop-blur border-t border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={currentPage === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          
          {currentPage === pages.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 primary-btn text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              Submit
            </Button>
          ) : (
            <Button
              onClick={goNext}
              className="flex-1 primary-btn text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Safe Area */}
      <div className="h-24" />
    </div>
  );
}

/**
 * Mobile-optimized Field Component
 */
function MobileField({ field, value, onChange, error }) {
  const baseInputClass = "w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400 rounded-lg px-4 py-3 text-base";
  
  const renderInput = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint || 'Enter text...'}
            className={baseInputClass}
          />
        );
        
      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint || 'Enter text...'}
            rows={4}
            className={baseInputClass}
          />
        );
        
      case 'number':
        return (
          <Input
            type="number"
            inputMode="numeric"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint || 'Enter number...'}
            className={baseInputClass}
          />
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
        );
        
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select...</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="space-y-3">
            {(field.options || []).map((opt, i) => (
              <label 
                key={i} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  value === opt.value 
                    ? 'border-primary bg-primary/10' 
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="w-5 h-5 text-primary"
                />
                <span className="text-white">{opt.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {(field.options || []).map((opt, i) => (
              <label 
                key={i} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  (value || []).includes(opt.value)
                    ? 'border-primary bg-primary/10' 
                    : 'border-slate-600 bg-slate-700/50'
                }`}
              >
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={(value || []).includes(opt.value)}
                  onChange={(e) => {
                    const current = value || [];
                    if (e.target.checked) {
                      onChange([...current, opt.value]);
                    } else {
                      onChange(current.filter(v => v !== opt.value));
                    }
                  }}
                  className="w-5 h-5 text-primary rounded"
                />
                <span className="text-white">{opt.label}</span>
              </label>
            ))}
          </div>
        );
        
      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-white font-medium text-base">
        {field.label}
        {field.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      {field.hint && field.type !== 'note' && (
        <p className="text-sm text-slate-400">{field.hint}</p>
      )}
      
      {renderInput()}
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export default MobileFormPage;
