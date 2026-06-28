import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/format';
import { useSession } from './useSession';

export type OrderHistoryItem = {
  id: number;
  product_name: string;
  quantity: number;
  price: number | null;
  image: string | null;
  size: string | null;
};

export type OrderHistoryEntry = {
  id: number;
  status: string;
  total_amount: number;
  delivery_distance_km: number | null;
  delivery_fee: number | null;
  created_at: string;
  location: string | null;
  items: OrderHistoryItem[];
};

export function useOrderHistory() {
  const { session } = useSession();
  const [orders, setOrders] = useState<OrderHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session?.user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(
          'id, status, total_amount, delivery_distance_km, delivery_fee, created_at, location, order_items(id, product_name, quantity, price, image, size)'
        )
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: OrderHistoryEntry[] = (data || []).map((row: any) => ({
        id: row.id,
        status: row.status,
        total_amount: Number(row.total_amount || 0),
        delivery_distance_km: row.delivery_distance_km ?? null,
        delivery_fee: row.delivery_fee ?? null,
        created_at: row.created_at,
        location: row.location ?? null,
        items: (row.order_items || []) as OrderHistoryItem[],
      }));

      setOrders(mapped);
    } catch (err) {
      console.warn('useOrderHistory: failed to load orders', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { orders, loading, error, refresh };
}
