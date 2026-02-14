import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Book,
  FileText,
  Users,
  Settings,
  Smartphone,
  MapPin,
  BarChart3,
  Shield,
  Zap,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  FolderKanban,
  Link2,
  Download,
  Globe,
  HelpCircle
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

/**
 * Help Center Categories and Articles
 */
const HELP_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of FieldForce',
    icon: Sparkles,
    color: 'from-cyan-500 to-blue-500',
    articles: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        description: 'Get up and running in 5 minutes',
        readTime: '5 min',
        content: `
## Welcome to FieldForce!

FieldForce is a powerful mobile data collection platform designed for field research organizations. Here's how to get started:

### Step 1: Create Your Organization
After signing up, create your organization to serve as your team workspace. Go to **Team > Create Organization**.

### Step 2: Create a Project
Projects help you organize related surveys. Navigate to **Projects > New Project** and give it a meaningful name.

### Step 3: Build Your First Form
Use our drag-and-drop form builder to create surveys. Go to **Forms > New Form** and start adding questions.

### Step 4: Deploy to Field
Share collection links with your team or use the mobile app to start collecting data offline.

### Step 5: Analyze Results
View submissions, export data, and generate reports from the **Submissions** and **Analytics** pages.
        `
      },
      {
        id: 'account-setup',
        title: 'Account Setup',
        description: 'Configure your profile and preferences',
        readTime: '3 min',
        content: `
## Setting Up Your Account

### Profile Settings
1. Click your avatar in the top-right corner
2. Select **Settings**
3. Update your name, email, and avatar

### Notification Preferences
Configure how you receive updates about submissions, team activity, and system alerts.

### Security
- Enable two-factor authentication for extra security
- Manage your active sessions
- Update your password regularly
        `
      },
      {
        id: 'navigation',
        title: 'Navigating the Dashboard',
        description: 'Understanding the interface',
        readTime: '4 min',
        content: `
## Dashboard Navigation

### Left Sidebar
The sidebar provides quick access to all main features:
- **Home**: Dashboard overview with key metrics
- **Projects**: Manage your data collection projects
- **Data**: Access cases, datasets, and exports
- **Field**: GPS map, devices, and collection links
- **Settings**: Team, roles, and preferences

### Top Bar
- **Search**: Press Cmd+K for quick search
- **Notifications**: Stay updated on submissions
- **Profile**: Access settings and sign out

### Keyboard Shortcuts
- \`Cmd/Ctrl + K\`: Open command palette
- \`Cmd/Ctrl + N\`: Create new form
- \`Cmd/Ctrl + /\`: Show all shortcuts
        `
      }
    ]
  },
  {
    id: 'forms',
    title: 'Forms & Surveys',
    description: 'Build and manage data collection forms',
    icon: FileText,
    color: 'from-violet-500 to-purple-500',
    articles: [
      {
        id: 'form-builder',
        title: 'Using the Form Builder',
        description: 'Create powerful surveys with drag-and-drop',
        readTime: '8 min',
        content: `
## Form Builder Guide

### Adding Questions
1. Click **+ Add Question** or drag from the sidebar
2. Choose question type (text, number, select, etc.)
3. Configure question properties

### Question Types
- **Text**: Short and long text responses
- **Number**: Numeric input with validation
- **Select One**: Single choice from options
- **Select Multiple**: Multiple choice selection
- **Date/Time**: Date and time pickers
- **GPS**: Location capture
- **Photo**: Image capture with camera
- **Signature**: Digital signature capture

### Skip Logic
Add conditional logic to show/hide questions:
1. Select a question
2. Click **Add Logic**
3. Set conditions and actions

### Validation Rules
Ensure data quality with validation:
- Required fields
- Min/max values
- Pattern matching
- Custom formulas
        `
      },
      {
        id: 'templates',
        title: 'Using Form Templates',
        description: 'Start faster with pre-built templates',
        readTime: '3 min',
        content: `
## Form Templates

### Available Templates
- Household Survey
- Health Assessment
- Customer Feedback
- Employee Survey
- Event Registration

### Using a Template
1. Go to **Templates** page
2. Preview the template
3. Click **Use Template**
4. Customize as needed

### Creating Your Own Templates
Save any form as a template for reuse across projects.
        `
      },
      {
        id: 'form-settings',
        title: 'Form Settings & Publishing',
        description: 'Configure and deploy your forms',
        readTime: '4 min',
        content: `
## Form Settings

### General Settings
- Form title and description
- Default language
- Submission limits

### Access Control
- Who can submit responses
- Authentication requirements
- Geographic restrictions

### Publishing
1. Click **Publish** when ready
2. Share via collection links
3. Monitor submissions in real-time
        `
      }
    ]
  },
  {
    id: 'data-collection',
    title: 'Data Collection',
    description: 'Collecting data in the field',
    icon: Smartphone,
    color: 'from-emerald-500 to-green-500',
    articles: [
      {
        id: 'collection-links',
        title: 'Collection Links',
        description: 'Share surveys without requiring login',
        readTime: '5 min',
        content: `
## Collection Links

Collection links allow enumerators to submit data without creating accounts.

### Security Modes
1. **Standard**: Simple shareable link
2. **Device Locked**: Locks to first device used
3. **PIN Protected**: Requires PIN + device lock

### Creating Links
1. Go to **Field > Collection Links**
2. Click **Create Single Link** or **Bulk Links**
3. Select forms and security mode
4. Share via WhatsApp, Email, or SMS

### Bulk Import
Import multiple enumerators from CSV/Excel:
- Name, Email columns required
- Auto-generate unique PINs
- Send distribution emails
        `
      },
      {
        id: 'offline-mode',
        title: 'Offline Data Collection',
        description: 'Work without internet connectivity',
        readTime: '4 min',
        content: `
## Offline Mode

FieldForce works seamlessly offline using Progressive Web App (PWA) technology.

### How It Works
1. Forms are cached locally
2. Submissions saved to device storage
3. Auto-sync when back online

### Installing the PWA
1. Open FieldForce in Chrome/Safari
2. Click "Add to Home Screen" prompt
3. Access like a native app

### Sync Status
- Green: All synced
- Yellow: Pending uploads
- Red: Sync errors (tap to retry)
        `
      },
      {
        id: 'gps-tracking',
        title: 'GPS & Location Tracking',
        description: 'Capture and verify locations',
        readTime: '3 min',
        content: `
## GPS Features

### Location Capture
- Automatic GPS on form open
- Manual location questions
- Accuracy indicators

### GPS Map View
View all submissions on an interactive map:
- Filter by form, date, enumerator
- Cluster markers for dense areas
- Export as KML/GeoJSON

### Geofencing
Restrict submissions to specific areas for quality control.
        `
      }
    ]
  },
  {
    id: 'team',
    title: 'Team Management',
    description: 'Manage your organization and team',
    icon: Users,
    color: 'from-orange-500 to-amber-500',
    articles: [
      {
        id: 'inviting-members',
        title: 'Inviting Team Members',
        description: 'Add users to your organization',
        readTime: '3 min',
        content: `
## Team Invitations

### Invite Methods
1. **Email Invite**: Send invitation link via email
2. **Direct Link**: Share signup link
3. **Bulk Import**: Upload CSV with email list

### User Roles
- **Admin**: Full access to all features
- **Supervisor**: Manage projects and view all data
- **Enumerator**: Submit data only
- **Viewer**: Read-only access

### Managing Members
- View activity and submissions
- Change roles
- Deactivate accounts
        `
      },
      {
        id: 'roles-permissions',
        title: 'Roles & Permissions',
        description: 'Configure access control',
        readTime: '5 min',
        content: `
## Role-Based Access Control (RBAC)

### Default Roles
Each role has predefined permissions that can be customized.

### Custom Roles
Create custom roles for specific needs:
1. Go to **Settings > Roles**
2. Click **Create Role**
3. Select permissions
4. Assign to users

### Permission Categories
- Organization management
- Project access
- Form editing
- Submission viewing
- Export capabilities
- Team management
        `
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & Reports',
    description: 'Analyze and export your data',
    icon: BarChart3,
    color: 'from-pink-500 to-rose-500',
    articles: [
      {
        id: 'dashboard-analytics',
        title: 'Understanding Analytics',
        description: 'Key metrics and visualizations',
        readTime: '4 min',
        content: `
## Analytics Dashboard

### Key Metrics
- Total submissions
- Completion rate
- Average duration
- Validation pass rate

### Charts & Graphs
- Submission trends over time
- Response distribution
- Geographic coverage
- Enumerator performance

### Filtering
Filter data by:
- Date range
- Form/Project
- Enumerator
- Location
        `
      },
      {
        id: 'exporting-data',
        title: 'Exporting Data',
        description: 'Download your data in various formats',
        readTime: '3 min',
        content: `
## Data Export

### Export Formats
- **Excel (.xlsx)**: Full formatting
- **CSV**: Universal compatibility
- **JSON**: For developers
- **SPSS (.sav)**: Statistical analysis
- **PDF**: Printable reports

### Export Options
- Select columns to include
- Filter by date/status
- Include metadata
- Split by form sections

### Scheduled Exports
Set up automatic exports to email or cloud storage.
        `
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with other tools',
    icon: Link2,
    color: 'from-indigo-500 to-blue-600',
    articles: [
      {
        id: 'api-access',
        title: 'API Documentation',
        description: 'Integrate with your systems',
        readTime: '6 min',
        content: `
## API Access

### Authentication
Use JWT tokens for API authentication:
\`\`\`
Authorization: Bearer YOUR_TOKEN
\`\`\`

### Endpoints
- \`GET /api/submissions\`: List submissions
- \`POST /api/forms\`: Create forms
- \`GET /api/projects\`: List projects

### Rate Limits
- 1000 requests per hour
- Bulk endpoints available

### Webhooks
Receive real-time notifications when submissions arrive.
        `
      },
      {
        id: 'webhooks',
        title: 'Setting Up Webhooks',
        description: 'Real-time data notifications',
        readTime: '4 min',
        content: `
## Webhooks

### Configuration
1. Go to **Settings > Integrations**
2. Click **Add Webhook**
3. Enter your endpoint URL
4. Select events to trigger

### Events
- new_submission
- submission_updated
- form_published
- user_invited

### Payload Format
Webhooks send JSON payloads with event details and full submission data.
        `
      }
    ]
  }
];

/**
 * Quick Links for common actions
 */
const QUICK_LINKS = [
  { title: 'Create a Form', icon: FileText, path: '/forms/new' },
  { title: 'View Submissions', icon: Download, path: '/submissions' },
  { title: 'Invite Team', icon: Users, path: '/team' },
  { title: 'Collection Links', icon: Link2, path: '/collection-links' },
];

/**
 * Contact Support options
 */
const SUPPORT_OPTIONS = [
  {
    title: 'Email Support',
    description: 'Get help within 24 hours',
    icon: Mail,
    action: 'support@fieldforce.io',
    type: 'email'
  },
  {
    title: 'Live Chat',
    description: 'Chat with our team',
    icon: MessageCircle,
    action: 'Open Chat',
    type: 'chat'
  },
  {
    title: 'Documentation',
    description: 'Browse full docs',
    icon: Book,
    action: 'View Docs',
    type: 'link'
  }
];

/**
 * Main Help Center Component
 */
export function HelpCenter({ onArticleClick, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Search across all articles
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    HELP_CATEGORIES.forEach(category => {
      category.articles.forEach(article => {
        if (
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
        ) {
          results.push({ ...article, categoryId: category.id, categoryTitle: category.title });
        }
      });
    });
    
    return results;
  }, [searchQuery]);

  const handleArticleSelect = (categoryId, article) => {
    setSelectedCategory(categoryId);
    setSelectedArticle(article);
    onArticleClick?.(categoryId, article.id);
  };

  const handleBack = () => {
    if (selectedArticle) {
      setSelectedArticle(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    }
  };

  const currentCategory = selectedCategory 
    ? HELP_CATEGORIES.find(c => c.id === selectedCategory) 
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Back button */}
          {(selectedCategory || selectedArticle) && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handleBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {selectedArticle ? currentCategory?.title : 'All Topics'}
            </motion.button>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-4">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Help Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {selectedArticle 
                ? selectedArticle.title 
                : selectedCategory 
                  ? currentCategory?.title 
                  : 'How can we help you?'}
            </h1>
            {!selectedArticle && (
              <p className="text-slate-400 max-w-lg mx-auto">
                {selectedCategory 
                  ? currentCategory?.description 
                  : 'Search our knowledge base or browse topics below'}
              </p>
            )}
          </motion.div>

          {/* Search */}
          {!selectedArticle && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-xl mx-auto mt-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 h-12 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-primary/50"
                  data-testid="help-search-input"
                />
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10 max-w-xl mx-auto"
                  >
                    {searchResults.slice(0, 5).map((result, index) => (
                      <button
                        key={`${result.categoryId}-${result.id}`}
                        onClick={() => handleArticleSelect(result.categoryId, result)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-700/50 last:border-0"
                      >
                        <p className="text-white font-medium">{result.title}</p>
                        <p className="text-sm text-slate-400">{result.categoryTitle}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {selectedArticle ? (
            /* Article View */
            <motion.div
              key="article"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ArticleView article={selectedArticle} category={currentCategory} />
            </motion.div>
          ) : selectedCategory ? (
            /* Category Articles List */
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <CategoryView 
                category={currentCategory} 
                onArticleSelect={(article) => handleArticleSelect(selectedCategory, article)}
              />
            </motion.div>
          ) : (
            /* Main Help Center View */
            <motion.div
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Quick Links */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {QUICK_LINKS.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => onNavigate?.(link.path)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      data-testid={`quick-link-${link.path.replace('/', '')}`}
                    >
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <link.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{link.title}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Categories Grid */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Browse Topics</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {HELP_CATEGORIES.map((category, index) => (
                    <motion.button
                      key={category.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedCategory(category.id)}
                      className="text-left p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                      data-testid={`category-${category.id}`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <category.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                      <div className="flex items-center text-sm text-primary">
                        <span>{category.articles.length} articles</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Contact Support */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4">Need More Help?</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {SUPPORT_OPTIONS.map((option) => (
                    <Card key={option.title} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="p-2.5 rounded-lg bg-primary/10">
                            <option.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{option.title}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                            {option.type === 'email' ? (
                              <a 
                                href={`mailto:${option.action}`}
                                className="text-sm text-primary hover:underline"
                              >
                                {option.action}
                              </a>
                            ) : (
                              <button className="text-sm text-primary hover:underline">
                                {option.action} <ExternalLink className="w-3 h-3 inline ml-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Category View - Shows all articles in a category
 */
function CategoryView({ category, onArticleSelect }) {
  return (
    <div className="space-y-4">
      {category.articles.map((article, index) => (
        <motion.button
          key={article.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onArticleSelect(article)}
          className="w-full text-left p-5 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
          data-testid={`article-${article.id}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground">{article.description}</p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {article.readTime}
              </Badge>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/**
 * Article View - Shows full article content
 */
function ArticleView({ article, category }) {
  // Simple markdown-like rendering
  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      // Headers
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-lg font-semibold text-foreground mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      // Code blocks
      if (line.startsWith('```')) {
        return null; // Skip code block markers
      }
      // List items
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="flex items-start gap-2 text-muted-foreground ml-4 mb-1">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{line.replace('- ', '')}</span>
          </li>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)[1];
        return (
          <li key={i} className="flex items-start gap-3 text-muted-foreground ml-4 mb-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 font-medium">
              {num}
            </span>
            <span>{line.replace(/^\d+\.\s/, '')}</span>
          </li>
        );
      }
      // Bold text
      if (line.includes('**')) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="text-muted-foreground mb-2">
            {parts.map((part, j) => 
              j % 2 === 1 
                ? <strong key={j} className="text-foreground font-medium">{part}</strong>
                : part
            )}
          </p>
        );
      }
      // Regular paragraph
      if (line.trim()) {
        return <p key={i} className="text-muted-foreground mb-2">{line}</p>;
      }
      return null;
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardContent className="p-8">
          {/* Article meta */}
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="outline" className="text-xs">
              {category?.title}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {article.readTime} read
            </Badge>
          </div>

          {/* Article content */}
          <div className="prose prose-slate dark:prose-invert max-w-none">
            {renderContent(article.content)}
          </div>

          {/* Helpful feedback */}
          <Separator className="my-8" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Was this article helpful?</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" data-testid="helpful-yes">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Yes
              </Button>
              <Button variant="outline" size="sm" data-testid="helpful-no">
                Not really
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related articles suggestion */}
      <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm font-medium text-foreground mb-2">Need more help?</p>
        <p className="text-sm text-muted-foreground">
          Contact our support team at{' '}
          <a href="mailto:support@fieldforce.io" className="text-primary hover:underline">
            support@fieldforce.io
          </a>
        </p>
      </div>
    </div>
  );
}

export default HelpCenter;
