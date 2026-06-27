/** Convert NL date (D-M-YYYY or DD-MM-YYYY) to ISO (YYYY-MM-DD). Passthrough if already ISO. */
export function nlNaarIso(datum: string | undefined): string {
  const match = (datum || '').match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return datum || '';
}

/** Convert ISO date (YYYY-MM-DD) to NL display format (D-M-YYYY). Passthrough if already NL. */
export function isoNaarNl(datum: string | undefined): string {
  const match = (datum || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, y, m, d] = match;
    return `${parseInt(d)}-${parseInt(m)}-${y}`;
  }
  return datum || '';
}

/** Today's date as ISO string (YYYY-MM-DD). */
export function vandaagIso(): string {
  return new Date().toISOString().split('T')[0];
}

/** Today + N days as ISO string. */
export function vandaagPlusDagen(dagen: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dagen);
  return d.toISOString().split('T')[0];
}

/** Today's date in NL display format (D-M-YYYY). */
export function vandaagNl(): string {
  return isoNaarNl(vandaagIso());
}
