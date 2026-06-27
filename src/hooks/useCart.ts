import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSessionId } from '../lib/session';
import { getImageStock } from '../lib/inventory';
import { getProductsSubtotal } from '../lib/order-totals';
import { resolveProductImagePath } from '../lib/images';
import { getErrorMessage } from '../lib/format';

export type CartItem = {
  cartId: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  size: string | null;
  productImage: string | null;
  stock: number;
};

type CartActionResult = { success: boolean; message?: string };

function normalizeOption(value?: string | null) {
  const trimmed = String(value || '').trim();
  return trimmed || null;
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionId = await getSessionId();
      const { data, error: fetchError } = await supabase
        .from('cart')
        .select('id, product_id, quantity, image, size, products(name, price, image, stock, image_inventory)')
        .eq('session_id', sessionId);

      if (fetchError) throw fetchError;

      const mapped: CartItem[] = (data || []).map((row: any) => ({
        cartId: row.id,
        productId: row.product_id,
        name: row.products?.name || 'Product',
        price: Number(row.products?.price || 0),
        quantity: Number(row.quantity || 1),
        image: row.image || null,
        size: row.size || null,
        productImage: resolveProductImagePath(row.products?.image) || null,
        stock: getImageStock(row.products?.image_inventory, row.image, Number(row.products?.stock || 0)),
      }));

      setItems(mapped);
    } catch (err) {
      console.warn('useCart: failed to load cart', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const cartCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const cartTotal = getProductsSubtotal(items.map((item) => ({ price: item.price, quantity: item.quantity })));

  const checkAvailability = useCallback(
    async (
      productId: number,
      requestedQuantity: number,
      targetImage: string | null,
      excludingCartId?: number | null
    ): Promise<CartActionResult & { stock?: number }> => {
      const sessionId = await getSessionId();

      const [{ data: product, error: productError }, { data: cartRows, error: cartError }] = await Promise.all([
        supabase.from('products').select('id, name, stock, image_inventory').eq('id', productId).maybeSingle(),
        supabase.from('cart').select('id, quantity, image').eq('session_id', sessionId).eq('product_id', productId),
      ]);

      if (productError) return { success: false, message: productError.message };
      if (cartError) return { success: false, message: cartError.message };
      if (!product) return { success: false, message: 'Product not found.' };

      const stock = getImageStock(product.image_inventory, targetImage, Number(product.stock || 0));
      const otherQuantity = (cartRows || []).reduce((sum, row: any) => {
        if (excludingCartId && Number(row.id) === Number(excludingCartId)) return sum;
        if (String(row.image || '') !== String(targetImage || '')) return sum;
        return sum + Number(row.quantity || 0);
      }, 0);

      if (otherQuantity + requestedQuantity > stock) {
        return {
          success: false,
          stock,
          message:
            stock > 0
              ? `Only ${stock} of the selected ${product.name || 'item'} variant in stock.`
              : `${product.name || 'This product'} is out of stock.`,
        };
      }

      return { success: true, stock };
    },
    []
  );

  const addToCart = useCallback(
    async (productId: number, options?: { image?: string | null; size?: string | null; quantity?: number }): Promise<CartActionResult> => {
      const sessionId = await getSessionId();
      const image = normalizeOption(options?.image);
      const size = normalizeOption(options?.size);
      const quantity = Math.max(1, Number(options?.quantity || 1));

      try {
        let existingQuery = supabase
          .from('cart')
          .select('id, quantity')
          .eq('session_id', sessionId)
          .eq('product_id', productId);

        existingQuery = image === null ? existingQuery.is('image', null) : existingQuery.eq('image', image);
        existingQuery = size === null ? existingQuery.is('size', null) : existingQuery.eq('size', size);

        const { data: existing, error: existingError } = await existingQuery.maybeSingle();
        if (existingError) throw existingError;

        if (existing) {
          const nextQuantity = Number(existing.quantity || 0) + quantity;
          const availability = await checkAvailability(productId, nextQuantity, image, existing.id);
          if (!availability.success) return availability;

          const { error: updateError } = await supabase
            .from('cart')
            .update({ quantity: nextQuantity })
            .eq('id', existing.id);
          if (updateError) throw updateError;
        } else {
          const availability = await checkAvailability(productId, quantity, image, null);
          if (!availability.success) return availability;

          const { error: insertError } = await supabase.from('cart').insert({
            session_id: sessionId,
            product_id: productId,
            quantity,
            image,
            size,
          });
          if (insertError) throw insertError;
        }

        await refreshCart();
        return { success: true };
      } catch (err) {
        console.warn('useCart: failed to add to cart', err);
        return { success: false, message: getErrorMessage(err) };
      }
    },
    [checkAvailability, refreshCart]
  );

  const updateQuantity = useCallback(
    async (cartId: number, nextQuantity: number): Promise<CartActionResult> => {
      try {
        if (nextQuantity < 1) {
          const { error: deleteError } = await supabase.from('cart').delete().eq('id', cartId);
          if (deleteError) throw deleteError;
          await refreshCart();
          return { success: true };
        }

        const { data: cartItem, error: cartItemError } = await supabase
          .from('cart')
          .select('id, product_id, image')
          .eq('id', cartId)
          .maybeSingle();
        if (cartItemError) throw cartItemError;
        if (!cartItem) return { success: false, message: 'Cart item not found.' };

        const availability = await checkAvailability(cartItem.product_id, nextQuantity, normalizeOption(cartItem.image), cartId);
        if (!availability.success) return availability;

        const { error: updateError } = await supabase.from('cart').update({ quantity: nextQuantity }).eq('id', cartId);
        if (updateError) throw updateError;

        await refreshCart();
        return { success: true };
      } catch (err) {
        console.warn('useCart: failed to update cart', err);
        return { success: false, message: getErrorMessage(err) };
      }
    },
    [checkAvailability, refreshCart]
  );

  const removeFromCart = useCallback(
    async (cartId: number): Promise<CartActionResult> => {
      try {
        const { error: deleteError } = await supabase.from('cart').delete().eq('id', cartId);
        if (deleteError) throw deleteError;
        await refreshCart();
        return { success: true };
      } catch (err) {
        console.warn('useCart: failed to remove item', err);
        return { success: false, message: getErrorMessage(err) };
      }
    },
    [refreshCart]
  );

  const clearCart = useCallback(async (): Promise<CartActionResult> => {
    try {
      const sessionId = await getSessionId();
      const { error: deleteError } = await supabase.from('cart').delete().eq('session_id', sessionId);
      if (deleteError) throw deleteError;
      await refreshCart();
      return { success: true };
    } catch (err) {
      console.warn('useCart: failed to clear cart', err);
      return { success: false, message: getErrorMessage(err) };
    }
  }, [refreshCart]);

  return {
    items,
    loading,
    error,
    cartCount,
    cartTotal,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
