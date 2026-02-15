/**
 * HelpCenter Component
 * 
 * A comprehensive, reusable Help Center page with:
 * - Search functionality
 * - Expandable category sidebar
 * - Article content viewer
 * - FAQ section
 * - Troubleshooting guide
 * - Keyboard shortcuts reference
 * - What's New changelog
 * - AI Assistant integration
 * 
 * Usage:
 * import { HelpCenter } from './pages/HelpCenter';
 * <Route path="/help" element={<HelpCenter />} />
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  BookOpen,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  CreditCard,
  Share2,
  FileText,
  Zap,
  AlertCircle,
  MessageCircle,
  Lightbulb,
  Target,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Star,
  ThumbsUp,
  ThumbsDown,
  Keyboard,
  Calendar,
  Mail,
  Shield,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  X,
  Home,
  ClipboardList,
  PieChart,
  Globe,
  Bell,
  MapPin,
  Smartphone,
  Link2
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { HelpAssistant } from '../components/HelpAssistant';

// Utility function to merge class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

// ============================================================
// CUSTOMIZE THESE: Update categories for FieldForce
// ============================================================

const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    description: 'Learn the basics and get started with FieldForce',
    color: 'teal',
    articles: [
      { id: 'welcome', title: 'Welcome to FieldForce', readTime: '3 min', popular: true },
      { id: 'first-project', title: 'Create Your First Project', readTime: '5 min', popular: true },
      { id: 'dashboard-overview', title: 'Dashboard Overview', readTime: '4 min' },
      { id: 'account-setup', title: 'Setting Up Your Account', readTime: '3 min' },
    ]
  },
  {
    id: 'forms',
    title: 'Forms & Surveys',
    icon: FileText,
    description: 'Create and manage data collection forms',
    color: 'blue',
    articles: [
      { id: 'form-builder', title: 'Using the Form Builder', readTime: '8 min', popular: true },
      { id: 'question-types', title: 'Question Types Guide', readTime: '6 min' },
      { id: 'skip-logic', title: 'Adding Skip Logic', readTime: '5 min' },
      { id: 'form-templates', title: 'Using Form Templates', readTime: '3 min' },
    ]
  },
  {
    id: 'collection',
    title: 'Data Collection',
    icon: Smartphone,
    description: 'Collect data in the field',
    color: 'green',
    articles: [
      { id: 'collection-links', title: 'Collection Links Guide', readTime: '5 min', popular: true },
      { id: 'offline-mode', title: 'Offline Data Collection', readTime: '4 min' },
      { id: 'gps-tracking', title: 'GPS & Location Features', readTime: '4 min' },
      { id: 'pwa-install', title: 'Installing the Mobile App', readTime: '3 min' },
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    icon: BarChart3,
    description: 'View analytics and generate reports',
    color: 'orange',
    articles: [
      { id: 'analytics-overview', title: 'Analytics Dashboard', readTime: '4 min', popular: true },
      { id: 'export-data', title: 'Exporting Your Data', readTime: '3 min' },
      { id: 'quality-metrics', title: 'Understanding Quality Scores', readTime: '4 min' },
    ]
  },
  {
    id: 'team',
    title: 'Team & Collaboration',
    icon: Users,
    description: 'Manage your team and permissions',
    color: 'pink',
    articles: [
      { id: 'team-management', title: 'Managing Team Members', readTime: '4 min' },
      { id: 'roles-permissions', title: 'Roles & Permissions', readTime: '5 min' },
      { id: 'bulk-import', title: 'Bulk Import Enumerators', readTime: '3 min' },
    ]
  },
  {
    id: 'settings',
    title: 'Account & Settings',
    icon: Settings,
    description: 'Configure your account and preferences',
    color: 'gray',
    articles: [
      { id: 'profile-settings', title: 'Profile Settings', readTime: '2 min' },
      { id: 'notification-preferences', title: 'Notification Preferences', readTime: '3 min' },
      { id: 'security-settings', title: 'Security Settings', readTime: '4 min' },
      { id: 'api-access', title: 'API & Integrations', readTime: '5 min' },
    ]
  },
];

// ============================================================
// FAQ Data for FieldForce
// ============================================================

const FAQ_DATA = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is FieldForce?',
        a: 'FieldForce is a comprehensive mobile data collection platform designed for field research organizations. It features offline data collection, GPS tracking, multi-language support, and powerful analytics.'
      },
      {
        q: 'Does FieldForce work offline?',
        a: 'Yes! FieldForce uses Progressive Web App (PWA) technology to work fully offline. Forms are cached locally, submissions are saved to your device, and everything syncs automatically when you reconnect.'
      },
      {
        q: 'How do I get support?',
        a: 'You can use our AI Assistant for instant help, browse the Help Center, or contact our support team at support@fieldforce.io.'
      },
    ]
  },
  {
    category: 'Forms & Collection',
    questions: [
      {
        q: 'How do I create a new form?',
        a: 'Navigate to Projects > Forms > New Form. You can start from scratch using the drag-and-drop builder or choose from our pre-built templates.'
      },
      {
        q: 'What are Collection Links?',
        a: 'Collection Links allow enumerators to submit data without creating accounts. You can choose security modes: Standard (simple link), Device Locked (locks to first device), or PIN Protected (requires PIN).'
      },
      {
        q: 'Can I add GPS questions to forms?',
        a: 'Yes! Add a GPS question type to capture location data. FieldForce can also automatically capture GPS coordinates when forms are opened.'
      },
    ]
  },
  {
    category: 'Team & Billing',
    questions: [
      {
        q: 'How do I invite team members?',
        a: 'Go to Settings > Team and click "Invite Member". You can send email invitations, generate signup links, or bulk import from CSV.'
      },
      {
        q: 'What roles are available?',
        a: 'FieldForce has four roles: Admin (full access), Supervisor (manage projects, view all data), Enumerator (submit data only), and Viewer (read-only access).'
      },
    ]
  },
];

// ============================================================
// Troubleshooting Data
// ============================================================

const TROUBLESHOOTING_DATA = [
  {
    id: 'sync-issues',
    title: 'Data not syncing',
    symptoms: ['Pending uploads', 'Yellow dot indicator', 'Sync errors'],
    solutions: [
      'Check your internet connection',
      'Pull down to refresh and force sync',
      'Clear browser cache and reload',
      'Check if you have pending submissions in offline queue',
      'Contact support if data appears stuck',
    ]
  },
  {
    id: 'login-issues',
    title: 'Cannot log in',
    symptoms: ['Invalid password', 'Account locked', 'Email not found'],
    solutions: [
      'Double-check your email address',
      'Use the "Forgot Password" link to reset',
      'Clear browser cookies and try again',
      'Check if your organization has SSO enabled',
      'Contact your admin for account issues',
    ]
  },
  {
    id: 'form-issues',
    title: 'Form not loading',
    symptoms: ['Blank form', 'Loading spinner', 'Error message'],
    solutions: [
      'Refresh the page',
      'Check if the form is published',
      'Verify you have permission to access the form',
      'Try accessing from the Collection Link if applicable',
      'Clear cache and reinstall PWA',
    ]
  },
];

// ============================================================
// Keyboard Shortcuts
// ============================================================

const KEYBOARD_SHORTCUTS = [
  { category: 'Navigation', shortcuts: [
    { keys: ['Ctrl', 'K'], action: 'Open search' },
    { keys: ['Ctrl', 'H'], action: 'Go to Home/Dashboard' },
    { keys: ['Esc'], action: 'Close modal/dialog' },
  ]},
  { category: 'Forms', shortcuts: [
    { keys: ['Ctrl', 'N'], action: 'Create new form' },
    { keys: ['Ctrl', 'S'], action: 'Save form' },
    { keys: ['Ctrl', 'P'], action: 'Preview form' },
  ]},
  { category: 'General', shortcuts: [
    { keys: ['Ctrl', '/'], action: 'Show keyboard shortcuts' },
    { keys: ['?'], action: 'Open help center' },
  ]},
];

// ============================================================
// What's New / Changelog
// ============================================================

const WHATS_NEW = [
  {
    version: '2.5.0',
    date: 'February 2026',
    highlights: [
      { type: 'feature', title: 'AI Help Assistant', description: 'Get instant answers with our GPT-5.2 powered assistant' },
      { type: 'feature', title: 'New Help Center', description: 'Comprehensive documentation with search and categories' },
      { type: 'improvement', title: 'Faster Sync', description: 'Improved offline sync performance' },
    ]
  },
  {
    version: '2.4.0',
    date: 'January 2026',
    highlights: [
      { type: 'feature', title: 'Collection Links', description: 'Share surveys without requiring login' },
      { type: 'feature', title: 'PIN Protection', description: 'Add PIN security to collection links' },
      { type: 'improvement', title: 'Multi-language', description: 'Added 6 language support' },
    ]
  },
];

// ============================================================
// Article Content
// ============================================================

const ARTICLE_CONTENT = {
  'welcome': {
    title: 'Welcome to FieldForce',
    content: `Welcome to FieldForce! This guide will help you get started with our mobile data collection platform.

## What is FieldForce?

FieldForce is a comprehensive platform designed for field research organizations. It helps you:

- **Create surveys** using our drag-and-drop form builder
- **Collect data offline** with automatic sync when online
- **Track locations** with GPS and geofencing
- **Manage teams** with role-based permissions
- **Analyze results** with real-time dashboards

## Key Features

### Offline-First Design
FieldForce works seamlessly offline. Forms are cached locally, submissions are saved to your device, and everything syncs automatically when you reconnect.

### Collection Links
Share surveys without requiring enumerators to create accounts. Choose security levels:
- **Standard** - Simple shareable link
- **Device Locked** - Locks to first device used
- **PIN Protected** - Requires PIN + device lock

### Multi-Language Support
FieldForce supports 6 languages: English, Spanish, French, Portuguese, Swahili, and Arabic.

## Quick Start

1. **Create an Organization** - Set up your workspace
2. **Create a Project** - Organize your surveys
3. **Build a Form** - Use templates or start from scratch
4. **Share Collection Links** - Distribute to your team
5. **View Analytics** - Monitor submissions in real-time

## Need Help?

- Use the **AI Assistant** (click the chat button below)
- Browse **Help Center** articles
- Contact **support@fieldforce.io**
    `,
  },
  'dashboard-overview': {
    title: 'Dashboard Overview',
    content: `The Dashboard is your command center for managing data collection. Here's what you'll find:

## Main Dashboard Elements

### Statistics Cards
At the top, you'll see key metrics:
- **Total Submissions** - Number of responses collected
- **Active Forms** - Currently published surveys
- **Quality Score** - Average validation pass rate
- **Team Members** - Active enumerators

### Activity Chart
A visual graph showing submission trends over time. Filter by:
- Last 7 days
- Last 30 days
- Custom date range

### Recent Submissions
Shows the latest submissions with quick access to view details.

### Quick Actions
- Create new form
- View all submissions
- Invite team member
- Generate collection link

## Sidebar Navigation

- **Home** - Dashboard overview
- **Projects** - Manage projects, forms, templates
- **Data** - Cases, datasets, exports
- **Field** - GPS map, devices, collection links
- **Settings** - Team, roles, preferences

## Tips

- Click any statistic card to see details
- Use Cmd+K (Ctrl+K) for quick search
- The sync indicator shows connection status
    `,
  },
  'collection-links': {
    title: 'Collection Links Guide',
    content: `Collection Links allow enumerators to submit data without creating accounts - perfect for field teams.

## What are Collection Links?

Collection links are shareable URLs that give access to specific forms. Enumerators can:
- Submit data without logging in
- Work offline with the PWA
- Have unique identifiers for tracking

## Security Modes

### Standard Link
- Simple shareable URL
- No restrictions
- Best for public surveys

### Device Locked
- Locks to the first device that opens it
- Prevents sharing of links
- Good for assigned enumerators

### PIN Protected
- Requires 4-digit PIN + device lock
- Maximum security
- Best for sensitive data collection

## Creating Collection Links

1. Go to **Field > Collection Links**
2. Click **Create Single Link** or **Bulk Links**
3. Select the form(s) to include
4. Choose security mode
5. Set expiration date (optional)
6. Click **Generate**

## Bulk Import

Import multiple enumerators from CSV:
1. Click **Bulk Links**
2. Download the template
3. Fill in Name, Email columns
4. Upload the file
5. PINs are auto-generated

## Sharing Options

- **Copy Link** - Share via any channel
- **WhatsApp** - Send directly to WhatsApp
- **Email** - Send invitation email
- **QR Code** - Generate scannable code
    `,
  },
};

// ============================================================
// Main Help Center Component
// ============================================================

export function HelpCenterNew({ isDark = true }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || null);
  const [activeArticle, setActiveArticle] = useState(searchParams.get('article') || null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'home');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [articleFeedback, setArticleFeedback] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Theme classes
  const bgPrimary = isDark ? 'bg-[#0a1628]' : 'bg-gray-50';
  const bgSecondary = isDark ? 'bg-[#0f1d32]' : 'bg-white';
  const borderColor = isDark ? 'border-white/10' : 'border-gray-200';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500' : 'text-gray-400';
  const hoverBg = isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  // Search functionality
  const searchResults = searchQuery.trim() ? 
    HELP_CATEGORIES.flatMap(cat => 
      cat.articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      ).map(article => ({ ...article, category: cat }))
    ) : [];

  // Handle article view
  const handleArticleClick = (categoryId, articleId) => {
    setActiveCategory(categoryId);
    setActiveArticle(articleId);
    setActiveTab('article');
    setSearchParams({ tab: 'article', category: categoryId, article: articleId });
  };

  // Get article content
  const getArticleContent = (articleId) => {
    return ARTICLE_CONTENT[articleId] || {
      title: 'Article Coming Soon',
      content: 'This article is being written. Please check back later or use the AI Assistant for help with this topic.'
    };
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'article':
        const article = getArticleContent(activeArticle);
        return (
          <div className="space-y-6">
            <button
              onClick={() => { setActiveTab('home'); setSearchParams({}); }}
              className={cn("flex items-center gap-2 text-sm", textSecondary, hoverBg, "px-3 py-2 rounded-lg")}
              data-testid="back-to-help"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help Center
            </button>
            
            <div className={cn(bgSecondary, borderColor, "border rounded-xl p-6")}>
              <h1 className={cn("text-2xl font-bold mb-4", textPrimary)}>{article.title}</h1>
              <div className={cn("prose prose-sm max-w-none", isDark ? "prose-invert" : "")}>
                <div className="whitespace-pre-wrap">{article.content}</div>
              </div>
            </div>
            
            <div className={cn(bgSecondary, borderColor, "border rounded-xl p-4")}>
              <p className={cn("text-sm font-medium mb-3", textPrimary)}>Was this article helpful?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setArticleFeedback(prev => ({ ...prev, [activeArticle]: 'yes' }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    articleFeedback[activeArticle] === 'yes'
                      ? "bg-green-500/20 text-green-400"
                      : cn(hoverBg, textSecondary)
                  )}
                  data-testid="feedback-yes"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Yes
                </button>
                <button
                  onClick={() => setArticleFeedback(prev => ({ ...prev, [activeArticle]: 'no' }))}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    articleFeedback[activeArticle] === 'no'
                      ? "bg-red-500/20 text-red-400"
                      : cn(hoverBg, textSecondary)
                  )}
                  data-testid="feedback-no"
                >
                  <ThumbsDown className="w-4 h-4" />
                  No
                </button>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>Frequently Asked Questions</h2>
            {FAQ_DATA.map((category, catIdx) => (
              <div key={catIdx} className="space-y-3">
                <h3 className={cn("font-semibold", textPrimary)}>{category.category}</h3>
                {category.questions.map((faq, qIdx) => {
                  const faqId = `${catIdx}-${qIdx}`;
                  const isExpanded = expandedFaq === faqId;
                  return (
                    <div
                      key={qIdx}
                      className={cn(bgSecondary, borderColor, "border rounded-xl overflow-hidden")}
                    >
                      <button
                        onClick={() => setExpandedFaq(isExpanded ? null : faqId)}
                        className={cn("w-full flex items-center justify-between p-4 text-left", hoverBg)}
                        data-testid={`faq-${faqId}`}
                      >
                        <span className={cn("font-medium", textPrimary)}>{faq.q}</span>
                        <ChevronDown className={cn(
                          "w-5 h-5 transition-transform",
                          textSecondary,
                          isExpanded && "rotate-180"
                        )} />
                      </button>
                      {isExpanded && (
                        <div className={cn("px-4 pb-4", textSecondary)}>
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );

      case 'troubleshooting':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>Troubleshooting</h2>
            <div className="grid gap-4">
              {TROUBLESHOOTING_DATA.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(bgSecondary, borderColor, "border rounded-xl p-4 cursor-pointer", hoverBg)}
                  onClick={() => setSelectedIssue(selectedIssue === issue.id ? null : issue.id)}
                  data-testid={`issue-${issue.id}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={cn("font-semibold", textPrimary)}>{issue.title}</h3>
                    <ChevronRight className={cn(
                      "w-5 h-5 transition-transform",
                      textSecondary,
                      selectedIssue === issue.id && "rotate-90"
                    )} />
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {issue.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className={cn("text-xs px-2 py-1 rounded-full", isDark ? "bg-white/10" : "bg-gray-100", textSecondary)}
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                  {selectedIssue === issue.id && (
                    <div className="mt-4 space-y-2">
                      <p className={cn("text-sm font-medium", textPrimary)}>Solutions:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {issue.solutions.map((solution, idx) => (
                          <li key={idx} className={cn("text-sm", textSecondary)}>{solution}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'shortcuts':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>Keyboard Shortcuts</h2>
            {KEYBOARD_SHORTCUTS.map((group, idx) => (
              <div key={idx} className={cn(bgSecondary, borderColor, "border rounded-xl p-4")}>
                <h3 className={cn("font-semibold mb-3", textPrimary)}>{group.category}</h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between">
                      <span className={textSecondary}>{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className={cn(
                              "px-2 py-1 text-xs rounded font-mono",
                              isDark ? "bg-white/10" : "bg-gray-100",
                              textPrimary
                            )}
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'whats-new':
        return (
          <div className="space-y-6">
            <h2 className={cn("text-xl font-bold", textPrimary)}>What's New</h2>
            {WHATS_NEW.map((release, idx) => (
              <div key={idx} className={cn(bgSecondary, borderColor, "border rounded-xl p-4")}>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("font-bold", textPrimary)}>v{release.version}</span>
                  <span className={textSecondary}>{release.date}</span>
                </div>
                <div className="space-y-2">
                  {release.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-3">
                      <span className={cn(
                        "px-2 py-0.5 text-xs rounded",
                        item.type === 'feature' ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400"
                      )}>
                        {item.type}
                      </span>
                      <div>
                        <p className={cn("font-medium", textPrimary)}>{item.title}</p>
                        <p className={cn("text-sm", textSecondary)}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* Quick Links */}
            <div className={cn(bgSecondary, borderColor, "border rounded-xl p-5")}>
              <h2 className={cn("font-semibold mb-4", textPrimary)}>Quick Links</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('faq')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                    borderColor, "border hover:border-teal-500/30"
                  )}
                  data-testid="quick-faq"
                >
                  <HelpCircle className="w-4 h-4 text-teal-500" />
                  <span className={cn("text-sm", textPrimary)}>FAQ</span>
                </button>
                <button
                  onClick={() => setActiveTab('troubleshooting')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                    borderColor, "border hover:border-teal-500/30"
                  )}
                  data-testid="quick-troubleshooting"
                >
                  <AlertCircle className="w-4 h-4 text-teal-500" />
                  <span className={cn("text-sm", textPrimary)}>Troubleshooting</span>
                </button>
                <button
                  onClick={() => setActiveTab('shortcuts')}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                    borderColor, "border hover:border-teal-500/30"
                  )}
                  data-testid="quick-shortcuts"
                >
                  <Keyboard className="w-4 h-4 text-teal-500" />
                  <span className={cn("text-sm", textPrimary)}>Shortcuts</span>
                </button>
              </div>
            </div>

            {/* Featured Categories */}
            {HELP_CATEGORIES.slice(0, 4).map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className={cn(bgSecondary, borderColor, "border rounded-xl p-5")}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-teal-500" />
                    <h2 className={cn("font-semibold", textPrimary)}>{category.title}</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {category.articles.slice(0, 2).map((article) => (
                      <button
                        key={article.id}
                        onClick={() => handleArticleClick(category.id, article.id)}
                        className={cn(
                          "text-left p-4 rounded-xl transition-all",
                          isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200",
                          borderColor, "border hover:border-teal-500/30"
                        )}
                        data-testid={`article-${article.id}`}
                      >
                        <h3 className={cn("font-medium mb-1", textPrimary)}>{article.title}</h3>
                        <p className={cn("text-sm", textSecondary)}>{article.readTime} read</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className={cn("min-h-screen p-6", bgPrimary)}>
        <div className="mb-8">
          <h1 className={cn("text-3xl font-bold mb-2", textPrimary)} data-testid="help-center-title">Help Center</h1>
          <p className={textSecondary}>Find answers, tutorials, and documentation</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", textMuted)} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, guides, and tutorials..."
            className={cn(
              "w-full pl-12 py-4 rounded-xl text-sm",
              bgSecondary, borderColor, "border",
              textPrimary, "placeholder-gray-500 outline-none focus:ring-2 focus:ring-teal-500/50"
            )}
            data-testid="help-search"
          />
          {searchQuery && searchResults.length > 0 && (
            <div className={cn(
              "absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto z-50 rounded-xl shadow-xl",
              bgSecondary, borderColor, "border"
            )}>
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => { handleArticleClick(result.category.id, result.id); setSearchQuery(''); }}
                  className={cn("w-full text-left px-4 py-3 border-b last:border-0", borderColor, hoverBg)}
                >
                  <p className={cn("text-sm font-medium", textPrimary)}>{result.title}</p>
                  <p className={cn("text-xs", textMuted)}>{result.category.title} • {result.readTime}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-column layout */}
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={cn("w-72 flex-shrink-0 rounded-xl p-5", bgSecondary, borderColor, "border")}>
            <div className="flex items-center gap-2 mb-5">
              <div className="p-1.5 rounded-lg bg-teal-500/10">
                <ClipboardList className="w-4 h-4 text-teal-500" />
              </div>
              <h2 className={cn("font-semibold", textPrimary)}>Categories</h2>
            </div>
            
            <nav className="space-y-1">
              {HELP_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategory === category.id;
                return (
                  <div key={category.id}>
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                        isExpanded ? cn(isDark ? "bg-white/5" : "bg-gray-100", textPrimary) : cn(textSecondary, hoverBg)
                      )}
                      data-testid={`category-${category.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-teal-500/70" />
                        <span>{category.title}</span>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-10 mt-1 space-y-1">
                        {category.articles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => handleArticleClick(category.id, article.id)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-sm transition-colors",
                              textMuted, "hover:text-teal-400"
                            )}
                          >
                            {article.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* What's New link */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setActiveTab('whats-new')}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  textSecondary, hoverBg
                )}
                data-testid="whats-new-link"
              >
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>What's New</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>

        {/* AI Assistant */}
        <HelpAssistant isDark={isDark} />
      </div>
    </DashboardLayout>
  );
}

export default HelpCenterNew;
