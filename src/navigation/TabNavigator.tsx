import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import HomeScreen from '../screens/HomeScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import { TabParamList } from './types';
import { useCart } from '../hooks/useCart';

const Tab = createBottomTabNavigator<TabParamList>();

const ACTIVE_COLOR = '#f97316';
const INACTIVE_COLOR = '#111827';

function TabIcon({
  name,
  solid,
  focused,
  badge,
}: {
  name: keyof typeof FontAwesome6.glyphMap;
  solid?: boolean;
  focused: boolean;
  badge?: number;
}) {
  return (
    <View style={{ width: 26, height: 24, alignItems: 'center', justifyContent: 'center' }}>
      <FontAwesome6
        name={name}
        size={22}
        iconStyle={solid ? 'solid' : 'regular'}
        color={focused ? ACTIVE_COLOR : INACTIVE_COLOR}
      />
      {badge ? (
        <View className="absolute -top-1.5 -right-2.5 bg-accent-orange rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold">{badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function TabNavigator() {
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 14,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f1f1ef',
        },
        tabBarLabelStyle: {
          fontSize: 11.5,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="house" solid focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Categories"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="table-cells-large" focused={focused} />,
        }}
      >
        {() => <PlaceholderScreen label="Categories" />}
      </Tab.Screen>
      <Tab.Screen
        name="Cart"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon name="cart-shopping" focused={focused} badge={cartCount} />
          ),
        }}
      >
        {() => <PlaceholderScreen label="Cart" />}
      </Tab.Screen>
      <Tab.Screen
        name="Wishlist"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="heart" focused={focused} />,
        }}
      >
        {() => <PlaceholderScreen label="Wishlist" />}
      </Tab.Screen>
      <Tab.Screen
        name="Account"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      >
        {() => <PlaceholderScreen label="Account" />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
