import { describe, it, expect } from 'vitest';
import { getProjectOfficeTeam, safeUUID, createOfficeMemberProfile, getOfficeTeamSignature } from '../src/components/office/officeCast';

describe('Office Team Normalization & Resilience', () => {
  it('generates non-empty fallback UUIDs even when globalThis.crypto is unavailable', () => {
    const id = safeUUID();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(5);
  });

  it('handles null and undefined configurations gracefully', () => {
    const teamNull = getProjectOfficeTeam(null);
    expect(teamNull).toBeDefined();
    expect(teamNull.ceo).toBeDefined();
    expect(teamNull.ceo.name).toBe('Rex');
    expect(Array.isArray(teamNull.ceo.skills)).toBe(true);
    expect(teamNull.ceo.appearance).toBeDefined();
    expect(Array.isArray(teamNull.employees)).toBe(true);

    const teamUndefined = getProjectOfficeTeam(undefined);
    expect(teamUndefined).toBeDefined();
    expect(teamUndefined.ceo.id).toBe('emp-ceo');
  });

  it('repairs employees with missing appearance and missing skills', () => {
    const rawBroken = {
      ceo: {
        id: 'emp-ceo',
        name: 'Rex',
        // appearance intentionally omitted
        // skills intentionally omitted
      },
      employees: [
        {
          id: 'emp-1',
          name: 'Otto',
          roleTitle: 'Frontend Engineer',
          // appearance missing
          // skills missing
        },
        {
          id: 'emp-2',
          name: 'Nate',
          roleTitle: 'DevOps',
          department: 'invalid-dept' as any,
          appearance: { skin: '#123456' }, // partial appearance
        },
      ],
    };

    const normalized = getProjectOfficeTeam(rawBroken as any);
    expect(normalized.ceo.appearance).toBeDefined();
    expect(normalized.ceo.appearance.skin).toBeDefined();
    expect(Array.isArray(normalized.ceo.skills)).toBe(true);

    expect(normalized.employees.length).toBe(2);
    expect(normalized.employees[0].appearance).toBeDefined();
    expect(normalized.employees[0].appearance.skin).toBeDefined();
    expect(Array.isArray(normalized.employees[0].skills)).toBe(true);

    expect(normalized.employees[1].department).toBe('general');
    expect(normalized.employees[1].appearance.skin).toBe('#123456');
    expect(normalized.employees[1].appearance.hairStyle).toBeDefined();
  });

  it('creates specialist profiles with valid appearance and skill arrays', () => {
    const profile = createOfficeMemberProfile('frontend');
    expect(profile.department).toBe('frontend');
    expect(Array.isArray(profile.skills)).toBe(true);
    expect(profile.skills.length).toBeGreaterThan(0);
    expect(profile.appearance).toBeDefined();
    expect(typeof profile.appearance.hairStyle).toBe('string');
  });

  it('changes the office refresh signature when a teammate appearance changes', () => {
    const team = getProjectOfficeTeam({ employees: [{ ...createOfficeMemberProfile('frontend'), id: 'employee-1' }] });
    const before = getOfficeTeamSignature(team);
    const changed = {
      ...team,
      employees: team.employees.map((employee) => ({
        ...employee,
        appearance: { ...employee.appearance, hair: '#123456' },
      })),
    };

    expect(getOfficeTeamSignature(changed)).not.toBe(before);
    expect(getOfficeTeamSignature({ ...team, employees: [...team.employees] })).toBe(before);
  });
});
