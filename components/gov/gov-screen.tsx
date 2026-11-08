/**
 * GovScreen — the shared screen shell: GovHeader + PhaseBanner + padded scroll content.
 * Every route renders through this so chrome stays identical.
 */
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { colors, spacing } from '@/theme';
import { GovHeader } from './gov-header';
import { PhaseBanner } from './phase-banner';

export function GovScreen({ meta, children }: { meta?: string; children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <GovHeader meta={meta} />
      <PhaseBanner />
      <ScrollView contentContainerStyle={{ padding: spacing.screen, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}
