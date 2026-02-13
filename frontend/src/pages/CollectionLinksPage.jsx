import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Link2,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  Users,
  FileText,
  Calendar,
  Hash,
  CheckCircle2,
  XCircle,
  ExternalLink,
  QrCode,
  Share2,
  Download,
  Clock,
  User,
  MoreVertical,
  MessageCircle,
  Mail,
  Smartphone,
  Check,
  Folder,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Info,
  Key
} from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { useOrgStore, useAuthStore } from '../store';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function CollectionLinksPage() {
  const { currentOrg } = useOrgStore();
  const authToken = useAuthStore((state) => state.token);
  const [tokens, setTokens] = useState([]);
  const [forms, setForms] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);
  
  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importFormIds, setImportFormIds] = useState([]);
  const [importExpiresDays, setImportExpiresDays] = useState(30);
  const [importMaxSubmissions, setImportMaxSubmissions] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  
  // Enhanced import state for security modes
  const [importSecurityMode, setImportSecurityMode] = useState('standard');
  const [importPinMode, setImportPinMode] = useState('auto'); // 'auto' | 'shared'
  const [importSharedPin, setImportSharedPin] = useState('');
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);
  const [distributing, setDistributing] = useState(false);
  
  // Link shortening state
  const [shortenedLinks, setShortenedLinks] = useState({}); // Maps original URL to shortened URL
  const [shorteningUrl, setShorteningUrl] = useState(null); // URL currently being shortened
  
  // Message templates state
  const [messageTemplates, setMessageTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  
  // Form state for creating new token
  const [newToken, setNewToken] = useState({
    enumerator_name: '',
    enumerator_email: '',
    form_ids: [],
    expires_days: 30,
    max_submissions: '',
    security_mode: 'standard', // 'standard' | 'device_locked' | 'pin_protected'
    require_pin: false,
    pin_code: ''
  });

  useEffect(() => {
    loadData();
    loadMessageTemplates();
  }, [currentOrg]);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      // Load tokens
      const tokensRes = await fetch(`${API_URL}/api/collect/tokens`, { headers });
      if (tokensRes.ok) {
        const data = await tokensRes.json();
        setTokens(data);
      }

      // Load forms (need org_id)
      if (currentOrg?.id) {
        const formsRes = await fetch(`${API_URL}/api/forms?org_id=${currentOrg.id}`, { headers });
        if (formsRes.ok) {
          const data = await formsRes.json();
          // Filter to only published forms
          setForms(data.filter(f => f.status === 'published'));
        }

        // Load projects
        const projectsRes = await fetch(`${API_URL}/api/projects?org_id=${currentOrg.id}`, { headers });
        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load collection links');
    } finally {
      setLoading(false);
    }
  };

  const loadMessageTemplates = async () => {
    try {
      const res = await fetch(`${API_URL}/api/message-templates`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessageTemplates(data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  // Apply template to generate custom message
  const applyTemplate = (template, enumeratorName, link, pin = null, expiryDate = null) => {
    if (!template) return '';
    
    let message = template.body;
    const pinSection = pin ? `Your PIN: ${pin}\n\n` : '';
    const expiry = expiryDate || 'N/A';
    
    message = message.replace(/{name}/g, enumeratorName || 'there');
    message = message.replace(/{link}/g, link);
    message = message.replace(/{pin_section}/g, pinSection);
    message = message.replace(/{pin}/g, pin || '');
    message = message.replace(/{expiry}/g, expiry);
    
    return message;
  };

  const handleCreateToken = async () => {
    if (!newToken.enumerator_name.trim()) {
      toast.error('Please enter enumerator name');
      return;
    }
    if (newToken.form_ids.length === 0) {
      toast.error('Please select at least one form');
      return;
    }
    if (newToken.security_mode === 'pin_protected' && newToken.pin_code.length !== 4) {
      toast.error('Please enter a 4-digit PIN');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/collect/tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newToken,
          max_submissions: newToken.max_submissions ? parseInt(newToken.max_submissions) : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        const link = `${window.location.origin}/collect/t/${data.token}`;
        setGeneratedLink(link);
        setGeneratedToken(data.token);
        setShowCreateDialog(false);
        setShowLinkDialog(true);
        
        // Store token in localStorage for later sharing (encrypted would be better in production)
        const storedTokens = JSON.parse(localStorage.getItem('collection_tokens') || '{}');
        storedTokens[data.id] = data.token;
        localStorage.setItem('collection_tokens', JSON.stringify(storedTokens));
        
        // Reset form
        setNewToken({
          enumerator_name: '',
          enumerator_email: '',
          form_ids: [],
          expires_days: 30,
          max_submissions: '',
          security_mode: 'standard',
          require_pin: false,
          pin_code: ''
        });
        
        // Show PIN reminder if PIN protected
        if (newToken.security_mode === 'pin_protected') {
          toast.success(`Link created! Remember to share PIN: ${newToken.pin_code}`, {
            duration: 10000
          });
        } else {
          toast.success('Collection link created!');
        }
        
        // Reload tokens list
        loadData();
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to create link');
      }
    } catch (error) {
      toast.error('Failed to create collection link');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeToken = async (tokenId) => {
    if (!confirm('Are you sure you want to revoke this collection link? The enumerator will no longer be able to submit data.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/collect/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (res.ok) {
        toast.success('Collection link revoked');
        loadData();
      } else {
        toast.error('Failed to revoke link');
      }
    } catch (error) {
      toast.error('Failed to revoke link');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getTokenLink = (tokenId) => {
    const storedTokens = JSON.parse(localStorage.getItem('collection_tokens') || '{}');
    const token = storedTokens[tokenId];
    if (token) {
      return `${window.location.origin}/collect/t/${token}`;
    }
    return null;
  };

  const handleShare = (tokenData) => {
    const link = getTokenLink(tokenData.id);
    if (link) {
      setSelectedToken({ ...tokenData, link });
      setShowShareDialog(true);
    } else {
      toast.error('Link not available. Token was created in a previous session.');
    }
  };

  const shareViaWhatsApp = (link, enumeratorName, pin = null, expiryDate = null) => {
    // Try to use selected template first
    const whatsappTemplate = selectedTemplate?.type === 'whatsapp' 
      ? selectedTemplate 
      : messageTemplates.find(t => t.type === 'whatsapp' && t.scope === 'system');
    
    const message = whatsappTemplate 
      ? applyTemplate(whatsappTemplate, enumeratorName, link, pin, expiryDate)
      : `Hi ${enumeratorName}! Here's your data collection link for FieldForce:\n\n${link}\n\nOpen this link on your phone to start collecting data.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = (link, enumeratorName, email, pin = null, expiryDate = null) => {
    // Try to use selected template first
    const emailTemplate = selectedTemplate?.type === 'email'
      ? selectedTemplate
      : messageTemplates.find(t => t.type === 'email' && t.scope === 'system');
    
    const subject = emailTemplate?.subject || 'FieldForce Data Collection Link';
    const body = emailTemplate 
      ? applyTemplate(emailTemplate, enumeratorName, link, pin, expiryDate)
      : `Hi ${enumeratorName},\n\nHere's your data collection link:\n\n${link}\n\nOpen this link on your phone or tablet to start collecting data.\n\nBest regards`;
    
    window.location.href = `mailto:${email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaSMS = (link, enumeratorName, pin = null, expiryDate = null) => {
    // Try to use selected template first
    const smsTemplate = selectedTemplate?.type === 'sms'
      ? selectedTemplate
      : messageTemplates.find(t => t.type === 'sms' && t.scope === 'system');
    
    const message = smsTemplate
      ? applyTemplate(smsTemplate, enumeratorName, link, pin, expiryDate)
      : `Hi ${enumeratorName}! Your FieldForce collection link: ${link}`;
    
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const isValid = validTypes.some(ext => file.name.toLowerCase().endsWith(ext));
      if (!isValid) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      setImportFile(file);
    }
  };

  const handleBulkImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }
    if (importFormIds.length === 0) {
      toast.error('Please select at least one form to assign');
      return;
    }
    if (importSecurityMode === 'pin_protected' && importPinMode === 'shared' && importSharedPin.length !== 4) {
      toast.error('Please enter a 4-digit shared PIN');
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const params = new URLSearchParams({
        form_ids: importFormIds.join(','),
        expires_days: importExpiresDays.toString(),
        security_mode: importSecurityMode
      });
      if (importMaxSubmissions) {
        params.append('max_submissions', importMaxSubmissions);
      }
      if (importSecurityMode === 'pin_protected') {
        params.append('pin_mode', importPinMode);
        if (importPinMode === 'shared') {
          params.append('shared_pin', importSharedPin);
        }
      }

      const res = await fetch(`${API_URL}/api/collect/tokens/bulk-import?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setImportResults(data);
        
        // Store tokens in localStorage for later sharing
        if (data.created_tokens && data.created_tokens.length > 0) {
          const storedTokens = JSON.parse(localStorage.getItem('collection_tokens') || '{}');
          data.created_tokens.forEach(t => {
            storedTokens[t.id] = t.token;
          });
          localStorage.setItem('collection_tokens', JSON.stringify(storedTokens));
        }
        
        loadData();
        toast.success(`Successfully imported ${data.success_count} enumerators`);
      } else {
        const error = await res.json();
        toast.error(error.detail || 'Failed to import enumerators');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import enumerators');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,email\nJohn Smith,john@example.com\nJane Doe,jane@example.com\nMike Johnson,";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'enumerator_import_template.csv';
    link.click();
    toast.success('Template downloaded');
  };

  const resetImportDialog = () => {
    setImportFile(null);
    setImportFormIds([]);
    setImportExpiresDays(30);
    setImportMaxSubmissions('');
    setImportResults(null);
    setImportSecurityMode('standard');
    setImportPinMode('auto');
    setImportSharedPin('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Export import results as CSV with links and PINs
  const exportImportResultsCSV = () => {
    if (!importResults?.created_tokens?.length) return;
    
    const hasPin = importSecurityMode === 'pin_protected';
    const headers = hasPin 
      ? ['name', 'email', 'link', 'pin', 'security_mode']
      : ['name', 'email', 'link', 'security_mode'];
    
    const rows = importResults.created_tokens.map(t => {
      const link = `${window.location.origin}/collect/t/${t.token}`;
      const base = [t.name, t.email || '', link];
      if (hasPin) {
        base.push(t.pin || '');
      }
      base.push(importSecurityMode);
      return base.join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enumerator_links_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Links exported to CSV');
  };
  
  // Open email client with all enumerator links
  // Email service state
  const [emailServiceStatus, setEmailServiceStatus] = useState(null);
  const [sendingEmails, setSendingEmails] = useState(false);

  // Check email service status on mount
  useEffect(() => {
    checkEmailServiceStatus();
  }, []);

  const checkEmailServiceStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/email/status`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEmailServiceStatus(data);
      }
    } catch (error) {
      console.error('Failed to check email status:', error);
    }
  };

  const sendBulkEmail = async () => {
    if (!importResults?.created_tokens?.length) return;
    
    // Check if email service is configured
    if (!emailServiceStatus?.configured) {
      // Fallback to mailto
      const subject = 'FieldForce Data Collection Links';
      let body = 'Dear Team,\n\nHere are the data collection links:\n\n';
      
      importResults.created_tokens.forEach(t => {
        const link = `${window.location.origin}/collect/t/${t.token}`;
        body += `${t.name}: ${link}`;
        if (t.pin) body += ` (PIN: ${t.pin})`;
        body += '\n';
      });
      
      body += '\nOpen your link on your phone to start collecting data.\n\nBest regards';
      
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast.info('Email service not configured. Opening default email client instead.');
      return;
    }

    // Use Resend API for bulk email
    setSendingEmails(true);
    
    try {
      const recipients = importResults.created_tokens
        .filter(t => t.email) // Only send to tokens with email addresses
        .map(t => ({
          email: t.email,
          name: t.name,
          link: `${window.location.origin}/collect/t/${t.token}`,
          pin: t.pin || null,
          expiry: t.expires_at ? new Date(t.expires_at).toLocaleDateString() : null
        }));

      if (recipients.length === 0) {
        toast.error('No email addresses found. Add email addresses during import.');
        setSendingEmails(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/email/send-bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipients })
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.detail || data.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      toast.error('Failed to send emails. Please try again.');
    } finally {
      setSendingEmails(false);
    }
  };
  
  // Copy all links to clipboard for bulk SMS
  const copyAllLinksForSMS = () => {
    if (!importResults?.created_tokens?.length) return;
    
    const hasPin = importSecurityMode === 'pin_protected';
    const messages = importResults.created_tokens.map(t => {
      const link = `${window.location.origin}/collect/t/${t.token}`;
      let msg = `${t.name}: ${link}`;
      if (hasPin && t.pin) msg += ` PIN:${t.pin}`;
      return msg;
    });
    
    navigator.clipboard.writeText(messages.join('\n\n'));
    toast.success(`${importResults.created_tokens.length} links copied! Paste into your SMS app.`);
  };

  const shortenLink = async (url) => {
    // Check if we already have this shortened
    if (shortenedLinks[url]) {
      copyToClipboard(shortenedLinks[url]);
      return;
    }

    setShorteningUrl(url);
    try {
      const res = await fetch(`${API_URL}/api/collect/shorten-url`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.short_url) {
          setShortenedLinks(prev => ({ ...prev, [url]: data.short_url }));
          copyToClipboard(data.short_url);
          toast.success('Short link copied to clipboard!');
        } else {
          toast.error(data.error || 'Failed to shorten link');
        }
      } else {
        toast.error('Failed to shorten link');
      }
    } catch (error) {
      console.error('Shortening error:', error);
      toast.error('Failed to shorten link');
    } finally {
      setShorteningUrl(null);
    }
  };

  const getProjectForForm = (formId) => {
    const form = forms.find(f => f.id === formId);
    if (form && form.project_id) {
      const project = projects.find(p => p.id === form.project_id);
      return project?.name || 'Unknown Project';
    }
    return null;
  };

  const getProjectsForToken = (formIds) => {
    const projectNames = new Set();
    formIds?.forEach(formId => {
      const projectName = getProjectForForm(formId);
      if (projectName) projectNames.add(projectName);
    });
    return Array.from(projectNames);
  };

  const getQRCodeUrl = (token) => {
    const link = `${window.location.origin}/collect/t/${token}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(link)}`;
  };

  const downloadQRCode = (tokenData) => {
    const link = document.createElement('a');
    link.href = getQRCodeUrl(tokenData.token);
    link.download = `collection-link-${tokenData.enumerator_name.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Collection Links</h1>
            <p className="text-slate-400 mt-1">
              Generate shareable links for field enumerators to collect data
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                resetImportDialog();
                setShowImportDialog(true);
              }}
              data-testid="bulk-links-btn"
            >
              <Upload className="w-4 h-4 mr-2" />
              Bulk Links
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} data-testid="create-single-link-btn">
              <Plus className="w-4 h-4 mr-2" />
              Create Single Link
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <Link2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{tokens.length}</p>
                  <p className="text-slate-400 text-sm">Total Links</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {tokens.filter(t => t.is_active && !isExpired(t.expires_at)).length}
                  </p>
                  <p className="text-slate-400 text-sm">Active Links</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {tokens.reduce((sum, t) => sum + (t.submission_count || 0), 0)}
                  </p>
                  <p className="text-slate-400 text-sm">Total Submissions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Links Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">All Collection Links</CardTitle>
              <Button variant="ghost" size="sm" onClick={loadData} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tokens.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="w-12 h-12 mx-auto mb-4 text-slate-500" />
                <h3 className="text-white font-medium mb-1">No Collection Links Yet</h3>
                <p className="text-slate-400 text-sm mb-4">
                  Create your first link to start collecting data from field enumerators
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Link
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Enumerator</TableHead>
                    <TableHead className="text-slate-400">Project</TableHead>
                    <TableHead className="text-slate-400">Forms</TableHead>
                    <TableHead className="text-slate-400">Submissions</TableHead>
                    <TableHead className="text-slate-400">Expires</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((tokenData) => {
                    const expired = isExpired(tokenData.expires_at);
                    const active = tokenData.is_active && !expired;
                    const tokenProjects = getProjectsForToken(tokenData.form_ids);
                    const hasStoredToken = !!getTokenLink(tokenData.id);
                    
                    return (
                      <TableRow key={tokenData.id} className="border-slate-700">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{tokenData.enumerator_name}</p>
                            {tokenData.enumerator_email && (
                              <p className="text-slate-400 text-sm">{tokenData.enumerator_email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {tokenProjects.length > 0 ? (
                              tokenProjects.map((proj, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <Folder className="w-3 h-3 text-slate-400" />
                                  <span className="text-slate-300 text-sm">{proj}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-slate-500 text-sm">-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {tokenData.form_ids?.length || 0} form{tokenData.form_ids?.length !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-white">
                            {tokenData.submission_count || 0}
                            {tokenData.max_submissions && (
                              <span className="text-slate-400"> / {tokenData.max_submissions}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {formatDate(tokenData.expires_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {active ? (
                              <Badge className="bg-green-500/20 text-green-400 w-fit">Active</Badge>
                            ) : expired ? (
                              <Badge className="bg-amber-500/20 text-amber-400 w-fit">Expired</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-400 w-fit">Revoked</Badge>
                            )}
                            {/* Security Mode Badge */}
                            {tokenData.security_mode === 'device_locked' && (
                              <Badge variant="outline" className="text-orange-400 border-orange-400/50 w-fit text-xs">
                                <Smartphone className="w-3 h-3 mr-1" />
                                Device Lock
                              </Badge>
                            )}
                            {tokenData.security_mode === 'pin_protected' && (
                              <Badge variant="outline" className="text-green-400 border-green-400/50 w-fit text-xs">
                                <Key className="w-3 h-3 mr-1" />
                                PIN
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`actions-menu-${tokenData.id}`}>
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {hasStoredToken && active && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleShare(tokenData)}
                                    className="cursor-pointer"
                                  >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Share Link...
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => copyToClipboard(getTokenLink(tokenData.id))}
                                    className="cursor-pointer"
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => shareViaWhatsApp(getTokenLink(tokenData.id), tokenData.enumerator_name)}
                                    className="cursor-pointer"
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Share via WhatsApp
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => shareViaEmail(getTokenLink(tokenData.id), tokenData.enumerator_name, tokenData.enumerator_email)}
                                    className="cursor-pointer"
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Share via Email
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => shareViaSMS(getTokenLink(tokenData.id), tokenData.enumerator_name)}
                                    className="cursor-pointer"
                                  >
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    Share via SMS
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {!hasStoredToken && active && (
                                <DropdownMenuItem disabled className="text-slate-500">
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Link not available
                                </DropdownMenuItem>
                              )}
                              {active && (
                                <DropdownMenuItem
                                  onClick={() => handleRevokeToken(tokenData.id)}
                                  className="text-red-400 cursor-pointer focus:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Revoke Link
                                </DropdownMenuItem>
                              )}
                              {!active && (
                                <DropdownMenuItem disabled className="text-slate-500">
                                  Link is {expired ? 'expired' : 'revoked'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Link Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[480px] max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="shrink-0 p-4 pb-2 border-b border-border">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Link2 className="w-5 h-5 text-primary" />
              Create Collection Link
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Enumerator Name & Email - Compact row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={newToken.enumerator_name}
                  onChange={(e) => setNewToken(prev => ({ ...prev, enumerator_name: e.target.value }))}
                  placeholder="John Smith"
                  className="h-9"
                  data-testid="enumerator-name-input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={newToken.enumerator_email}
                  onChange={(e) => setNewToken(prev => ({ ...prev, enumerator_email: e.target.value }))}
                  placeholder="john@example.com"
                  className="h-9"
                />
              </div>
            </div>

            {/* Select Forms - Compact */}
            <div className="space-y-1">
              <Label className="text-xs">Assign Forms *</Label>
              {forms.length === 0 ? (
                <p className="text-xs text-muted-foreground">No published forms available</p>
              ) : (
                <div className="space-y-1 max-h-24 overflow-y-auto border border-border rounded-lg p-1.5">
                  {forms.map((form) => (
                    <label
                      key={form.id}
                      className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors text-sm ${
                        newToken.form_ids.includes(form.id)
                          ? 'bg-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newToken.form_ids.includes(form.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewToken(prev => ({ ...prev, form_ids: [...prev.form_ids, form.id] }));
                          } else {
                            setNewToken(prev => ({ ...prev, form_ids: prev.form_ids.filter(id => id !== form.id) }));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded"
                      />
                      <span className="text-foreground truncate">{form.name}</span>
                      <span className="text-muted-foreground text-xs ml-auto">{form.field_count} fields</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Expiry & Max Submissions - Compact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Expires In</Label>
                <Select
                  value={String(newToken.expires_days)}
                  onValueChange={(val) => setNewToken(prev => ({ ...prev, expires_days: parseInt(val) }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="30 days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Max Submissions</Label>
                <Input
                  type="number"
                  value={newToken.max_submissions}
                  onChange={(e) => setNewToken(prev => ({ ...prev, max_submissions: e.target.value }))}
                  placeholder="Unlimited"
                  className="h-9"
                />
              </div>
            </div>

            {/* Security Mode - Dropdown style */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Shield className="w-3 h-3" />
                Security Mode
              </Label>
              <Select
                value={newToken.security_mode}
                onValueChange={(val) => setNewToken(prev => ({ 
                  ...prev, 
                  security_mode: val, 
                  require_pin: val === 'pin_protected' 
                }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    <div className="flex items-center gap-2">
                      <Link2 className="w-3.5 h-3.5 text-blue-500" />
                      <span>Standard Link</span>
                      <span className="text-xs text-muted-foreground ml-1">- Anyone can access</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="device_locked">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                      <span>Device Locked</span>
                      <span className="text-xs text-muted-foreground ml-1">- Track on map</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pin_protected">
                    <div className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5 text-green-500" />
                      <span>PIN Protected</span>
                      <span className="text-xs text-muted-foreground ml-1">- Most secure</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Security mode detailed description */}
              <div className={`p-2.5 rounded-lg text-xs ${
                newToken.security_mode === 'standard' ? 'bg-blue-500/10 border border-blue-500/20' :
                newToken.security_mode === 'device_locked' ? 'bg-orange-500/10 border border-orange-500/20' :
                'bg-green-500/10 border border-green-500/20'
              }`}>
                {newToken.security_mode === 'standard' && (
                  <div className="space-y-1">
                    <p className="font-medium text-blue-400">Open Access</p>
                    <p className="text-muted-foreground">Link can be opened on any device, any number of times. Best for public surveys or when you fully trust your team. No device tracking available.</p>
                  </div>
                )}
                {newToken.security_mode === 'device_locked' && (
                  <div className="space-y-1">
                    <p className="font-medium text-orange-400">Device Registration Required</p>
                    <p className="text-muted-foreground">Link locks to the first device that opens it. Enables <strong>GPS tracking on the map</strong> - see exactly where each enumerator is collecting data in real-time. Prevents link sharing between team members.</p>
                  </div>
                )}
                {newToken.security_mode === 'pin_protected' && (
                  <div className="space-y-1">
                    <p className="font-medium text-green-400">Maximum Security</p>
                    <p className="text-muted-foreground">Requires 4-digit PIN + device lock. Enables <strong>GPS tracking on the map</strong> with verified identity. Even if someone gets the link, they can't access without the PIN. Ideal for sensitive data collection.</p>
                  </div>
                )}
              </div>
            </div>

            {/* PIN Input (shown when PIN mode selected) */}
            {newToken.security_mode === 'pin_protected' && (
              <div className="flex items-center gap-3 p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                <Key className="w-4 h-4 text-green-500 shrink-0" />
                <div className="flex-1">
                  <Label className="text-xs">Access PIN</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <Input
                      type="text"
                      maxLength={4}
                      value={newToken.pin_code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setNewToken(prev => ({ ...prev, pin_code: val }));
                      }}
                      placeholder="0000"
                      className="w-20 h-8 text-center font-mono tracking-widest"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                        setNewToken(prev => ({ ...prev, pin_code: randomPin }));
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="shrink-0 p-4 pt-3 border-t border-border bg-background">
            <Button variant="ghost" size="sm" onClick={() => setShowCreateDialog(false)} className="text-muted-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateToken} disabled={creating} data-testid="generate-link-btn">
              {creating ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Collection Link Created!
            </DialogTitle>
            <DialogDescription>
              Share this link with your enumerator. They can open it on any device to start collecting data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Link */}
            <div className="space-y-2">
              <Label>Collection Link</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Shortened Link Option */}
            {shortenedLinks[generatedLink] ? (
              <div className="space-y-2">
                <Label>Shortened Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={shortenedLinks[generatedLink]}
                    readOnly
                    className="font-mono text-sm bg-green-500/10 border-green-500/30"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyToClipboard(shortenedLinks[generatedLink])}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => shortenLink(generatedLink)}
                disabled={shorteningUrl === generatedLink}
              >
                {shorteningUrl === generatedLink ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="w-4 h-4 mr-2" />
                )}
                Create Shortened Link
              </Button>
            )}

            {/* Share Options */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => shareViaWhatsApp(generatedLink, newToken.enumerator_name || 'there')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => shareViaEmail(generatedLink, newToken.enumerator_name || 'Enumerator', newToken.enumerator_email)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => shareViaSMS(generatedLink, newToken.enumerator_name || 'there')}
              >
                <Smartphone className="w-4 h-4 mr-2" />
                SMS
              </Button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4 p-4 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-slate-400">Or scan this QR code</p>
              <div className="bg-white p-3 rounded-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedLink)}`}
                  alt="QR Code"
                  className="w-36 h-36"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(generatedLink)}`;
                  link.download = 'collection-qr-code.png';
                  link.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>

            {/* Warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-400 text-sm">
                ⚠️ Save this link now! You can share it later from the actions menu.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowLinkDialog(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog (for existing tokens) */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Share Collection Link
            </DialogTitle>
            <DialogDescription>
              {selectedToken?.enumerator_name}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="link" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="link" className="flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link
              </TabsTrigger>
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Collection Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedToken?.link || ''}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyToClipboard(selectedToken?.link)}
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Shortened Link */}
              {shortenedLinks[selectedToken?.link] && (
                <div className="space-y-2">
                  <Label>Shortened Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={shortenedLinks[selectedToken?.link]}
                      readOnly
                      className="font-mono text-sm bg-green-500/10 border-green-500/30"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => copyToClipboard(shortenedLinks[selectedToken?.link])}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => shortenLink(selectedToken?.link)}
                  disabled={shorteningUrl === selectedToken?.link}
                >
                  {shorteningUrl === selectedToken?.link ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="w-4 h-4 mr-2" />
                  )}
                  {shortenedLinks[selectedToken?.link] ? 'Copy Short Link' : 'Shorten & Copy'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(selectedToken?.link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Link
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4 mt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedToken?.link || '')}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedToken?.link || '')}`;
                    link.download = `collection-${selectedToken?.enumerator_name?.replace(/\s+/g, '-')}-qr.png`;
                    link.click();
                    toast.success('QR code downloaded');
                  }}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="share" className="space-y-4 mt-4">
              {/* Template Selection */}
              {messageTemplates.length > 0 && (
                <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                  <Label className="text-xs text-muted-foreground">Message Template (Optional)</Label>
                  <Select
                    value={selectedTemplate?.id || 'default'}
                    onValueChange={(val) => {
                      if (val === 'default') {
                        setSelectedTemplate(null);
                      } else {
                        const template = messageTemplates.find(t => t.id === val);
                        setSelectedTemplate(template);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Use default message" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default message</SelectItem>
                      {messageTemplates.filter(t => t.type === 'whatsapp' || t.type === 'email' || t.type === 'sms').map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="flex items-center gap-2">
                            {t.type === 'whatsapp' && <MessageCircle className="w-3 h-3 text-green-500" />}
                            {t.type === 'email' && <Mail className="w-3 h-3 text-blue-500" />}
                            {t.type === 'sms' && <Smartphone className="w-3 h-3 text-purple-500" />}
                            {t.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    shareViaWhatsApp(selectedToken?.link, selectedToken?.enumerator_name);
                    setShowShareDialog(false);
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-3 text-green-500" />
                  Share via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    shareViaEmail(selectedToken?.link, selectedToken?.enumerator_name, selectedToken?.enumerator_email);
                    setShowShareDialog(false);
                  }}
                >
                  <Mail className="w-5 h-5 mr-3 text-blue-500" />
                  Share via Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    shareViaSMS(selectedToken?.link, selectedToken?.enumerator_name);
                    setShowShareDialog(false);
                  }}
                >
                  <Smartphone className="w-5 h-5 mr-3 text-purple-500" />
                  Share via SMS
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {selectedTemplate ? `Using template: ${selectedTemplate.name}` : 'Using default message templates'}
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={(open) => {
        if (!open) resetImportDialog();
        setShowImportDialog(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Import Enumerators
            </DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file to create collection links for multiple enumerators at once
            </DialogDescription>
          </DialogHeader>

          {!importResults ? (
            <div className="space-y-4 py-4">
              {/* File Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Upload File *</Label>
                  <Button variant="link" size="sm" onClick={downloadTemplate} className="h-auto p-0">
                    <Download className="w-3 h-3 mr-1" />
                    Download Template
                  </Button>
                </div>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    importFile 
                      ? 'border-primary bg-primary/5' 
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="import-file-input"
                  />
                  {importFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="text-white font-medium">{importFile.name}</p>
                        <p className="text-slate-400 text-sm">
                          {(importFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImportFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-white">Click to upload or drag and drop</p>
                      <p className="text-slate-400 text-sm mt-1">CSV or Excel (.xlsx, .xls)</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  Required column: <code className="bg-slate-800 px-1 rounded">name</code> • 
                  Optional: <code className="bg-slate-800 px-1 rounded">email</code>
                </p>
              </div>

              {/* Select Forms */}
              <div className="space-y-2">
                <Label>Assign Forms *</Label>
                {forms.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No published forms available</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2">
                    {forms.map((form) => (
                      <label
                        key={form.id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                          importFormIds.includes(form.id)
                            ? 'bg-primary/20 border border-primary/50'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={importFormIds.includes(form.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setImportFormIds(prev => [...prev, form.id]);
                            } else {
                              setImportFormIds(prev => prev.filter(id => id !== form.id));
                            }
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium truncate">{form.name}</p>
                          <p className="text-muted-foreground text-xs">{form.field_count} fields</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link Expires In</Label>
                  <Select
                    defaultValue="30"
                    value={String(importExpiresDays)}
                    onValueChange={(val) => setImportExpiresDays(parseInt(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="30 days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Submissions</Label>
                  <Input
                    type="number"
                    value={importMaxSubmissions}
                    onChange={(e) => setImportMaxSubmissions(e.target.value)}
                    placeholder="Unlimited"
                  />
                </div>
              </div>
              
              {/* Security Mode */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Security Mode
                </Label>
                <Select
                  value={importSecurityMode}
                  onValueChange={(val) => setImportSecurityMode(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5 text-blue-500" />
                        <span>Standard - Open access, no tracking</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="device_locked">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-orange-500" />
                        <span>Device Locked - GPS map tracking enabled</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="pin_protected">
                      <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-green-500" />
                        <span>PIN Protected - Maximum security + tracking</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Bulk import security description */}
                <p className="text-xs text-muted-foreground mt-1.5 px-1">
                  {importSecurityMode === 'standard' && 'Links can be accessed from any device. No GPS tracking available.'}
                  {importSecurityMode === 'device_locked' && 'Each link locks to one device. Enables real-time GPS tracking on the map to monitor enumerator locations.'}
                  {importSecurityMode === 'pin_protected' && 'PIN + device lock. Maximum security with GPS tracking. Ideal for sensitive data collection.'}
                </p>
              </div>
              
              {/* PIN Options (shown when PIN protected selected) */}
              {importSecurityMode === 'pin_protected' && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-green-500" />
                    <Label className="text-green-400">PIN Configuration</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label className={`flex-1 p-2 rounded-lg border cursor-pointer transition-colors ${
                        importPinMode === 'auto' 
                          ? 'bg-green-500/20 border-green-500/50' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}>
                        <input
                          type="radio"
                          name="pin_mode"
                          checked={importPinMode === 'auto'}
                          onChange={() => setImportPinMode('auto')}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">Auto-generate unique PINs</span>
                        <p className="text-xs text-muted-foreground ml-5">Each enumerator gets a different PIN</p>
                      </label>
                      
                      <label className={`flex-1 p-2 rounded-lg border cursor-pointer transition-colors ${
                        importPinMode === 'shared' 
                          ? 'bg-green-500/20 border-green-500/50' 
                          : 'border-slate-600 hover:border-slate-500'
                      }`}>
                        <input
                          type="radio"
                          name="pin_mode"
                          checked={importPinMode === 'shared'}
                          onChange={() => setImportPinMode('shared')}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">Use shared PIN</span>
                        <p className="text-xs text-muted-foreground ml-5">Same PIN for all enumerators</p>
                      </label>
                    </div>
                    
                    {importPinMode === 'shared' && (
                      <div className="flex gap-2 items-center">
                        <Input
                          type="text"
                          maxLength={4}
                          value={importSharedPin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setImportSharedPin(val);
                          }}
                          placeholder="Enter 4-digit PIN"
                          className="w-32 text-center font-mono tracking-widest"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                            setImportSharedPin(randomPin);
                          }}
                        >
                          Generate
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Import Results */
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
                <div className="flex-1 text-center">
                  <p className="text-2xl font-bold text-green-400">{importResults.success_count}</p>
                  <p className="text-slate-400 text-sm">Imported</p>
                </div>
                {importResults.error_count > 0 && (
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-bold text-red-400">{importResults.error_count}</p>
                    <p className="text-slate-400 text-sm">Failed</p>
                  </div>
                )}
                <div className="flex-1 text-center">
                  <Badge variant="outline" className={`${
                    importSecurityMode === 'pin_protected' ? 'border-green-500/50 text-green-400' :
                    importSecurityMode === 'device_locked' ? 'border-orange-500/50 text-orange-400' :
                    'border-blue-500/50 text-blue-400'
                  }`}>
                    {importSecurityMode === 'pin_protected' && <Key className="w-3 h-3 mr-1" />}
                    {importSecurityMode === 'device_locked' && <Lock className="w-3 h-3 mr-1" />}
                    {importSecurityMode === 'standard' && <Link2 className="w-3 h-3 mr-1" />}
                    {importSecurityMode.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              {importResults.error_count > 0 && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-sm font-medium">Import Errors</p>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-sm text-slate-400">
                    {importResults.errors.map((err, idx) => (
                      <p key={idx}>Row {err.row}: {err.error}</p>
                    ))}
                  </div>
                </div>
              )}

              {importResults.created_tokens.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">
                    Links created! Choose how to distribute:
                  </p>
                  
                  {/* Distribution Options */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={exportImportResultsCSV}
                    >
                      <Download className="w-5 h-5 text-blue-400" />
                      <span className="text-xs">Export CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={sendBulkEmail}
                      disabled={sendingEmails}
                    >
                      {sendingEmails ? (
                        <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                      ) : (
                        <Mail className="w-5 h-5 text-green-400" />
                      )}
                      <span className="text-xs">{sendingEmails ? 'Sending...' : 'Email All'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex flex-col items-center gap-1 h-auto py-3"
                      onClick={copyAllLinksForSMS}
                    >
                      <Smartphone className="w-5 h-5 text-purple-400" />
                      <span className="text-xs">Copy for SMS</span>
                    </Button>
                  </div>
                  
                  {/* Preview of created links */}
                  <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Name</TableHead>
                          <TableHead className="text-xs">Link</TableHead>
                          {importSecurityMode === 'pin_protected' && (
                            <TableHead className="text-xs">PIN</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResults.created_tokens.slice(0, 5).map((t, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs py-1">{t.name}</TableCell>
                            <TableCell className="text-xs py-1 font-mono text-muted-foreground">
                              ...{t.token.slice(-8)}
                            </TableCell>
                            {importSecurityMode === 'pin_protected' && (
                              <TableCell className="text-xs py-1 font-mono text-green-400">{t.pin || '-'}</TableCell>
                            )}
                          </TableRow>
                        ))}
                        {importResults.created_tokens.length > 5 && (
                          <TableRow>
                            <TableCell colSpan={importSecurityMode === 'pin_protected' ? 3 : 2} className="text-xs py-1 text-muted-foreground text-center">
                              +{importResults.created_tokens.length - 5} more...
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!importResults ? (
              <>
                <Button variant="ghost" onClick={() => setShowImportDialog(false)} className="text-muted-foreground">
                  Cancel
                </Button>
                <Button onClick={handleBulkImport} disabled={importing || !importFile}>
                  {importing ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import {importFile && 'Enumerators'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowImportDialog(false)}>
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

export default CollectionLinksPage;
