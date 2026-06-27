import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { getDeliveryLocation, DeliveryLocationResult } from '../lib/location';
import { getOrderTotals } from '../lib/order-totals';
import { KIGALI_DELIVERY_FEE_RWF } from '../lib/delivery';
import { RootStackParamList } from '../navigation/types';

export default function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, cartTotal, clearCart } = useCart();
  const { placeOrder, placing } = useOrders();

  const [manualAddress, setManualAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<DeliveryLocationResult | null>(null);

  const deliveryFee = location?.deliveryFee ?? KIGALI_DELIVERY_FEE_RWF;
  const totals = getOrderTotals(items.map((item) => ({ price: item.price, quantity: item.quantity })), deliveryFee);

  const handleUseGps = async () => {
    setLocating(true);
    try {
      const result = await getDeliveryLocation(manualAddress);
      setLocation(result);
      if (!result.latitude) {
        Alert.alert(
          'Location unavailable',
          'We could not access your GPS location. You can type your delivery address instead, and we will use the standard delivery fee.'
        );
      }
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceOrder = async () => {
    const finalLabel = location?.label || manualAddress.trim();
    if (!finalLabel) {
      Alert.alert('Delivery location required', 'Please share your location or type your delivery address first.');
      return;
    }

    const result = await placeOrder({
      label: finalLabel,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      deliveryFee,
      distanceKm: location?.distanceKm ?? 0,
    });

    if (!result.success) {
      Alert.alert('Could not place order', result.message || 'Something went wrong.');
      return;
    }

    Alert.alert('Order placed!', `Your order #${result.orderId} has been placed successfully.`, [
      { text: 'OK', onPress: () => navigation.navigate('Tabs') },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-line">
        <Pressable onPress={() => navigation.goBack()} className="w-9 h-9 items-center justify-center">
          <FontAwesome6 name="arrow-left" size={16} color="#111827" />
        </Pressable>
        <Text className="text-[16px] font-bold text-ink-900 ml-2">Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        <View className="bg-white rounded-2xl border border-line p-4 mb-4">
          <Text className="text-[14px] font-bold text-ink-900 mb-3">Delivery Location</Text>

          <Pressable
            onPress={handleUseGps}
            disabled={locating}
            className="flex-row items-center justify-center gap-2 border border-accent-orange rounded-xl h-11 mb-3"
          >
            {locating ? (
              <ActivityIndicator color="#f97316" />
            ) : (
              <>
                <FontAwesome6 name="location-crosshairs" size={14} color="#f97316" />
                <Text className="text-accent-orange font-semibold text-[14px]">Use my current location</Text>
              </>
            )}
          </Pressable>

          <Text className="text-[12.5px] text-ink-500 mb-1.5">Or type your delivery address</Text>
          <TextInput
            value={manualAddress}
            onChangeText={setManualAddress}
            placeholder="e.g. KG 7 Ave, Kacyiru, Kigali"
            placeholderTextColor="#94a3b8"
            multiline
            className="border border-line rounded-xl px-3.5 py-3 text-[14px] text-ink-900 min-h-[60px]"
          />

          {location?.label ? (
            <View className="flex-row items-center gap-2 mt-3 bg-accent-orange-soft rounded-lg px-3 py-2.5">
              <FontAwesome6 name="location-dot" size={13} color="#f97316" />
              <Text className="text-[12.5px] text-ink-700 flex-1">{location.label}</Text>
            </View>
          ) : null}
        </View>

        <View className="bg-white rounded-2xl border border-line p-4">
          <Text className="text-[14px] font-bold text-ink-900 mb-3">Order Summary</Text>
          {items.map((item) => (
            <View key={item.cartId} className="flex-row items-center justify-between mb-2">
              <Text className="text-[13px] text-ink-700 flex-1 mr-2" numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text className="text-[13px] font-semibold text-ink-900">
                RWF {Number(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          <View className="border-t border-line mt-2 pt-3">
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[13px] text-ink-500">Subtotal</Text>
              <Text className="text-[13px] text-ink-700">RWF {totals.productsSubtotal.toLocaleString()}</Text>
            </View>
            <View className="flex-row items-center justify-between mb-1.5">
              <Text className="text-[13px] text-ink-500">Delivery fee</Text>
              <Text className="text-[13px] text-ink-700">RWF {totals.deliveryFee.toLocaleString()}</Text>
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-[15px] font-bold text-ink-900">Total</Text>
              <Text className="text-[17px] font-bold text-accent-orange">RWF {totals.customerTotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-line px-4 pt-3 pb-5">
        <Pressable
          onPress={handlePlaceOrder}
          disabled={placing || items.length === 0}
          className="bg-accent-orange rounded-full h-12 items-center justify-center"
          style={{ opacity: placing || items.length === 0 ? 0.6 : 1 }}
        >
          {placing ? <ActivityIndicator color="#ffffff" /> : <Text className="text-white font-bold text-[15px]">Place Order</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
