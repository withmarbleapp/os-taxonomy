import { describe, expect, it } from 'vitest';
import {
  ageFromDob,
  ageOnUkSept1,
  approximateDobFromAge,
  deriveChildAgeFields,
  ukAcademicYearStart,
  ukYearGroupFromDob,
} from '../../shared/ukSchoolYear.js';

/** Fixed "today" so year-group expectations stay stable. Academic year 2025–26. */
const AS_OF = new Date('2026-07-10');

describe('ukSchoolYear', () => {
  it('picks academic year start from Sept 1 cut-off', () => {
    expect(ukAcademicYearStart(new Date('2026-07-10'))).toBe(2025);
    expect(ukAcademicYearStart(new Date('2025-09-01'))).toBe(2025);
    expect(ukAcademicYearStart(new Date('2025-08-31'))).toBe(2024);
  });

  it('computes age from DOB', () => {
    expect(ageFromDob('2021-03-15', AS_OF)).toBe(5);
    expect(ageFromDob('2021-07-10', AS_OF)).toBe(5);
    expect(ageFromDob('2021-07-11', AS_OF)).toBe(4);
  });

  it('computes age on Sept 1 for birthday after Sept 1', () => {
    // Born 15 Oct 2020: on 1 Sept 2025 they are still 4
    expect(ageOnUkSept1('2020-10-15', AS_OF)).toBe(4);
    expect(ukYearGroupFromDob('2020-10-15', AS_OF)).toBe('Reception');
  });

  /**
   * England/Wales: year group is based on age on 1 Sept of the academic year,
   * not calendar age alone. Mid-year DOBs (15 March) for academic year 2025–26.
   */
  it.each([
    { dob: '2024-03-15', ageOnSept1: 1, yearGroup: 'Pre-school' },
    { dob: '2023-03-15', ageOnSept1: 2, yearGroup: 'Pre-school' },
    { dob: '2022-03-15', ageOnSept1: 3, yearGroup: 'Nursery' },
    { dob: '2021-03-15', ageOnSept1: 4, yearGroup: 'Reception' },
    { dob: '2020-03-15', ageOnSept1: 5, yearGroup: 'Year 1' },
    { dob: '2019-03-15', ageOnSept1: 6, yearGroup: 'Year 2' },
    { dob: '2018-03-15', ageOnSept1: 7, yearGroup: 'Year 3' },
    { dob: '2017-03-15', ageOnSept1: 8, yearGroup: 'Year 4' },
    { dob: '2016-03-15', ageOnSept1: 9, yearGroup: 'Year 5' },
    { dob: '2015-03-15', ageOnSept1: 10, yearGroup: 'Year 6' },
    { dob: '2014-03-15', ageOnSept1: 11, yearGroup: 'Year 7+' },
    { dob: '2013-03-15', ageOnSept1: 12, yearGroup: 'Year 7+' },
  ] as const)(
    'maps DOB $dob (age $ageOnSept1 on Sept 1) → $yearGroup',
    ({ dob, ageOnSept1, yearGroup }) => {
      expect(ageOnUkSept1(dob, AS_OF)).toBe(ageOnSept1);
      expect(ukYearGroupFromDob(dob, AS_OF)).toBe(yearGroup);
      expect(deriveChildAgeFields(dob, AS_OF).yearGroup).toBe(yearGroup);
    },
  );

  it('keeps summer-born and autumn-born children in the same cohort when age on Sept 1 matches', () => {
    // Both are age 5 on 1 Sept 2025 → Year 1
    expect(ukYearGroupFromDob('2020-08-31', AS_OF)).toBe('Year 1');
    expect(ukYearGroupFromDob('2019-09-02', AS_OF)).toBe('Year 1');
    expect(ageOnUkSept1('2020-08-31', AS_OF)).toBe(5);
    expect(ageOnUkSept1('2019-09-02', AS_OF)).toBe(5);
  });

  it('places Sept 1 birthday on the older side of the cut-off', () => {
    // Born exactly 1 Sept 2020 → age 5 on 1 Sept 2025 → Year 1
    expect(ageOnUkSept1('2020-09-01', AS_OF)).toBe(5);
    expect(ukYearGroupFromDob('2020-09-01', AS_OF)).toBe('Year 1');
    // Born 2 Sept 2020 → still 4 on 1 Sept 2025 → Reception
    expect(ageOnUkSept1('2020-09-02', AS_OF)).toBe(4);
    expect(ukYearGroupFromDob('2020-09-02', AS_OF)).toBe('Reception');
  });

  it('maps seeded demo children DOBs to the expected school years', () => {
    // Maya: age 5 in July 2026, Reception (age 4 on Sept 1 2025)
    expect(deriveChildAgeFields('2021-03-15', AS_OF)).toEqual({
      age: 5,
      yearGroup: 'Reception',
    });
    // Leo: age 7 in July 2026, Year 2 (age 6 on Sept 1 2025)
    expect(deriveChildAgeFields('2019-01-10', AS_OF)).toEqual({
      age: 7,
      yearGroup: 'Year 2',
    });
  });

  it('rolls year group forward after the next September', () => {
    const mayaDob = '2021-03-15';
    expect(ukYearGroupFromDob(mayaDob, new Date('2026-08-31'))).toBe('Reception');
    expect(ukYearGroupFromDob(mayaDob, new Date('2026-09-01'))).toBe('Year 1');
    expect(ukYearGroupFromDob(mayaDob, new Date('2027-07-10'))).toBe('Year 1');
  });

  it('approximateDobFromAge uses Jan 1', () => {
    expect(approximateDobFromAge(5, AS_OF)).toBe('2021-01-01');
  });
});
