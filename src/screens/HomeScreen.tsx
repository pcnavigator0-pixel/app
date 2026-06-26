import { useState } from 'react';
import { ScrollView, RefreshControl, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import CollectionShortcuts from '../components/CollectionShortcuts';
import CollectionCarousel from '../components/CollectionCarousel';
import ShopByCategories from '../components/ShopByCategories';
import { useHomeData } from '../hooks/useHomeData';
import { useCart } from '../hooks/useCart';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { collectionItems, categoryChips, loading, error, refresh } = useHomeData();
  const { cartCount } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCategoryNavigation = (category: string) => {
    // Wired up once the Categories/Products screen exists.
    console.log('Navigate to category:', category);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <HomeHeader
        cartCount={cartCount}
        onMenuPress={() => console.log('open menu')}
        onSearchPress={() => console.log('open search')}
        onCartPress={() => console.log('open cart')}
      />
      <CollectionShortcuts onPress={(label) => console.log('shortcut pressed:', label)} />

      <ScrollView
        className="flex-1 bg-canvas"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator color="#f97316" size="large" />
          </View>
        ) : error ? (
          <View className="items-center justify-center py-20 px-6">
            <Text className="text-ink-500 text-center">{error}</Text>
          </View>
        ) : (
          <>
            <CollectionCarousel items={collectionItems} onShopCollection={handleCategoryNavigation} />
            <ShopByCategories categories={categoryChips} onCategoryPress={handleCategoryNavigation} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
