import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Check,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '../store';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Default languages (fallback)
const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: 'EN' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: 'ES' },
  { code: 'fr', name: 'French', native: 'Français', flag: 'FR' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: 'DE' },
  { code: 'pt', name: 'Portuguese', native: 'Português', flag: 'PT' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: 'ZH' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: 'JA' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: 'AR' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: 'HI' },
  { code: 'sw', name: 'Swahili', native: 'Kiswahili', flag: 'SW' },
];

export function LanguageSelector({ variant = 'default' }) {
  const token = useAuthStore((state) => state.token);
  
  const [languages, setLanguages] = useState(DEFAULT_LANGUAGES);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Load supported languages and user preference
  useEffect(() => {
    loadLanguages();
    loadUserPreference();
    
    // Check localStorage for saved language
    const saved = localStorage.getItem('fieldforce_language');
    if (saved) {
      setCurrentLanguage(saved);
    }
  }, [token]);

  const loadLanguages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/settings/languages`);
      if (res.ok) {
        const data = await res.json();
        setLanguages(data.languages || DEFAULT_LANGUAGES);
      }
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadUserPreference = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_URL}/api/settings/preferences`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.language) {
          setCurrentLanguage(data.language);
          localStorage.setItem('fieldforce_language', data.language);
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  };

  const updateLanguage = async (langCode) => {
    setUpdating(true);
    setCurrentLanguage(langCode);
    localStorage.setItem('fieldforce_language', langCode);
    
    try {
      if (token) {
        await fetch(`${API_URL}/api/settings/language`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ language: langCode })
        });
      }
      
      const selectedLang = languages.find(l => l.code === langCode);
      toast.success(`Language changed to ${selectedLang?.native || selectedLang?.name}`);
      
      // In a real app, this would trigger i18n library to switch languages
      // For now, we just save the preference
    } catch (error) {
      console.error('Failed to update language:', error);
      toast.error('Failed to update language');
    } finally {
      setUpdating(false);
    }
  };

  const currentLangData = languages.find(l => l.code === currentLanguage) || languages[0];

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Globe className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => updateLanguage(lang.code)}
              className="flex items-center justify-between"
            >
              <span>{lang.native}</span>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="gap-2 text-muted-foreground hover:text-foreground"
          disabled={updating}
          data-testid="language-selector"
        >
          {updating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Globe className="w-4 h-4" />
          )}
          <span className="text-sm font-medium">{currentLangData.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground">Select Language</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => updateLanguage(lang.code)}
              className={`flex items-center justify-between ${
                currentLanguage === lang.code ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-8 text-center font-medium text-xs bg-muted rounded px-1.5 py-0.5">
                  {lang.flag}
                </span>
                <div>
                  <p className="font-medium text-sm">{lang.native}</p>
                  <p className="text-xs text-muted-foreground">{lang.name}</p>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSelector;
