import React from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleDot,
  FileSearch,
  FolderOpen,
  Layers,
  ListChecks,
} from 'lucide-react';
import { IssueItem, Project, ThemeMode, ViewMode } from '../types';

interface ProjectHomeViewProps {
  theme: ThemeMode;
  project: Project;
  activeTranscriptTitle?: string | null;
  onNavigate: (view: ViewMode) => void;
}

const statusLabel: Record<IssueItem['status'], string> = {
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
};

const formatDate = (value?: string, includeTime = false) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat(undefined, includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }).format(date);
};

export const ProjectHomeView: React.FC<ProjectHomeViewProps> = ({
  theme,
  project,
  activeTranscriptTitle,
  onNavigate,
}) => {
  const isDark = theme !== 'light';
  const issues = project.issues || [];
  const openIssues = issues.filter((issue) => issue.status !== 'done');
  const completeCount = issues.length - openIssues.length;
  const recentIssues = openIssues.slice(0, 3);
  const scan = project.scanSummary;
  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-700';
  const border = isDark ? 'border-[#27272a]' : 'border-zinc-200';
  const surface = isDark ? 'bg-[#121215]' : 'bg-zinc-50';
  const quietSurface = isDark ? 'bg-[#09090b]' : 'bg-white';

  const projectKind = project.type
    ? project.type.replace(/-/g, ' ')
    : 'general';
  const sourceLabel = project.source === 'folder-map'
    ? 'Folder map'
    : project.source === 'starter-example'
      ? 'Starter example'
      : 'Formative project';
  const updatedDate = formatDate(project.updatedAt);

  return (
    <main className={`flex-1 min-h-0 overflow-y-auto ${isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-white text-zinc-950'}`}>
      <div className="mx-auto w-full max-w-6xl px-5 py-6 xl:px-8 xl:py-8">
        <header className={`flex flex-col gap-5 border-b pb-6 xl:flex-row xl:items-end xl:justify-between ${border}`}>
          <div className="min-w-0">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-[0.12em] ${mutedText}`}>
              Project overview
            </p>
            <h1 className="break-words text-2xl font-semibold tracking-tight xl:text-3xl">
              {project.name}
            </h1>
            <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${mutedText}`}>
              {project.description || 'A workspace for this project’s tasks, notes, and project canvas.'}
            </p>
            <div className={`mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs ${mutedText}`}>
              <span className="capitalize">{projectKind}</span>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${project.source === 'folder-map' ? 'bg-sky-500' : project.source === 'starter-example' ? 'bg-amber-500' : 'bg-zinc-400'}`} />
                {sourceLabel}
              </span>
              <span>Updated {updatedDate}</span>
            </div>
            {project.folderPath && (
              <p className={`mt-3 flex max-w-3xl items-center gap-2 truncate font-mono text-[11px] ${mutedText}`} title={project.folderPath}>
                <FolderOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{project.folderPath}</span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate('issues')}
              className={`inline-flex min-h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200 focus-visible:ring-offset-[#09090b]' : 'bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-offset-white'}`}
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              {issues.length === 0 ? 'Create a task' : 'Open tasks'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('architecture')}
              className={`inline-flex min-h-9 items-center gap-2 rounded-lg border px-3.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${border} ${isDark ? 'bg-[#18181c] text-zinc-200 hover:bg-zinc-800 focus-visible:ring-offset-[#09090b]' : 'bg-white text-zinc-800 hover:bg-zinc-100 focus-visible:ring-offset-white'}`}
            >
              <Layers className="h-3.5 w-3.5" aria-hidden="true" />
              Open canvas
            </button>
            <button
              type="button"
              onClick={() => onNavigate('agent-chat')}
              className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#09090b]"
            >
              <Bot className="h-3.5 w-3.5" aria-hidden="true" />
              Agent chat
            </button>
          </div>
        </header>

        <section aria-label="Project summary" className={`grid grid-cols-3 border-b ${border}`}>
          <div className={`py-4 pr-3 ${mutedText}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide">Tasks</p>
            <p className={`mt-1 text-xl font-semibold tabular-nums ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>{issues.length}</p>
          </div>
          <div className={`border-l py-4 pl-4 pr-3 ${border} ${mutedText}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide">Still open</p>
            <p className={`mt-1 text-xl font-semibold tabular-nums ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>{openIssues.length}</p>
          </div>
          <div className={`border-l py-4 pl-4 ${border} ${mutedText}`}>
            <p className="text-[11px] font-medium uppercase tracking-wide">Canvas items</p>
            <p className={`mt-1 text-xl font-semibold tabular-nums ${isDark ? 'text-zinc-100' : 'text-zinc-950'}`}>{project.nodes?.length || 0}</p>
          </div>
        </section>

        <div className="grid gap-8 py-7 xl:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] xl:gap-12">
          <section aria-labelledby="project-next-up-title" className="min-w-0">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id="project-next-up-title" className="text-base font-semibold">Next up</h2>
              <button
                type="button"
                onClick={() => onNavigate('issues')}
                className={`inline-flex items-center gap-1 text-xs font-medium ${isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-700 hover:text-black'} focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500`}
              >
                View tasks <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

            {recentIssues.length > 0 ? (
              <div className={`divide-y overflow-hidden rounded-lg border ${border}`}>
                {recentIssues.map((issue) => (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => onNavigate('issues')}
                    className={`flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${border} ${isDark ? 'hover:bg-[#121215]' : 'hover:bg-zinc-50'}`}
                  >
                    {issue.status === 'blocked'
                      ? <CircleDot className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
                      : <CircleDot className={`h-4 w-4 shrink-0 ${issue.status === 'in_progress' ? 'text-amber-500' : 'text-sky-500'}`} aria-hidden="true" />}
                    <span className={`w-20 shrink-0 font-mono text-[11px] ${mutedText}`}>{issue.key}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{issue.title}</span>
                    <span className={`hidden shrink-0 text-xs sm:block ${mutedText}`}>{statusLabel[issue.status]}</span>
                  </button>
                ))}
              </div>
            ) : issues.length === 0 ? (
              <div className={`rounded-lg border p-4 ${border} ${surface}`}>
                <p className="text-sm font-medium">Give this project a first task</p>
                <p className={`mt-1 max-w-xl text-xs leading-relaxed ${mutedText}`}>
                  Tasks stay with this project. Adding one does not start or assign an agent.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('issues')}
                  className={`mt-3 inline-flex min-h-8 items-center gap-2 rounded-md px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200 focus-visible:ring-offset-[#121215]' : 'bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-offset-zinc-50'}`}
                >
                  <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                  Create first task
                </button>
              </div>
            ) : (
              <div className={`rounded-lg border p-4 ${border} ${surface}`}>
                <p className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                  All {completeCount} {completeCount === 1 ? 'task is' : 'tasks are'} complete
                </p>
                <p className={`mt-1 text-xs leading-relaxed ${mutedText}`}>You can review completed work or add another task.</p>
              </div>
            )}

            <div className="mt-7">
              <h2 className="mb-3 text-base font-semibold">Project areas</h2>
              <div className={`border-y ${border}`}>
                <ProjectAreaRow
                  theme={theme}
                  icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}
                  title="Tasks & issues"
                  detail={`${issues.length} ${issues.length === 1 ? 'task' : 'tasks'} · stored with this project`}
                  onClick={() => onNavigate('issues')}
                />
                <ProjectAreaRow
                  theme={theme}
                  icon={<Layers className="h-4 w-4" aria-hidden="true" />}
                  title="Project canvas"
                  detail={project.source === 'folder-map'
                    ? `${project.nodes?.length || 0} editable items · seeded from a folder scan${project.folderMapCreatedAt ? ` on ${formatDate(project.folderMapCreatedAt)}` : ''}`
                    : `${project.nodes?.length || 0} editable items · maintained by you`}
                  onClick={() => onNavigate('architecture')}
                />
                <ProjectAreaRow
                  theme={theme}
                  icon={<Bot className="h-4 w-4" aria-hidden="true" />}
                  title="Agent chat"
                  detail={`${project.agentConversations?.length || 0} ${project.agentConversations?.length === 1 ? 'conversation' : 'conversations'} · Codex and Claude Code read-only runs`}
                  onClick={() => onNavigate('agent-chat')}
                />
                <ProjectAreaRow
                  theme={theme}
                  icon={<Activity className="h-4 w-4" aria-hidden="true" />}
                  title="Saved transcripts"
                  detail={activeTranscriptTitle
                    ? `Selected transcript: ${activeTranscriptTitle}`
                    : 'Inspect an existing transcript; this does not start an agent'}
                  onClick={() => onNavigate('agent-flow')}
                />
              </div>
            </div>
          </section>

          <aside className="min-w-0 space-y-6">
            {project.source === 'starter-example' && (
              <section aria-label="About this starter example" className={`border-l-2 border-amber-500 pl-3 py-1`}>
                <p className="text-sm font-semibold">Starter example</p>
                <p className={`mt-1 text-xs leading-relaxed ${mutedText}`}>
                  This is a static diagram supplied with Formative. It was not generated from your project files; edit or remove its items as needed.
                </p>
              </section>
            )}

            {!project.folderPath && project.source !== 'starter-example' && (
              <section aria-label="Folder access" className={`rounded-lg border p-4 ${border} ${quietSurface}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <FolderOpen className={`h-4 w-4 ${mutedText}`} aria-hidden="true" />
                  No folder is linked
                </div>
                <p className={`mt-2 text-xs leading-relaxed ${mutedText}`}>
                  This project was created in Formative. Its tasks and canvas are saved locally, but no project files are being read.
                </p>
              </section>
            )}

            {scan && (
              <section aria-labelledby="project-scan-title" className={`rounded-lg border ${border} ${quietSurface}`}>
                <div className={`border-b px-4 py-3 ${border}`}>
                  <div className="flex items-center gap-2">
                    <FileSearch className={`h-4 w-4 ${mutedText}`} aria-hidden="true" />
                    <h2 id="project-scan-title" className="text-sm font-semibold">Folder map evidence</h2>
                  </div>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    Checked {formatDate(scan.inspectedAt, true)}
                  </p>
                </div>

                <div className={`grid grid-cols-3 divide-x border-b text-center ${isDark ? 'divide-[#27272a] border-[#27272a]' : 'divide-zinc-200 border-zinc-200'}`}>
                  <ScanStat theme={theme} label="Root entries" value={`${scan.rootEntryCount ?? 0}${scan.rootEntriesTruncated ? '+' : ''}`} />
                  <ScanStat theme={theme} label="Folders mapped" value={scan.mappedFolderCount ?? 0} />
                  <ScanStat theme={theme} label="Files seen" value={scan.visibleFileCount ?? 0} />
                </div>

                <details className="group">
                  <summary className={`cursor-pointer list-none px-4 py-3 text-xs font-medium ${isDark ? 'text-zinc-300 hover:text-white' : 'text-zinc-800 hover:text-black'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500`}>
                    What was checked and what it means
                    <span className="float-right transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                  </summary>
                  <div className={`border-t px-4 py-3 ${border}`}>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      This report refreshes when you open the same folder again. Your editable canvas is preserved and is not regenerated.
                    </p>
                    <p className={`mt-2 text-xs leading-relaxed ${mutedText}`}>
                      The folder scan saw {scan.rootEntryCount ?? 0}{scan.rootEntriesTruncated ? '+' : ''} root entries; {scan.visibleFolderCount ?? 0} visible top-level folders were found, with at most {scan.mappedFolderCount ?? 0} shown on the canvas.
                    </p>
                    <p className={`text-xs leading-relaxed ${mutedText}`}>
                      Suggested type: <span className={`font-semibold capitalize ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{(scan.suggestedType || project.type || 'general').replace(/-/g, ' ')}</span>. {scan.suggestionReason || 'No supported project markers were found.'}
                    </p>
                    {(scan.evidence || []).length > 0 ? (
                      <ul className="mt-3 space-y-3">
                        {(scan.evidence || []).map((item) => (
                          <li key={item.path} className="text-xs leading-relaxed">
                            <code className={`font-mono font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{item.path}</code>
                            <p className={`mt-0.5 ${mutedText}`}>{item.observation} {item.meaning}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`mt-3 text-xs leading-relaxed ${mutedText}`}>
                        No supported project markers were found. The suggested type is general.
                      </p>
                    )}
                    <ul className={`mt-3 list-disc space-y-1 pl-4 text-xs leading-relaxed ${mutedText}`}>
                      {(scan.limitations || []).map((limitation) => <li key={limitation}>{limitation}</li>)}
                    </ul>
                  </div>
                </details>
              </section>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
};

interface ProjectAreaRowProps {
  theme: ThemeMode;
  icon: React.ReactNode;
  title: string;
  detail: string;
  onClick: () => void;
}

const ProjectAreaRow: React.FC<ProjectAreaRowProps> = ({ theme, icon, title, detail, onClick }) => {
  const isDark = theme !== 'light';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${isDark ? 'border-[#27272a] hover:bg-[#121215]' : 'border-zinc-200 hover:bg-zinc-50'}`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${isDark ? 'bg-[#18181c] text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className={`mt-0.5 block truncate text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-700'}`}>{detail}</span>
      </span>
      <ArrowRight className={`h-4 w-4 shrink-0 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`} aria-hidden="true" />
    </button>
  );
};

const ScanStat: React.FC<{ theme: ThemeMode; label: string; value: number | string }> = ({ theme, label, value }) => (
  <div className={`min-w-0 py-3 ${theme === 'light' ? 'text-zinc-700' : 'text-zinc-400'}`}>
    <p className={`truncate px-1 text-sm font-semibold tabular-nums ${theme === 'light' ? 'text-zinc-950' : 'text-zinc-100'}`}>{value}</p>
    <p className="mt-0.5 truncate px-1 text-[10px]">{label}</p>
  </div>
);
