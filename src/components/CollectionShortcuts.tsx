import { ScrollView, Text, Pressable, View } from 'react-native';

const SHORTCUTS = [
  'SHOP ALL',
  'TOP CATEGORY',
  'NEW ARRIVALS',
  'FEATURED',
  'TRENDING',
  'BEST PICKS',
  "EDITOR'S CHOICE",
  'SEASONAL',
  'POPULAR NOW',
];

export default function CollectionShortcuts({
  activeIndex = 0,
  onPress,
}: {
  activeIndex?: number;
  onPress?: (label: string, index: number) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="bg-white border-b border-line"
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, gap: 26 }}
    >
      {SHORTCUTS.map((label, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable key={label} onPress={() => onPress?.(label, index)}>
            <View className="items-center">
              <Text
                className={`text-[13px] tracking-[1px] font-bold ${
                  isActive ? 'text-ink-900' : 'text-ink-300'
                }`}
              >
                {label}
              </Text>
              {isActive ? <View className="h-[3px] w-7 bg-accent-orange rounded-full mt-2" /> : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
