import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  FileText,
  Users,
  BarChart3,
  Camera,
  Navigation,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Upload,
  Plus,
  Trash2,
  Edit,
  Eye,
  Filter,
  Search,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Smartphone,
  Wifi,
  WifiOff,
  Cloud,
  Lock,
  ArrowRight,
  Play,
  Settings,
  Bell,
  Calendar,
  Globe,
  Shield,
  Zap,
  Star,
  Image,
  Mic,
  Video,
  Map,
  List,
  Grid,
  RefreshCw,
  Copy,
  Share2,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart,
  Home,
  FolderOpen,
  ClipboardList,
  UserCheck,
  MapPinned,
  X,
  ChevronLeft,
  Sparkles,
  Heart,
  Wheat,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { DEMO_INDUSTRIES, getIndustryData, INDUSTRY_LIST } from '../data/demoData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { GuidedTour, useTour, TourButton } from '../components/GuidedTour';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { PublicHeader } from '../components/PublicHeader';

// =============================================================================
// SAMPLE DATA
// =============================================================================

const SAMPLE_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Community Health Survey 2026',
    description: 'Community health assessment across 12 regions',
    status: 'active',
    submissions: 2847,
    target: 5000,
    forms: 3,
    team: 24,
    lastActivity: '2 hours ago',
    color: 'emerald'
  },
  {
    id: 'proj-2',
    name: 'Agricultural Census - Valley Region',
    description: 'Crop yield and farmer livelihood survey',
    status: 'active',
    submissions: 1523,
    target: 3000,
    forms: 2,
    team: 15,
    lastActivity: '30 mins ago',
    color: 'amber'
  },
  {
    id: 'proj-3',
    name: 'School Enrollment Verification',
    description: 'Primary school enrollment audit',
    status: 'completed',
    submissions: 892,
    target: 900,
    forms: 1,
    team: 8,
    lastActivity: '3 days ago',
    color: 'sky'
  }
];

const SAMPLE_FORMS = [
  {
    id: 'form-1',
    name: 'Household Health Assessment',
    project: 'Community Health Survey 2026',
    questions: 45,
    submissions: 1847,
    status: 'active',
    lastModified: 'Today',
    version: '2.3'
  },
  {
    id: 'form-2',
    name: 'Vaccination Record',
    project: 'Community Health Survey 2026',
    questions: 28,
    submissions: 623,
    status: 'active',
    lastModified: 'Yesterday',
    version: '1.5'
  },
  {
    id: 'form-3',
    name: 'Facility Checklist',
    project: 'Community Health Survey 2026',
    questions: 62,
    submissions: 377,
    status: 'draft',
    lastModified: '3 days ago',
    version: '3.0'
  },
  {
    id: 'form-4',
    name: 'Crop Assessment Form',
    project: 'Agricultural Census - Valley Region',
    questions: 35,
    submissions: 1102,
    status: 'active',
    lastModified: 'Today',
    version: '1.2'
  }
];

const SAMPLE_SUBMISSIONS = [
  {
    id: 'sub-1',
    form: 'Household Health Assessment',
    respondent: 'HH-REG-0847',
    enumerator: 'Sarah Johnson',
    location: 'Metro District, Zone A',
    gps: '40.7128, -74.0060',
    status: 'validated',
    timestamp: '2026-02-10 14:23',
    hasMedia: true,
    mediaCount: 3
  },
  {
    id: 'sub-2',
    form: 'Vaccination Record',
    respondent: 'VAC-REG-1293',
    enumerator: 'Michael Chen',
    location: 'Coastal Region, Sector B',
    gps: '34.0522, -118.2437',
    status: 'pending',
    timestamp: '2026-02-10 14:15',
    hasMedia: false,
    mediaCount: 0
  },
  {
    id: 'sub-3',
    form: 'Crop Assessment Form',
    respondent: 'FARM-VAL-0234',
    enumerator: 'Emma Rodriguez',
    location: 'Valley North, Area C',
    gps: '41.8781, -87.6298',
    status: 'validated',
    timestamp: '2026-02-10 13:58',
    hasMedia: true,
    mediaCount: 5
  },
  {
    id: 'sub-4',
    form: 'Household Health Assessment',
    respondent: 'HH-LAK-0562',
    enumerator: 'David Park',
    location: 'Lakeside, District D',
    gps: '29.7604, -95.3698',
    status: 'flagged',
    timestamp: '2026-02-10 13:42',
    hasMedia: true,
    mediaCount: 2
  },
  {
    id: 'sub-5',
    form: 'Facility Checklist',
    respondent: 'FAC-CTR-0089',
    enumerator: 'Lisa Anderson',
    location: 'Central Hub, Zone E',
    gps: '33.4484, -112.0740',
    status: 'validated',
    timestamp: '2026-02-10 12:30',
    hasMedia: true,
    mediaCount: 8
  }
];

const SAMPLE_TEAM = [
  { id: 1, name: 'Sarah Johnson', role: 'Enumerator', status: 'online', submissions: 127, location: 'Metro District' },
  { id: 2, name: 'Michael Chen', role: 'Enumerator', status: 'online', submissions: 98, location: 'Coastal Region' },
  { id: 3, name: 'Emma Rodriguez', role: 'Supervisor', status: 'online', submissions: 45, location: 'Valley North' },
  { id: 4, name: 'David Park', role: 'Enumerator', status: 'offline', submissions: 112, location: 'Lakeside' },
  { id: 5, name: 'Lisa Anderson', role: 'Enumerator', status: 'online', submissions: 89, location: 'Central Hub' },
  { id: 6, name: 'James Wilson', role: 'QA Reviewer', status: 'online', submissions: 0, location: 'Metro District' },
];

const SAMPLE_GPS_POINTS = [
  { id: 1, lat: 40.7128, lng: -74.0060, label: 'Metro Central', count: 234 },
  { id: 2, lat: 34.0522, lng: -118.2437, label: 'Coastal Region', count: 156 },
  { id: 3, lat: 41.8781, lng: -87.6298, label: 'Lakeside District', count: 189 },
  { id: 4, lat: 29.7604, lng: -95.3698, label: 'Southern Hub', count: 98 },
  { id: 5, lat: 33.4484, lng: -112.0740, label: 'Valley Region', count: 145 },
];

const SAMPLE_PHOTOS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300', caption: 'Health facility exterior', form: 'Facility Checklist' },
  { id: 2, url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300', caption: 'Vaccination station', form: 'Vaccination Record' },
  { id: 3, url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=300', caption: 'Field assessment', form: 'Crop Assessment' },
  { id: 4, url: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300', caption: 'Community meeting', form: 'Household Assessment' },
  { id: 5, url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=300', caption: 'Medical supplies', form: 'Facility Checklist' },
  { id: 6, url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300', caption: 'Farm equipment', form: 'Crop Assessment' },
];

// =============================================================================
// COMPONENTS
// =============================================================================

// Demo Banner Component with pulse animation
const DemoBanner = ({ onStartTrial }) => (
  <motion.div 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] animate-gradient text-white py-3 px-4 relative overflow-hidden"
  >
    {/* Shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
    
    <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div 
          className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Play className="w-4 h-4" />
        </motion.div>
        <span className="text-sm font-medium">
          You're viewing an interactive demo with sample data
        </span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          size="sm" 
          onClick={onStartTrial}
          className="bg-white text-violet-600 hover:bg-violet-50 shadow-lg shadow-black/20"
        >
          Start Free Trial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  </motion.div>
);

// Locked Feature Button
const LockedButton = ({ children, icon: Icon, variant = 'outline', size = 'default' }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} className="opacity-60 cursor-not-allowed" disabled>
          {Icon && <Icon className="w-4 h-4 mr-2" />}
          {children}
          <Lock className="w-3 h-3 ml-2 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Sign up to unlock this feature
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

// Stats Card
const StatCard = ({ icon: Icon, label, value, change, changeType, color, onClick }) => (
  <Card 
    className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-${color}-500/10`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
        {change && (
          <Badge variant={changeType === 'up' ? 'default' : 'secondary'} className="text-xs">
            {changeType === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {change}
          </Badge>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

// Detail Modal Component
const DetailModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[800px] md:max-h-[80vh] bg-background rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {children}
          </div>
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Sign up to access full functionality
              </p>
              <Button onClick={onClose}>
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// Submission Detail Content
const SubmissionDetail = ({ submission }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Form</p>
        <p className="font-medium">{submission.form}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Respondent ID</p>
        <p className="font-mono">{submission.respondent}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Enumerator</p>
        <p className="font-medium">{submission.enumerator}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Location</p>
        <p className="font-medium">{submission.location}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">GPS Coordinates</p>
        <p className="font-mono text-sm">{submission.gps}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Status</p>
        <Badge variant={submission.status === 'validated' ? 'default' : submission.status === 'flagged' ? 'destructive' : 'secondary'}>
          {submission.status}
        </Badge>
      </div>
    </div>
    
    {submission.hasMedia && (
      <div>
        <p className="text-sm text-muted-foreground mb-2">Attached Media ({submission.mediaCount} files)</p>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].slice(0, submission.mediaCount).map(i => (
            <div key={i} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    )}
    
    <div>
      <p className="text-sm text-muted-foreground mb-2">Sample Responses</p>
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-sm">Household Size</span>
          <span className="font-medium">5</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Water Source</span>
          <span className="font-medium">Protected Well</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Vaccination Status</span>
          <span className="font-medium">Complete</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm">Monthly Income</span>
          <span className="font-medium">KES 25,000</span>
        </div>
      </div>
    </div>
  </div>
);

// Project Detail Content
const ProjectDetail = ({ project }) => (
  <div className="space-y-6">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl bg-${project.color}-500/10`}>
        <FolderOpen className={`w-8 h-8 text-${project.color}-500`} />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold">{project.name}</h3>
        <p className="text-muted-foreground">{project.description}</p>
      </div>
      <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="text-sm">
        {project.status}
      </Badge>
    </div>
    
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{project.submissions.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Submissions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{project.target.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Target</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{project.forms}</p>
          <p className="text-sm text-muted-foreground">Forms</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{project.team}</p>
          <p className="text-sm text-muted-foreground">Team Members</p>
        </CardContent>
      </Card>
    </div>
    
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span>Progress</span>
        <span className="font-medium">{Math.round((project.submissions / project.target) * 100)}%</span>
      </div>
      <Progress value={(project.submissions / project.target) * 100} className="h-3" />
    </div>
    
    <div>
      <p className="text-sm text-muted-foreground mb-2">Recent Activity</p>
      <div className="space-y-2">
        {[
          { action: '12 submissions synced', user: 'Sarah Johnson', time: '2 mins ago' },
          { action: 'Form updated', user: 'Admin', time: '1 hour ago' },
          { action: '45 submissions validated', user: 'QA Team', time: '3 hours ago' },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">{item.action}</p>
              <p className="text-xs text-muted-foreground">by {item.user}</p>
            </div>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Form Detail Content
const FormDetail = ({ form }) => (
  <div className="space-y-6">
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-xl bg-primary/10">
        <ClipboardList className="w-8 h-8 text-primary" />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold">{form.name}</h3>
        <p className="text-muted-foreground">{form.project}</p>
      </div>
      <Badge variant={form.status === 'active' ? 'default' : 'secondary'} className="text-sm">
        {form.status}
      </Badge>
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{form.questions}</p>
          <p className="text-sm text-muted-foreground">Questions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{form.submissions.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Submissions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">v{form.version}</p>
          <p className="text-sm text-muted-foreground">Version</p>
        </CardContent>
      </Card>
    </div>
    
    <div>
      <p className="text-sm text-muted-foreground mb-2">Sample Questions</p>
      <div className="space-y-2">
        {[
          { type: 'Text', label: 'Respondent Name', required: true },
          { type: 'Select', label: 'Region', required: true },
          { type: 'Number', label: 'Household Size', required: true },
          { type: 'GPS', label: 'Location', required: true },
          { type: 'Photo', label: 'Photo Evidence', required: false },
        ].map((q, i) => (
          <div key={i} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs">{q.type}</Badge>
              <span className="text-sm">{q.label}</span>
            </div>
            {q.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
          </div>
        ))}
      </div>
    </div>
    
    <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
      <span>Last modified: {form.lastModified}</span>
      <span>Version: {form.version}</span>
    </div>
  </div>
);

// Team Member Detail Content
const TeamMemberDetail = ({ member }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-2xl font-semibold text-primary">
            {member.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background ${
          member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
        }`} />
      </div>
      <div>
        <h3 className="text-xl font-semibold">{member.name}</h3>
        <p className="text-muted-foreground">{member.role}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{member.submissions}</p>
          <p className="text-sm text-muted-foreground">Submissions</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-2xl font-bold capitalize">{member.status}</p>
          <p className="text-sm text-muted-foreground">Status</p>
        </CardContent>
      </Card>
    </div>
    
    <div>
      <p className="text-sm text-muted-foreground mb-2">Location</p>
      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span>{member.location}</span>
      </div>
    </div>
    
    <div>
      <p className="text-sm text-muted-foreground mb-2">Recent Activity</p>
      <div className="space-y-2">
        {[
          { action: 'Submitted form', detail: 'Household Survey', time: '2 hours ago' },
          { action: 'Synced data', detail: '15 submissions', time: '3 hours ago' },
          { action: 'Started session', detail: 'Logged in', time: '4 hours ago' },
        ].map((activity, i) => (
          <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-muted-foreground">{activity.detail}</p>
            </div>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Dashboard Tab
const DashboardTab = ({ onViewSubmissions, onViewTeam, onViewProject, industryData }) => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={FileText} 
        label="Total Submissions" 
        value={industryData.stats.totalSubmissions.toLocaleString()} 
        change="+12%" 
        changeType="up" 
        color="sky"
        onClick={onViewSubmissions}
      />
      <StatCard 
        icon={Users} 
        label="Active Enumerators" 
        value={industryData.stats.activeEnumerators.toString()} 
        change="+3" 
        changeType="up" 
        color="emerald"
        onClick={onViewTeam}
      />
      <StatCard 
        icon={CheckCircle2} 
        label="Validated" 
        value={industryData.stats.validated.toLocaleString()} 
        change="93%" 
        changeType="up" 
        color="violet"
        onClick={onViewSubmissions}
      />
      <StatCard 
        icon={AlertCircle} 
        label="Pending Review" 
        value={industryData.stats.pendingReview.toString()} 
        change="-8%" 
        changeType="down" 
        color="amber"
        onClick={onViewSubmissions}
      />
    </div>

    {/* Projects Grid */}
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Active Projects</h3>
        <LockedButton icon={Plus}>New Project</LockedButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {industryData.projects.map((project) => (
          <Card 
            key={project.id} 
            className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onViewProject(project)}
            data-testid={`project-card-${project.id}`}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-${project.color}-500/10`}>
                  <FolderOpen className={`w-5 h-5 text-${project.color}-500`} />
                </div>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
              <h4 className="font-semibold mb-1">{project.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round((project.submissions / project.target) * 100)}%</span>
                </div>
                <Progress value={(project.submissions / project.target) * 100} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{project.submissions.toLocaleString()} submissions</span>
                  <span>Target: {project.target.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {project.forms} forms
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {project.team} team
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{project.lastActivity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>

    {/* Recent Activity */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {industryData.activity.map((activity, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-${activity.color}-500/10`}>
                <Upload className={`w-4 h-4 text-${activity.color}-500`} />
              </div>
              <div className="flex-1">
                <p className="text-sm">{activity.text}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Forms Tab
const FormsTab = ({ onViewForm, industryData }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Input placeholder="Search forms..." className="w-64" />
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>
      <LockedButton icon={Plus}>Create Form</LockedButton>
    </div>

    <div className="grid gap-4">
      {industryData.forms.map((form) => (
        <Card 
          key={form.id} 
          className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
          onClick={() => onViewForm(form)}
          data-testid={`form-card-${form.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{form.name}</h4>
                  <p className="text-sm text-muted-foreground">{form.project}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-lg font-semibold">{form.questions}</p>
                  <p className="text-xs text-muted-foreground">Questions</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{form.submissions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Submissions</p>
                </div>
                <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
                  {form.status}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onViewForm(form); }}
                    data-testid={`view-form-${form.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" disabled className="opacity-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sign up to edit forms</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onViewForm(form)}>
                        <Eye className="w-4 h-4 mr-2" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                        <Lock className="w-3 h-3 ml-auto" />
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <Download className="w-4 h-4 mr-2" /> Export
                        <Lock className="w-3 h-3 ml-auto" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Submissions Tab
const SubmissionsTab = ({ onViewSubmission, industryData }) => {
  const [viewMode, setViewMode] = useState('table');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Input placeholder="Search submissions..." className="w-64" />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
          <LockedButton icon={Download} size="sm">Export</LockedButton>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form</TableHead>
              <TableHead>Respondent ID</TableHead>
              <TableHead>Enumerator</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {industryData.submissions.map((sub) => (
              <TableRow 
                key={sub.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onViewSubmission(sub)}
                data-testid={`submission-row-${sub.id}`}
              >
                <TableCell className="font-medium">{sub.form}</TableCell>
                <TableCell className="font-mono text-sm">{sub.respondent}</TableCell>
                <TableCell>{sub.enumerator}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{sub.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {sub.hasMedia ? (
                    <Badge variant="outline" className="gap-1">
                      <Camera className="w-3 h-3" /> {sub.mediaCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={sub.status === 'validated' ? 'default' : sub.status === 'flagged' ? 'destructive' : 'secondary'}
                  >
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{sub.timestamp}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); onViewSubmission(sub); }}
                    data-testid={`view-submission-${sub.id}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Showing 5 of 5,262 submissions</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
};

// Team Tab
const TeamTab = ({ onViewMember, industryData }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Input placeholder="Search team members..." className="w-64" />
      <LockedButton icon={Plus}>Invite Member</LockedButton>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {industryData.team.map((member) => (
        <Card 
          key={member.id}
          className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
          onClick={() => onViewMember(member)}
          data-testid={`team-member-${member.id}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                    member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onViewMember(member)}>View Profile</DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    Edit Permissions <Lock className="w-3 h-3 ml-auto" />
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="text-destructive">
                    Remove <Lock className="w-3 h-3 ml-auto" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-3 h-3" /> {member.location}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium">{member.submissions}</span>
                <span className="text-muted-foreground">submissions</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Map Tab
const MapTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" /> Filter by Form
        </Button>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" /> Date Range
        </Button>
      </div>
      <LockedButton icon={Download}>Export GPS Data</LockedButton>
    </div>

    <Card className="overflow-hidden">
      <div className="relative h-[500px] bg-slate-800">
        {/* Simulated Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
          {/* Map Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Region Label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-slate-600 text-[200px] font-bold opacity-20">MAP</div>
          </div>
          
          {/* GPS Points */}
          {SAMPLE_GPS_POINTS.map((point, idx) => (
            <motion.div
              key={point.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="absolute"
              style={{
                left: `${20 + idx * 15}%`,
                top: `${25 + (idx % 3) * 20}%`,
              }}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="relative">
                      <div className="absolute -inset-4 bg-sky-500/20 rounded-full animate-ping" />
                      <div className="relative w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                        {point.count}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{point.label}</p>
                    <p className="text-xs text-muted-foreground">{point.count} submissions</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          ))}
        </div>
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button variant="secondary" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon">
            <span className="text-lg">−</span>
          </Button>
        </div>
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur rounded-lg p-4">
          <p className="text-sm font-semibold mb-2">Submission Clusters</p>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500" />
              <span>Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Completed</span>
            </div>
          </div>
        </div>
      </div>
    </Card>

    {/* Location Summary */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {SAMPLE_GPS_POINTS.map((point) => (
        <Card key={point.id}>
          <CardContent className="p-4 text-center">
            <p className="font-semibold">{point.label}</p>
            <p className="text-2xl font-bold text-primary">{point.count}</p>
            <p className="text-xs text-muted-foreground">submissions</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Media Tab
const MediaTab = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline">
          <Image className="w-4 h-4 mr-2" /> Photos
        </Button>
        <Button variant="outline">
          <Mic className="w-4 h-4 mr-2" /> Audio
        </Button>
        <Button variant="outline">
          <Video className="w-4 h-4 mr-2" /> Video
        </Button>
      </div>
      <LockedButton icon={Download}>Download All</LockedButton>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {SAMPLE_PHOTOS.map((photo) => (
        <motion.div
          key={photo.id}
          whileHover={{ scale: 1.02 }}
          className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
        >
          <img 
            src={photo.url} 
            alt={photo.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-medium truncate">{photo.caption}</p>
              <p className="text-white/70 text-xs">{photo.form}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    <Card>
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">2,847 Media Files</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Photos, audio recordings, and videos from field submissions
        </p>
        <LockedButton icon={Download}>Export Media Gallery</LockedButton>
      </CardContent>
    </Card>
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InteractiveDemoPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Modal states for detail views
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);
  
  // Industry selection state
  const [selectedIndustry, setSelectedIndustry] = useState('healthcare');
  const [showIndustrySelector, setShowIndustrySelector] = useState(false);
  const industryData = getIndustryData(selectedIndustry);
  
  // Guided tour state
  const tourState = useTour();
  
  // Icon mapping for industries
  const industryIcons = {
    healthcare: Heart,
    agriculture: Wheat,
    education: GraduationCap
  };
  
  // Track previous tab for directional animations
  const [prevTabIndex, setPrevTabIndex] = useState(0);
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'forms', label: 'Forms', icon: ClipboardList },
    { id: 'submissions', label: 'Submissions', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'map', label: 'GPS Map', icon: MapPinned },
    { id: 'media', label: 'Media', icon: Camera },
  ];
  
  // Get current tab index for animation direction
  const currentTabIndex = navItems.findIndex(item => item.id === activeTab);
  const slideDirection = currentTabIndex > prevTabIndex ? 1 : -1;
  
  // Handle tab switching with direction tracking
  const handleTabChange = (tabId) => {
    const newIndex = navItems.findIndex(item => item.id === tabId);
    setPrevTabIndex(currentTabIndex);
    setActiveTab(tabId);
  };
  
  // Handle switching tabs based on stats card clicks
  const handleViewSubmissions = () => handleTabChange('submissions');
  const handleViewTeam = () => handleTabChange('team');
  const handleViewForms = () => handleTabChange('forms');
  
  // Animation variants for tab content
  const tabVariants = {
    initial: (direction) => ({
      opacity: 0,
      x: direction * 60,
      scale: 0.98,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        staggerChildren: 0.08,
      },
    },
    exit: (direction) => ({
      opacity: 0,
      x: direction * -60,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    }),
  };
  
  // Staggered children animation for cards/items
  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  // Get the current industry icon component
  const CurrentIndustryIcon = industryIcons[selectedIndustry];

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Page Header */}
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/demo')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Back to Demo</span>
              </button>
              <div className="h-6 w-px bg-slate-700" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-white hidden sm:inline">FieldForce</span>
              </div>
              <div className="h-6 w-px bg-slate-700 hidden sm:block" />
              {/* Industry Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowIndustrySelector(!showIndustrySelector)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                    showIndustrySelector 
                      ? 'bg-slate-700 border-slate-600' 
                      : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <CurrentIndustryIcon className={`w-4 h-4 text-${industryData.color}-400`} />
                  <span className="text-sm text-white">{industryData.name}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showIndustrySelector ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showIndustrySelector && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <p className="text-xs text-slate-400 px-2 py-1.5 uppercase tracking-wider">Select Industry Demo</p>
                        {INDUSTRY_LIST.map((industry) => {
                          const Icon = industryIcons[industry.id];
                          return (
                            <button
                              key={industry.id}
                              onClick={() => {
                                setSelectedIndustry(industry.id);
                                setShowIndustrySelector(false);
                              }}
                              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-all ${
                                selectedIndustry === industry.id
                                  ? `bg-${industry.color}-500/20 border border-${industry.color}-500/30`
                                  : 'hover:bg-slate-700/50'
                              }`}
                            >
                              <div className={`p-2 rounded-lg bg-${industry.color}-500/20`}>
                                <Icon className={`w-4 h-4 text-${industry.color}-400`} />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-white">{industry.name}</p>
                                <p className="text-xs text-slate-400">{industry.description}</p>
                              </div>
                              {selectedIndustry === industry.id && (
                                <CheckCircle2 className={`w-4 h-4 text-${industry.color}-400 mt-1`} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Tour Button - show when tour has been completed */}
              {tourState.hasSeenTour && (
                <TourButton 
                  onClick={tourState.startTour}
                  className="hidden sm:flex"
                />
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/25"
                >
                  <span className="hidden sm:inline">Start Free Trial</span>
                  <span className="sm:hidden">Start Trial</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Guided Tour */}
        <GuidedTour tourState={tourState} />

        {/* Click outside to close industry selector */}
        {showIndustrySelector && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowIndustrySelector(false)}
          />
        )}

        {/* Demo Container */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto">
            {/* Browser Window Frame */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="rounded-xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-700/50"
            >
              {/* Window Title Bar */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  {/* Window Controls */}
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer" />
                  </div>
                  {/* URL Bar */}
                  <div className="hidden sm:flex items-center gap-2 bg-slate-900/50 rounded-lg px-3 py-1.5 min-w-[300px]">
                    <Lock className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs text-slate-400">app.fieldforce.io/dashboard</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Demo
                  </Badge>
                </div>
              </div>

              {/* Demo Content Area */}
              <div className="bg-background">
                {/* Demo Banner inside window */}
                <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_100%] animate-gradient text-white py-2 px-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <motion.div 
                      className="p-1 bg-white/20 rounded"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <Play className="w-3 h-3" />
                    </motion.div>
                    <span className="text-xs font-medium">
                      {industryData.bannerText} — Actions like save & export are disabled
                    </span>
                  </div>
                </div>
        
                {/* Main Layout */}
                <div className="flex" style={{ height: 'calc(100vh - 180px)', minHeight: '600px' }}>
                  {/* Sidebar */}
                  <aside className={`${sidebarOpen ? 'w-56' : 'w-16'} bg-card border-r flex flex-col transition-all duration-300`}>
                    {/* Logo */}
                    <div className="p-3 border-b">
                      <motion.div 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
                          <MapPin className="w-4 h-4 text-white" />
                        </div>
                        {sidebarOpen && <span className="font-bold text-sm">FieldForce</span>}
                      </motion.div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                      {navItems.map((item, index) => (
                        <motion.button
                          key={item.id}
                          onClick={() => handleTabChange(item.id)}
                          className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 relative overflow-hidden text-sm ${
                            activeTab === item.id 
                              ? 'text-primary-foreground' 
                              : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          whileHover={{ x: 2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {activeTab === item.id && (
                            <motion.div
                              layoutId="activeTabBg"
                              className="absolute inset-0 bg-primary rounded-lg"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                          )}
                          <item.icon className="w-4 h-4 relative z-10" />
                          {sidebarOpen && <span className="relative z-10">{item.label}</span>}
                        </motion.button>
                      ))}
                    </nav>

                    {/* Bottom Section */}
                    {sidebarOpen && (
                      <div className="p-3 border-t">
                        <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/30">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-violet-400" />
                              <span className="text-xs font-semibold text-violet-300">Demo Mode</span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              Unlock all features with a free trial
                            </p>
                            <Button 
                              size="sm" 
                              className="w-full bg-violet-500 hover:bg-violet-600 text-xs h-7"
                              onClick={() => navigate('/register')}
                            >
                              Start Free Trial
                            </Button>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </aside>

                  {/* Main Content */}
                  <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Header with animated title */}
                    <div className="px-4 py-3 border-b bg-card/50">
                      <div className="flex items-center justify-between">
                        <div className="overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.h1 
                              key={activeTab}
                              className="text-lg font-bold capitalize"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                            >
                              {activeTab === 'map' ? 'GPS Map' : activeTab}
                            </motion.h1>
                          </AnimatePresence>
                        </div>
                        <div className="flex items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" disabled className="opacity-50 h-8">
                                  <Bell className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sign up to enable notifications</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" disabled className="opacity-50 h-8">
                                  <Settings className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Sign up to access settings</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Tab Content with Enhanced Animations */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <AnimatePresence mode="wait" custom={slideDirection}>
                        <motion.div
                          key={activeTab}
                          custom={slideDirection}
                          variants={tabVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                        >
                          {activeTab === 'dashboard' && (
                            <DashboardTab 
                              onViewSubmissions={handleViewSubmissions}
                              onViewTeam={handleViewTeam}
                              onViewProject={setSelectedProject}
                              industryData={industryData}
                            />
                          )}
                          {activeTab === 'forms' && (
                            <FormsTab onViewForm={setSelectedForm} industryData={industryData} />
                          )}
                          {activeTab === 'submissions' && (
                            <SubmissionsTab onViewSubmission={setSelectedSubmission} industryData={industryData} />
                          )}
                          {activeTab === 'team' && (
                            <TeamTab onViewMember={setSelectedTeamMember} industryData={industryData} />
                          )}
                          {activeTab === 'map' && <MapTab />}
                          {activeTab === 'media' && <MediaTab />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </main>
                </div>
              </div>
            </motion.div>

            {/* Bottom info */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-slate-500">
                This is a fully interactive preview with sample data. 
                <button 
                  onClick={() => navigate('/register')}
                  className="text-sky-400 hover:text-sky-300 ml-1 underline underline-offset-2"
                >
                  Start your free trial
                </button>
                {' '}to connect your own data.
              </p>
            </motion.div>
          </div>
        </div>
        
        {/* Detail Modals */}
        <DetailModal 
          isOpen={!!selectedSubmission} 
          onClose={() => setSelectedSubmission(null)}
          title="Submission Details"
        >
          {selectedSubmission && <SubmissionDetail submission={selectedSubmission} />}
        </DetailModal>
        
        <DetailModal 
          isOpen={!!selectedProject} 
          onClose={() => setSelectedProject(null)}
          title="Project Details"
        >
          {selectedProject && <ProjectDetail project={selectedProject} />}
        </DetailModal>
        
        <DetailModal 
          isOpen={!!selectedForm} 
          onClose={() => setSelectedForm(null)}
          title="Form Details"
        >
          {selectedForm && <FormDetail form={selectedForm} />}
        </DetailModal>
        
        <DetailModal 
          isOpen={!!selectedTeamMember} 
          onClose={() => setSelectedTeamMember(null)}
          title="Team Member"
        >
          {selectedTeamMember && <TeamMemberDetail member={selectedTeamMember} />}
        </DetailModal>
      </div>
    </TooltipProvider>
  );
}

export default InteractiveDemoPage;
