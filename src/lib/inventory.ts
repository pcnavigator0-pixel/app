export type ImageVariant = {
  id: string;
  image: string;
  quantity: number;
};

export type ImageInventory = ImageVariant[];

function makeVariantId(index: number) {
  return `img_${index + 1}`;
}

export function normalizeImageInventory(value: unknown): ImageInventory {
  if (!Array.isArray(value)) return [];

  return value.reduce<ImageInventory>((acc, entry, index) => {
    if (!entry || typeof entry !== 'object') return acc;

    const record = entry as Record<string, unknown>;
    const image = String(record.image || '').trim();
    if (!image) return acc;

    const id = String(record.id || '').trim() || makeVariantId(index);
    const quantity = Math.max(0, Math.floor(Number(record.quantity) || 0));

    acc.push({ id, image, quantity });
    return acc;
  }, []);
}

export function getInventoryTotal(inventory: ImageInventory) {
  return inventory.reduce((sum, variant) => sum + Math.max(0, Number(variant.quantity) || 0), 0);
}

export function findVariant(inventory: unknown, identifier?: string | null) {
  const normalizedInventory = normalizeImageInventory(inventory);
  if (!identifier) return null;

  const target = String(identifier).trim();
  if (!target) return null;

  return normalizedInventory.find((variant) => variant.id === target || variant.image === target) || null;
}

export function getImageStock(inventory: unknown, image?: string | null, fallbackStock = 0) {
  const normalizedInventory = normalizeImageInventory(inventory);
  if (normalizedInventory.length === 0) return Math.max(0, Number(fallbackStock || 0));

  const selectedImage = String(image || '').trim();
  if (!selectedImage) return Math.max(0, Number(fallbackStock || 0));

  const variant = findVariant(normalizedInventory, selectedImage);
  return variant ? Math.max(0, Number(variant.quantity || 0)) : 0;
}
