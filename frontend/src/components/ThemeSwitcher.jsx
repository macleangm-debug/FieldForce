import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useUIStore } from '../store';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

export function ThemeSwitcher({ variant = 'default', showLabel = false }) {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            data-testid="theme-switcher"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {isDark ? 'Light mode' : 'Dark mode'}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (variant === 'header') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        data-testid="theme-switcher"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="gap-2"
      data-testid="theme-switcher"
    >
      {isDark ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      {showLabel && (isDark ? 'Light Mode' : 'Dark Mode')}
    </Button>
  );
}

export default ThemeSwitcher;
