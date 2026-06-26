import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { CategoryChip } from '../hooks/useHomeData';

export default function ShopByCategories({
  categories,
  onCategoryPress,
}: {
  categories: CategoryChip[];
  onCategoryPress: (category: string) => void;
}) {
  if (categories.length === 0) return null;

  return (
    <View className="mt-7 px-4">
      <Text className="text-[26px] font-bold text-ink-900 mb-4">Shop By Categories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 20 }}
      >
        {categories.map((item) => (
          <Pressable
            key={item.category}
            onPress={() => onCategoryPress(item.category)}
            className="items-center"
            style={{ width: 84 }}
          >
            <View className="w-20 h-20 rounded-full overflow-hidden bg-canvas mb-2">
              <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            </View>
            <Text className="text-[13.5px] font-bold text-ink-900" numberOfLines={1}>
              {item.category}
            </Text>
            <Text className="text-[12.5px] font-semibold text-accent-orange mt-0.5">
              {item.count}+ Items
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
