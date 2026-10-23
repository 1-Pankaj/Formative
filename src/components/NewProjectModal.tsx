/**
 * Formative Studio - Redesigned New Project Modal
 * 
 * A modern new project creation dialog with proper design system integration.
 */

import React, { useState } from 'react';
import { Plus, Layers, FolderOpen, Code, Bot, Database, Network, Cpu, Zap } from 'lucide-react';
import { Project, ThemeMode, ProjectType } from '../types';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription } from './ui/card';
import { cn } from '../lib/utils';

interface NewProjectModalProps {
  theme: ThemeMode;
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

// Project type options
const projectTypes: Array<{
  id: ProjectType;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    id: 'web',
    label: 'Web Application',
    description: 'Full-stack web applications with frontend and backend',
    icon: Network,
  },
  {
    id: 'mobile',
    label: 'Mobile Application',
    description: 'Cross-platform mobile apps with React Native',
    icon: Code,
  },
  {
    id: 'backend',
    label: 'Backend Service',
    description: 'Microservices, APIs, and server-side applications',
    icon: Server,
  },
  {
    id: 'ai-system',
    label: 'AI System',
    description: 'AI agents, LLM pipelines, and intelligent systems',
    icon: Bot,
  },
  {
    id: 'data-pipeline',
    label: 'Data Pipeline',
    description: 'ETL, data processing, and analytics pipelines',
    icon: Database,
  },
  {
    id: 'realtime',
    label: 'Realtime System',
    description: 'WebSocket, live updates, and collaborative systems',
    icon: Zap,
  },
  {
    id: 'general',
    label: 'General',
    description: 'Custom architecture with full flexibility',
    icon: Layers,
  },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  theme,
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const isDark = theme === 'dark';
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [selectedType, setSelectedType] = useState<ProjectType>('general');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  // Handle type selection
  const handleSelectType = (type: ProjectType) => {
    setSelectedType(type);
    setStep('details');
  };

  // Handle back to type selection
  const handleBack = () => {
    setStep('type');
  };

  // Handle project creation
  const handleCreate = () => {
    if (!projectName.trim()) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      description: projectDescription || `Software architecture canvas for ${projectName}`,
      type: selectedType,
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
      issues: [],
    };

    onCreateProject(newProject);
    onClose();
    
    // Reset form
    setProjectName('');
    setProjectDescription('');
    setSelectedType('general');
    setStep('type');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent theme={theme} size="lg" onClose={onClose}>
        <DialogHeader theme={theme}>
          <DialogTitle theme={theme} className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brand-primary" />
            <span>Create New Workspace</span>
          </DialogTitle>
          <DialogDescription theme={theme}>
            {step === 'type' 
              ? 'Choose a project type to get started with the right template' 
              : 'Configure your new workspace details'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Content */}
        <div className="py-4">
          {step === 'type' ? (
            /* Type Selection Step */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {projectTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                
                return (
                  <Card
                    key={type.id}
                    variant={isSelected ? 'elevated' : 'interactive'}
                    theme={theme}
                    onClick={() => handleSelectType(type.id)}
                    className={cn(
                      'cursor-pointer transition-all',
                      isSelected && 'ring-2 ring-brand-primary'
                    )}
                  >
                    <CardHeader theme={theme}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-hover">
                          <Icon className="w-4 h-4 text-brand-primary" />
                        </div>
                        <CardTitle theme={theme} className="text-sm">
                          {type.label}
                        </CardTitle>
                      </div>
                      <CardDescription theme={theme} className="text-xs">
                        {type.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Details Step */
            <div className="space-y-4">
              {/* Project Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Workspace Name
                </label>
                <Input
                  theme={theme}
                  placeholder="My Architecture Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Project Description */}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Brief description of your architecture..."
                  className={cn(
                    `w-full px-3 py-2 rounded-lg border text-sm resize-none`,
                    `focus:outline-none focus:ring-2 focus:ring-brand-primary`,
                    isDark
                      ? 'bg-dark-surface border-dark-border text-text-primary placeholder:text-muted min-h-[100px]'
                      : 'bg-white border-light-border text-zinc-900 placeholder:text-zinc-400 min-h-[100px]'
                  )}
                />
              </div>

              {/* Selected Type Display */}
              <div className="pt-2">
                <p className="text-sm text-muted mb-2">
                  Project Type
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-hover">
                    {projectTypes.find(t => t.id === selectedType)?.icon({ className: 'w-4 h-4 text-brand-primary' })}
                  </div>
                  <span className="text-sm font-medium">
                    {projectTypes.find(t => t.id === selectedType)?.label}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    theme={theme}
                    onClick={handleBack}
                    className="text-xs"
                  >
                    Change
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter theme={theme}>
          {step === 'type' ? (
            <Button variant="outline" size="sm" theme={theme} onClick={onClose}>
              Cancel
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" theme={theme} onClick={handleBack}>
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                theme={theme}
                onClick={handleCreate}
                disabled={!projectName.trim()}
              >
                <Plus className="w-4 h-4" />
                <span>Create Workspace</span>
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
