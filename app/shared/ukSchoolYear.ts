/** England/Wales academic year helpers (Sept 1 cut-off). */

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDob(dob: string): Date {
  if (!DOB_RE.test(dob)) {
    throw new Error(`Invalid date of birth: ${dob}`);
  }
  const [y, m, d] = dob.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    throw new Error(`Invalid date of birth: ${dob}`);
  }
  return date;
}

function toUtcDate(asOf: Date): Date {
  return new Date(
    Date.UTC(asOf.getFullYear(), asOf.getMonth(), asOf.getDate()),
  );
}

/** Calendar year of the Sept 1 that started the current academic year. */
export function ukAcademicYearStart(asOf: Date = new Date()): number {
  const d = toUtcDate(asOf);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0-indexed; Aug = 7, Sept = 8
  return month >= 8 ? year : year - 1;
}

/** Whole years of age on `asOf` (local calendar date of asOf). */
export function ageFromDob(dob: string, asOf: Date = new Date()): number {
  const birth = parseDob(dob);
  const today = toUtcDate(asOf);
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

/** Age in whole years on 1 September of the current academic year. */
export function ageOnUkSept1(dob: string, asOf: Date = new Date()): number {
  const birth = parseDob(dob);
  const startYear = ukAcademicYearStart(asOf);
  const sept1 = new Date(Date.UTC(startYear, 8, 1));
  let age = sept1.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = sept1.getUTCMonth() - birth.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && sept1.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

/**
 * England/Wales year group from DOB.
 * Age on Sept 1: 3 Nursery, 4 Reception, 5–10 Year 1–6, 11+ Year 7+, younger Pre-school.
 */
export function ukYearGroupFromDob(dob: string, asOf: Date = new Date()): string {
  const age = ageOnUkSept1(dob, asOf);
  if (age < 3) return 'Pre-school';
  if (age === 3) return 'Nursery';
  if (age === 4) return 'Reception';
  if (age >= 5 && age <= 10) return `Year ${age - 4}`;
  return 'Year 7+';
}

export function deriveChildAgeFields(
  dob: string,
  asOf: Date = new Date(),
): { age: number; yearGroup: string } {
  return {
    age: ageFromDob(dob, asOf),
    yearGroup: ukYearGroupFromDob(dob, asOf),
  };
}

/** Approximate DOB for migrating age-only rows (1 Jan of birth year). */
export function approximateDobFromAge(age: number, asOf: Date = new Date()): string {
  const today = toUtcDate(asOf);
  const year = today.getUTCFullYear() - age;
  return `${year}-01-01`;
}

export function isValidDob(dob: string): boolean {
  try {
    parseDob(dob);
    return true;
  } catch {
    return false;
  }
}
