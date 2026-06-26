function isAbsoluteImageUrl(value: string) {
  return /^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:');
}

function sanitizeImageValue(value?: string | null) {
  return String(value || '').trim().replace(/\\/g, '/').replace(/^['"]+|['"]+$/g, '');
}

function parseImageList(value?: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.map((image) => sanitizeImageValue(String(image))).filter(Boolean);
  }

  const trimmed = String(value || '').trim();
  if (!trimmed) return [];

  if (trimmed.startsWith('[')) {
    try {
      const jsonImages = JSON.parse(trimmed);
      if (Array.isArray(jsonImages)) {
        return jsonImages.map((image) => sanitizeImageValue(String(image))).filter(Boolean);
      }
    } catch {
      return trimmed.split(',').map((image) => sanitizeImageValue(image)).filter(Boolean);
    }
  }

  if (trimmed.includes(',')) {
    return trimmed.split(',').map((image) => sanitizeImageValue(image)).filter(Boolean);
  }

  return [sanitizeImageValue(trimmed)].filter(Boolean);
}

export function resolveProductImagePath(value?: string | null) {
  const normalized = parseImageList(value)[0] || '';
  if (!normalized) return '';
  if (isAbsoluteImageUrl(normalized)) return normalized;
  if (normalized.startsWith('/')) return normalized;
  if (normalized.startsWith('public/')) return `/${normalized.slice('public/'.length)}`;
  if (normalized.startsWith('upload/')) return `/${normalized}`;
  if (normalized.includes('/')) return `/${normalized}`;
  return `/upload/${normalized}`;
}

export function normalizeProductImages(product?: { image?: string | null; images?: string | string[] | null } | null) {
  if (!product) return [];

  const imageColumnImages = parseImageList(product.image);
  const parsedImages = parseImageList(product.images);
  const allImages = [...imageColumnImages, ...parsedImages];
  const uniqueImages = Array.from(new Set(allImages.map(resolveProductImagePath).filter(Boolean)));

  return uniqueImages;
}
