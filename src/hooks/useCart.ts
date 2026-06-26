import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from './useSession';

export function useCart() {
  const { session } = useSession();
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (!session?.user?.id) {
      setCartCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', session.user.id);

      if (error) throw error;

      const total = (data || []).reduce((sum, row) => sum + Number(row.quantity || 0), 0);
      setCartCount(total);
    } catch (error) {
      console.warn('Failed to load cart count', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return { cartCount, loading, refreshCart };
}
