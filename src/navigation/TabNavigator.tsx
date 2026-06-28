import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import AccountScreen from '../screens/AccountScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import FloatingTabBar from './FloatingTabBar';
import { TabParamList } from './types';
import { useCart } from '../hooks/useCart';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const { cartCount } = useCart();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Categories">
        {() => <PlaceholderScreen label="Categories" />}
      </Tab.Screen>
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarBadge: cartCount > 0 ? cartCount : undefined }}
      />
      <Tab.Screen name="Wishlist">
        {() => <PlaceholderScreen label="Wishlist" />}
      </Tab.Screen>
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}


