import { useCallback, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/format';
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
        'id, name, description, price, original_price, image, images, category, badge, sold, stock, image_inventory, is_trend, views, created_at, seller_id'
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (fetchError) throw fetchError;

    const rows = (data || []) as Product[];
    const sellerIds = Array.from(new Set(rows.map((row) => row.seller_id).filter(Boolean))) as string[];

    let sellerNameById: Record<string, string> = {};
    if (sellerIds.length > 0) {
      const { data: sellers, error: sellerError } = await supabase
        .from('users')
        .select('id, business_name')
        .in('id', sellerIds);

      if (sellerError) {
        // Don't fail the whole product load just because seller names couldn't be fetched.
        console.warn('useProductFeed: failed to load seller names', sellerError);
      } else {
        sellerNameById = (sellers || []).reduce<Record<string, string>>((acc, seller: any) => {
          if (seller.business_name) acc[seller.id] = seller.business_name;
          return acc;
        }, {});
      }
    }

    return rows.map((row) => ({
      ...row,
      seller_business_name: row.seller_id ? sellerNameById[row.seller_id] || undefined : undefined,
    }));
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
      console.warn('useProductFeed: failed to load first page', err);
      setError(getErrorMessage(err));
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
      console.warn('useProductFeed: failed to load next page', err);
      setError(getErrorMessage(err));
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

