import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { 
  ChevronLeft, ChevronRight, Save, Send, AlertCircle, CheckCircle2,
  Clock, RefreshCw, Wifi, WifiOff
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * CAWI (Computer-Assisted Web Interviewing) Survey Page
 * Enhanced web survey experience with:
 * - Multi-page navigation
 * - Progress saving
 * - Auto-save
 * - Responsive design
 * - Offline support
 */
export function CAWISurveyPage() {
  const { formId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');
  const resumeId = searchParams.get('resume');
  
  const [form, setForm] = useState(null);
  const [surveySettings, setSurveySettings] = useState({
    primaryColor: '#0ea5e9',
    logo: null,
    thankYouMessage: 'Thank you for completing our survey!',
    showProgressBar: true,
    shuffleQuestions: false,
  });
  const [responses, setResponses] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
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

  // Load form and resume progress
  useEffect(() => {
    loadForm();
  }, [formId, token, resumeId]);

  const loadForm = async () => {
    try {
      // Load form structure
      const formRes = await fetch(`${API_URL}/api/forms/${formId}/public`);
      if (!formRes.ok) throw new Error('Form not found');
      
      const formData = await formRes.json();
      setForm(formData);
      
      // Set survey settings (including primary color)
      if (formData.settings) {
        setSurveySettings(prev => ({
          ...prev,
          ...formData.settings
        }));
      }
      
      // Organize fields into pages (shuffle if enabled)
      let fieldsToOrganize = formData.fields || [];
      if (formData.settings?.shuffleQuestions) {
        fieldsToOrganize = [...fieldsToOrganize].sort(() => Math.random() - 0.5);
      }
      const formPages = organizeIntoPages(fieldsToOrganize);
      setPages(formPages);
      
      // Resume if session exists
      if (resumeId) {
        const resumeRes = await fetch(`${API_URL}/api/cawi/sessions/${resumeId}`);
        if (resumeRes.ok) {
          const sessionData = await resumeRes.json();
          setResponses(sessionData.responses || {});
          setCurrentPage(sessionData.current_page || 0);
          setLastSaved(new Date(sessionData.updated_at));
          toast.success('Progress restored');
        }
      } else if (token) {
        // Check for existing session with this token
        const existingRes = await fetch(`${API_URL}/api/cawi/sessions/by-token/${token}`);
        if (existingRes.ok) {
          const sessionData = await existingRes.json();
          if (sessionData && sessionData.id) {
            setResponses(sessionData.responses || {});
            setCurrentPage(sessionData.current_page || 0);
            setLastSaved(new Date(sessionData.updated_at));
          }
        }
      }
      
      // Try to restore from localStorage
      const localKey = `cawi_${formId}_${token || 'anon'}`;
      const localData = localStorage.getItem(localKey);
      if (localData && !resumeId) {
        const parsed = JSON.parse(localData);
        if (Object.keys(parsed.responses || {}).length > 0) {
          setResponses(parsed.responses);
          setCurrentPage(parsed.currentPage || 0);
          setLastSaved(new Date(parsed.savedAt));
        }
      }
    } catch (error) {
      console.error('Failed to load form:', error);
      toast.error('Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  // Organize fields into pages based on page breaks or groups
  const organizeIntoPages = (fields) => {
    const pages = [];
    let currentPageFields = [];
    
    for (const field of fields) {
      if (field.type === 'page_break' || field.settings?.startNewPage) {
        if (currentPageFields.length > 0) {
          pages.push({
            title: field.label || `Page ${pages.length + 1}`,
            fields: currentPageFields
          });
          currentPageFields = [];
        }
      } else {
        currentPageFields.push(field);
      }
    }
    
    // Add remaining fields
    if (currentPageFields.length > 0) {
      pages.push({
        title: pages.length === 0 ? (form?.name || 'Survey') : `Page ${pages.length + 1}`,
        fields: currentPageFields
      });
    }
    
    // If no page breaks, treat all fields as one page
    if (pages.length === 0 && fields.length > 0) {
      pages.push({ title: form?.name || 'Survey', fields });
    }
    
    return pages;
  };

  // Save progress
  const saveProgress = useCallback(async () => {
    if (!form) return;
    
    setSaving(true);
    
    // Always save to localStorage
    const localKey = `cawi_${formId}_${token || 'anon'}`;
    localStorage.setItem(localKey, JSON.stringify({
      responses,
      currentPage,
      savedAt: new Date().toISOString()
    }));
    
    // Try to save to server if online
    if (isOnline) {
      try {
        const res = await fetch(`${API_URL}/api/cawi/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form_id: formId,
            token,
            responses,
            current_page: currentPage,
            status: 'in_progress'
          })
        });
        
        if (res.ok) {
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Failed to save to server:', error);
      }
    }
    
    setSaving(false);
  }, [form, formId, token, responses, currentPage, isOnline]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!autoSaveEnabled || !form) return;
    
    const interval = setInterval(() => {
      if (Object.keys(responses).length > 0) {
        saveProgress();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoSaveEnabled, form, responses, saveProgress]);

  // Handle field change
  const handleChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Validate current page
  const validateCurrentPage = () => {
    const currentPageData = pages[currentPage];
    if (!currentPageData) return true;
    
    const newErrors = {};
    
    for (const field of currentPageData.fields) {
      if (field.required && !responses[field.id]) {
        newErrors[field.id] = 'This field is required';
      }
      
      // Additional validations
      if (field.validation) {
        const value = responses[field.id];
        
        if (field.validation.minLength && value && value.length < field.validation.minLength) {
          newErrors[field.id] = `Minimum ${field.validation.minLength} characters required`;
        }
        
        if (field.validation.maxLength && value && value.length > field.validation.maxLength) {
          newErrors[field.id] = `Maximum ${field.validation.maxLength} characters allowed`;
        }
        
        if (field.validation.pattern && value) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            newErrors[field.id] = field.validation.patternMessage || 'Invalid format';
          }
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next page
  const goNext = () => {
    if (!validateCurrentPage()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
      saveProgress();
    }
  };

  // Navigate to previous page
  const goPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Submit survey
  const handleSubmit = async () => {
    if (!validateCurrentPage()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/submissions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: formId,
          data: responses,
          token,
          source: 'cawi',
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
      });
      
      if (res.ok) {
        // Clear local storage for responses
        const localKey = `cawi_${formId}_${token || 'anon'}`;
        localStorage.removeItem(localKey);
        
        // Save settings for the completion page
        localStorage.setItem(`cawi_settings_${formId}`, JSON.stringify({
          thankYouMessage: surveySettings.thankYouMessage,
          primaryColor: surveySettings.primaryColor
        }));
        
        toast.success('Survey submitted successfully!');
        navigate(`/survey/complete?formId=${formId}`);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to submit survey');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit survey. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading survey...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Survey Not Found</h2>
            <p className="text-muted-foreground">
              The survey you're looking for doesn't exist or has been closed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentPage + 1) / pages.length) * 100;
  const currentPageData = pages[currentPage];
  
  // Dynamic styles based on primary color
  const primaryColor = surveySettings.primaryColor || '#0ea5e9';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Custom CSS Variables for primary color */}
      <style>{`
        .survey-primary-btn {
          background-color: ${primaryColor} !important;
        }
        .survey-primary-btn:hover {
          background-color: ${primaryColor}dd !important;
        }
        .survey-progress-bar > div {
          background-color: ${primaryColor} !important;
        }
        .survey-accent {
          color: ${primaryColor} !important;
        }
        .survey-radio:checked, .survey-checkbox:checked {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {/* Survey Logo */}
              {surveySettings.logo && (
                <img 
                  src={surveySettings.logo} 
                  alt="Survey logo" 
                  className="h-8 w-auto rounded"
                />
              )}
              <h1 className="text-lg font-semibold text-white truncate">{form.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Connection status */}
              <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
              </div>
              
              {/* Save status */}
              {lastSaved && (
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              
              {/* Manual save */}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={saveProgress}
                disabled={saving}
                className="text-white hover:bg-slate-700"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {/* Progress - conditionally shown based on settings */}
          {surveySettings.showProgressBar && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Page {currentPage + 1} of {pages.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-1 survey-progress-bar" />
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{currentPageData?.title}</CardTitle>
            {currentPageData?.description && (
              <CardDescription>{currentPageData.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {currentPageData?.fields.map((field) => (
              <CAWIField
                key={field.id}
                field={field}
                value={responses[field.id]}
                onChange={(value) => handleChange(field.id, value)}
                error={errors[field.id]}
              />
            ))}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goPrevious}
            disabled={currentPage === 0}
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentPage === pages.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="survey-primary-btn text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Survey
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={goNext}
              className="survey-primary-btn text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by DataPulse</p>
      </footer>
    </div>
  );
}

/**
 * CAWI Field Component
 * Renders individual form fields for the web survey
 */
function CAWIField({ field, value, onChange, error }) {
  const renderInput = () => {
    const baseClass = `w-full bg-slate-700 border-slate-600 text-white placeholder-slate-400 
                       focus:border-primary focus:ring-primary`;
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint}
            className={`${baseClass} rounded-lg px-4 py-3`}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint}
            rows={4}
            className={`${baseClass} rounded-lg px-4 py-3`}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
            placeholder={field.hint}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`${baseClass} rounded-lg px-4 py-3`}
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClass} rounded-lg px-4 py-3`}
          />
        );
        
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${baseClass} rounded-lg px-4 py-3`}
          >
            <option value="">Select an option...</option>
            {(field.options || []).map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
        
      case 'radio':
        return (
          <div className="space-y-3">
            {(field.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                  className="w-5 h-5 text-primary bg-slate-700 border-slate-600 focus:ring-primary"
                />
                <span className="text-white group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {(field.options || []).map((opt, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer group">
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
                  className="w-5 h-5 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary"
                />
                <span className="text-white group-hover:text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        );
        
      case 'note':
        return (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-blue-300">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {field.content || field.hint}
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.hint}
            className={`${baseClass} rounded-lg px-4 py-3`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-white font-medium">
          {field.label}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </span>
        {field.hint && field.type !== 'note' && (
          <span className="block text-sm text-slate-400 mt-1">{field.hint}</span>
        )}
      </label>
      
      {renderInput()}
      
      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Survey Complete Page
 */
export function SurveyCompletePage() {
  const [searchParams] = useSearchParams();
  const formId = searchParams.get('formId');
  const [settings, setSettings] = useState({
    thankYouMessage: 'Your response has been recorded successfully.',
    primaryColor: '#22c55e'
  });
  
  useEffect(() => {
    // Try to get settings from localStorage (saved during survey)
    if (formId) {
      const localKey = `cawi_settings_${formId}`;
      const savedSettings = localStorage.getItem(localKey);
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {}
      }
    }
  }, [formId]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="max-w-md bg-slate-800/50 border-slate-700">
        <CardContent className="pt-8 pb-6 text-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${settings.primaryColor}20` }}
          >
            <CheckCircle2 className="w-8 h-8" style={{ color: settings.primaryColor }} />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Thank You!</h2>
          <p className="text-slate-400 mb-6">
            {settings.thankYouMessage}
          </p>
          <p className="text-sm text-slate-500">
            You can close this window now.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default CAWISurveyPage;
