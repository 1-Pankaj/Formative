/**
 * Formative Studio - Redesigned Welcome Screen
 * 
 * A modern, clean welcome screen with proper design system integration.
 */

import React from 'react';
import { 
  FolderOpen, 
  Plus, 
  Bot, 
  Trash2, 
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
  ExternalLink,
  Crown,
  Search
} from 'lucide-react';
import { Project, ThemeMode } from '../types';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { cn, getInitials, truncate } from '../lib/utils';
import formativeLogo from '../assets/FormativeLogo.png';

interface WelcomeScreenProps {
  theme: ThemeMode;
  projects: Project[];
  onOpenProject: (id: string) => void;
  onScanDirectory: () => void;
  onNewProject: () => void;
  onOpenAiTelemetry: () => void;
  onLoadTemplate: (template?: Project) => void;
  onOpenOnboarding: () => void;
  onDeleteProject?: (id: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  theme,
  projects,
  onOpenProject,
  onScanDirectory,
  onNewProject,
  onOpenAiTelemetry,
  onLoadTemplate,
  onOpenOnboarding,
  onDeleteProject,
}) => {
  const isDark = theme !== 'light';
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.type.toLowerCase().includes(query)
    );
  });

  return (
    <div
      className={cn(
        `flex-1 h-full overflow-y-auto px-8 py-8 select-none`,
        isDark ? 'bg-dark-background text-text-primary' : 'bg-light-background text-zinc-900'
      )}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div
          className={cn(
            'pb-6 border-b flex items-center justify-between',
            isDark ? 'border-dark-border' : 'border-light-border'
          )}
        >
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center p-2 shadow-sm border',
                isDark ? 'bg-dark-surface border-dark-border' : 'bg-light-surface border-light-border'
              )}
            >
              <img
                src={formativeLogo}
                alt="Formative Studio"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Formative Studio
              </h1>
              <p className="text-sm text-muted mt-0.5">
                Desktop Software Architecture & Single-Agent Orchestration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              theme={theme}
              onClick={onOpenOnboarding}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-primary" />
              <span>Interactive Guide</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              theme={theme}
              onClick={onNewProject}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Workspace</span>
            </Button>
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scan Project Card */}
          <Card variant="elevated" theme={theme}>
            <CardHeader theme={theme}>
              <CardTitle theme={theme} className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-brand-primary" />
                <span>Scan Local Project</span>
              </CardTitle>
              <CardDescription theme={theme}>
                Open any local repository to automatically analyze directory structures
                and generate an initial architecture map.
              </CardDescription>
            </CardHeader>
            <CardFooter theme={theme}>
              <Button
                variant="primary"
                size="sm"
                theme={theme}
                onClick={onScanDirectory}
              >
                Scan Project Folder
              </Button>
            </CardFooter>
          </Card>

          {/* AI Telemetry Card */}
          <Card variant="elevated" theme={theme}>
            <CardHeader theme={theme}>
              <CardTitle theme={theme} className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-brand-accent" />
                <span>AI Agent Telemetry</span>
              </CardTitle>
              <CardDescription theme={theme}>
                Connect to local AI agent sessions (Claude Code, Antigravity, OpenCode)
                to stream real-time tool execution and reasoning.
              </CardDescription>
            </CardHeader>
            <CardFooter theme={theme}>
              <Button
                variant="outline"
                size="sm"
                theme={theme}
                onClick={onOpenAiTelemetry}
              >
                Connect Agent
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Templates Section */}
        <Card variant="bordered" theme={theme}>
          <CardHeader theme={theme}>
            <CardTitle theme={theme} className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-primary" />
              <span>Starter Blueprints</span>
            </CardTitle>
            <CardDescription theme={theme}>
              Jumpstart your architecture with production-grade blueprints
            </CardDescription>
          </CardHeader>
          <CardContent theme={theme}>
            <p className="text-sm text-muted mb-3">
              Choose from 7 pre-built architecture templates or start from scratch.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Full-Stack Web',
                'AI Agent Workflow',
                'Microservices',
                'Mobile Engine',
                'Realtime System',
                'Data Pipeline',
                'Blank Canvas'
              ].map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  theme={theme}
                  onClick={() => onLoadTemplate()}
                  className="text-xs h-8"
                >
                  {template}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Workspaces Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Recent Workspaces
              </h2>
              <p className="text-sm text-muted">
                {projects.length} active workspaces
              </p>
            </div>
            
            {/* Search */}
            <div className="w-48">
              <Input
                theme={theme}
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                className="text-sm"
              />
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            <Card variant="bordered" theme={theme} className="text-center">
              <CardContent theme={theme} className="py-8">
                <div className="w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-3">
                  <Layers className="w-6 h-6 text-muted" />
                </div>
                <CardTitle theme={theme} className="text-lg mb-2">
                  No workspaces yet
                </CardTitle>
                <CardDescription theme={theme} className="mb-4">
                  Open an existing project folder or create a fresh architecture canvas to get started.
                </CardDescription>
                <Button
                  variant="primary"
                  size="sm"
                  theme={theme}
                  onClick={onNewProject}
                >
                  + Create First Workspace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects.map((proj) => (
                <Card
                  key={proj.id}
                  variant="interactive"
                  theme={theme}
                  onClick={() => onOpenProject(proj.id)}
                  className="cursor-pointer"
                >
                  <CardHeader theme={theme}>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0',
                          isDark 
                            ? 'bg-dark-surface-hover text-text-primary' 
                            : 'bg-light-surface-hover text-zinc-900'
                        )}
                      >
                        {getInitials(proj.name, 2)}
                      </div>
                      <div className="min-w-0">
                        <CardTitle theme={theme} className="text-base">
                          {proj.name}
                        </CardTitle>
                        <CardDescription theme={theme}>
                          {truncate(proj.description || '', 60)}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter theme={theme}>
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={cn(
                          'text-xs font-mono px-2 py-0.5 rounded border',
                          isDark 
                            ? 'bg-dark-surface-hover border-dark-border text-text-muted' 
                            : 'bg-light-surface-hover border-light-border text-zinc-600'
                        )}
                      >
                        {proj.type || 'workspace'}
                      </span>
                      <span className="text-xs text-muted">
                        {proj.nodes?.length || 0} nodes
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={cn(
            'pt-4 border-t text-center',
            isDark ? 'border-dark-border text-muted' : 'border-light-border text-zinc-500'
          )}
        >
          <p className="text-xs">
            Formative Studio v1.0.0 - Built with React 19, TypeScript, and Electron
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
