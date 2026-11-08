/**
 * TaskList — the core list (order paper, day's business, clauses, briefs).
 * Rows: title + sub + one tag + optional chevron; hairline dividers (SYSTEM.md §3).
 * VoiceOver: each row announces title → sub → tag as one element (§5).
 */
import { Pressable, SectionList, Text, View } from 'react-native';
import { colors, spacing, type, type TagStatus } from '@/theme';
import { ChevronIcon } from './icons';
import { Tag } from './tag';

export interface TaskItem {
  id: string;
  title: string;
  sub?: string;
  status?: TagStatus;
  chevron?: boolean;
  onPress?: () => void;
}

export interface TaskSection {
  heading: string;
  items: TaskItem[];
}

export function TaskList({ sections }: { sections: TaskSection[] }) {
  return (
    <SectionList
      sections={sections.map((s) => ({ ...s, data: s.items }))}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      renderSectionHeader={({ section }) => (
        <Text style={[type.section, { marginTop: spacing.section, marginBottom: 4, paddingBottom: 6, borderBottomWidth: 2, borderBottomColor: colors.black }]}>
          {(section as TaskSection).heading}
        </Text>
      )}
      renderItem={({ item }) => {
        const row = (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: spacing.row, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={type.title} numberOfLines={2}>{item.title}</Text>
              {item.sub ? <Text style={[type.sub, { color: colors.secondary, marginTop: 3 }]} numberOfLines={2}>{item.sub}</Text> : null}
            </View>
            {item.status ? <Tag status={item.status} /> : null}
            {item.chevron ? <ChevronIcon /> : null}
          </View>
        );
        const label = [item.title, item.sub, item.status ? item.status : null].filter(Boolean).join(', ');
        if (!item.onPress) {
          return (
            <View accessibilityRole="text" accessibilityLabel={label}>{row}</View>
          );
        }
        return (
          <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={item.onPress}>
            {row}
          </Pressable>
        );
      }}
    />
  );
}
