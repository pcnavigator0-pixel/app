import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useProductDetail } from '../hooks/useProductDetail';
import { useCart } from '../hooks/useCart';
import { useSession } from '../hooks/useSession';
import { normalizeImageInventory } from '../lib/inventory';
import { normalizeProductImages, resolveProductImagePath } from '../lib/images';
import { RootStackParamList } from '../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_SIZE = 64;

type ProductDetailRoute = RouteProp<RootStackParamList, 'ProductDetail'>;

export default function ProductDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailRoute>();
  const { productId } = route.params;

  const { product, reviews, averageRating, loading, error } = useProductDetail(productId);
  const { addToCart } = useCart();
  const { session } = useSession();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const galleryImages = useMemo(() => normalizeProductImages(product), [product]);
  const variants = useMemo(() => normalizeImageInventory(product?.image_inventory), [product]);

  const activeVariant = useMemo(() => {
    if (!selectedVariantImage) return null;
    return variants.find((v) => v.image === selectedVariantImage) || null;
  }, [variants, selectedVariantImage]);

  const stockForSelection = variants.length > 0 ? activeVariant?.quantity ?? 0 : Number(product?.stock || 0);

  const handleSelectVariant = (image: string) => {
    setSelectedVariantImage(image);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (variants.length > 0 && !selectedVariantImage) {
      alert('Please choose an image variant first.');
      return;
    }

    setAdding(true);
    try {
      const result = await addToCart(product.id, {
        image: selectedVariantImage,
        quantity,
      });

      if (!result.success) {
        alert(result.message || 'Could not add to cart.');
        return;
      }
    } finally {
      setAdding(false);
    }
  };

  const handleWhatsApp = () => {
    if (!product) return;
    const text = encodeURIComponent(`Hi! I'm interested in "${product.name}" (RWF ${Number(product.price || 0).toLocaleString()}).`);
    Linking.openURL(`https://wa.me/?text=${text}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#f97316" size="large" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-ink-500 text-center">{error || 'Product not found.'}</Text>
        <Pressable onPress={() => navigation.goBack()} className="mt-4">
          <Text className="text-accent-orange font-semibold">Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-line">
        <Pressable
          onPress={() => navigation.goBack()}
          className="w-10 h-10 rounded-full border border-line items-center justify-center"
        >
          <FontAwesome6 name="arrow-left" size={16} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-bold text-ink-900">Product Description</Text>
        <Pressable
          onPress={() => setIsWishlisted((current) => !current)}
          className="w-10 h-10 rounded-full border border-line items-center justify-center"
        >
          <FontAwesome6
            name="heart"
            iconStyle={isWishlisted ? 'solid' : 'regular'}
            size={15}
            color={isWishlisted ? '#f97316' : '#111827'}
          />
        </Pressable>
      </View>

      <ScrollView className="flex-1 bg-canvas" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-white px-4 pt-4 pb-3">
          <Text className="text-[28px] font-bold text-ink-900">
            RWF {Number(product.price || 0).toLocaleString()}
          </Text>
        </View>

        {galleryImages.length > 0 ? (
          <View className="bg-white">
            <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }} className="bg-black">
              <Image
                source={{ uri: galleryImages[activeImageIndex] }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            {galleryImages.length > 1 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ padding: 12, gap: 10 }}
              >
                {galleryImages.map((uri, index) => (
                  <Pressable
                    key={`${uri}-${index}`}
                    onPress={() => setActiveImageIndex(index)}
                    style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
                    className={`rounded-xl overflow-hidden border-2 ${
                      index === activeImageIndex ? 'border-accent-orange' : 'border-line'
                    }`}
                  >
                    <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}
          </View>
        ) : null}

        <View className="bg-white px-4 py-4 mt-2">
          <Text className="text-[15px] font-semibold text-ink-900 leading-5">{product.name}</Text>
          {product.description ? (
            <Text className="text-[13.5px] text-ink-500 leading-5 mt-2">{product.description}</Text>
          ) : null}

          <View className="flex-row items-center gap-2 mt-3">
            <Text className="text-[12.5px] text-ink-500">Product ID {product.id}</Text>
            <Text className="text-ink-300">|</Text>
            <View className="flex-row items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <FontAwesome6
                  key={star}
                  name="star"
                  iconStyle={star <= Math.round(averageRating) ? 'solid' : 'regular'}
                  size={12}
                  color="#f97316"
                />
              ))}
            </View>
            <Text className="text-[12.5px] text-ink-500">
              {reviews.length > 0 ? `${reviews.length} review${reviews.length === 1 ? '' : 's'}` : 'No reviews yet'}
            </Text>
          </View>
        </View>

        {variants.length > 0 ? (
          <View className="bg-white px-4 py-4 mt-2">
            <Text className="text-[16px] font-bold text-ink-900 mb-3">Variant Image</Text>
            <View className="flex-row flex-wrap gap-3">
              {variants.map((variant) => {
                const isSelected = variant.image === selectedVariantImage;
                const inStock = variant.quantity > 0;
                const resolvedImage = resolveProductImagePath(variant.image) || variant.image;

                return (
                  <Pressable
                    key={variant.id}
                    onPress={() => handleSelectVariant(variant.image)}
                    style={{ width: (SCREEN_WIDTH - 32 - 30) / 4 }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 ${
                      isSelected ? 'border-accent-orange' : 'border-line'
                    }`}
                  >
                    <Image source={{ uri: resolvedImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View className="absolute top-1 left-1">
                      <Text
                        className={`text-[10px] font-extrabold ${inStock ? 'text-green-600' : 'text-red-500'}`}
                        style={{ textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 3, textShadowOffset: { width: 0, height: 0 } }}
                      >
                        {inStock ? 'in' : 'out'}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {selectedVariantImage ? (
          <View className="bg-white px-4 py-4 mt-2">
            <Text className="text-[16px] font-bold text-ink-900 mb-3">Chosen Variant</Text>
            <View className="flex-row items-center justify-between border border-line rounded-2xl p-3">
              <View className="flex-row items-center gap-3 flex-1">
                <Image
                  source={{ uri: resolveProductImagePath(selectedVariantImage) || selectedVariantImage }}
                  style={{ width: 52, height: 52, borderRadius: 10 }}
                  resizeMode="cover"
                />
                <View>
                  <Text className="text-[14px] font-bold text-ink-900">
                    {stockForSelection > 0 ? `${stockForSelection} in stock` : 'Out of stock'}
                  </Text>
                  {stockForSelection > 0 ? (
                    <Text className="text-[12.5px] text-green-600">{stockForSelection} left in stock</Text>
                  ) : (
                    <Text className="text-[12.5px] text-red-500">Currently unavailable</Text>
                  )}
                </View>
              </View>

              <View className="flex-row items-center bg-canvas rounded-full">
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 items-center justify-center"
                >
                  <Text className="text-[18px] text-ink-900">−</Text>
                </Pressable>
                <Text className="w-9 text-center text-[15px] font-bold text-ink-900">{quantity}</Text>
                <Pressable
                  onPress={() => setQuantity((q) => Math.min(stockForSelection || 1, q + 1))}
                  disabled={quantity >= stockForSelection}
                  className="w-9 h-9 items-center justify-center"
                >
                  <Text className="text-[18px] text-ink-900">+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        <View className="bg-white px-4 py-4 mt-2">
          <Text className="text-[16px] font-bold text-ink-900 mb-4">Features</Text>
          <View className="flex-row flex-wrap" style={{ gap: 16 }}>
            {[
              { icon: 'layer-group', tone: 'bg-[#16a34a]', label: product.category || 'Product' },
              { icon: 'box', tone: 'bg-accent-orange', label: 'Available stock' },
              { icon: 'truck', tone: 'bg-[#16a34a]', label: 'Delivery ready' },
              { icon: 'store', tone: 'bg-accent-orange', label: product.seller_business_name || 'Shopcorner' },
              { icon: 'eye', tone: 'bg-accent-orange', label: `${product.views || 0} views` },
              { icon: 'bag-shopping', tone: 'bg-[#16a34a]', label: `${product.sold || 0} sold` },
            ].map((feature) => (
              <View key={feature.label} style={{ width: (SCREEN_WIDTH - 32 - 32) / 3 }} className="items-center">
                <View className={`w-12 h-12 rounded-full ${feature.tone} items-center justify-center mb-1.5`}>
                  <FontAwesome6 name={feature.icon as any} size={17} color="#ffffff" />
                </View>
                <Text className="text-[12px] text-ink-700 text-center" numberOfLines={1}>
                  {feature.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {product.description ? (
          <View className="bg-white px-4 py-4 mt-2">
            <Text className="text-[16px] font-bold text-ink-900 mb-2">About this product</Text>
            <Text className="text-[13.5px] text-ink-500 leading-5">{product.description}</Text>
          </View>
        ) : null}

        <View className="px-4 mt-3">
          <View className="flex-row border border-line rounded-2xl py-3 px-2 bg-white">
            {[
              { icon: 'shield-halved', label: 'Safe Payment', sub: '100% secure' },
              { icon: 'rotate', label: 'Easy Returns', sub: '7 days return' },
              { icon: 'headset', label: 'Support', sub: '24/7 support' },
            ].map((badge) => (
              <View key={badge.label} className="flex-1 items-center px-1">
                <FontAwesome6 name={badge.icon as any} size={16} color="#111827" />
                <Text className="text-[11.5px] font-semibold text-ink-900 mt-1.5">{badge.label}</Text>
                <Text className="text-[10.5px] text-ink-500">{badge.sub}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-line px-4 pt-3 pb-5 flex-row items-center gap-3">
        <Pressable
          onPress={handleAddToCart}
          disabled={adding || (variants.length > 0 && stockForSelection <= 0)}
          className="flex-1 bg-accent-orange rounded-full h-12 items-center justify-center flex-row gap-2"
          style={{ opacity: adding || (variants.length > 0 && stockForSelection <= 0) ? 0.6 : 1 }}
        >
          {adding ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <FontAwesome6 name="cart-shopping" size={15} color="#ffffff" />
              <Text className="text-white font-bold text-[15px]">Add to Cart</Text>
            </>
          )}
        </Pressable>
        <Pressable onPress={handleWhatsApp} className="w-12 h-12 rounded-full bg-[#22c55e] items-center justify-center">
          <FontAwesome6 name="whatsapp" iconStyle="brand" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
