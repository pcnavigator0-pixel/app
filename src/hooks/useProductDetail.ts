import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getErrorMessage } from '../lib/format';
import { Product } from '../types';

export type Review = {
  id: number;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function useProductDetail(productId: number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ data: productData, error: productError }, { data: reviewData, error: reviewError }] = await Promise.all([
        supabase
          .from('products')
          .select(
            'id, name, description, price, original_price, image, images, category, badge, sold, stock, image_inventory, sizes, is_trend, views, created_at, seller_id'
          )
          .eq('id', productId)
          .maybeSingle(),
        supabase
          .from('reviews')
          .select('id, user_name, rating, comment, created_at')
          .eq('product_id', productId)
          .order('created_at', { ascending: false }),
      ]);

      if (productError) throw productError;
      if (reviewError) throw reviewError;

      let resolvedProduct = (productData as Product) || null;

      if (resolvedProduct?.seller_id) {
        const { data: seller, error: sellerError } = await supabase
          .from('users')
          .select('business_name')
          .eq('id', resolvedProduct.seller_id)
          .maybeSingle();

        if (sellerError) {
          console.warn('useProductDetail: failed to load seller name', sellerError);
        } else if (seller?.business_name) {
          resolvedProduct = { ...resolvedProduct, seller_business_name: seller.business_name };
        }
      }

      setProduct(resolvedProduct);
      setReviews((reviewData as Review[]) || []);

      // Best-effort view count increment; don't block the UI if it fails.
      if (resolvedProduct) {
        supabase
          .from('products')
          .update({ views: Number(resolvedProduct.views || 0) + 1 })
          .eq('id', productId)
          .then(() => {});
      }
    } catch (err) {
      console.warn('useProductDetail: failed to load product', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0;

  return { product, reviews, averageRating, loading, error, refresh: load };
}
