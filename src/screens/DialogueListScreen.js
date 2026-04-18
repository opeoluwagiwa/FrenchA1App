import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import dialoguesData from '../data/dialogues_data.json';

const ICONS = ['☕', '🗺️', '🎓', '🏥', '👗', '🏨', '🛒', '📅'];

export default function DialogueListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Real-Life Dialogues 💬</Text>
      <Text style={styles.subtitle}>Practice conversations you'll actually have</Text>

      <FlatList
        data={dialoguesData}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DialogueDetail', { dialogue: item, index })}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{ICONS[index] || '💬'}</Text>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.setting}>{item.setting}</Text>
              <Text style={styles.lineCount}>{item.lines?.length || 0} lines</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', padding: SPACING.md, paddingBottom: 4 },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  list: { padding: SPACING.md, paddingTop: 0 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B9D',
    ...SHADOWS.card,
  },
  icon: { fontSize: 28, marginRight: SPACING.md },
  info: { flex: 1 },
  title: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  setting: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  lineCount: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  arrow: { color: COLORS.textMuted, fontSize: FONTS.size.xl },
});
