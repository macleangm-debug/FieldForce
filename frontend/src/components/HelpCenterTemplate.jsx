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
  HelpCircle,
  ZoomIn,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

/**
 * Screenshot Modal for zoomed view
 */
function ScreenshotModal({ src, alt, onClose }) {
  if (!src) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 p-2 text-white hover:text-primary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img 
          src={src} 
          alt={alt} 
          className="w-full rounded-lg shadow-2xl"
        />
        <p className="text-center text-white/70 mt-3 text-sm">{alt}</p>
      </motion.div>
    </motion.div>
  );
}

/**
 * Screenshot component with zoom capability
 */
function Screenshot({ src, alt, caption }) {
  const [zoomed, setZoomed] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="my-4 p-8 rounded-xl bg-muted/30 border border-border flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">{caption || alt}</span>
      </div>
    );
  }

  return (
    <>
      <motion.figure 
        className="my-4 group cursor-zoom-in"
        onClick={() => setZoomed(true)}
        whileHover={{ scale: 1.01 }}
      >
        <div className="relative rounded-xl overflow-hidden border border-border shadow-lg">
          <img 
            src={src} 
            alt={alt}
            onError={() => setError(true)}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
            <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        {caption && (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </motion.figure>
      
      <AnimatePresence>
        {zoomed && (
          <ScreenshotModal src={src} alt={alt || caption} onClose={() => setZoomed(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Help Center Categories and Articles with Screenshots
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
        screenshots: [
          { id: 'dashboard', caption: 'The FieldForce Dashboard - Your command center for data collection' },
          { id: 'sidebar', caption: 'Navigation sidebar with quick access to all features' }
        ],
        content: `
## Welcome to FieldForce!

FieldForce is a powerful mobile data collection platform designed for field research organizations. Here's how to get started:

[SCREENSHOT:dashboard]

### Step 1: Create Your Organization
After signing up, create your organization to serve as your team workspace. Click the **Create Organization** button on your dashboard.

### Step 2: Create a Project
Projects help you organize related surveys. Navigate to **Projects** in the sidebar and click **New Project**.

[SCREENSHOT:sidebar]

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
        screenshots: [
          { id: 'settings', caption: 'Profile settings page - customize your account' }
        ],
        content: `
## Setting Up Your Account

[SCREENSHOT:settings]

### Profile Settings
1. Click your avatar in the top-right corner
2. Select **Settings**
3. Update your name, email, and avatar

### Personal Information
Fill in your details including:
- Full Name
- Email Address  
- Phone Number
- Job Title
- Department
- Location

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
        screenshots: [
          { id: 'nav-sidebar', caption: 'The sidebar provides quick access to all main features' },
          { id: 'nav-header', caption: 'Top header with search, notifications, and user profile' }
        ],
        content: `
## Dashboard Navigation

[SCREENSHOT:nav-sidebar]

### Left Sidebar
The sidebar provides quick access to all main features:
- **Home**: Dashboard overview with key metrics
- **Projects**: Manage your data collection projects  
- **Data**: Access cases, datasets, and exports
- **Field**: GPS map, devices, and collection links
- **Settings**: Team, roles, and preferences

[SCREENSHOT:nav-header]

### Top Bar
- **Search**: Press Cmd+K for quick search across all data
- **Notifications**: Stay updated on submissions and team activity
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
        screenshots: [
          { id: 'forms-list', caption: 'Forms page showing all your surveys' },
          { id: 'form-builder', caption: 'Drag-and-drop form builder interface' }
        ],
        content: `
## Form Builder Guide

[SCREENSHOT:forms-list]

### Accessing the Form Builder
1. Navigate to **Projects > Forms** in the sidebar
2. Click **+ New Form** button
3. Choose "Start from scratch" or select a template

[SCREENSHOT:form-builder]

### Adding Questions
1. Click **+ Add Question** or drag from the sidebar
2. Choose question type (text, number, select, etc.)
3. Configure question properties in the right panel

### Question Types Available
- **Text**: Short and long text responses
- **Number**: Numeric input with validation
- **Select One**: Single choice from options
- **Select Multiple**: Multiple choice selection
- **Date/Time**: Date and time pickers
- **GPS**: Location capture with map
- **Photo**: Image capture with camera
- **Signature**: Digital signature capture
- **Barcode**: Scan barcodes and QR codes

### Skip Logic
Add conditional logic to show/hide questions:
1. Select a question
2. Click **Add Logic** in the properties panel
3. Set conditions and actions

### Validation Rules
Ensure data quality with validation:
- Required fields
- Min/max values
- Pattern matching (regex)
- Custom formulas
        `
      },
      {
        id: 'templates',
        title: 'Using Form Templates',
        description: 'Start faster with pre-built templates',
        readTime: '3 min',
        screenshots: [
          { id: 'templates', caption: 'Browse pre-built form templates' }
        ],
        content: `
## Form Templates

[SCREENSHOT:templates]

### Available Templates
FieldForce comes with professionally designed templates:
- **Household Survey** - Demographic data collection
- **Health Assessment** - Patient intake and screening
- **Customer Feedback** - Satisfaction surveys
- **Employee Survey** - HR and workplace assessments
- **Event Registration** - Sign-ups and RSVPs
- **Agriculture Survey** - Farm and crop monitoring

### Using a Template
1. Go to **Templates** page from the sidebar
2. Preview the template to see all questions
3. Click **Use Template** to create a copy
4. Customize questions as needed
5. Publish when ready

### Creating Your Own Templates
Save any form as a template for reuse:
1. Open an existing form
2. Click **Save as Template**
3. Give it a name and description
4. Share with your organization
        `
      },
      {
        id: 'form-settings',
        title: 'Form Settings & Publishing',
        description: 'Configure and deploy your forms',
        readTime: '4 min',
        screenshots: [
          { id: 'form-settings', caption: 'Form settings and configuration options' }
        ],
        content: `
## Form Settings

[SCREENSHOT:form-settings]

### General Settings
- **Form title and description** - What users see
- **Default language** - Primary language for the form
- **Submission limits** - Max responses allowed

### Access Control
Configure who can submit responses:
- Public (anyone with the link)
- Team members only
- Specific users or groups
- Password protected

### Geographic Restrictions
- Enable geofencing to limit where forms can be submitted
- Set allowed regions on a map

### Publishing Options
1. **Draft**: Form is not accessible
2. **Published**: Form is live and accepting responses
3. **Closed**: No new submissions accepted

### Publishing Workflow
1. Review all questions and logic
2. Test with preview mode
3. Click **Publish** when ready
4. Share via collection links or embed
5. Monitor submissions in real-time
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
        screenshots: [
          { id: 'collection-links', caption: 'Collection Links page - manage all your shareable survey links' },
          { id: 'create-link', caption: 'Creating a new collection link with security options' }
        ],
        content: `
## Collection Links

Collection links allow enumerators to submit data without creating accounts - perfect for field teams.

[SCREENSHOT:collection-links]

### Security Modes
Choose the right level of protection:

1. **Standard Link**
   - Simple shareable URL
   - No restrictions
   - Best for public surveys

2. **Device Locked**
   - Locks to first device used
   - Prevents link sharing
   - Good for assigned enumerators

3. **PIN Protected**
   - Requires 4-digit PIN + device lock
   - Maximum security
   - Best for sensitive data

[SCREENSHOT:create-link]

### Creating Links
1. Go to **Field > Collection Links**
2. Click **Create Single Link** or **Bulk Links**
3. Select the form(s) to include
4. Choose security mode
5. Set expiration date (optional)
6. Generate and share

### Bulk Import
Import multiple enumerators at once:
- Upload CSV/Excel with Name, Email columns
- Auto-generate unique PINs
- Send distribution emails automatically
        `
      },
      {
        id: 'offline-mode',
        title: 'Offline Data Collection',
        description: 'Work without internet connectivity',
        readTime: '4 min',
        screenshots: [
          { id: 'offline-status', caption: 'Offline status indicator and sync status' }
        ],
        content: `
## Offline Mode

FieldForce works seamlessly offline using Progressive Web App (PWA) technology - essential for remote field work.

[SCREENSHOT:offline-status]

### How It Works
1. Forms are automatically cached locally
2. Submissions saved to device storage
3. Auto-sync when connectivity returns
4. No data loss even without internet

### Installing the PWA
For the best offline experience:

**On Mobile (Android/iOS)**
1. Open FieldForce in Chrome/Safari
2. Tap "Add to Home Screen" prompt
3. Access like a native app
4. Works fully offline

**On Desktop**
1. Click the install icon in the address bar
2. Or go to Settings > Install FieldForce
3. App opens in its own window

### Sync Status Indicators
- **Green dot**: All data synced
- **Yellow dot**: Pending uploads
- **Red dot**: Sync errors (tap to retry)

### Best Practices
- Sync before going to field
- Check pending uploads regularly
- Keep device charged
- Test offline mode before deployment
        `
      },
      {
        id: 'gps-tracking',
        title: 'GPS & Location Tracking',
        description: 'Capture and verify locations',
        readTime: '3 min',
        screenshots: [
          { id: 'gps-map', caption: 'GPS Map view showing all submissions with location data' }
        ],
        content: `
## GPS Features

Location data helps verify submissions and visualize coverage.

[SCREENSHOT:gps-map]

### Automatic Location Capture
- GPS coordinates captured when form opens
- Accuracy indicator shows quality
- Works with device GPS or network location

### GPS Question Type
Add dedicated GPS questions to forms:
- Manual location capture
- Map picker for precise positioning
- Multiple locations per submission

### GPS Map View
Visualize all submissions on an interactive map:
1. Go to **Field > GPS Map**
2. Filter by form, date, or enumerator
3. Click markers for submission details
4. Cluster view for dense areas

### Export Options
- **KML**: For Google Earth
- **GeoJSON**: For GIS applications
- **CSV with coordinates**: For spreadsheets

### Geofencing
Restrict submissions to specific areas:
1. Draw boundaries on map
2. Enable geofencing for form
3. Submissions outside boundary rejected
4. Great for quality control
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
        screenshots: [
          { id: 'team-page', caption: 'Team page showing all organization members' }
        ],
        content: `
## Team Invitations

Build your field team quickly with multiple invitation methods.

[SCREENSHOT:team-page]

### Invite Methods

**Email Invite**
1. Go to **Settings > Team**
2. Click **Invite Member**
3. Enter email address
4. Select role
5. Send invitation

**Direct Link**
- Generate a signup link
- Share via any channel
- New users auto-join your org

**Bulk Import**
- Upload CSV with email list
- Assign roles in bulk
- Great for large teams

### User Roles
- **Admin**: Full access to all features
- **Supervisor**: Manage projects and view all data
- **Enumerator**: Submit data only
- **Viewer**: Read-only access to data

### Managing Members
- View activity and submission counts
- Change roles as needed
- Deactivate accounts (data preserved)
- Re-activate when needed
        `
      },
      {
        id: 'roles-permissions',
        title: 'Roles & Permissions',
        description: 'Configure access control',
        readTime: '5 min',
        screenshots: [
          { id: 'rbac', caption: 'Role-based access control settings' }
        ],
        content: `
## Role-Based Access Control (RBAC)

Fine-grained permissions for enterprise security needs.

[SCREENSHOT:rbac]

### Default Roles
Each role has predefined permissions:

**Admin**
- Full organization management
- User management
- Billing access
- All data access

**Supervisor**  
- Project management
- Form creation/editing
- View all submissions
- Export data

**Enumerator**
- Submit forms assigned to them
- View own submissions
- Basic profile access

**Viewer**
- Read-only data access
- View reports
- No editing capabilities

### Custom Roles
Create roles tailored to your needs:
1. Go to **Settings > Roles**
2. Click **Create Role**
3. Name your role
4. Select specific permissions
5. Assign to users

### Permission Categories
- Organization management
- Project access
- Form editing
- Submission viewing
- Export capabilities
- Team management
- Billing access
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
        screenshots: [
          { id: 'analytics', caption: 'Analytics dashboard with key metrics and charts' }
        ],
        content: `
## Analytics Dashboard

Get insights from your data at a glance.

[SCREENSHOT:analytics]

### Key Metrics
Track what matters most:
- **Total Submissions**: All responses collected
- **Active Forms**: Currently published surveys
- **Quality Score**: Validation pass rate
- **Team Members**: Active enumerators

### Charts & Visualizations

**Submission Trends**
- Line chart showing submissions over time
- Compare periods
- Identify patterns

**Status Distribution**
- Pie chart of approved/pending/rejected
- Quick quality overview

**Top Forms**
- Bar chart ranking forms by submissions
- Focus resources effectively

**Geographic Coverage**
- Map visualization of data points
- Identify coverage gaps

### Filtering
Slice data by:
- Date range
- Form/Project
- Enumerator
- Location
- Status
        `
      },
      {
        id: 'exporting-data',
        title: 'Exporting Data',
        description: 'Download your data in various formats',
        readTime: '3 min',
        screenshots: [
          { id: 'exports', caption: 'Export options and format selection' }
        ],
        content: `
## Data Export

Get your data in the format you need.

[SCREENSHOT:exports]

### Export Formats

**Excel (.xlsx)**
- Full formatting preserved
- Multiple sheets for complex forms
- Best for business users

**CSV**
- Universal compatibility
- Lightweight files
- Great for data processing

**JSON**
- Structured data for developers
- API-friendly format
- Preserves nested data

**SPSS (.sav)**
- Statistical analysis ready
- Variable labels included
- For researchers

**PDF Reports**
- Printable summaries
- Charts included
- Shareable reports

### Export Options
Customize your export:
- Select columns to include
- Filter by date/status
- Include/exclude metadata
- Split by form sections
- Add calculated fields

### Scheduled Exports
Automate regular exports:
1. Set up export template
2. Choose frequency (daily/weekly/monthly)
3. Select destination (email/cloud storage)
4. Receive data automatically
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
        screenshots: [
          { id: 'api-settings', caption: 'API settings and key management' }
        ],
        content: `
## API Access

Build custom integrations with our REST API.

[SCREENSHOT:api-settings]

### Authentication
Use JWT tokens for API authentication:
\`\`\`
Authorization: Bearer YOUR_TOKEN
\`\`\`

Generate tokens in **Settings > API & Integrations**.

### Key Endpoints

**Submissions**
- \`GET /api/submissions\` - List all submissions
- \`GET /api/submissions/{id}\` - Get single submission
- \`POST /api/submissions\` - Create submission

**Forms**
- \`GET /api/forms\` - List forms
- \`POST /api/forms\` - Create form
- \`PUT /api/forms/{id}\` - Update form

**Projects**
- \`GET /api/projects\` - List projects
- \`POST /api/projects\` - Create project

### Rate Limits
- 1000 requests per hour (standard)
- 10000 requests per hour (enterprise)
- Bulk endpoints available for large operations

### SDKs & Libraries
- Python SDK
- JavaScript/Node.js
- REST API for any platform
        `
      },
      {
        id: 'webhooks',
        title: 'Setting Up Webhooks',
        description: 'Real-time data notifications',
        readTime: '4 min',
        screenshots: [
          { id: 'webhooks', caption: 'Webhook configuration and event selection' }
        ],
        content: `
## Webhooks

Receive real-time notifications when events occur.

[SCREENSHOT:webhooks]

### Configuration
1. Go to **Settings > Integrations**
2. Click **Add Webhook**
3. Enter your endpoint URL
4. Select events to trigger
5. Save and test

### Available Events
- \`submission.created\` - New submission received
- \`submission.updated\` - Submission modified
- \`submission.approved\` - Submission approved
- \`submission.rejected\` - Submission rejected
- \`form.published\` - Form goes live
- \`user.invited\` - New team member

### Payload Format
Webhooks send JSON payloads:
\`\`\`json
{
  "event": "submission.created",
  "timestamp": "2026-01-15T10:30:00Z",
  "data": {
    "submission_id": "sub_123",
    "form_id": "form_456",
    "responses": {...}
  }
}
\`\`\`

### Security
- HTTPS endpoints required
- Signature verification available
- Retry on failure (3 attempts)
- Event logs for debugging
        `
      }
    ]
  }
];

/**
 * Screenshot paths mapping
 */
const SCREENSHOT_PATHS = {
  'dashboard': '/help-images/dashboard-overview.png',
  'sidebar': '/help-images/nav-sidebar.png',
  'settings': '/help-images/settings-page.png',
  'nav-sidebar': '/help-images/nav-sidebar.png',
  'nav-header': '/help-images/nav-header.png',
  'forms-list': '/help-images/forms-page.png',
  'form-builder': '/help-images/form-builder.png',
  'templates': '/help-images/templates-page.png',
  'form-settings': '/help-images/form-settings.png',
  'collection-links': '/help-images/collection-links.png',
  'create-link': '/help-images/create-link.png',
  'offline-status': '/help-images/offline-status.png',
  'gps-map': '/help-images/gps-map.png',
  'team-page': '/help-images/team-page.png',
  'rbac': '/help-images/rbac-page.png',
  'analytics': '/help-images/analytics-page.png',
  'exports': '/help-images/exports-page.png',
  'api-settings': '/help-images/api-settings.png',
  'webhooks': '/help-images/webhooks.png',
};

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
              className="max-w-xl mx-auto mt-8 relative"
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
                    className="absolute left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-10"
                  >
                    {searchResults.slice(0, 5).map((result) => (
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
              {article.screenshots && article.screenshots.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  <span>{article.screenshots.length} screenshot{article.screenshots.length > 1 ? 's' : ''}</span>
                </div>
              )}
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
 * Article View - Shows full article content with screenshots
 */
function ArticleView({ article, category }) {
  // Parse content and render with screenshots
  const renderContent = (content) => {
    const lines = content.split('\n');
    const elements = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Screenshot placeholder
      if (line.trim().startsWith('[SCREENSHOT:')) {
        const match = line.match(/\[SCREENSHOT:(\w+)\]/);
        if (match) {
          const screenshotId = match[1];
          const screenshotInfo = article.screenshots?.find(s => s.id === screenshotId);
          const path = SCREENSHOT_PATHS[screenshotId];
          
          if (path) {
            elements.push(
              <Screenshot 
                key={`screenshot-${i}`}
                src={path}
                alt={screenshotInfo?.caption || `Screenshot: ${screenshotId}`}
                caption={screenshotInfo?.caption}
              />
            );
          }
        }
        continue;
      }
      
      // Headers
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-foreground mt-6 mb-3">
            {line.replace('### ', '')}
          </h3>
        );
        continue;
      }
      
      // Code blocks
      if (line.startsWith('```')) {
        // Find the end of code block
        let codeContent = [];
        let lang = line.replace('```', '').trim();
        i++;
        while (i < lines.length && !lines[i].startsWith('```')) {
          codeContent.push(lines[i]);
          i++;
        }
        elements.push(
          <pre key={`code-${i}`} className="my-4 p-4 rounded-lg bg-slate-900 border border-slate-700 overflow-x-auto">
            <code className="text-sm text-slate-300 font-mono">
              {codeContent.join('\n')}
            </code>
          </pre>
        );
        continue;
      }
      
      // List items
      if (line.startsWith('- ')) {
        elements.push(
          <li key={i} className="flex items-start gap-2 text-muted-foreground ml-4 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{renderInlineFormatting(line.replace('- ', ''))}</span>
          </li>
        );
        continue;
      }
      
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+)\./)[1];
        elements.push(
          <li key={i} className="flex items-start gap-3 text-muted-foreground ml-4 mb-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 font-medium">
              {num}
            </span>
            <span>{renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}</span>
          </li>
        );
        continue;
      }
      
      // Regular paragraph
      if (line.trim()) {
        elements.push(
          <p key={i} className="text-muted-foreground mb-3 leading-relaxed">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    }
    
    return elements;
  };
  
  // Handle inline formatting like **bold** and `code`
  const renderInlineFormatting = (text) => {
    // Split by bold and code patterns
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-foreground font-medium">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono">{part.slice(1, -1)}</code>;
      }
      return part;
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
            {article.screenshots && article.screenshots.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                <ImageIcon className="w-3 h-3 mr-1" />
                {article.screenshots.length} screenshots
              </Badge>
            )}
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
