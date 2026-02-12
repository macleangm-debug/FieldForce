import React, { useState, useEffect } from 'react';
import {
  Link2,
  QrCode,
  Code,
  Copy,
  Check,
  ExternalLink,
  Download,
  Share2,
  MessageCircle,
  Mail,
  Smartphone
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

export function ShareSurveyDialog({ isOpen, onClose, formId, formName }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const [embedWidth, setEmbedWidth] = useState('100%');
  const [embedHeight, setEmbedHeight] = useState('600');

  const surveyUrl = `${window.location.origin}/survey/${formId}`;
  
  const embedCode = `<iframe 
  src="${surveyUrl}"
  width="${embedWidth}"
  height="${embedHeight}px"
  frameborder="0"
  allowfullscreen
  style="border: none; border-radius: 8px;"
></iframe>`;

  // Generate QR Code using a free API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}`;

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setActiveTab('link');
    }
  }, [isOpen]);

  const handleCopy = (text, message = 'Copied to clipboard!') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(surveyUrl)}`;
    link.download = `${formName || 'survey'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded');
  };

  const shareViaWhatsApp = () => {
    const message = `Please fill out this survey: ${formName || 'Survey'}\n\n${surveyUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Survey: ${formName || 'Please respond'}`;
    const body = `Hi,\n\nPlease take a moment to fill out this survey:\n\n${surveyUrl}\n\nThank you!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaSMS = () => {
    const message = `Please fill out this survey: ${surveyUrl}`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Survey
          </DialogTitle>
          <DialogDescription>
            {formName || 'Your Survey'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="link" className="flex items-center gap-1.5">
              <Link2 className="w-4 h-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">QR</span>
            </TabsTrigger>
            <TabsTrigger value="share" className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-1.5">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Embed</span>
            </TabsTrigger>
          </TabsList>

          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Public Survey Link</Label>
              <div className="flex gap-2">
                <Input
                  value={surveyUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleCopy(surveyUrl, 'Survey link copied!')}
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this link with anyone to collect responses. No login required.
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(surveyUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Survey in New Tab
            </Button>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4 mt-4">
            <div className="flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with a mobile device to open the survey
              </p>
              <Button onClick={handleDownloadQR} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </TabsContent>

          {/* Share Tab (NEW) */}
          <TabsContent value="share" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Share this survey via your preferred messaging app
            </p>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareViaWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-3 text-green-500" />
                Share via WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareViaEmail}
              >
                <Mail className="w-5 h-5 mr-3 text-blue-500" />
                Share via Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={shareViaSMS}
              >
                <Smartphone className="w-5 h-5 mr-3 text-purple-500" />
                Share via SMS
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              These options will open the respective app with a pre-filled message
            </p>
          </TabsContent>

          {/* Embed Tab */}
          <TabsContent value="embed" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Width</Label>
                  <Input
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    placeholder="100%"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (px)</Label>
                  <Input
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    placeholder="600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Embed Code</Label>
                <Textarea
                  value={embedCode}
                  readOnly
                  className="font-mono text-xs min-h-[120px]"
                />
              </div>

              <Button 
                onClick={() => handleCopy(embedCode, 'Embed code copied!')}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Embed Code
              </Button>

              <p className="text-xs text-muted-foreground">
                Paste this code into your website&apos;s HTML to embed the survey.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ShareSurveyDialog;
