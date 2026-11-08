/**
 * GovTabBar — custom tab bar for expo-router Tabs (SYSTEM.md §3):
 * white, 2px black top border, line icons (19px, 1.5 stroke) over 10.5/700 labels.
 * Active tab: black + 4px green top bar.
 */
import type { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, type } from '@/theme';

interface TabRoute {
  key: string;
  name: string;
}

interface GovTabBarProps {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
        tabBarIcon?: (props: { color: ColorValue; focused: boolean; size: number }) => ReactNode;
      };
    }
  >;
  navigateToTab: (routeKey: string) => void;
}

export function GovTabBar({ state, descriptors, navigateToTab }: GovTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ backgroundColor: colors.white, borderTopWidth: 2, borderTopColor: colors.black, paddingBottom: Math.max(insets.bottom, 6), flexDirection: 'row' }}>
      {state.routes.map((route, i) => {
        const active = i === state.index;
        const options = descriptors[route.key]?.options ?? {};
        const color = active ? colors.black : colors.secondary;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={options.title ?? route.name}
            onPress={() => navigateToTab(route.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: 4,
              paddingTop: 8,
              borderTopWidth: 4,
              borderTopColor: active ? colors.green : 'transparent',
              marginTop: -2,
            }}
          >
            {options.tabBarIcon?.({ color, focused: active, size: 19 })}
            <Text style={[{ fontFamily: type.tag.fontFamily, fontSize: 10.5, lineHeight: 13 }, { color }]} numberOfLines={1}>
              {options.title ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
