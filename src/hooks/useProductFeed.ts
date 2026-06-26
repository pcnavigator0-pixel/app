import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';

const PAGE_SIZE = 10;

export function useProductFeed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef(0);
  const requestInFlight = useRef(false);

  const fetchPage = useCallback(async (page: number) => {
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: fetchError } = await supabase
      .from('products')
      .select(
        'id, name, description, price, original_price, image, images, category, badge, sold, stock, image_inventory, is_trend, views, created_at, seller_id, seller_business_name'
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (fetchError) throw fetchError;
    return (data as Product[]) || [];
  }, []);

  const loadFirstPage = useCallback(async () => {
    setLoadingInitial(true);
    setError(null);
    pageRef.current = 0;
    try {
      const firstPage = await fetchPage(0);
      setProducts(firstPage);
      setHasMore(firstPage.length === PAGE_SIZE);
      pageRef.current = 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products.');
    } finally {
      setLoadingInitial(false);
    }
  }, [fetchPage]);

  const loadNextPage = useCallback(async () => {
    if (requestInFlight.current || !hasMore || loadingInitial) return;

    requestInFlight.current = true;
    setLoadingMore(true);
    try {
      const nextPage = await fetchPage(pageRef.current);
      setProducts((current) => {
        const existingIds = new Set(current.map((product) => product.id));
        const deduped = nextPage.filter((product) => !existingIds.has(product.id));
        return [...current, ...deduped];
      });
      setHasMore(nextPage.length === PAGE_SIZE);
      pageRef.current += 1;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more products.');
    } finally {
      setLoadingMore(false);
      requestInFlight.current = false;
    }
  }, [fetchPage, hasMore, loadingInitial]);

  return {
    products,
    loadingInitial,
    loadingMore,
    hasMore,
    error,
    loadFirstPage,
    loadNextPage,
  };
}
