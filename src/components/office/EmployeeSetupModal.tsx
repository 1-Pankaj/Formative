import React, { useEffect, useMemo, useRef, useState } from 'react';
import { OfficeDepartment, OfficeMemberProfile, ProjectOfficeTeam, ThemeMode } from '../../types';
import { createOfficeMemberProfile, MAX_OFFICE_EMPLOYEES } from './officeCast';
import { useOfficeModalAccessibility } from './useOfficeModalAccessibility';

interface EmployeeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: ProjectOfficeTeam;
  theme: ThemeMode;
  onSave: (team: ProjectOfficeTeam) => Promise<boolean>;
}

const DEPARTMENTS: { id: OfficeDepartment; label: string }[] = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'qa', label: 'Quality and release' },
  { id: 'database', label: 'Data and storage' },
  { id: 'general', label: 'General' },
];

const HAIR_STYLES = [
  ['short', 'Short'], ['curly', 'Curly'], ['bald', 'Bald'], ['buzz', 'Buzz cut'],
  ['ponytail', 'Ponytail'], ['messy', 'Messy'], ['long', 'Long'], ['bun', 'Bun'], ['cap', 'Cap'],
] as const;

const PROVIDERS = [
  ['', 'Use the chat selection'],
  ['codex-cli', 'Codex CLI'],
  ['claude-code', 'Claude Code CLI'],
] as const;

function parseSkills(value: string): string[] {
  const parsed: string[] = [];
  const seen = new Set<string>();
  for (const candidate of value.split(',')) {
    const skill = candidate.trim().replace(/\s+/g, ' ').slice(0, 80);
    const key = skill.toLocaleLowerCase();
    if (!skill || seen.has(key)) continue;
    seen.add(key);
    parsed.push(skill);
    if (parsed.length === 20) break;
  }
  return parsed;
}

export const EmployeeSetupModal: React.FC<EmployeeSetupModalProps> = ({ isOpen, onClose, team, theme, onSave }) => {
  const isDark = theme !== 'light';
  const [draft, setDraft] = useState<ProjectOfficeTeam>(team);
  const [skillsDraft, setSkillsDraft] = useState<Record<string, string>>({});
  const [addingDepartment, setAddingDepartment] = useState<OfficeDepartment>('frontend');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);

  useOfficeModalAccessibility(isOpen, dialogRef, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setDraft({ ceo: { ...team.ceo, appearance: { ...team.ceo.appearance }, skills: [...team.ceo.skills] }, employees: team.employees.map((item) => ({ ...item, appearance: { ...item.appearance }, skills: [...item.skills] })) });
    setSkillsDraft(Object.fromEntries([[team.ceo.id, team.ceo.skills.join(', ')], ...team.employees.map((item) => [item.id, item.skills.join(', ')])]));
    setError(null);
    setSaving(false);
  }, [isOpen, team]);

  const shell = isDark ? 'border-[#27272a] bg-[#121215] text-zinc-100' : 'border-zinc-200 bg-white text-zinc-950';
  const line = isDark ? 'border-[#27272a]' : 'border-zinc-200';
  const quiet = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const input = isDark
    ? 'border-[#3a3a40] bg-[#09090b] text-zinc-100 focus:border-zinc-400'
    : 'border-zinc-300 bg-white text-zinc-900 focus:border-zinc-600';
  const action = isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-700';
  const hasChanges = useMemo(() => JSON.stringify(team) !== JSON.stringify(draft), [team, draft]);

  if (!isOpen) return null;

  const updateCeo = (patch: Partial<OfficeMemberProfile>) => {
    setDraft((current) => ({ ...current, ceo: { ...current.ceo, ...patch } }));
  };
  const updateEmployee = (id: string, patch: Partial<OfficeMemberProfile>) => {
    setDraft((current) => ({ ...current, employees: current.employees.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  };
  const updateAppearance = (profile: OfficeMemberProfile, key: keyof OfficeMemberProfile['appearance'], value: string | boolean) => ({
    ...profile,
    appearance: { ...profile.appearance, [key]: value },
  });
  const addEmployee = () => {
    if (draft.employees.length >= MAX_OFFICE_EMPLOYEES) {
      setError('A project can have up to 23 office employees.');
      return;
    }
    setDraft((current) => ({ ...current, employees: [...current.employees, createOfficeMemberProfile(addingDepartment)] }));
    setError(null);
  };
  const save = async () => {
    if (saving || !hasChanges) return;
    if ([draft.ceo, ...draft.employees].some((profile) => !profile.name.trim() || !profile.roleTitle.trim())) {
      setError('Every teammate needs a name and role before the team can be saved.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await onSave(draft);
      if (saved) onClose();
      else setError('Formative could not save the team. Your edits are still here; try again.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Formative could not save the team.');
    } finally {
      setSaving(false);
    }
  };

  const renderIdentity = (profile: OfficeMemberProfile, onChange: (patch: Partial<OfficeMemberProfile>) => void, isCeo = false) => (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className={`mb-1 block text-xs font-medium ${quiet}`}>Name</span>
        <input value={profile.name} maxLength={80} onChange={(event) => onChange({ name: event.target.value })} className={`h-9 w-full rounded-md border px-3 text-sm outline-none ${input}`} />
      </label>
      <label className="block">
        <span className={`mb-1 block text-xs font-medium ${quiet}`}>{isCeo ? 'Role' : 'Role title'}</span>
        <input value={profile.roleTitle} maxLength={100} onChange={(event) => onChange({ roleTitle: event.target.value })} className={`h-9 w-full rounded-md border px-3 text-sm outline-none ${input}`} />
      </label>
      {!isCeo && (
        <label className="block">
          <span className={`mb-1 block text-xs font-medium ${quiet}`}>Department</span>
          <select value={profile.department} onChange={(event) => onChange({ department: event.target.value as OfficeDepartment })} className={`h-9 w-full rounded-md border px-3 text-sm outline-none ${input}`}>
            {DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{department.label}</option>)}
          </select>
        </label>
      )}
      <label className="block">
        <span className={`mb-1 block text-xs font-medium ${quiet}`}>Preferred agent</span>
        <select value={profile.preferredProviderId || ''} onChange={(event) => onChange({ preferredProviderId: (event.target.value || undefined) as OfficeMemberProfile['preferredProviderId'] })} className={`h-9 w-full rounded-md border px-3 text-sm outline-none ${input}`}>
          {PROVIDERS.map(([id, label]) => <option key={id || 'selected'} value={id}>{label}</option>)}
        </select>
      </label>
      <label className="block sm:col-span-2">
        <span className={`mb-1 block text-xs font-medium ${quiet}`}>Skills</span>
        <input
          value={skillsDraft[profile.id] ?? profile.skills.join(', ')}
          maxLength={1200}
          onChange={(event) => {
            setSkillsDraft((current) => ({ ...current, [profile.id]: event.target.value }));
            onChange({ skills: parseSkills(event.target.value) });
          }}
          onBlur={(event) => {
            const skills = parseSkills(event.target.value);
            onChange({ skills });
            setSkillsDraft((current) => ({ ...current, [profile.id]: skills.join(', ') }));
          }}
          placeholder="Separate skills with commas"
          className={`h-9 w-full rounded-md border px-3 text-sm outline-none ${input}`}
        />
      </label>
    </div>
  );

  const renderAppearance = (profile: OfficeMemberProfile, onChange: (profile: OfficeMemberProfile) => void) => (
    <fieldset className={`mt-4 rounded-lg border p-3 ${line}`}>
      <legend className={`px-1 text-xs font-medium ${quiet}`}>Appearance</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex min-h-10 items-center justify-between gap-3">
          <span className="text-sm">Hair style</span>
          <select value={profile.appearance.hairStyle} onChange={(event) => onChange(updateAppearance(profile, 'hairStyle', event.target.value) as OfficeMemberProfile)} className={`h-9 max-w-40 rounded-md border px-2 text-sm outline-none ${input}`}>
            {HAIR_STYLES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {([
          ['skin', 'Skin'], ['hair', 'Hair color'], ['shirt', 'Clothing'], ['pants', 'Trousers'],
          ...(profile.appearance.suit ? [['tie', 'Tie'] as const] : []),
          ...(profile.appearance.hairStyle === 'cap' ? [['cap', 'Cap'] as const] : []),
        ] as const).map(([key, label]) => (
          <label key={key} className="flex min-h-10 items-center justify-between gap-3">
            <span className="text-sm">{label}</span>
            <input type="color" value={(profile.appearance[key] as string) || '#000000'} aria-label={`${profile.name} ${label.toLowerCase()}`} onChange={(event) => onChange(updateAppearance(profile, key, event.target.value) as OfficeMemberProfile)} className={`h-8 w-12 cursor-pointer rounded border p-0.5 ${line} ${isDark ? 'bg-[#09090b]' : 'bg-white'}`} />
          </label>
        ))}
        {([
          ['glasses', 'Glasses'], ['headset', 'Headset'], ['suit', 'Suit jacket'],
        ] as const).map(([key, label]) => (
          <label key={key} className={`flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 ${line}`}>
            <span className="text-sm">{label}</span>
            <input type="checkbox" checked={Boolean(profile.appearance[key])} onChange={(event) => onChange(updateAppearance(profile, key, event.target.checked) as OfficeMemberProfile)} aria-label={`${profile.name} ${label.toLowerCase()}`} className="h-4 w-4 accent-zinc-800" />
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="office-team-title" className={`flex max-h-[min(900px,94vh)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border shadow-2xl outline-none ${shell}`}>
        <header className={`flex shrink-0 items-start justify-between gap-5 border-b px-5 py-4 ${line}`}>
          <div>
            <h2 id="office-team-title" className="text-base font-semibold">Team setup</h2>
          <p className={`mt-1 max-w-2xl text-sm leading-5 ${quiet}`}>Choose who appears in this project’s office, set their roles and skills, and customize how they look. The coordinator remains available even when no employees are enabled.</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving} className={`shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium ${isDark ? 'text-zinc-300 hover:bg-[#222226]' : 'text-zinc-700 hover:bg-zinc-100'}`}>Close</button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <section aria-labelledby="office-coordinator-heading">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <h3 id="office-coordinator-heading" className="text-sm font-semibold">Project coordinator</h3>
                <p className={`mt-0.5 text-xs ${quiet}`}>Required project coordinator. Chat uses a supported local agent you select.</p>
              </div>
              <span className={`text-xs ${quiet}`}>Required</span>
            </div>
            {renderIdentity(draft.ceo, updateCeo, true)}
            {renderAppearance(draft.ceo, (profile) => updateCeo({ appearance: profile.appearance }))}
          </section>

          <section className={`mt-6 border-t pt-5 ${line}`} aria-labelledby="office-employees-heading">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 id="office-employees-heading" className="text-sm font-semibold">Employees</h3>
                <p className={`mt-0.5 text-xs ${quiet}`}>{draft.employees.filter((item) => item.enabled).length} of {draft.employees.length} appear in the office. Removing a teammate clears their task assignments.</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="new-office-department">New employee role</label>
                <select id="new-office-department" value={addingDepartment} onChange={(event) => setAddingDepartment(event.target.value as OfficeDepartment)} className={`h-9 rounded-md border px-2.5 text-xs outline-none ${input}`}>
                  {DEPARTMENTS.map((department) => <option key={department.id} value={department.id}>{department.label}</option>)}
                </select>
                <button type="button" onClick={addEmployee} disabled={draft.employees.length >= MAX_OFFICE_EMPLOYEES} className={`h-9 rounded-md px-3 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${action}`}>Add employee</button>
              </div>
            </div>

            {draft.employees.length === 0 ? (
              <div className={`rounded-lg border border-dashed px-4 py-5 text-sm ${line} ${quiet}`}>No employees added. Add only the roles you want to see in this project.</div>
            ) : (
              <div className="space-y-3">
                {draft.employees.map((employee, index) => (
                  <details key={employee.id} open={index === 0} className={`rounded-lg border ${line}`}>
                    <summary className={`flex cursor-pointer list-none items-center gap-3 px-3.5 py-3 [&::-webkit-details-marker]:hidden ${isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-zinc-50'}`}>
                      <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${employee.enabled ? 'bg-emerald-500' : isDark ? 'bg-zinc-600' : 'bg-zinc-400'}`} />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{employee.name || 'New employee'} <span className={`font-normal ${quiet}`}>· {employee.roleTitle || 'Role'}</span></span>
                      <span className={`text-xs ${quiet}`}>{employee.enabled ? 'In office' : 'Away'}</span>
                    </summary>
                    <div className={`border-t px-3.5 py-4 ${line}`}>
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={employee.enabled} onChange={(event) => updateEmployee(employee.id, { enabled: event.target.checked })} className="h-4 w-4 accent-blue-600" />
                          Show this employee in the office
                        </label>
                        <button type="button" onClick={() => setDraft((current) => ({ ...current, employees: current.employees.filter((item) => item.id !== employee.id) }))} className={`rounded px-2 py-1 text-xs font-medium ${isDark ? 'text-zinc-400 hover:bg-rose-500/10 hover:text-rose-300' : 'text-zinc-600 hover:bg-rose-50 hover:text-rose-700'}`}>Remove employee</button>
                      </div>
                      {renderIdentity(employee, (patch) => updateEmployee(employee.id, patch))}
                      {renderAppearance(employee, (profile) => updateEmployee(employee.id, { appearance: profile.appearance }))}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </section>

          {error && <p role="alert" className="mt-4 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
        </div>

        <footer className={`flex shrink-0 items-center justify-between gap-4 border-t px-5 py-3 ${line} ${isDark ? 'bg-[#09090b]' : 'bg-zinc-50'}`}>
          <span className={`text-xs ${quiet}`}>{hasChanges ? 'Unsaved changes' : 'Saved with this project.'}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} disabled={saving} className={`h-9 rounded-md border px-3 text-sm font-medium ${line} ${quiet}`}>Cancel</button>
            <button type="button" onClick={() => void save()} disabled={!hasChanges || saving} className={`h-9 rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${action}`}>{saving ? 'Saving…' : 'Save team'}</button>
          </div>
        </footer>
      </section>
    </div>
  );
};
