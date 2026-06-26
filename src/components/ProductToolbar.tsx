import { View, Text, TextInput, Pressable } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export default function ProductToolbar({
  query,
  onQueryChange,
  resultCount,
  isGridView,
  onToggleView,
  onFilterPress,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  resultCount: number;
  isGridView: boolean;
  onToggleView: () => void;
  onFilterPress: () => void;
}) {
  return (
    <View className="px-4 pt-4">
      <View className="flex-row items-center gap-2.5">
        <View className="flex-1 flex-row items-center bg-white border border-line rounded-xl px-3.5 h-11">
          <FontAwesome6 name="magnifying-glass" size={14} color="#94a3b8" />
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search products..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2.5 text-[14px] text-ink-900"
          />
        </View>

        <Pressable
          onPress={onToggleView}
          className={`w-11 h-11 rounded-xl items-center justify-center ${
            isGridView ? 'bg-accent-orange' : 'bg-white border border-line'
          }`}
        >
          <FontAwesome6 name="table-cells-large" size={16} color={isGridView ? '#ffffff' : '#111827'} />
        </Pressable>
        <Pressable
          onPress={onToggleView}
          className={`w-11 h-11 rounded-xl items-center justify-center ${
            !isGridView ? 'bg-accent-orange' : 'bg-white border border-line'
          }`}
        >
          <FontAwesome6 name="list" size={16} color={!isGridView ? '#ffffff' : '#111827'} />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-[14px] text-ink-700">
          <Text className="font-bold text-ink-900">{resultCount}</Text> shown on home
        </Text>
        <Pressable
          onPress={onFilterPress}
          className="flex-row items-center gap-1.5 bg-white border border-line rounded-xl px-3.5 h-9"
        >
          <FontAwesome6 name="sliders" size={13} color="#111827" />
          <Text className="text-[13px] font-semibold text-ink-900">Filter</Text>
        </Pressable>
      </View>
    </View>
  );
}
