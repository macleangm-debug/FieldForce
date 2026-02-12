import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  Folder,
  ClipboardList,
  User,
  Command,
  ArrowRight,
  History,
  X,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
import { Input } from './ui/input';
import { useAuthStore } from '../store';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Icon map for result types
const TYPE_ICONS = {
  form: FileText,
  project: Folder,
  submission: ClipboardList,
  team: User
};

const TYPE_COLORS = {
  form: 'bg-blue-500/10 text-blue-500',
  project: 'bg-emerald-500/10 text-emerald-500',
  submission: 'bg-amber-500/10 text-amber-500',
  team: 'bg-purple-500/10 text-purple-500'
};

export function CommandPalette({ open, onOpenChange }) {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const inputRef = useRef(null);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  // Load recent searches on open
  useEffect(() => {
    if (open) {
      loadRecentSearches();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      // Focus input after dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenChange]);

  const loadRecentSearches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/search/recent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentSearches(data.recent || []);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const performSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/search/global?q=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (searchQuery) => {
    try {
      await fetch(`${API_URL}/api/search/history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: searchQuery })
      });
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const handleSelect = (result) => {
    if (query) {
      saveToHistory(query);
    }
    navigate(result.path);
    onOpenChange(false);
  };

  const handleRecentSelect = (recentQuery) => {
    setQuery(recentQuery);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const items = results.length > 0 ? results : recentSearches;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        } else if (recentSearches[selectedIndex]) {
          setQuery(recentSearches[selectedIndex].query);
        }
        break;
      case 'Escape':
        onOpenChange(false);
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden bg-card border-border">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search forms, projects, submissions..."
            className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 placeholder:text-muted-foreground"
            data-testid="command-palette-input"
          />
          {loading && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Results
              </p>
              {results.map((result, index) => {
                const Icon = TYPE_ICONS[result.type] || FileText;
                const colorClass = TYPE_COLORS[result.type] || 'bg-slate-500/10 text-slate-500';
                
                return (
                  <motion.button
                    key={result.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      selectedIndex === index 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                    data-testid={`search-result-${result.id}`}
                  >
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-xs capitalize">{result.type}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Recent Searches */}
          {results.length === 0 && recentSearches.length > 0 && !query && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase">
                Recent Searches
              </p>
              {recentSearches.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSelect(item.query)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedIndex === index 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <History className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{item.query}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No results found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Search your workspace</p>
              <p className="text-sm">Find forms, projects, submissions, and team members</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-background border border-border">Esc</kbd>
              Close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CommandPalette;
