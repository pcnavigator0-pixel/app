import { supabase } from './supabase';

export type NotificationType =
  | 'welcome'
  | 'order_placed'
  | 'order_confirmed'
  | 'order_cancelled'
  | 'payment_received'
  | 'order_delivered'
  | 'new_follower'
  | 'product_review';

/**
 * Inserts a notification row directly via the anon client. This relies on your
 * Supabase RLS policy allowing inserts into `notifications` for authenticated
 * users (and for the seller being notified, if that's a different user than the
 * caller — check your policy covers that case).
 *
 * Unlike the web app's server-side `createNotification`, this does NOT trigger a
 * push notification (that requires the OneSignal REST API + a server secret,
 * which can't safely live in a shipped mobile app). If you want push notifications
 * from mobile-placed orders, that needs a Supabase Edge Function or similar
 * server-side trigger — flagging this so it's a deliberate decision, not a
 * silent gap.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      data: data || null,
      is_read: false,
    });

    if (error) {
      console.warn('Failed to create notification:', error.message);
    }
  } catch (err) {
    console.warn('Failed to create notification:', err);
  }
}
