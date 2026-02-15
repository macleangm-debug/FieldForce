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

  // Getting Started Articles
  'first-project': {
    title: 'Create Your First Project',
    content: `This guide walks you through creating your first project in FieldForce.

## What is a Project?

Projects are containers that organize your surveys, forms, and data. Think of them as folders for related data collection activities.

## Creating a Project

### Step 1: Navigate to Projects
Click **Projects** in the left sidebar, then click **+ New Project**.

### Step 2: Enter Project Details
- **Project Name** - Give it a descriptive name (e.g., "Household Survey 2026")
- **Description** - Add details about the project goals
- **Start Date** - When data collection begins
- **End Date** - When data collection ends (optional)

### Step 3: Configure Settings
- **Default Language** - Primary language for forms
- **Geographic Scope** - Region or area of coverage
- **Data Access** - Who can view submissions

### Step 4: Add Team Members
Invite team members and assign roles:
- **Supervisors** - Manage forms and view all data
- **Enumerators** - Submit data only
- **Viewers** - Read-only access

## Next Steps

After creating a project:
1. **Create Forms** - Build your survey questions
2. **Generate Links** - Create collection links for enumerators
3. **Deploy** - Start collecting data

## Tips

- Use clear, descriptive project names
- Set realistic date ranges
- Add all team members before deployment
    `,
  },

  'account-setup': {
    title: 'Setting Up Your Account',
    content: `Configure your FieldForce account for the best experience.

## Profile Settings

### Updating Your Profile
1. Click your avatar in the top-right corner
2. Select **Settings**
3. Update your information:
   - **Full Name** - Your display name
   - **Email** - Login email (cannot change)
   - **Phone** - Contact number
   - **Job Title** - Your role
   - **Department** - Your team
   - **Location** - Where you're based

### Profile Photo
1. Click **Change Photo**
2. Upload an image (JPG, PNG)
3. Crop and save

## Language & Region

### Interface Language
FieldForce supports 6 languages:
- English
- Spanish (Español)
- French (Français)
- Portuguese (Português)
- Swahili (Kiswahili)
- Arabic (العربية)

Change language in **Settings > Appearance**.

## Security Settings

### Password
- Use strong passwords (8+ characters)
- Include numbers and symbols
- Change regularly

### Two-Factor Authentication
1. Go to **Settings > Security**
2. Click **Enable 2FA**
3. Scan QR code with authenticator app
4. Enter verification code

## Notification Preferences

Control what notifications you receive:
- **Email notifications** - Submission alerts, team updates
- **Push notifications** - Real-time alerts (mobile)
- **Daily digest** - Summary of activity
    `,
  },

  // Forms & Surveys Articles
  'form-builder': {
    title: 'Using the Form Builder',
    content: `Master FieldForce's drag-and-drop form builder to create powerful surveys.

## Accessing the Form Builder

1. Navigate to **Projects > Forms**
2. Click **+ New Form**
3. Choose **Start from Scratch** or select a template

## Form Builder Interface

### Left Panel - Question Types
Drag question types from here to your form:
- **Text** - Short/long text input
- **Number** - Numeric input
- **Select One** - Single choice
- **Select Multiple** - Multiple choices
- **Date/Time** - Date and time pickers
- **GPS** - Location capture
- **Photo** - Image capture
- **Signature** - Digital signatures
- **Barcode** - Scan codes

### Center Panel - Form Canvas
Your form preview. Drag questions here and reorder.

### Right Panel - Question Properties
Configure the selected question:
- **Label** - Question text
- **Required** - Make mandatory
- **Hint** - Help text
- **Validation** - Rules and constraints

## Adding Questions

### Basic Steps
1. Drag a question type to the canvas
2. Click to select it
3. Edit properties in the right panel
4. Add more questions as needed

### Question Options (Select types)
1. Click **Add Option**
2. Enter option text
3. Reorder with drag handles
4. Delete with X button

## Form Settings

### General
- **Form Title** - Display name
- **Description** - Instructions
- **Language** - Default language

### Submission
- **Allow edits** - Can edit after submit
- **Confirmation message** - Thank you text

## Saving & Publishing

1. Click **Save** to save draft
2. Click **Preview** to test
3. Click **Publish** when ready

## Tips

- Keep forms concise (under 50 questions)
- Group related questions
- Use skip logic for conditional questions
- Test thoroughly before publishing
    `,
  },

  'question-types': {
    title: 'Question Types Guide',
    content: `Complete reference for all question types in FieldForce.

## Text Questions

### Short Text
- Single line input
- Max 255 characters
- Use for: Names, IDs, brief answers

### Long Text
- Multi-line textarea
- Max 5000 characters
- Use for: Comments, descriptions, notes

## Numeric Questions

### Number
- Integer or decimal input
- Min/max validation
- Use for: Age, quantities, measurements

### Calculate
- Formula-based field
- Auto-computes values
- Use for: Totals, scores, BMI

## Selection Questions

### Select One
- Radio buttons (single choice)
- Dropdown for many options
- Use for: Yes/No, categories, ratings

### Select Multiple
- Checkboxes (multiple choices)
- Use for: Features, symptoms, preferences

## Date & Time

### Date
- Calendar picker
- Format: YYYY-MM-DD
- Use for: Birth dates, event dates

### Time
- Time picker
- Format: HH:MM
- Use for: Schedules, durations

### Date/Time
- Combined picker
- Use for: Appointments, timestamps

## Location Questions

### GPS Point
- Captures coordinates
- Shows accuracy
- Use for: Survey location, landmarks

### GPS Shape
- Draw areas on map
- Polygon or line
- Use for: Farm boundaries, routes

## Media Questions

### Photo
- Camera capture or upload
- Compression options
- Use for: Documentation, evidence

### Audio
- Voice recording
- Max duration setting
- Use for: Interviews, notes

### Video
- Video recording
- Duration limits
- Use for: Demonstrations

## Special Questions

### Signature
- Touch/mouse drawing
- Use for: Consent, verification

### Barcode/QR
- Scan codes
- Supports multiple formats
- Use for: Asset tracking, IDs

### Matrix
- Grid of questions
- Rows and columns
- Use for: Ratings, comparisons
    `,
  },

  'skip-logic': {
    title: 'Adding Skip Logic',
    content: `Create smart forms that adapt based on user responses.

## What is Skip Logic?

Skip logic (conditional logic) shows or hides questions based on previous answers. This:
- Shortens forms for users
- Collects relevant data only
- Improves data quality

## Types of Logic

### Show/Hide Questions
Show a question only if a condition is met.

**Example**: Show "Specify other" only if "Other" is selected.

### Skip to Question
Jump to a specific question based on answer.

**Example**: If age < 18, skip to guardian consent section.

### Required Conditionally
Make a question required only in certain cases.

**Example**: Phone number required only if "Contact by phone" is selected.

## Creating Skip Logic

### Step 1: Select Question
Click the question you want to add logic to.

### Step 2: Open Logic Panel
Click **Add Logic** in the right panel.

### Step 3: Set Condition
- **If** - Select the source question
- **Operator** - Equals, Not equals, Greater than, etc.
- **Value** - The answer to check

### Step 4: Set Action
- **Show this question** - Display when condition met
- **Hide this question** - Hide when condition met
- **Skip to** - Jump to another question

### Step 5: Save
Click **Save Logic** to apply.

## Multiple Conditions

### AND Logic
All conditions must be true:
- Age > 18 AND Consent = Yes

### OR Logic  
Any condition can be true:
- Role = Doctor OR Role = Nurse

## Best Practices

1. **Plan logic before building** - Map out your form flow
2. **Keep it simple** - Avoid overly complex conditions
3. **Test thoroughly** - Check all logic paths
4. **Document logic** - Add comments for team

## Troubleshooting

**Question not showing:**
- Check condition is correct
- Verify source question has value
- Test with different answers

**Infinite loops:**
- Avoid circular references
- Check skip destinations
    `,
  },

  'form-templates': {
    title: 'Using Form Templates',
    content: `Save time with pre-built form templates.

## Available Templates

### Household Survey
- Demographics questions
- Income and assets
- Housing conditions
- 25+ questions ready to use

### Health Assessment
- Patient information
- Symptoms checklist
- Vital signs
- Medical history

### Customer Feedback
- Satisfaction ratings
- NPS score
- Open comments
- Contact info

### Employee Survey
- Job satisfaction
- Work environment
- Manager feedback
- Professional development

### Event Registration
- Attendee details
- Session preferences
- Dietary requirements
- Payment info

### Agriculture Survey
- Farm details
- Crop information
- Livestock counts
- Input usage

## Using a Template

### Step 1: Browse Templates
1. Go to **Projects > Templates**
2. Browse by category
3. Click to preview

### Step 2: Preview
Review all questions and logic before using.

### Step 3: Use Template
1. Click **Use Template**
2. Enter form name
3. Choose project
4. Click **Create**

### Step 4: Customize
- Add/remove questions
- Edit labels and options
- Modify logic
- Update settings

## Creating Your Own Templates

### Save as Template
1. Open an existing form
2. Click **More > Save as Template**
3. Enter template name
4. Add description
5. Choose category
6. Click **Save**

### Sharing Templates
Templates can be:
- **Private** - Only you can see
- **Organization** - Shared with team
- **Public** - Available to all

## Template Best Practices

1. **Start with templates** - Faster than building from scratch
2. **Customize for needs** - Templates are starting points
3. **Create organization templates** - Share common forms
4. **Version control** - Update templates periodically
    `,
  },

  // Data Collection Articles
  'offline-mode': {
    title: 'Offline Data Collection',
    content: `FieldForce works seamlessly without internet connectivity.

## How Offline Mode Works

### Automatic Caching
When you access FieldForce online:
- Forms are downloaded to your device
- Media assets are cached
- The app shell is stored locally

### Offline Submission
When offline:
1. Open forms as usual
2. Complete the survey
3. Submit - data saves locally
4. Sync happens when back online

## Setting Up Offline Mode

### Install the PWA
For best offline experience:

**On Mobile (Android/iOS)**
1. Open FieldForce in Chrome/Safari
2. Tap the "Install" or "Add to Home Screen" prompt
3. Access from your home screen

**On Desktop**
1. Click install icon in address bar
2. Or go to browser menu > Install FieldForce

### Pre-Cache Forms
Before going to field:
1. Open each form you'll need
2. Wait for "Ready for offline" indicator
3. Verify forms load without internet

## Sync Status Indicators

### Green Dot
All data synced successfully.

### Yellow Dot
Pending uploads. Data saved locally, will sync when online.

### Red Dot
Sync errors. Tap to see details and retry.

## Managing Offline Data

### Viewing Pending Submissions
1. Go to **Data > Pending**
2. See all unsynced submissions
3. Tap to view details

### Force Sync
1. Connect to internet
2. Pull down to refresh
3. Or click **Sync Now**

### Handling Conflicts
If data conflicts occur:
- Keep device version
- Keep server version  
- Merge changes

## Best Practices

1. **Sync before fieldwork** - Download latest forms
2. **Charge devices fully** - Offline uses battery
3. **Sync daily** - Don't let data pile up
4. **Check sync status** - Before leaving field

## Troubleshooting

**Data not syncing:**
- Check internet connection
- Ensure you're logged in
- Clear cache and retry
- Contact support if stuck

**Form not available offline:**
- Open form while online first
- Wait for caching to complete
- Reinstall PWA if needed
    `,
  },

  'gps-tracking': {
    title: 'GPS & Location Features',
    content: `Capture and verify locations with FieldForce GPS features.

## GPS Capabilities

### Automatic Location
- Captures coordinates when form opens
- Shows accuracy indicator
- Stores with submission

### GPS Questions
- Manual location capture
- Map picker for precision
- Multiple points per form

### Geofencing
- Restrict submissions to areas
- Verify field visits
- Quality control

## Adding GPS to Forms

### Automatic Capture
1. Open form settings
2. Enable **Auto-capture GPS**
3. Choose timing (on open/submit)

### GPS Question Type
1. Drag GPS to form
2. Configure options:
   - Accuracy threshold
   - Allow manual entry
   - Show map preview

## GPS Map View

### Viewing Submissions on Map
1. Go to **Field > GPS Map**
2. Select project/form
3. View all submission locations

### Map Features
- **Cluster view** - Group nearby points
- **Filter** - By date, form, enumerator
- **Export** - KML, GeoJSON, CSV

## Geofencing

### Creating Geofences
1. Go to **Field > Geofences**
2. Click **Create Geofence**
3. Draw boundary on map
4. Name and save

### Applying to Forms
1. Open form settings
2. Enable **Require geofence**
3. Select geofence(s)
4. Choose action (warn/block)

## Accuracy Settings

### Accuracy Levels
- **High** - Within 10 meters
- **Medium** - Within 50 meters
- **Low** - Within 100 meters

### Improving Accuracy
1. Enable GPS on device
2. Wait for accuracy to improve
3. Move to open area
4. Avoid buildings/trees

## Exporting Location Data

### Formats
- **CSV** - Spreadsheet with lat/long
- **KML** - Google Earth format
- **GeoJSON** - GIS applications

### Export Steps
1. Go to **Data > Export**
2. Select submissions
3. Choose format
4. Include GPS fields
5. Download
    `,
  },

  'pwa-install': {
    title: 'Installing the Mobile App',
    content: `Install FieldForce as a Progressive Web App (PWA) for the best mobile experience.

## What is a PWA?

A Progressive Web App gives you:
- **App-like experience** - Feels like native app
- **Offline support** - Works without internet
- **Home screen icon** - Quick access
- **Push notifications** - Stay updated
- **No app store** - Install directly from browser

## Installing on Android

### Chrome Browser
1. Open FieldForce in Chrome
2. Look for "Install" banner at bottom
3. Tap **Install**
4. Or tap menu (⋮) > **Install app**

### Samsung Internet
1. Open FieldForce
2. Tap menu > **Add page to**
3. Select **Home screen**

## Installing on iOS

### Safari Browser
1. Open FieldForce in Safari
2. Tap Share button (□↑)
3. Scroll down, tap **Add to Home Screen**
4. Tap **Add**

**Note**: iOS requires Safari for PWA installation.

## Installing on Desktop

### Chrome
1. Open FieldForce
2. Click install icon (⊕) in address bar
3. Or menu > **Install FieldForce**

### Edge
1. Open FieldForce
2. Click menu (...)
3. Select **Apps > Install FieldForce**

## After Installation

### First Launch
1. Tap FieldForce icon
2. Log in (once)
3. Grant permissions (location, camera)

### Granting Permissions
For full functionality, allow:
- **Location** - GPS features
- **Camera** - Photo questions
- **Notifications** - Sync alerts

## Updating the PWA

PWAs update automatically when online. To force update:
1. Open FieldForce
2. Pull down to refresh
3. Or clear cache in settings

## Troubleshooting

**Install option not showing:**
- Ensure HTTPS connection
- Clear browser cache
- Try different browser

**App not working offline:**
- Open while online first
- Wait for caching
- Check storage space
    `,
  },

  // Analytics Articles
  'analytics-overview': {
    title: 'Analytics Dashboard',
    content: `Get insights from your data with FieldForce analytics.

## Dashboard Overview

### Key Metrics Cards
At a glance view of:
- **Total Submissions** - All responses collected
- **Active Forms** - Currently published
- **Quality Score** - Validation pass rate
- **Team Members** - Active enumerators

### Submission Trends
Line chart showing submissions over time:
- Daily, weekly, monthly views
- Compare periods
- Identify patterns

### Status Distribution
Pie chart of submission statuses:
- **Approved** - Passed review
- **Pending** - Awaiting review
- **Rejected** - Failed validation

### Top Forms
Bar chart ranking forms by submissions.

## Filtering Data

### Date Range
- Last 7 days
- Last 30 days
- This month
- Custom range

### By Form
Select specific forms to analyze.

### By Enumerator
View individual performance.

### By Location
Filter by geographic area.

## Analytics Tabs

### Overview
Summary metrics and trends.

### Submissions
Detailed submission analysis:
- By time of day
- By day of week
- Response times

### Quality
Data quality metrics:
- Validation pass rates
- Error types
- Improvement trends

### Performance
Team performance:
- Submissions per enumerator
- Average completion time
- Quality scores by person

## Exporting Analytics

### Charts
1. Hover over chart
2. Click download icon
3. Choose PNG or PDF

### Data
1. Click **Export**
2. Select metrics
3. Choose format (Excel, CSV)
4. Download

## Tips

- Check analytics daily during active collection
- Set up automated reports
- Compare to previous periods
- Share insights with team
    `,
  },

  'export-data': {
    title: 'Exporting Your Data',
    content: `Export your submissions in various formats.

## Export Formats

### Excel (.xlsx)
- Best for business users
- Preserves formatting
- Multiple sheets for sections
- Includes charts option

### CSV
- Universal compatibility
- Lightweight files
- Works with any software
- Good for data processing

### JSON
- Structured data
- Developer-friendly
- Preserves nested data
- API-compatible

### SPSS (.sav)
- Statistical analysis ready
- Variable labels included
- For researchers
- SPSS/PSPP compatible

### PDF Report
- Printable summaries
- Charts included
- Shareable format
- Professional look

## Exporting Steps

### Basic Export
1. Go to **Data > Submissions**
2. Select submissions (or all)
3. Click **Export**
4. Choose format
5. Click **Download**

### Custom Export
1. Click **Custom Export**
2. Select columns to include
3. Apply filters (date, status)
4. Set options:
   - Include metadata
   - Split by sections
   - Add calculated fields
5. Download

## Export Options

### Column Selection
Choose which fields to export:
- Question responses
- Metadata (date, user, GPS)
- Calculated fields
- System fields

### Filtering
Export specific data:
- Date range
- Status (approved/pending)
- Form/Project
- Enumerator

### Formatting
- Include headers
- Date format
- Number format
- Language

## Scheduled Exports

### Setting Up
1. Go to **Data > Scheduled Exports**
2. Click **+ New Schedule**
3. Configure:
   - Export settings
   - Frequency (daily/weekly)
   - Recipients
4. Save

### Delivery Options
- Email attachment
- Cloud storage (Google Drive, Dropbox)
- SFTP server
- Webhook

## API Export

For developers:
- REST API available
- Bulk export endpoints
- Real-time streaming
- See API documentation
    `,
  },

  'quality-metrics': {
    title: 'Understanding Quality Scores',
    content: `Learn how FieldForce measures and tracks data quality.

## What is a Quality Score?

Quality score is a percentage indicating how many submissions pass validation rules. Higher scores mean better data quality.

## Score Components

### Completeness (40%)
- Required fields filled
- No skipped questions
- All sections complete

### Accuracy (30%)
- Values within range
- Consistent answers
- No contradictions

### Timeliness (20%)
- Submitted on time
- Reasonable duration
- Within date range

### Location (10%)
- GPS captured
- Within geofence
- Accuracy acceptable

## Validation Rules

### Built-in Rules
- Required field check
- Data type validation
- Range constraints
- Pattern matching

### Custom Rules
Create your own:
1. Go to form settings
2. Click **Validation Rules**
3. Add rule:
   - Name
   - Condition
   - Error message
4. Save

### Cross-field Validation
Check relationships:
- Age matches birth date
- End date after start date
- Total equals sum of parts

## Viewing Quality

### Submission Level
Each submission shows:
- Overall score
- Failed rules
- Warnings

### Form Level
Aggregate quality for form:
- Average score
- Common errors
- Trend over time

### Project Level
Overall project quality:
- By form comparison
- By enumerator
- Over time

## Improving Quality

### For Form Designers
1. Add appropriate validation
2. Use clear labels
3. Provide hints
4. Test thoroughly

### For Supervisors
1. Review low-score submissions
2. Identify problem patterns
3. Provide feedback
4. Update training

### For Enumerators
1. Read questions carefully
2. Double-check entries
3. Ask if unsure
4. Review before submit

## Quality Reports

### Automated Alerts
Set up alerts for:
- Score below threshold
- Specific rule failures
- Unusual patterns

### Quality Dashboard
Visual overview:
- Score distribution
- Trend analysis
- Problem areas
    `,
  },

  // Team Articles
  'team-management': {
    title: 'Managing Team Members',
    content: `Invite and manage your FieldForce team.

## Team Overview

### Viewing Team
1. Go to **Settings > Team**
2. See all members:
   - Name and email
   - Role
   - Status (active/inactive)
   - Last active

## Inviting Members

### Email Invitation
1. Click **Invite Member**
2. Enter email address
3. Select role
4. Add personal message (optional)
5. Click **Send Invite**

### Bulk Invite
1. Click **Bulk Invite**
2. Download CSV template
3. Fill in: Name, Email, Role
4. Upload file
5. Click **Send All**

### Invite Link
1. Click **Get Invite Link**
2. Copy link
3. Share via any channel
4. New users join with default role

## Managing Members

### Changing Roles
1. Click member name
2. Select new role
3. Confirm change

### Deactivating Users
1. Click member name
2. Click **Deactivate**
3. Confirm

User loses access but data preserved.

### Reactivating Users
1. Filter by "Inactive"
2. Click member name
3. Click **Reactivate**

### Removing Users
1. Click member name
2. Click **Remove from team**
3. Confirm

Permanent - reassign their work first.

## Team Activity

### Activity Log
View recent team actions:
- Logins
- Submissions
- Form changes
- Settings updates

### Performance Metrics
See per-member stats:
- Submission count
- Quality scores
- Active time

## Best Practices

1. **Use appropriate roles** - Least privilege
2. **Regular audits** - Review access
3. **Offboard promptly** - Remove departed staff
4. **Document roles** - Clear responsibilities
    `,
  },

  'roles-permissions': {
    title: 'Roles & Permissions',
    content: `Understand and configure role-based access control.

## Default Roles

### Admin
Full access to everything:
- Organization settings
- Billing management
- User management
- All data access
- Form creation/editing

### Supervisor
Manage projects and data:
- Create/edit forms
- View all submissions
- Manage team
- Export data
- Cannot access billing

### Enumerator
Submit data only:
- Access assigned forms
- Submit responses
- View own submissions
- Cannot edit forms
- Cannot see other's data

### Viewer
Read-only access:
- View submissions
- View analytics
- Cannot submit
- Cannot edit anything

## Permission Categories

### Organization
- View organization settings
- Edit organization settings
- Manage billing
- Manage integrations

### Users
- View team members
- Invite members
- Change roles
- Remove members

### Projects
- Create projects
- Edit projects
- Delete projects
- Assign members

### Forms
- Create forms
- Edit forms
- Publish forms
- Delete forms

### Data
- View submissions
- Edit submissions
- Delete submissions
- Export data

### Analytics
- View dashboards
- Create reports
- Export analytics

## Custom Roles

### Creating Custom Role
1. Go to **Settings > Roles**
2. Click **Create Role**
3. Enter role name
4. Select permissions
5. Save

### Editing Roles
1. Click role name
2. Modify permissions
3. Save changes

Changes apply to all users with that role.

### Deleting Roles
1. Click role name
2. Click **Delete**
3. Reassign users first

## Best Practices

1. **Start with defaults** - Customize if needed
2. **Least privilege** - Give minimum needed
3. **Regular review** - Audit permissions
4. **Document custom roles** - Clear definitions
    `,
  },

  'bulk-import': {
    title: 'Bulk Import Enumerators',
    content: `Import multiple enumerators at once from a spreadsheet.

## When to Use Bulk Import

- Large teams (10+ people)
- Frequent onboarding
- Migrating from other systems
- Temporary field staff

## Preparing Your File

### Download Template
1. Go to **Field > Collection Links**
2. Click **Bulk Links**
3. Click **Download Template**

### Required Columns
- **Name** - Full name
- **Email** - Valid email address

### Optional Columns
- **Phone** - Mobile number
- **Role** - Enumerator (default)
- **Language** - Preferred language
- **Region** - Geographic area

### File Format
- Excel (.xlsx) or CSV
- UTF-8 encoding for special characters
- No empty rows
- Headers in first row

## Import Process

### Step 1: Upload File
1. Click **Choose File**
2. Select your spreadsheet
3. Click **Upload**

### Step 2: Review Mapping
1. Verify column mapping
2. Fix any errors shown
3. Click **Continue**

### Step 3: Validation
System checks:
- Email format valid
- No duplicates
- Required fields present

### Step 4: Import
1. Review summary
2. Click **Import**
3. Wait for completion

## After Import

### Collection Links Created
Each enumerator gets:
- Unique collection link
- Auto-generated PIN (if enabled)
- Email notification (optional)

### Distribution
Send links via:
- **Bulk Email** - Click "Email All"
- **Export List** - Download links
- **WhatsApp** - Copy individual links

## Handling Errors

### Common Issues
- **Invalid email** - Check format
- **Duplicate email** - Already exists
- **Missing required** - Fill all columns

### Partial Import
If some fail:
1. View error details
2. Fix in spreadsheet
3. Re-import failures only

## Tips

1. **Test with small batch** - Verify before large import
2. **Clean data first** - Remove duplicates
3. **Verify emails** - Reduce bounces
4. **Save original file** - For reference
    `,
  },

  // Settings Articles
  'profile-settings': {
    title: 'Profile Settings',
    content: `Customize your FieldForce profile.

## Accessing Profile

1. Click your avatar (top-right)
2. Select **Settings**
3. Click **Profile** tab

## Personal Information

### Basic Details
- **Full Name** - Display name across app
- **Email** - Login email (read-only)
- **Phone** - Contact number
- **Job Title** - Your position
- **Department** - Your team/unit
- **Location** - City/Country

### Updating Info
1. Edit fields
2. Click **Save Changes**
3. Confirmation appears

## Profile Photo

### Uploading Photo
1. Click **Change Photo**
2. Choose file (JPG, PNG)
3. Crop as needed
4. Click **Save**

### Removing Photo
1. Click **Remove**
2. Confirm removal
3. Initials shown instead

### Photo Requirements
- Max 5MB file size
- Square recommended
- Professional image

## Display Preferences

### Name Display
Choose how your name appears:
- Full name
- First name only
- Initials

### Timezone
Select your timezone for:
- Submission timestamps
- Scheduled reports
- Notifications

## Connected Accounts

### Single Sign-On (SSO)
If enabled by organization:
- Google account
- Microsoft account
- SAML provider

### API Keys
For developers:
1. Click **API Keys**
2. Generate new key
3. Copy and secure
    `,
  },

  'notification-preferences': {
    title: 'Notification Preferences',
    content: `Control how and when FieldForce notifies you.

## Notification Types

### Email Notifications
Sent to your registered email:
- New submissions
- Team updates
- System alerts
- Weekly digests

### Push Notifications
Real-time alerts on device:
- Requires PWA installation
- Submission alerts
- Sync status
- Mentions

### In-App Notifications
Bell icon in top bar:
- All activity
- Click to view
- Mark as read

## Configuring Notifications

### Access Settings
1. Go to **Settings**
2. Click **Notifications**

### Per-Category Settings
For each notification type:
- **Email** - On/Off
- **Push** - On/Off
- **In-App** - Always on

## Notification Categories

### Submissions
- New submission received
- Submission edited
- Submission rejected
- Review requested

### Team
- New member joined
- Member role changed
- Invitation accepted

### Forms
- Form published
- Form updated
- Collection link created

### System
- Sync completed
- Storage warning
- Maintenance alerts

## Digest Settings

### Daily Digest
Summary email at end of day:
- Submission count
- Key metrics
- Action items

### Weekly Report
Weekly summary:
- Trends
- Performance
- Recommendations

### Digest Timing
Choose delivery time:
- Morning (8 AM)
- Evening (6 PM)
- Custom time

## Managing Notifications

### Muting Temporarily
- **Do Not Disturb** - Pause all
- Set duration
- Auto-resume

### Unsubscribing
Each email has unsubscribe link.
Or manage all in settings.

## Tips

1. Enable push for urgent items
2. Use digest for overview
3. Don't over-notify
4. Review periodically
    `,
  },

  'security-settings': {
    title: 'Security Settings',
    content: `Secure your FieldForce account.

## Password Security

### Password Requirements
- Minimum 8 characters
- At least one uppercase
- At least one number
- At least one symbol

### Changing Password
1. Go to **Settings > Security**
2. Click **Change Password**
3. Enter current password
4. Enter new password twice
5. Click **Update**

### Password Tips
- Use unique password
- Don't share
- Change regularly
- Use password manager

## Two-Factor Authentication

### What is 2FA?
Extra security layer requiring:
1. Your password
2. Code from your phone

### Enabling 2FA
1. Go to **Settings > Security**
2. Click **Enable 2FA**
3. Choose method:
   - Authenticator app
   - SMS (less secure)
4. Scan QR code
5. Enter verification code
6. Save backup codes

### Backup Codes
- One-time use codes
- For when phone unavailable
- Store securely
- 10 codes provided

### Disabling 2FA
1. Go to **Settings > Security**
2. Click **Disable 2FA**
3. Enter password
4. Confirm

## Active Sessions

### Viewing Sessions
See all logged-in devices:
- Device type
- Location
- Last active
- IP address

### Signing Out Sessions
1. Click session
2. Click **Sign Out**
3. Confirm

### Sign Out All
1. Click **Sign Out All Sessions**
2. You'll be logged out too
3. Re-login required

## Security Recommendations

1. **Enable 2FA** - Essential protection
2. **Strong password** - Unique and complex
3. **Review sessions** - Check regularly
4. **Secure devices** - Lock screens
5. **Report suspicious activity** - Contact support
    `,
  },

  'api-access': {
    title: 'API & Integrations',
    content: `Connect FieldForce with other systems via API.

## API Overview

### What You Can Do
- Retrieve submissions
- Create forms programmatically
- Manage users
- Trigger workflows

### Authentication
All API calls require:
- API Key (header)
- Or OAuth token

## Getting API Keys

### Generate Key
1. Go to **Settings > API**
2. Click **Generate Key**
3. Name your key
4. Set permissions
5. Copy and secure

### Key Permissions
- **Read** - View data only
- **Write** - Create/update
- **Delete** - Remove data
- **Admin** - Full access

### Revoking Keys
1. Find key in list
2. Click **Revoke**
3. Confirm

## API Endpoints

### Submissions
\`\`\`
GET /api/submissions
POST /api/submissions
GET /api/submissions/{id}
\`\`\`

### Forms
\`\`\`
GET /api/forms
POST /api/forms
PUT /api/forms/{id}
\`\`\`

### Users
\`\`\`
GET /api/users
POST /api/users/invite
\`\`\`

## Webhooks

### What are Webhooks?
Automatic notifications when events occur.

### Setting Up
1. Go to **Settings > Webhooks**
2. Click **Add Webhook**
3. Enter URL
4. Select events
5. Save

### Events
- submission.created
- submission.updated
- form.published
- user.invited

## Integrations

### Available Integrations
- Google Sheets
- Power BI
- Zapier
- Custom webhooks

### Setting Up Integration
1. Go to **Settings > Integrations**
2. Select service
3. Follow auth flow
4. Configure mapping
5. Test connection

## Rate Limits

- 1000 requests/hour (standard)
- 10000 requests/hour (enterprise)
- Bulk endpoints available

## Documentation

Full API docs available at:
**/api/docs** (Swagger UI)
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
