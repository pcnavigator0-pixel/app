import { View, Text, Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function HomeHeader({
  cartCount,
  onMenuPress,
  onSearchPress,
  onCartPress,
}: {
  cartCount: number;
  onMenuPress: () => void;
  onSearchPress: () => void;
  onCartPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 pt-3 pb-3 bg-white">
      <Pressable
        onPress={onMenuPress}
        className="w-11 h-11 rounded-full border border-line items-center justify-center"
      >
        <FontAwesome6 name="bars" size={18} color="#111827" />
      </Pressable>

      <View className="items-center">
        <View className="flex-row items-baseline">
          <Text className="text-[19px] font-extrabold tracking-wide text-ink-900">SHOP </Text>
          <Text className="text-[19px] font-extrabold tracking-wide text-accent-orange">CORNER</Text>
        </View>
        <Text className="text-[11px] font-bold tracking-[2px] text-accent-orange -mt-1">RWANDA</Text>
      </View>

      <View className="flex-row items-center gap-2.5">
        <Pressable
          onPress={onSearchPress}
          className="w-11 h-11 rounded-full border border-line items-center justify-center"
        >
          <FontAwesome6 name="magnifying-glass" size={17} color="#111827" />
        </Pressable>
        <Pressable
          onPress={onCartPress}
          className="w-11 h-11 rounded-full bg-ink-900 items-center justify-center"
        >
          <FontAwesome6 name="bag-shopping" size={16} color="#ffffff" />
          {cartCount > 0 ? (
            <View className="absolute -top-1.5 -right-1.5 bg-accent-orange rounded-full min-w-[20px] h-5 items-center justify-center px-1 border-2 border-white">
              <Text className="text-white text-[10px] font-bold">{cartCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
