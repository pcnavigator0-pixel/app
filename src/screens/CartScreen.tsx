import { View, Text, Image, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useCart, CartItem } from '../hooks/useCart';
import { useSession } from '../hooks/useSession';
import { resolveProductImagePath } from '../lib/images';
import { RootStackParamList } from '../navigation/types';

export default function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, loading, cartTotal, updateQuantity, removeFromCart } = useCart();
  const { session } = useSession();

  const handleCheckout = () => {
    if (!session?.user?.id) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderItem = ({ item }: { item: CartItem }) => {
    const imageUri = resolveProductImagePath(item.image || item.productImage);

    return (
      <View className="flex-row items-center bg-white rounded-2xl border border-line p-3 mb-3">
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: 60, height: 60, borderRadius: 10 }} resizeMode="cover" />
        ) : (
          <View style={{ width: 60, height: 60, borderRadius: 10 }} className="bg-canvas" />
        )}

        <View className="flex-1 ml-3">
          <Text className="text-[13.5px] font-semibold text-ink-900" numberOfLines={2}>
            {item.name}
          </Text>
          {item.size ? <Text className="text-[12px] text-ink-500 mt-0.5">Size: {item.size}</Text> : null}
          <Text className="text-[14px] font-bold text-ink-900 mt-1">
            RWF {Number(item.price * item.quantity).toLocaleString()}
          </Text>
        </View>

        <View className="items-end">
          <Pressable onPress={() => removeFromCart(item.cartId)} className="mb-2">
            <FontAwesome6 name="trash" size={14} color="#94a3b8" />
          </Pressable>
          <View className="flex-row items-center bg-canvas rounded-full">
            <Pressable onPress={() => updateQuantity(item.cartId, item.quantity - 1)} className="w-8 h-8 items-center justify-center">
              <Text className="text-[16px] text-ink-900">−</Text>
            </Pressable>
            <Text className="w-7 text-center text-[13px] font-bold text-ink-900">{item.quantity}</Text>
            <Pressable
              onPress={() => updateQuantity(item.cartId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-8 h-8 items-center justify-center"
            >
              <Text className="text-[16px] text-ink-900">+</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="px-4 py-3 bg-white border-b border-line">
        <Text className="text-[18px] font-bold text-ink-900">My Cart</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome6 name="cart-shopping" size={36} color="#cbd5e1" />
          <Text className="text-ink-500 mt-3 text-center">Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.cartId)}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 140 }}
          />

          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-line px-4 pt-3 pb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[14px] text-ink-700">Subtotal</Text>
              <Text className="text-[18px] font-bold text-ink-900">RWF {cartTotal.toLocaleString()}</Text>
            </View>
            <Pressable
              onPress={handleCheckout}
              className="bg-accent-orange rounded-full h-12 items-center justify-center"
            >
              <Text className="text-white font-bold text-[15px]">Proceed to Checkout</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
