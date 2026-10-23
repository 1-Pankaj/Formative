/**
 * Formative Studio - Redesigned Launchpad Modal
 * 
 * A modern launchpad with proper design system integration.
 */

import React, { useState } from 'react';
import {
  Layers,
  FolderOpen,
  Plus,
  Bot,
  Trash2,
  BookOpen,
  ArrowRight,
  Search,
  Crown,
  Code,
  Terminal,
  Database,
  FileText,
  ExternalLink,
  Sparkles,
  Network
} from 'lucide-react';
import { Project, ThemeMode, AgentProvider, AgentSession, ProjectType } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { cn, getInitials, truncate } from '../lib/utils';

interface LaunchpadModalProps {
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  sessions: AgentSession[];
  selectedProvider: AgentProvider;
  onChangeProvider: (provider: AgentProvider) => void;
  onSelectSession: (session: AgentSession) => void;
  onScanDirectory: () => void;
  onSelectCustomTranscript: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateBlankProject: (name: string, type: ProjectType) => void;
  onDeleteProject: (id: string) => void;
  onLoadTemplate: (template?: Project) => void;
}

export const LaunchpadModal: React.FC<LaunchpadModalProps> = ({
  theme,
  isOpen,
  onClose,
  sessions,
  selectedProvider,
  onChangeProvider,
  onSelectSession,
  onScanDirectory,
  onSelectCustomTranscript,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateBlankProject,
  onDeleteProject,
  onLoadTemplate,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'projects' | 'ai' | 'templates'>('projects');
  const [newProjectName, setNewProjectName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query)
    );
  });

  // Provider options
  const providers: Array<{ id: AgentProvider; label: string; icon: React.ElementType }> = [
    { id: 'claude-code', label: 'Claude Code', icon: Crown },
    { id: 'opencode', label: 'OpenCode', icon: Code },
    { id: 'antigravity', label: 'Antigravity', icon: Sparkles },
    { id: 'custom', label: 'Custom File', icon: FileText },
  ];

  // Template options
  const templates = [
    { name: 'Full-Stack Web', type: 'web' as ProjectType, description: 'React/Next.js frontend with API Gateway and PostgreSQL' },
    { name: 'AI Agent Workflow', type: 'ai-system' as ProjectType, description: 'Autonomous AI agent with tool orchestration' },
    { name: 'Microservices', type: 'backend' as ProjectType, description: 'Cloud microservices with event-driven architecture' },
    { name: 'Mobile Engine', type: 'mobile' as ProjectType, description: 'React Native with GraphQL and Lambda workers' },
    { name: 'Realtime System', type: 'realtime' as ProjectType, description: 'Collaborative canvas with WebSocket signaling' },
    { name: 'Data Pipeline', type: 'data-pipeline' as ProjectType, description: 'Vector lakehouse with ingestion and embedding workers' },
  ];

  // Handle project creation
  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateBlankProject(newProjectName, 'general');
      setNewProjectName('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        theme={theme}
        size="xl"
        onClose={onClose}
        className="max-w-4xl"
      >
        <DialogHeader theme={theme}>
          <DialogTitle theme={theme} className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <span>Studio Launchpad</span>
          </DialogTitle>
          <DialogDescription theme={theme}>
            Open workspaces, connect AI agents, or start from a template
          </DialogDescription>
        </DialogHeader>

        {/* Tabs */}
        <div
          className={cn(
            'flex border-b',
            isDark ? 'border-dark-border' : 'border-light-border'
          )}
        >
          {[
            { id: 'projects', label: 'Workspaces' },
            { id: 'ai', label: 'AI Agents' },
            { id: 'templates', label: 'Templates' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              theme={theme}
              onClick={() => setActiveTab(tab.id as 'projects' | 'ai' | 'templates')}
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
        <div className="py-4">
          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {/* Search and New Project */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    theme={theme}
                    placeholder="Search workspaces..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="text-sm"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  theme={theme}
                  onClick={onScanDirectory}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Scan Folder</span>
                </Button>
              </div>

              {/* Project List */}
              {filteredProjects.length === 0 ? (
                <Card variant="bordered" theme={theme} className="text-center">
                  <CardContent theme={theme} className="py-6">
                    <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                      <Layers className="w-6 h-6 text-muted" />
                    </div>
                    <CardTitle theme={theme} className="text-lg mb-2">
                      No workspaces found
                    </CardTitle>
                    <CardDescription theme={theme}>
                      Create a new workspace or scan a project folder to get started.
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredProjects.map((proj) => {
                    const Icon = proj.type === 'web' ? Network : 
                                proj.type === 'backend' ? Terminal : 
                                proj.type === 'ai-system' ? Bot : 
                                proj.type === 'mobile' ? Code : 
                                Layers;
                    
                    return (
                      <Card
                        key={proj.id}
                        variant={activeProjectId === proj.id ? 'elevated' : 'bordered'}
                        theme={theme}
                        onClick={() => onSelectProject(proj.id)}
                        className="cursor-pointer"
                      >
                        <CardHeader theme={theme}>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                                isDark 
                                  ? 'bg-dark-surface-hover text-dark-text-primary' 
                                  : 'bg-light-surface-hover text-zinc-900'
                              )}
                            >
                              {getInitials(proj.name, 2)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <CardTitle theme={theme} className="text-base">
                                {proj.name}
                              </CardTitle>
                              <CardDescription theme={theme}>
                                {truncate(proj.description || '', 60)}
                              </CardDescription>
                            </div>
                            
                            {/* Active indicator */}
                            {activeProjectId === proj.id && (
                              <span className="w-2 h-2 rounded-full bg-brand-primary" />
                            )}
                          </div>
                        </CardHeader>
                        <CardFooter theme={theme}>
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={cn(
                                'text-xs font-mono px-2 py-0.5 rounded border',
                                isDark 
                                  ? 'bg-dark-surface-hover border-dark-border text-dark-text-muted' 
                                  : 'bg-light-surface-hover border-light-border text-zinc-600'
                              )}
                            >
                              {proj.type || 'workspace'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted">
                                {proj.nodes?.length || 0} nodes
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                theme={theme}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteProject(proj.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* New Project Form */}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    theme={theme}
                    placeholder="New workspace name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    className="flex-1 text-sm"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    theme={theme}
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {/* Provider Selection */}
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  AI Provider
                </h3>
                <div className="flex flex-wrap gap-2">
                  {providers.map((provider) => {
                    const Icon = provider.icon;
                    const isSelected = selectedProvider === provider.id;
                    
                    return (
                      <Button
                        key={provider.id}
                        variant={isSelected ? 'primary' : 'outline'}
                        size="sm"
                        theme={theme}
                        onClick={() => onChangeProvider(provider.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{provider.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Sessions List */}
              <div>
                <h3 className="text-sm font-semibold mb-2">
                  Available Sessions
                </h3>
                
                {sessions.length === 0 ? (
                  <Card variant="bordered" theme={theme} className="text-center">
                    <CardContent theme={theme} className="py-6">
                      <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                        <Bot className="w-6 h-6 text-muted" />
                      </div>
                      <CardTitle theme={theme} className="text-lg mb-2">
                        No sessions found
                      </CardTitle>
                      <CardDescription theme={theme}>
                        {selectedProvider === 'custom' 
                          ? 'Select a custom transcript file to connect' 
                          : `No active ${selectedProvider} sessions detected`}
                      </CardDescription>
                      
                      {selectedProvider === 'custom' && (
                        <Button
                          variant="outline"
                          size="sm"
                          theme={theme}
                          onClick={onSelectCustomTranscript}
                          className="mt-3"
                        >
                          <FileText className="w-4 h-4" />
                          <span>Select Custom File</span>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessions.map((session) => (
                      <Card
                        key={session.id}
                        variant="interactive"
                        theme={theme}
                        onClick={() => onSelectSession(session)}
                        className="cursor-pointer"
                      >
                        <CardHeader theme={theme}>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle theme={theme} className="text-sm">
                                {session.title}
                              </CardTitle>
                              <CardDescription theme={theme}>
                                {session.provider} - {session.lineCount} lines
                              </CardDescription>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted" />
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Choose from 7 production-grade architecture blueprints to jumpstart your design.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.name}
                    variant="interactive"
                    theme={theme}
                    onClick={() => onLoadTemplate()}
                    className="cursor-pointer"
                  >
                    <CardHeader theme={theme}>
                      <CardTitle theme={theme} className="text-base">
                        {template.name}
                      </CardTitle>
                      <CardDescription theme={theme}>
                        {template.type}
                      </CardDescription>
                    </CardHeader>
                    <CardContent theme={theme}>
                      <p className="text-sm text-muted">
                        {template.description}
                      </p>
                    </CardContent>
                    <CardFooter theme={theme}>
                      <Button
                        variant="ghost"
                        size="sm"
                        theme={theme}
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoadTemplate();
                        }}
                      >
                        Use Template
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
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

export default LaunchpadModal;
