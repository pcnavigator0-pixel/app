import { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { CollectionItem } from '../hooks/useHomeData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
// Matches the reference design's proportions (roughly square, not elongated).
// Using a ratio instead of a fixed pixel height keeps this correct across
// different screen widths, instead of looking too tall on narrower phones.
const CARD_HEIGHT = Math.round(CARD_WIDTH * 0.95);

export default function CollectionCarousel({
  items,
  onShopCollection,
}: {
  items: CollectionItem[];
  onShopCollection: (category: string) => void;
}) {
  const listRef = useRef<FlatList<CollectionItem>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(index);
  };

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    listRef.current?.scrollToOffset({ offset: clamped * CARD_WIDTH, animated: true });
    setActiveIndex(clamped);
  };

  if (items.length === 0) return null;

  return (
    <View className="mt-2">
      <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT, alignSelf: 'center', marginTop: 8 }}>
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
              <Image
                source={{ uri: item.image }}
                style={{ width: '100%', height: '100%', borderRadius: 24 }}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.82)']}
                locations={[0, 0.45, 1]}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '72%',
                  borderBottomLeftRadius: 24,
                  borderBottomRightRadius: 24,
                }}
              />
              <View className="absolute left-5 right-5 bottom-12">
                <Text className="text-white text-[12px] font-bold tracking-[2px] mb-2 opacity-90">
                  {item.eyebrow.toUpperCase()}
                </Text>
                <Text className="text-white text-[28px] font-bold mb-2">{item.title}</Text>
                <Text className="text-white/85 text-[14px] leading-5 mb-3">{item.description}</Text>
                <Text className="text-white/70 text-[12px] font-bold tracking-[1.5px] mb-3">
                  {item.count} PRODUCT{item.count === 1 ? '' : 'S'} AVAILABLE
                </Text>
                <Pressable
                  onPress={() => onShopCollection(item.category)}
                  className="flex-row items-center gap-2"
                >
                  <Text className="text-white text-[15px] font-bold tracking-[1px]">SHOP COLLECTION</Text>
                  <FontAwesome6 name="arrow-right" size={13} color="#ffffff" />
                </Pressable>
              </View>
            </View>
          )}
        />

        {items.length > 1 ? (
          <>
            <Pressable
              onPress={() => goTo(activeIndex - 1)}
              className="absolute left-3 bottom-5 w-10 h-10 rounded-full bg-white items-center justify-center"
              style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
            >
              <FontAwesome6 name="chevron-left" size={14} color="#111827" />
            </Pressable>
            <Pressable
              onPress={() => goTo(activeIndex + 1)}
              className="absolute right-3 bottom-5 w-10 h-10 rounded-full bg-white items-center justify-center"
              style={{ shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 3 }}
            >
              <FontAwesome6 name="chevron-right" size={14} color="#111827" />
            </Pressable>

            <View className="absolute bottom-7 left-0 right-0 flex-row items-center justify-center gap-2">
              {items.map((item, index) => (
                <View
                  key={item.key}
                  className={`rounded-full ${
                    index === activeIndex ? 'bg-accent-orange w-5 h-2' : 'bg-white/55 w-2 h-2'
                  }`}
                />
              ))}
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}
