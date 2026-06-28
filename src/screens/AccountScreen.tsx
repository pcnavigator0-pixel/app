import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, FlatList, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useSession } from '../hooks/useSession';
import { useUserProfile } from '../hooks/useUserProfile';
import { useOrderHistory, OrderHistoryEntry } from '../hooks/useOrderHistory';
import { resolveProductImagePath } from '../lib/images';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../navigation/types';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fff8e1', text: '#8a6d3b' },
  paid: { bg: '#e8f5e9', text: '#2e7d32' },
  processing: { bg: '#e3f2fd', text: '#1565c0' },
  delivered: { bg: '#e8f5e9', text: '#1b5e20' },
  canceled: { bg: '#ffebee', text: '#b71c1c' },
};

function OrderCard({ order }: { order: OrderHistoryEntry }) {
  const statusStyle = STATUS_STYLES[order.status?.toLowerCase()] || STATUS_STYLES.pending;
  const orderDate = new Date(order.created_at);

  return (
    <View className="bg-white rounded-2xl border border-line p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-[14px] font-bold text-ink-900">Order #{order.id}</Text>
        <View style={{ backgroundColor: statusStyle.bg }} className="rounded-full px-3 py-1">
          <Text style={{ color: statusStyle.text }} className="text-[11.5px] font-bold capitalize">
            {order.status}
          </Text>
        </View>
      </View>

      <Text className="text-[12px] text-ink-500 mb-3">
        {orderDate.toLocaleDateString()} · {order.items.length} item{order.items.length === 1 ? '' : 's'}
      </Text>

      {order.items.slice(0, 3).map((item) => {
        const imageUri = resolveProductImagePath(item.image);
        return (
          <View key={item.id} className="flex-row items-center mb-2">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 36, height: 36, borderRadius: 8 }} resizeMode="cover" />
            ) : (
              <View style={{ width: 36, height: 36, borderRadius: 8 }} className="bg-canvas" />
            )}
            <Text className="text-[12.5px] text-ink-700 ml-2.5 flex-1" numberOfLines={1}>
              {item.product_name} × {item.quantity}
            </Text>
          </View>
        );
      })}

      <View className="border-t border-line mt-2 pt-2.5 flex-row items-center justify-between">
        <Text className="text-[12.5px] text-ink-500">Total</Text>
        <Text className="text-[15px] font-bold text-ink-900">RWF {order.total_amount.toLocaleString()}</Text>
      </View>
    </View>
  );
}

export default function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session, initializing } = useSession();
  const { profile } = useUserProfile();
  const { orders, loading, refresh } = useOrderHistory();
  const [refreshing, setRefreshing] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setSigningOut(false);
    }
  };

  if (initializing) {
    return (
      <SafeAreaView className="flex-1 bg-canvas items-center justify-center">
        <ActivityIndicator color="#f97316" size="large" />
      </SafeAreaView>
    );
  }

  if (!session?.user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-16 h-16 rounded-full bg-accent-orange-soft items-center justify-center mb-4">
          <FontAwesome6 name="user" size={26} color="#f97316" />
        </View>
        <Text className="text-[18px] font-bold text-ink-900 mb-1.5">You're not signed in</Text>
        <Text className="text-[13.5px] text-ink-500 text-center mb-6">
          Sign in to view your orders and complete checkout.
        </Text>
        <Pressable
          onPress={() => navigation.navigate('Login')}
          className="bg-accent-orange rounded-full h-12 px-8 items-center justify-center"
        >
          <Text className="text-white font-bold text-[15px]">Sign In</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="bg-white px-4 pt-4 pb-5 border-b border-line">
        <View className="flex-row items-center">
          <View className="w-14 h-14 rounded-full bg-accent-orange-soft items-center justify-center mr-3.5">
            <Text className="text-[20px] font-bold text-accent-orange">
              {(profile?.full_name || session.user.email || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-ink-900">{profile?.full_name || 'Welcome'}</Text>
            <Text className="text-[13px] text-ink-500" numberOfLines={1}>
              {profile?.email || session.user.email}
            </Text>
          </View>
          <Pressable onPress={handleSignOut} disabled={signingOut}>
            {signingOut ? (
              <ActivityIndicator color="#94a3b8" size="small" />
            ) : (
              <FontAwesome6 name="right-from-bracket" size={18} color="#94a3b8" />
            )}
          </Pressable>
        </View>
      </View>

      <View className="px-4 pt-4 pb-2">
        <Text className="text-[15px] font-bold text-ink-900">My Orders</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <FontAwesome6 name="box-open" size={32} color="#cbd5e1" />
          <Text className="text-ink-500 mt-3 text-center">You haven't placed any orders yet.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(order) => String(order.id)}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}
