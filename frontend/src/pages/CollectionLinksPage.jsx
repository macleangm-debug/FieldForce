import React, { useState, useEffect } from 'react';
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
  User
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
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useOrgStore } from '../store';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function CollectionLinksPage() {
  const { currentOrg } = useOrgStore();
  const [tokens, setTokens] = useState([]);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [creating, setCreating] = useState(false);
  
  // Form state for creating new token
  const [newToken, setNewToken] = useState({
    enumerator_name: '',
    enumerator_email: '',
    form_ids: [],
    expires_days: 30,
    max_submissions: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load tokens and forms in parallel
      const [tokensRes, formsRes] = await Promise.all([
        fetch(`${API_URL}/api/collect/tokens`, { headers }),
        fetch(`${API_URL}/api/forms`, { headers })
      ]);

      if (tokensRes.ok) {
        const data = await tokensRes.json();
        setTokens(data);
      }

      if (formsRes.ok) {
        const data = await formsRes.json();
        // Filter to only published forms
        setForms(data.filter(f => f.status === 'published'));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load collection links');
    } finally {
      setLoading(false);
    }
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

    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/collect/tokens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        
        // Reset form
        setNewToken({
          enumerator_name: '',
          enumerator_email: '',
          form_ids: [],
          expires_days: 30,
          max_submissions: ''
        });
        
        // Reload tokens list
        loadData();
        toast.success('Collection link created!');
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/collect/tokens/${tokenId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
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
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
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
          <Button onClick={() => setShowCreateDialog(true)} data-testid="create-link-btn">
            <Plus className="w-4 h-4 mr-2" />
            Create Link
          </Button>
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
                          {active ? (
                            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                          ) : expired ? (
                            <Badge className="bg-amber-500/20 text-amber-400">Expired</Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-400">Revoked</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                              <DropdownMenuItem
                                onClick={() => {
                                  // Note: We don't have the actual token stored, only the hash
                                  // This would need the token to be retrieved differently
                                  toast.info('Token was only shown at creation time for security');
                                }}
                                className="text-slate-200"
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRevokeToken(tokenData.id)}
                                className="text-red-400"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Revoke Link
                              </DropdownMenuItem>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-primary" />
              Create Collection Link
            </DialogTitle>
            <DialogDescription>
              Generate a shareable link for a field enumerator to collect data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Enumerator Name */}
            <div className="space-y-2">
              <Label>Enumerator Name *</Label>
              <Input
                value={newToken.enumerator_name}
                onChange={(e) => setNewToken(prev => ({ ...prev, enumerator_name: e.target.value }))}
                placeholder="John Smith"
                data-testid="enumerator-name-input"
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label>Email (Optional)</Label>
              <Input
                type="email"
                value={newToken.enumerator_email}
                onChange={(e) => setNewToken(prev => ({ ...prev, enumerator_email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>

            {/* Select Forms */}
            <div className="space-y-2">
              <Label>Assign Forms *</Label>
              {forms.length === 0 ? (
                <p className="text-sm text-slate-400">No published forms available</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-700 rounded-lg p-2">
                  {forms.map((form) => (
                    <label
                      key={form.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                        newToken.form_ids.includes(form.id)
                          ? 'bg-primary/20 border border-primary/50'
                          : 'hover:bg-slate-700/50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newToken.form_ids.includes(form.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewToken(prev => ({
                              ...prev,
                              form_ids: [...prev.form_ids, form.id]
                            }));
                          } else {
                            setNewToken(prev => ({
                              ...prev,
                              form_ids: prev.form_ids.filter(id => id !== form.id)
                            }));
                          }
                        }}
                        className="w-4 h-4 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{form.name}</p>
                        <p className="text-slate-400 text-xs">{form.field_count} fields</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Expiry */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expires In</Label>
                <Select
                  value={String(newToken.expires_days)}
                  onValueChange={(val) => setNewToken(prev => ({ ...prev, expires_days: parseInt(val) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  value={newToken.max_submissions}
                  onChange={(e) => setNewToken(prev => ({ ...prev, max_submissions: e.target.value }))}
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateToken} disabled={creating} data-testid="generate-link-btn">
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
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
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
                ⚠️ Save this link now! For security, it won't be shown again.
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
    </DashboardLayout>
  );
}

export default CollectionLinksPage;
