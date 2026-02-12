import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings2,
  Image,
  Calendar as CalendarIcon,
  Hash,
  MessageSquare,
  Upload,
  Palette,
  ToggleLeft,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { cn } from '../lib/utils';

export function SurveySettingsSidebar({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsChange 
}) {
  const [localSettings, setLocalSettings] = useState({
    name: settings?.name || '',
    description: settings?.description || '',
    closeDate: settings?.closeDate ? new Date(settings.closeDate) : null,
    closeTime: settings?.closeTime || '23:59',
    maxResponses: settings?.maxResponses || '',
    thankYouMessage: settings?.thankYouMessage || 'Thank you for completing our survey!',
    logo: settings?.logo || null,
    primaryColor: settings?.primaryColor || '#0ea5e9',
    showProgressBar: settings?.showProgressBar ?? true,
    shuffleQuestions: settings?.shuffleQuestions ?? false,
    allowMultipleSubmissions: settings?.allowMultipleSubmissions ?? false,
    requireLogin: settings?.requireLogin ?? false,
  });
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Generate time options in 30-minute intervals
  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h.toString().padStart(2, '0');
      const minute = m.toString().padStart(2, '0');
      const time = `${hour}:${minute}`;
      const label = format(new Date(2000, 0, 1, h, m), 'h:mm a');
      timeOptions.push({ value: time, label });
    }
  }

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    onSettingsChange?.({ ...localSettings, [key]: value });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[400px] bg-slate-900 border-l border-slate-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-semibold text-white">Survey Settings</h2>
                  <p className="text-xs text-slate-400">Configure your survey options</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-65px)] p-4 space-y-6">
              {/* Survey Name */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Survey Name</Label>
                <Input
                  value={localSettings.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="My Survey"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-white font-medium">Description</Label>
                <Textarea
                  value={localSettings.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add a description for your survey..."
                  className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                />
              </div>

              <Separator className="bg-slate-700" />

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Logo
                </Label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                  {localSettings.logo ? (
                    <div className="relative">
                      <img 
                        src={localSettings.logo} 
                        alt="Survey logo" 
                        className="max-h-24 mx-auto rounded"
                      />
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-0 right-0"
                        onClick={() => handleChange('logo', null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-400">Click to upload logo</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Close Date */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Close Date (Optional)
                </Label>
                
                {/* Date Picker */}
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-slate-800 border-slate-600 hover:bg-slate-700",
                        !localSettings.closeDate && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {localSettings.closeDate ? (
                        format(localSettings.closeDate, "PPP")
                      ) : (
                        <span>Pick a close date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-600" align="start">
                    <Calendar
                      mode="single"
                      selected={localSettings.closeDate}
                      onSelect={(date) => {
                        handleChange('closeDate', date);
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="rounded-md"
                    />
                  </PopoverContent>
                </Popover>

                {/* Time Picker */}
                {localSettings.closeDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <Select
                      value={localSettings.closeTime}
                      onValueChange={(value) => handleChange('closeTime', value)}
                    >
                      <SelectTrigger className="flex-1 bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 max-h-[200px]">
                        {timeOptions.map((time) => (
                          <SelectItem 
                            key={time.value} 
                            value={time.value}
                            className="text-white hover:bg-slate-700"
                          >
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear Date Button */}
                {localSettings.closeDate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    onClick={() => {
                      handleChange('closeDate', null);
                      handleChange('closeTime', '23:59');
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear date
                  </Button>
                )}

                <p className="text-xs text-slate-400">
                  Survey will automatically stop accepting responses after this date and time
                </p>
              </div>

              {/* Max Responses */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Max Responses (Optional)
                </Label>
                <Input
                  type="number"
                  value={localSettings.maxResponses}
                  onChange={(e) => handleChange('maxResponses', e.target.value)}
                  placeholder="Unlimited"
                  className="bg-slate-800 border-slate-600 text-white"
                />
                <p className="text-xs text-slate-400">
                  Survey will close after reaching this number of responses
                </p>
              </div>

              <Separator className="bg-slate-700" />

              {/* Thank You Message */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Thank You Message
                </Label>
                <Textarea
                  value={localSettings.thankYouMessage}
                  onChange={(e) => handleChange('thankYouMessage', e.target.value)}
                  placeholder="Thank you for completing our survey!"
                  className="bg-slate-800 border-slate-600 text-white min-h-[80px]"
                />
              </div>

              {/* Theme Color */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Primary Color
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={localSettings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <Input
                    value={localSettings.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white font-mono flex-1"
                  />
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Toggle Options */}
              <div className="space-y-4">
                <Label className="text-white font-medium flex items-center gap-2">
                  <ToggleLeft className="w-4 h-4" />
                  Options
                </Label>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Show Progress Bar</p>
                    <p className="text-xs text-slate-400">Display progress at the top</p>
                  </div>
                  <Switch
                    checked={localSettings.showProgressBar}
                    onCheckedChange={(checked) => handleChange('showProgressBar', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Shuffle Questions</p>
                    <p className="text-xs text-slate-400">Randomize question order</p>
                  </div>
                  <Switch
                    checked={localSettings.shuffleQuestions}
                    onCheckedChange={(checked) => handleChange('shuffleQuestions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Allow Multiple Submissions</p>
                    <p className="text-xs text-slate-400">Same user can submit again</p>
                  </div>
                  <Switch
                    checked={localSettings.allowMultipleSubmissions}
                    onCheckedChange={(checked) => handleChange('allowMultipleSubmissions', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Require Login</p>
                    <p className="text-xs text-slate-400">Respondents must sign in</p>
                  </div>
                  <Switch
                    checked={localSettings.requireLogin}
                    onCheckedChange={(checked) => handleChange('requireLogin', checked)}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 pb-8">
                <Button className="w-full" onClick={onClose}>
                  Save Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default SurveySettingsSidebar;
