import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Building2,
  Bell,
  Globe,
  Palette,
  Shield,
  Key,
  Save,
  Moon,
  Sun,
  Check,
  Download,
  Database,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  Webhook,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Monitor,
  Smartphone,
  Laptop,
  Lock,
  LogOut,
  HardDrive,
  Clock,
  MapPin,
  UserX,
  CreditCard,
  Mail,
  Phone,
  Camera,
  MessageSquare,
  Edit2,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { useAuthStore, useOrgStore, useUIStore } from '../store';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

// Sidebar navigation items
const settingsNav = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Your personal information' },
  { id: 'account', label: 'Account', icon: Settings, description: 'Account settings and preferences' },
  { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email and push notifications' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password and authentication' },
  { id: 'templates', label: 'Message Templates', icon: MessageSquare, description: 'Sharing message templates' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Subscription and payments' },
  { id: 'organization', label: 'Organization', icon: Building2, description: 'Organization settings' },
  { id: 'api', label: 'API & Integrations', icon: Key, description: 'API keys and webhooks' },
];

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function SettingsPage() {
  const { user, token, logout } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const { theme, setTheme, language, setLanguage } = useUIStore();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [saving, setSaving] = useState(false);
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || 'Demo User',
    email: user?.email || 'demo@fieldforce.io',
    phone: '+1 234 567 8900',
    jobTitle: 'Field Coordinator',
    department: 'Data Collection',
    location: 'Nairobi, Kenya',
  });
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailSubmissions: true,
    emailReviews: true,
    emailDigest: false,
    pushEnabled: true,
    soundEnabled: true,
    desktopNotifications: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginAlerts: true,
  });

  // Organization settings
  const [orgSettings, setOrgSettings] = useState({
    requireGPS: true,
    autoApprove: false,
    duplicateDetection: true,
    require2FA: false,
    autoApproveThreshold: 90,
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // API settings
  const [apiKey, setApiKey] = useState('ff_sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [showApiKey, setShowApiKey] = useState(false);

  // Mock billing data
  const [billingInfo] = useState({
    plan: 'Pro',
    price: '$189/month',
    nextBilling: '2026-03-01',
    submissions: { used: 3247, limit: 5000 },
    storage: { used: 12.5, limit: 25 },
  });

  // Connected devices
  const [connectedDevices, setConnectedDevices] = useState([
    { id: '1', name: 'MacBook Pro', type: 'laptop', location: 'Nairobi, Kenya', lastActive: new Date(), current: true },
    { id: '2', name: 'iPhone 14', type: 'mobile', location: 'Nairobi, Kenya', lastActive: new Date(Date.now() - 86400000), current: false },
  ]);

  // Message templates state
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'whatsapp',
    subject: '',
    body: '',
    scope: 'user'
  });

  // Load templates when templates section is active
  React.useEffect(() => {
    if (activeSection === 'templates') {
      loadTemplates();
    }
  }, [activeSection]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const res = await fetch(`${API_URL}/api/message-templates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.body.trim()) {
      toast.error('Please fill in name and message body');
      return;
    }

    try {
      const url = editingTemplate 
        ? `${API_URL}/api/message-templates/${editingTemplate.id}`
        : `${API_URL}/api/message-templates`;
      
      const method = editingTemplate ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateForm)
      });

      if (res.ok) {
        toast.success(editingTemplate ? 'Template updated' : 'Template created');
        setShowTemplateEditor(false);
        setEditingTemplate(null);
        setTemplateForm({ name: '', type: 'whatsapp', subject: '', body: '', scope: 'user' });
        loadTemplates();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to save template');
      }
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const res = await fetch(`${API_URL}/api/message-templates/${templateId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success('Template deleted');
        loadTemplates();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to delete template');
      }
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const openTemplateEditor = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        type: template.type,
        subject: template.subject || '',
        body: template.body,
        scope: template.scope
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({ name: '', type: 'whatsapp', subject: '', body: '', scope: 'user' });
    }
    setShowTemplateEditor(true);
  };

  // Handlers
  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Password changed successfully');
    setPasswordForm({ current: '', new: '', confirm: '' });
    setSaving(false);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerateApiKey = () => {
    const newKey = `ff_sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    toast.success('API key regenerated');
  };

  const handleRevokeDevice = (deviceId) => {
    setConnectedDevices(connectedDevices.filter(d => d.id !== deviceId));
    toast.success('Device session revoked');
  };

  const getDeviceIcon = (type) => {
    switch (type) {
      case 'mobile': return Smartphone;
      case 'laptop': return Laptop;
      default: return Monitor;
    }
  };

  const formatLastActive = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Active now';
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(diff / 86400000)} days ago`;
  };

  // Render active section content
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Profile</h2>
              <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            {/* Avatar Section */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{profile.name}</h3>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={profile.jobTitle}
                      onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Account</h2>
              <p className="text-muted-foreground">Manage your account settings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your preferred language and timezone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="EAT">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EAT">East Africa Time (EAT)</SelectItem>
                        <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                        <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <UserX className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/30 rounded-lg bg-destructive/5">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. All your data will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Appearance</h2>
              <p className="text-muted-foreground">Customize the look and feel</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose your preferred color scheme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Sun className="w-5 h-5" />
                      <span className="font-medium">Light</span>
                      {theme === 'light' && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                    <div className="mt-3 h-16 rounded bg-white border border-gray-200" />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5" />
                      <span className="font-medium">Dark</span>
                      {theme === 'dark' && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                    <div className="mt-3 h-16 rounded bg-gray-900 border border-gray-700" />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce spacing for denser display</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
              <p className="text-muted-foreground">Configure how you receive notifications</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Submissions</Label>
                    <p className="text-sm text-muted-foreground">Get notified when data is submitted</p>
                  </div>
                  <Switch 
                    checked={notifications.emailSubmissions}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailSubmissions: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Review Requests</Label>
                    <p className="text-sm text-muted-foreground">Notify when submissions need review</p>
                  </div>
                  <Switch 
                    checked={notifications.emailReviews}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailReviews: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Summary sent every Monday</p>
                  </div>
                  <Switch 
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">Show browser notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.desktopNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, desktopNotifications: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound</Label>
                    <p className="text-sm text-muted-foreground">Play sound for new notifications</p>
                  </div>
                  <Switch 
                    checked={notifications.soundEnabled}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, soundEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Security</h2>
              <p className="text-muted-foreground">Manage your account security</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleChangePassword} disabled={saving}>
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">
                      Use authenticator app for login verification
                    </p>
                  </div>
                  <Switch 
                    checked={securitySettings.twoFactorEnabled}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Devices with access to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {connectedDevices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  return (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <DeviceIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{device.name}</p>
                            {device.current && (
                              <Badge className="bg-green-500/10 text-green-500 text-xs">Current</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{device.location}</span>
                            <span>•</span>
                            <span>{formatLastActive(device.lastActive)}</span>
                          </div>
                        </div>
                      </div>
                      {!device.current && (
                        <Button variant="ghost" size="sm" onClick={() => handleRevokeDevice(device.id)}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Billing</h2>
              <p className="text-muted-foreground">Manage your subscription and payments</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold">{billingInfo.plan}</h3>
                      <Badge>Active</Badge>
                    </div>
                    <p className="text-muted-foreground">{billingInfo.price}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline">Change Plan</Button>
                    <Button>Upgrade</Button>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Submissions</span>
                      <span>{billingInfo.submissions.used.toLocaleString()} / {billingInfo.submissions.limit.toLocaleString()}</span>
                    </div>
                    <Progress value={(billingInfo.submissions.used / billingInfo.submissions.limit) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage</span>
                      <span>{billingInfo.storage.used} GB / {billingInfo.storage.limit} GB</span>
                    </div>
                    <Progress value={(billingInfo.storage.used / billingInfo.storage.limit) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/2027</p>
                    </div>
                  </div>
                  <Button variant="outline">Update</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: 'Feb 1, 2026', amount: '$189.00', status: 'Paid' },
                    { date: 'Jan 1, 2026', amount: '$189.00', status: 'Paid' },
                    { date: 'Dec 1, 2025', amount: '$189.00', status: 'Paid' },
                  ].map((invoice, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-muted-foreground">Pro Plan</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{invoice.amount}</span>
                        <Badge variant="outline" className="text-green-600">{invoice.status}</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'organization':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Organization</h2>
              <p className="text-muted-foreground">Manage {currentOrg?.name || 'organization'} settings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input value={currentOrg?.name || 'ACME Research'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input value={currentOrg?.slug || 'acme-research'} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Collection Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require GPS</Label>
                    <p className="text-sm text-muted-foreground">All submissions must include GPS</p>
                  </div>
                  <Switch 
                    checked={orgSettings.requireGPS}
                    onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, requireGPS: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve Submissions</Label>
                    <p className="text-sm text-muted-foreground">High quality submissions auto-approved</p>
                  </div>
                  <Switch 
                    checked={orgSettings.autoApprove}
                    onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, autoApprove: checked })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Duplicate Detection</Label>
                    <p className="text-sm text-muted-foreground">Flag potential duplicate submissions</p>
                  </div>
                  <Switch 
                    checked={orgSettings.duplicateDetection}
                    onCheckedChange={(checked) => setOrgSettings({ ...orgSettings, duplicateDetection: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">API & Integrations</h2>
              <p className="text-muted-foreground">Manage API keys and webhooks</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>API Key</CardTitle>
                <CardDescription>Use this key for API authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Input 
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      readOnly
                      className="font-mono pr-10"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-0 top-0"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyApiKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={handleRegenerateApiKey}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep your API key secret. Never share it publicly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>Receive real-time notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-mono text-sm">https://api.example.com/webhook</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">submission.created</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked />
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Webhook
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Export All Data</p>
                    <p className="text-sm text-muted-foreground">Download all submissions and forms</p>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'templates':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Message Templates</h2>
              <p className="text-muted-foreground mt-1">
                Create reusable message templates for sharing collection links
              </p>
            </div>

            {/* Template Editor Dialog */}
            {showTemplateEditor && (
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {editingTemplate ? 'Edit Template' : 'Create Template'}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setShowTemplateEditor(false);
                        setEditingTemplate(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Template Name</Label>
                      <Input
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Friendly WhatsApp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={templateForm.type}
                        onValueChange={(val) => setTemplateForm(prev => ({ ...prev, type: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scope</Label>
                      <Select
                        value={templateForm.scope}
                        onValueChange={(val) => setTemplateForm(prev => ({ ...prev, scope: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Personal (only me)</SelectItem>
                          <SelectItem value="organization">Organization (team shared)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {templateForm.type === 'email' && (
                      <div className="space-y-2">
                        <Label>Subject Line</Label>
                        <Input
                          value={templateForm.subject}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
                          placeholder="Your Data Collection Link"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Message Body</Label>
                      <div className="flex gap-1">
                        {['{name}', '{link}', '{pin_section}', '{expiry}'].map((variable) => (
                          <Button
                            key={variable}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 px-2"
                            onClick={() => {
                              setTemplateForm(prev => ({
                                ...prev,
                                body: prev.body + variable
                              }));
                            }}
                          >
                            {variable}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm(prev => ({ ...prev, body: e.target.value }))}
                      placeholder="Hi {name}! Here's your collection link: {link}"
                      className="w-full min-h-[150px] p-3 rounded-lg bg-background border border-input text-sm resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Available variables: {'{name}'} (enumerator name), {'{link}'} (collection URL), {'{pin_section}'} (PIN if applicable), {'{expiry}'} (expiration date)
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTemplateEditor(false);
                        setEditingTemplate(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveTemplate}>
                      <Save className="w-4 h-4 mr-2" />
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Button */}
            {!showTemplateEditor && (
              <Button onClick={() => openTemplateEditor()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}

            {/* Templates List */}
            <div className="space-y-4">
              {/* System Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge variant="secondary">Default</Badge>
                    System Templates
                  </CardTitle>
                  <CardDescription>Pre-built templates you can use right away</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTemplates ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {templates.filter(t => t.scope === 'system').map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              template.type === 'whatsapp' ? 'bg-green-500/20 text-green-500' :
                              template.type === 'email' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-purple-500/20 text-purple-500'
                            }`}>
                              {template.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> :
                               template.type === 'email' ? <Mail className="w-4 h-4" /> :
                               <Smartphone className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">Default</Badge>
                        </div>
                      ))}
                      {templates.filter(t => t.scope === 'system').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No system templates available
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    My Templates
                  </CardTitle>
                  <CardDescription>Your personal message templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {templates.filter(t => t.scope === 'user').map((template) => (
                      <div
                        key={template.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            template.type === 'whatsapp' ? 'bg-green-500/20 text-green-500' :
                            template.type === 'email' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-purple-500/20 text-purple-500'
                          }`}>
                            {template.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> :
                             template.type === 'email' ? <Mail className="w-4 h-4" /> :
                             <Smartphone className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{template.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openTemplateEditor(template)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {templates.filter(t => t.scope === 'user').length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No personal templates yet. Create one above!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Organization Templates */}
              {currentOrg && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Organization Templates
                    </CardTitle>
                    <CardDescription>Templates shared with your team at {currentOrg.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {templates.filter(t => t.scope === 'organization').map((template) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              template.type === 'whatsapp' ? 'bg-green-500/20 text-green-500' :
                              template.type === 'email' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-purple-500/20 text-purple-500'
                            }`}>
                              {template.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> :
                               template.type === 'email' ? <Mail className="w-4 h-4" /> :
                               <Smartphone className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{template.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openTemplateEditor(template)}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {templates.filter(t => t.scope === 'organization').length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No organization templates yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex gap-8" data-testid="settings-page">
        {/* Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-6">
            <h1 className="font-bold text-xl mb-6">Settings</h1>
            <nav className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden mb-6 w-full">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settingsNav.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </DashboardLayout>
  );
}

export default SettingsPage;
