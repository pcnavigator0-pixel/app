import { View, Text, Image, Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Product } from '../types';
import { resolveProductImagePath } from '../lib/images';

const CARD_GAP = 12;

export default function ProductCard({
  product,
  cardWidth,
  onPress,
  onQuickAdd,
  onToggleWishlist,
  onCompare,
  onWhatsApp,
  isWishlisted,
}: {
  product: Product;
  cardWidth: number;
  onPress: () => void;
  onQuickAdd: () => void;
  onToggleWishlist: () => void;
  onCompare: () => void;
  onWhatsApp: () => void;
  isWishlisted?: boolean;
}) {
  const imageUri = resolveProductImagePath(product.image);
  const sellerName = product.seller_business_name || 'Shopcorner';

  return (
    <Pressable
      onPress={onPress}
      style={{ width: cardWidth }}
      className="bg-white rounded-2xl border border-line overflow-hidden mb-3"
    >
      <View style={{ width: '100%', height: cardWidth }} className="bg-canvas">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : null}

        <Pressable
          onPress={onToggleWishlist}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white items-center justify-center"
          style={{ shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, elevation: 2 }}
        >
          <FontAwesome6
            name="heart"
            iconStyle={isWishlisted ? 'solid' : 'regular'}
            size={14}
            color={isWishlisted ? '#f97316' : '#111827'}
          />
        </Pressable>

        <Pressable
          onPress={onQuickAdd}
          className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-accent-orange items-center justify-center"
          style={{ shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 4, elevation: 2 }}
        >
          <FontAwesome6 name="plus" size={15} color="#ffffff" />
        </Pressable>
      </View>

      <View className="px-3 pt-2.5 pb-3">
        <Text className="text-[14px] font-semibold text-ink-900 leading-5" numberOfLines={2}>
          {product.name}
        </Text>
        <Text className="text-[12.5px] text-ink-500 mt-1">By {sellerName}</Text>
        <Text className="text-[15px] font-bold text-ink-900 mt-1.5">
          RWF {Number(product.price || 0).toLocaleString()}.00
        </Text>

        <View className="flex-row items-center justify-between mt-1.5">
          <Text className="text-[12px] text-ink-500">{product.sold || 0}+ sold</Text>
          <View className="flex-row items-center gap-1">
            <FontAwesome6 name="eye" size={11} color="#94a3b8" />
            <Text className="text-[12px] text-ink-500">{product.views || 0}</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mt-2.5">
          <Pressable
            onPress={onCompare}
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-accent-orange-soft rounded-lg py-2"
          >
            <FontAwesome6 name="scale-balanced" size={11} color="#f97316" />
            <Text className="text-[12px] font-semibold text-accent-orange">Compare</Text>
          </Pressable>
          <Pressable
            onPress={onWhatsApp}
            className="flex-1 flex-row items-center justify-center gap-1.5 bg-[#dcfce7] rounded-lg py-2"
          >
            <FontAwesome6 name="whatsapp" iconStyle="brand" size={12} color="#16a34a" />
            <Text className="text-[12px] font-semibold text-[#16a34a]">WhatsApp</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export { CARD_GAP };
