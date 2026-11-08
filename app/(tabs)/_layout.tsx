/**
 * Tab shell — the seven routes from DESIGN.md §11 behind the GOV.UK-style tab bar.
 */
import { Tabs } from 'expo-router';
import { GovTabBar } from '@/components/gov/tab-bar';
import { AgendaIcon, CabinetIcon, GazetteIcon, No10Icon, OrdersIcon, SettingsIcon, TreasuryIcon } from '@/components/gov/icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GovTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'No. 10', tabBarIcon: (p) => <No10Icon color={p.color} /> }} />
      <Tabs.Screen name="agenda" options={{ title: 'Agenda', tabBarIcon: (p) => <AgendaIcon color={p.color} /> }} />
      <Tabs.Screen name="cabinet" options={{ title: 'Cabinet', tabBarIcon: (p) => <CabinetIcon color={p.color} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: (p) => <OrdersIcon color={p.color} /> }} />
      <Tabs.Screen name="gazette" options={{ title: 'Gazette', tabBarIcon: (p) => <GazetteIcon color={p.color} /> }} />
      <Tabs.Screen name="treasury" options={{ title: 'Treasury', tabBarIcon: (p) => <TreasuryIcon color={p.color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: (p) => <SettingsIcon color={p.color} /> }} />
    </Tabs>
  );
}
