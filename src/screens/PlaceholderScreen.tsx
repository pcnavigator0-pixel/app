import { View, Text } from 'react-native';

export default function PlaceholderScreen({ label }: { label: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <Text className="text-ink-500 text-base">{label} screen coming soon</Text>
    </View>
  );
}
