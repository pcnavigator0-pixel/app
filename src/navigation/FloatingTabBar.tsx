import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const ACTIVE_COLOR = '#f97316';
const INACTIVE_COLOR = '#111827';

const ICONS: Record<string, { name: keyof typeof FontAwesome6.glyphMap; solid?: boolean }> = {
  Home: { name: 'house', solid: true },
  Categories: { name: 'table-cells-large' },
  Cart: { name: 'cart-shopping' },
  Wishlist: { name: 'heart' },
  Account: { name: 'user' },
};

export default function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 10) }}
      className="px-3 pt-2 bg-canvas"
    >
      <View
        className="flex-row bg-white rounded-[22px] px-1.5 pt-2.5 pb-2"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const icon = ICONS[route.name] || { name: 'circle' as const };
          const badge =
            route.name === 'Cart' && typeof options.tabBarBadge !== 'undefined'
              ? options.tabBarBadge
              : undefined;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center justify-center py-1"
            >
              <View style={{ width: 24, height: 22, alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome6
                  name={icon.name}
                  size={19}
                  iconStyle={isFocused && icon.solid ? 'solid' : 'regular'}
                  color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
                {badge ? (
                  <View className="absolute -top-1 -right-2 bg-accent-orange rounded-full min-w-[16px] h-4 items-center justify-center px-1">
                    <Text className="text-white text-[9px] font-bold">{badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                className={`text-[11px] mt-1 ${isFocused ? 'font-bold' : 'font-medium'}`}
                style={{ color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR }}
              >
                {String(options.tabBarLabel ?? route.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
