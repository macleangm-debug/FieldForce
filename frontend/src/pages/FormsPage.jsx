import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Play,
  Copy,
  Archive,
  Eye,
  Database,
  Calendar,
  Edit3,
  Link,
  Share2,
  MessageCircle,
  Mail,
  Smartphone,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Skeleton } from '../components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ShareSurveyDialog } from '../components/ShareSurveyDialog';
import { useOrgStore, useProjectStore } from '../store';
import { formAPI, projectAPI } from '../lib/api';
import { formatDate, getStatusVariant } from '../lib/utils';
import { toast } from 'sonner';

const FormCard = ({ form, onPublish, onDuplicate, onArchive, onShare }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const surveyUrl = `${window.location.origin}/survey/${form.id}`;
  
  const copyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(surveyUrl);
    toast.success(t('forms.surveyLinkCopied'));
  };
  
  const shareViaWhatsApp = (e) => {
    e.stopPropagation();
    const message = `Please fill out this survey: ${form.name}\n\n${surveyUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };
  
  const shareViaEmail = (e) => {
    e.stopPropagation();
    const subject = `Survey: ${form.name}`;
    const body = `Hi,\n\nPlease take a moment to fill out this survey:\n\n${surveyUrl}\n\nThank you!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const shareViaSMS = (e) => {
    e.stopPropagation();
    const message = `Please fill out this survey: ${surveyUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };
  
  const openSurvey = (e) => {
    e.stopPropagation();
    window.open(surveyUrl, '_blank');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="bg-card border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
        onClick={() => navigate(`/forms/${form.id}`)}
        data-testid={`form-card-${form.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-barlow text-lg text-foreground group-hover:text-primary transition-colors">
                  {form.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getStatusVariant(form.status)}>
                    {form.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">v{form.version}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/forms/${form.id}/edit`); }}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  {t('forms.editForm')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/forms/${form.id}/preview`); }}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('forms.preview')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {form.status === 'draft' && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPublish(form.id); }}>
                    <Play className="w-4 h-4 mr-2" />
                    {t('forms.publish')}
                  </DropdownMenuItem>
                )}
                {form.status === 'published' && (
                  <>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('forms.shareSurvey')}
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent className="w-48">
                          <DropdownMenuItem onClick={copyLink}>
                            <Copy className="w-4 h-4 mr-2" />
                            {t('forms.copyLink')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(form.id, form.name); }}>
                            <QrCode className="w-4 h-4 mr-2" />
                            {t('forms.qrCodeEmbed')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={shareViaWhatsApp}>
                            <MessageCircle className="w-4 h-4 mr-2 text-green-500" />
                            {t('forms.shareViaWhatsApp')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareViaEmail}>
                            <Mail className="w-4 h-4 mr-2 text-blue-500" />
                            {t('forms.shareViaEmail')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={shareViaSMS}>
                            <Smartphone className="w-4 h-4 mr-2 text-purple-500" />
                            {t('forms.shareViaSMS')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={openSurvey}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {t('forms.openSurvey')}
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </>
                )}
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(form.id, form.name); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('forms.duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onArchive(form.id); }}
                  className="text-destructive"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {t('forms.archive')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {form.description || t('common.noDescription')}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Edit3 className="w-3.5 h-3.5" />
              {form.field_count} {t('forms.fields')}
            </div>
            <div className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              {form.submission_count} {t('forms.submissions')}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {t('forms.updated')} {formatDate(form.updated_at)}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function FormsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentOrg } = useOrgStore();
  const { projects, currentProject, setCurrentProject } = useProjectStore();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', description: '', project_id: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      loadProjects();
    }
  }, [currentOrg]);

  useEffect(() => {
    if (selectedProject && selectedProject !== 'all') {
      loadForms(selectedProject);
    } else if (projects.length > 0) {
      loadAllForms();
    }
  }, [selectedProject, projects]);

  const loadProjects = async () => {
    try {
      const response = await projectAPI.list(currentOrg.id);
      useProjectStore.getState().setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadForms = async (projectId) => {
    setLoading(true);
    try {
      const response = await formAPI.list(projectId);
      setForms(response.data);
    } catch (error) {
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const loadAllForms = async () => {
    setLoading(true);
    try {
      const allForms = [];
      for (const project of projects) {
        const response = await formAPI.list(project.id);
        allForms.push(...response.data);
      }
      setForms(allForms);
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!newForm.name.trim()) {
      toast.error(t('forms.formName') + ' required');
      return;
    }
    if (!newForm.project_id) {
      toast.error(t('forms.selectProject'));
      return;
    }
    setCreating(true);
    try {
      const response = await formAPI.create({
        name: newForm.name,
        description: newForm.description,
        project_id: newForm.project_id,
        fields: []
      });
      setForms([...forms, response.data]);
      setCreateDialogOpen(false);
      setNewForm({ name: '', description: '', project_id: '' });
      toast.success(t('forms.formCreated'));
      navigate(`/forms/${response.data.id}/edit`);
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (formId) => {
    try {
      await formAPI.publish(formId);
      setForms(forms.map(f => 
        f.id === formId ? { ...f, status: 'published' } : f
      ));
      toast.success(t('forms.formPublished'));
    } catch (error) {
      toast.error(error.response?.data?.detail || t('errors.somethingWentWrong'));
    }
  };

  const handleDuplicate = async (formId, formName) => {
    try {
      const response = await formAPI.duplicate(formId, `${formName} (Copy)`);
      setForms([...forms, response.data]);
      toast.success(t('forms.formDuplicated'));
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    }
  };

  const handleArchive = async (formId) => {
    try {
      await formAPI.archive(formId);
      setForms(forms.map(f => 
        f.id === formId ? { ...f, status: 'archived' } : f
      ));
      toast.success(t('forms.formArchived'));
    } catch (error) {
      toast.error(t('errors.somethingWentWrong'));
    }
  };

  // Share dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareFormId, setShareFormId] = useState(null);
  const [shareFormName, setShareFormName] = useState('');

  const handleShare = (formId, formName) => {
    setShareFormId(formId);
    setShareFormName(formName);
    setShareDialogOpen(true);
  };

  const filteredForms = forms.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!currentOrg) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">{t('organization.selectOrgFirst')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="forms-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-barlow text-3xl font-bold tracking-tight text-white">{t('forms.title')}</h1>
            <p className="text-gray-400">{t('forms.subtitle')}</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-form-btn">
                <Plus className="w-4 h-4 mr-2" />
                {t('forms.newForm')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-barlow">{t('forms.createForm')}</DialogTitle>
                <DialogDescription>{t('forms.addForm')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="project">{t('collectionLinks.project')}</Label>
                  <Select
                    value={newForm.project_id}
                    onValueChange={(value) => setNewForm({ ...newForm, project_id: value })}
                  >
                    <SelectTrigger data-testid="form-project-select">
                      <SelectValue placeholder={t('forms.selectProject')} />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{t('forms.formName')}</Label>
                  <Input
                    id="name"
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="e.g., Household Survey"
                    data-testid="form-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('forms.description')}</Label>
                  <Textarea
                    id="description"
                    value={newForm.description}
                    onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                    placeholder="Brief description of the form"
                    rows={3}
                    data-testid="form-description-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleCreateForm} disabled={creating} data-testid="save-form-btn">
                  {creating ? t('common.creating') : t('forms.createForm')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('forms.searchForms')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="search-forms-input"
            />
          </div>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('collectionLinks.project')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('forms.allProjects')}</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('common.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('forms.allStatus')}</SelectItem>
              <SelectItem value="draft">{t('forms.draft')}</SelectItem>
              <SelectItem value="published">{t('forms.published')}</SelectItem>
              <SelectItem value="archived">{t('forms.archived')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50">
                <CardHeader>
                  <Skeleton className="h-10 w-10 rounded-sm" />
                  <Skeleton className="h-5 w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredForms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onPublish={handlePublish}
                onDuplicate={handleDuplicate}
                onArchive={handleArchive}
                onShare={handleShare}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-card border border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-barlow text-lg font-semibold mb-2">No forms found</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                {search ? 'Try adjusting your search' : 'Create your first form to start collecting data'}
              </p>
              {!search && projects.length > 0 && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Form
                </Button>
              )}
              {projects.length === 0 && (
                <Button onClick={() => navigate('/projects')}>
                  Create a Project First
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Share Survey Dialog */}
      <ShareSurveyDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        formId={shareFormId}
        formName={shareFormName}
      />
    </DashboardLayout>
  );
}
