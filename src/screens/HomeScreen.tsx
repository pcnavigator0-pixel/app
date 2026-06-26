import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeHeader from '../components/HomeHeader';
import CollectionShortcuts from '../components/CollectionShortcuts';
import CollectionCarousel from '../components/CollectionCarousel';
import ShopByCategories from '../components/ShopByCategories';
import ProductToolbar from '../components/ProductToolbar';
import ProductCard from '../components/ProductCard';
import { useHomeData } from '../hooks/useHomeData';
import { useProductFeed } from '../hooks/useProductFeed';
import { useCart } from '../hooks/useCart';
import { Product } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 12;
const CARD_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export default function HomeScreen() {
  const { collectionItems, categoryChips, loading: loadingCollections, error: collectionsError, refresh: refreshCollections } = useHomeData();
  const {
    products,
    loadingInitial,
    loadingMore,
    hasMore,
    error: feedError,
    loadFirstPage,
    loadNextPage,
  } = useProductFeed();
  const { cartCount, refreshCart } = useCart();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGridView, setIsGridView] = useState(true);
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshCollections(), loadFirstPage(), refreshCart()]);
    setRefreshing(false);
  };

  const handleCategoryNavigation = (category: string) => {
    // Wired up once category-filtered browsing exists.
    console.log('Navigate to category:', category);
  };

  const handleToggleWishlist = (productId: number) => {
    setWishlistedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((product) => product.name?.toLowerCase().includes(normalizedQuery));
  }, [products, searchQuery]);

  const renderProductCard = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        cardWidth={CARD_WIDTH}
        isWishlisted={wishlistedIds.has(item.id)}
        onPress={() => console.log('open product', item.id)}
        onQuickAdd={() => console.log('quick add', item.id)}
        onToggleWishlist={() => handleToggleWishlist(item.id)}
        onCompare={() => console.log('compare', item.id)}
        onWhatsApp={() => console.log('whatsapp', item.id)}
      />
    ),
    [wishlistedIds]
  );

  const listHeader = (
    <>
      {loadingCollections ? (
        <View className="items-center justify-center py-16">
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : collectionsError ? (
        <View className="items-center justify-center py-16 px-6">
          <Text className="text-ink-500 text-center">{collectionsError}</Text>
        </View>
      ) : (
        <>
          <CollectionCarousel items={collectionItems} onShopCollection={handleCategoryNavigation} />
          <ShopByCategories categories={categoryChips} onCategoryPress={handleCategoryNavigation} />
        </>
      )}

      <ProductToolbar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        resultCount={filteredProducts.length}
        isGridView={isGridView}
        onToggleView={() => setIsGridView((current) => !current)}
        onFilterPress={() => console.log('open filters')}
      />
    </>
  );

  const listFooter = loadingMore ? (
    <View className="items-center justify-center py-6">
      <ActivityIndicator color="#f97316" size="small" />
    </View>
  ) : !hasMore && products.length > 0 ? (
    <View className="items-center justify-center py-6">
      <Text className="text-ink-300 text-[12.5px]">You've reached the end</Text>
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <HomeHeader
        cartCount={cartCount}
        onMenuPress={() => console.log('open menu')}
        onSearchPress={() => console.log('open search')}
        onCartPress={() => console.log('open cart')}
      />
      <CollectionShortcuts onPress={(label) => console.log('shortcut pressed:', label)} />

      {loadingInitial ? (
        <View className="flex-1 items-center justify-center bg-canvas">
          <ActivityIndicator color="#f97316" size="large" />
        </View>
      ) : feedError && products.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-canvas px-6">
          <Text className="text-ink-500 text-center">{feedError}</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1 bg-canvas"
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProductCard}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: GRID_PADDING, gap: GRID_GAP }}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          contentContainerStyle={{ paddingBottom: 32 }}
          onEndReachedThreshold={0.4}
          onEndReached={loadNextPage}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

