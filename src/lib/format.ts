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
  return error instanceof Error ? error.message : 'Something went wrong.';
}
