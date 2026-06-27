export function getStableIndex(seed: string, max: number) {
  if (max <= 0) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % max;
}

export function formatCollectionTitle(value: string) {
  const normalized = String(value || '').trim();
  if (!normalized) return 'Featured';
  return normalized
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (error && typeof error === 'object') {
    const record = error as Record<string, unknown>;
    if (typeof record.message === 'string' && record.message) {
      // Supabase PostgrestError shape: { message, details, hint, code }
      const parts = [record.message];
      if (typeof record.hint === 'string' && record.hint) parts.push(`Hint: ${record.hint}`);
      if (typeof record.code === 'string' && record.code) parts.push(`(code ${record.code})`);
      return parts.join(' ');
    }
  }

  return 'Something went wrong.';
}

