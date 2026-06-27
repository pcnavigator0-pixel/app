import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { resolveProductImagePath } from '../lib/images';
import { getStableIndex, formatCollectionTitle, getErrorMessage } from '../lib/format';
import { Product } from '../types';

export type CollectionItem = {
  key: string;
  category: string;
  image: string;
  count: number;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel: string;
};

export type CategoryChip = {
  category: string;
  image: string;
  count: number;
};

const EYEBROW_LABELS = ['Featured Edit', 'New Season', 'Store Picks'];
const DESCRIPTIONS = [
  'A focused collection built around your strongest visuals and the products shoppers notice first.',
  'A clean category spotlight with room for your product photography to carry the full impression.',
  'A refined category card that feels premium without putting extra layers between the shopper and the image.',
];
const ACTION_LABELS = ['Shop Collection', 'View Collection', 'Discover More'];

export function useHomeData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('id, name, description, price, original_price, image, images, category, badge, sold, stock, image_inventory, is_trend, views, created_at')
        .order('created_at', { ascending: false })
        .limit(200);

      if (fetchError) throw fetchError;
      setProducts((data as Product[]) || []);
    } catch (err) {
      console.warn('useHomeData: failed to load products', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categoryCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((counts, product) => {
      const category = String(product.category || 'Uncategorized').trim();
      if (!category) return counts;
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
  }, [products]);

  const categoryImageCollections = useMemo(() => {
    return products.reduce<Record<string, string[]>>((images, product) => {
      const category = String(product.category || 'Uncategorized').trim();
      const imagePath = resolveProductImagePath(product.image);
      if (!category || !imagePath) return images;

      if (!images[category]) images[category] = [];
      if (!images[category].includes(imagePath)) images[category].push(imagePath);

      return images;
    }, {});
  }, [products]);

  const categories = useMemo(
    () => Object.keys(categoryCounts).filter((category) => (categoryImageCollections[category]?.length || 0) > 0),
    [categoryCounts, categoryImageCollections]
  );

  const categoryChips = useMemo<CategoryChip[]>(() => {
    return categories.map((category) => ({
      category,
      image: categoryImageCollections[category][0],
      count: categoryCounts[category] || 0,
    }));
  }, [categories, categoryImageCollections, categoryCounts]);

  const collectionItems = useMemo<CollectionItem[]>(() => {
    const baseItems = categories
      .map((category, index) => {
        const images = categoryImageCollections[category] || [];
        if (images.length === 0) return null;

        const selectedImage = images[getStableIndex(`${category}-${images.length}`, images.length)];

        return {
          key: `${category}-${index}`,
          category,
          image: selectedImage,
          count: categoryCounts[category] || images.length,
          eyebrow: EYEBROW_LABELS[index % EYEBROW_LABELS.length],
          title: formatCollectionTitle(category),
          description: DESCRIPTIONS[index % DESCRIPTIONS.length],
          actionLabel: ACTION_LABELS[index % ACTION_LABELS.length],
        };
      })
      .filter(Boolean) as CollectionItem[];

    if (baseItems.length === 0) return [];

    const normalizedItems = [...baseItems];
    let repeatIndex = 0;
    while (normalizedItems.length < 3) {
      const item = baseItems[repeatIndex % baseItems.length];
      normalizedItems.push({ ...item, key: `${item.category}-repeat-${repeatIndex}` });
      repeatIndex += 1;
    }

    return normalizedItems;
  }, [categories, categoryImageCollections, categoryCounts]);

  return {
    products,
    loading,
    error,
    categoryChips,
    collectionItems,
    refresh: loadProducts,
  };
}
