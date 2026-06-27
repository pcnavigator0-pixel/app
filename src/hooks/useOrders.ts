import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSessionId } from '../lib/session';
import { getImageStock } from '../lib/inventory';
import { getOrderTotals, toMoney } from '../lib/order-totals';
import { createNotification } from '../lib/notifications';
import { getErrorMessage } from '../lib/format';
import { useSession } from './useSession';
import { useUserProfile } from './useUserProfile';

export type DeliveryLocationInput = {
  label: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryFee: number;
  distanceKm: number;
};

type PlaceOrderResult = { success: boolean; message?: string; orderId?: number };

export function useOrders() {
  const { session } = useSession();
  const { profile } = useUserProfile();
  const [placing, setPlacing] = useState(false);

  const placeOrder = useCallback(
    async (deliveryLocation: DeliveryLocationInput): Promise<PlaceOrderResult> => {
      if (!session?.user?.id) {
        return { success: false, message: 'Please sign in before placing an order.' };
      }

      if (!deliveryLocation.label) {
        return { success: false, message: 'Delivery location is required before placing an order.' };
      }

      setPlacing(true);
      try {
        const sessionId = await getSessionId();

        const { data: cartData, error: cartError } = await supabase
          .from('cart')
          .select('id, product_id, quantity, image, size, products(id, name, price, stock, image_inventory)')
          .eq('session_id', sessionId);

        if (cartError) throw cartError;

        const cartItems = cartData || [];
        if (cartItems.length === 0) {
          return { success: false, message: 'Cart is empty' };
        }

        // Validate stock per product+variant combination, same as web.
        const requestedByKey: Record<string, { quantity: number; name: string; stock: number }> = {};
        for (const item of cartItems as any[]) {
          const key = `${item.product_id}:${String(item.image || '')}`;
          if (!requestedByKey[key]) {
            requestedByKey[key] = {
              quantity: 0,
              name: item.products?.name || 'Product',
              stock: getImageStock(item.products?.image_inventory, item.image, Number(item.products?.stock || 0)),
            };
          }
          requestedByKey[key].quantity += Number(item.quantity || 1);
        }

        const unavailable = Object.values(requestedByKey).find((entry) => entry.quantity > entry.stock);
        if (unavailable) {
          return {
            success: false,
            message:
              unavailable.stock > 0
                ? `Only ${unavailable.stock} of the selected ${unavailable.name} variant in stock.`
                : `${unavailable.name} is out of stock.`,
          };
        }

        const orderTotals = getOrderTotals(
          (cartItems as any[]).map((item) => ({ price: item.products?.price, quantity: item.quantity || 1 })),
          deliveryLocation.deliveryFee
        );

        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: session.user.id,
            session_id: sessionId,
            status: 'pending',
            total_amount: orderTotals.customerTotal,
            delivery_distance_km: deliveryLocation.distanceKm,
            delivery_fee: deliveryLocation.deliveryFee,
            full_name: profile?.full_name || null,
            phone: profile?.phone || null,
            location: deliveryLocation.label,
          })
          .select('*')
          .single();

        if (orderError || !newOrder) {
          throw orderError || new Error('Could not create order');
        }

        const orderItemsPayload = (cartItems as any[]).map((item) => ({
          order_id: newOrder.id,
          product_id: item.product_id,
          quantity: Number(item.quantity || 1),
          image: item.image || null,
          size: item.size || null,
          price: Number(item.products?.price || 0),
          product_name: item.products?.name || 'Unknown product',
        }));

        const { error: orderItemsError } = await supabase.from('order_items').insert(orderItemsPayload);

        if (orderItemsError) {
          await supabase.from('orders').delete().eq('id', newOrder.id);
          throw orderItemsError;
        }

        // Notify the buyer.
        await createNotification(
          session.user.id,
          'order_placed',
          'Order Placed Successfully',
          `Your order #${newOrder.id} has been placed. Total: RWF ${toMoney(orderTotals.customerTotal).toLocaleString()}`,
          { entity_type: 'order', entity_id: newOrder.id }
        );

        // Notify the seller(s) whose products were ordered.
        const { data: sellerProducts } = await supabase
          .from('products')
          .select('seller_id')
          .in('id', (cartItems as any[]).map((item) => item.product_id));

        const sellerIds = Array.from(new Set((sellerProducts || []).map((p: any) => p.seller_id).filter(Boolean)));
        for (const sellerId of sellerIds) {
          await createNotification(
            sellerId as string,
            'order_placed',
            'New Order Received',
            `You have received a new order #${newOrder.id}`,
            { entity_type: 'order', entity_id: newOrder.id }
          );
        }

        // Clear the cart now that the order is placed.
        await supabase.from('cart').delete().eq('session_id', sessionId);

        return { success: true, orderId: newOrder.id };
      } catch (err) {
        console.warn('useOrders: failed to place order', err);
        return { success: false, message: getErrorMessage(err) };
      } finally {
        setPlacing(false);
      }
    },
    [session?.user?.id, profile?.full_name, profile?.phone]
  );

  return { placeOrder, placing };
}
