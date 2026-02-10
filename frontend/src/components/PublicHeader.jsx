import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Menu,
  X,
  ChevronDown,
  Play,
  LogIn,
  UserPlus,
  DollarSign,
  Sparkles,
  FileText,
  BarChart3
} from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuthStore } from '../store';

export function PublicHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Use Cases', href: '/#use-cases' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Demo', href: '/demo', highlight: true },
  ];

  const isActive = (href) => {
    if (href.startsWith('/#')) return location.pathname === '/';
    return location.pathname === href;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-slate-900/95 backdrop-blur-lg border-b border-slate-800 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FieldForce</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.highlight
                      ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30'
                      : isActive(item.href)
                        ? 'text-white bg-slate-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.highlight && <Play className="w-3 h-3 inline mr-1" />}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/login')}
                    className="text-slate-300 hover:text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Log in
                  </Button>
                  <Button 
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Start Free
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900 border-t border-slate-800"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                      item.highlight
                        ? 'bg-sky-500/20 text-sky-400'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  {isAuthenticated ? (
                    <Button 
                      onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}
                      className="w-full bg-gradient-to-r from-sky-500 to-cyan-500"
                    >
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                        className="w-full border-slate-700 text-white"
                      >
                        Log in
                      </Button>
                      <Button 
                        onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}
                        className="w-full bg-gradient-to-r from-sky-500 to-cyan-500"
                      >
                        Start Free Trial
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}

export default PublicHeader;
