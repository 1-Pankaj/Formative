/**
 * Formative Studio - Redesigned Settings Modal
 * 
 * A modern settings dialog with proper design system integration.
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  Palette, 
  FolderOpen, 
  FileText, 
  Clock, 
  Bell, 
  HelpCircle
} from 'lucide-react';
import { ThemeMode } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'general' | 'paths' | 'appearance' | 'about'>('general');
  
  // Load saved settings from localStorage
  const [claudePath, setClaudePath] = useState(() => {
    return localStorage.getItem('formative_claude_path') || '';
  });
  
  const [antigravityPath, setAntigravityPath] = useState(() => {
    return localStorage.getItem('formative_antigravity_path') || '';
  });
  
  const [memoryWindow, setMemoryWindow] = useState(() => {
    return localStorage.getItem('formative_memory_window') || '50';
  });
  
  const [autoSaveInterval, setAutoSaveInterval] = useState(() => {
    return localStorage.getItem('formative_autosave_sec') || '30';
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('formative_claude_path', claudePath);
    localStorage.setItem('formative_antigravity_path', antigravityPath);
    localStorage.setItem('formative_memory_window', memoryWindow);
    localStorage.setItem('formative_autosave_sec', autoSaveInterval);
  }, [claudePath, antigravityPath, memoryWindow, autoSaveInterval]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent theme={theme} size="lg" onClose={onClose}>
        <DialogHeader theme={theme}>
          <DialogTitle theme={theme} className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-primary" />
            <span>Studio Preferences</span>
          </DialogTitle>
          <DialogDescription theme={theme}>
            Configure Formative Studio settings and preferences
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div
          className={cn(
            'flex border-b mb-4',
            isDark ? 'border-dark-border' : 'border-light-border'
          )}
        >
          {[
            { id: 'general', label: 'General' },
            { id: 'paths', label: 'Paths' },
            { id: 'appearance', label: 'Appearance' },
            { id: 'about', label: 'About' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              theme={theme}
              onClick={() => setActiveTab(tab.id as 'general' | 'paths' | 'appearance' | 'about')}
              className={cn(
                'rounded-none',
                activeTab === tab.id 
                  ? 'border-b-2 border-brand-primary text-brand-primary' 
                  : ''
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Auto-Save</span>
                  </CardTitle>
                  <CardDescription theme={theme}>
                    Configure automatic saving of your work
                  </CardDescription>
                </CardHeader>
                <CardContent theme={theme}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Auto-save Interval (seconds)
                    </label>
                    <Input
                      theme={theme}
                      type="number"
                      value={autoSaveInterval}
                      onChange={(e) => setAutoSaveInterval(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </CardTitle>
                  <CardDescription theme={theme}>
                    Configure notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent theme={theme}>
                  <p className="text-sm text-muted">
                    Notification settings coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Paths Tab */}
          {activeTab === 'paths' && (
            <div className="space-y-4">
              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span>AI Agent Paths</span>
                  </CardTitle>
                  <CardDescription theme={theme}>
                    Configure paths to AI agent session directories
                  </CardDescription>
                </CardHeader>
                <CardContent theme={theme} className="space-y-4">
                  {/* Claude Code Path */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>Claude Code</span>
                      <span className="text-xs text-muted">~/.claude/projects/</span>
                    </label>
                    <Input
                      theme={theme}
                      placeholder="/path/to/claude/projects"
                      value={claudePath}
                      onChange={(e) => setClaudePath(e.target.value)}
                    />
                  </div>

                  {/* Antigravity Path */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <span>Antigravity</span>
                      <span className="text-xs text-muted">~/.gemini/antigravity/brain/</span>
                    </label>
                    <Input
                      theme={theme}
                      placeholder="/path/to/antigravity/brain"
                      value={antigravityPath}
                      onChange={(e) => setAntigravityPath(e.target.value)}
                    />
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    theme={theme}
                    onClick={() => {
                      // Reset to defaults
                      setClaudePath('');
                      setAntigravityPath('');
                    }}
                  >
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>

              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Memory Window</span>
                  </CardTitle>
                  <CardDescription theme={theme}>
                    Number of recent agent steps to keep in memory
                  </CardDescription>
                </CardHeader>
                <CardContent theme={theme}>
                  <div className="space-y-2">
                    <Input
                      theme={theme}
                      type="number"
                      value={memoryWindow}
                      onChange={(e) => setMemoryWindow(e.target.value)}
                      className="w-32"
                    />
                    <p className="text-xs text-muted">
                      Higher values use more memory but provide better context
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>Theme</span>
                  </CardTitle>
                  <CardDescription theme={theme}>
                    Choose your preferred color scheme
                  </CardDescription>
                </CardHeader>
                <CardContent theme={theme}>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'dark' ? 'primary' : 'outline'}
                      size="sm"
                      theme={theme}
                      onClick={onToggleTheme}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      <span>Dark Mode</span>
                    </Button>
                    <Button
                      variant={theme === 'light' ? 'primary' : 'outline'}
                      size="sm"
                      theme={theme}
                      onClick={onToggleTheme}
                      className="flex-1 flex items-center gap-2"
                    >
                      <Sun className="w-4 h-4" />
                      <span>Light Mode</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>UI Preferences</span>
                  </CardTitle>
                  <CardDescription theme={theme}>
                    Customize the user interface
                  </CardDescription>
                </CardHeader>
                <CardContent theme={theme}>
                  <p className="text-sm text-muted">
                    More UI customization options coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <Card variant="bordered" theme={theme}>
                <CardHeader theme={theme}>
                  <CardTitle theme={theme} className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>About Formative Studio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent theme={theme} className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Formative Studio
                    </h3>
                    <p className="text-sm text-muted">
                      Desktop Software Architecture & Single-Agent Orchestration Canvas
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted mb-1">Version</p>
                      <p>1.0.0</p>
                    </div>
                    <div>
                      <p className="text-muted mb-1">License</p>
                      <p>MIT</p>
                    </div>
                    <div>
                      <p className="text-muted mb-1">Built With</p>
                      <p>React 19, TypeScript, Electron</p>
                    </div>
                    <div>
                      <p className="text-muted mb-1">Author</p>
                      <p>Formative Open Source</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-xs text-muted">
                      Formative Studio is an open-source visual architecture tool that bridges
                      software architecture blueprints with live AI agent execution.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter theme={theme}>
          <Button variant="outline" size="sm" theme={theme} onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
