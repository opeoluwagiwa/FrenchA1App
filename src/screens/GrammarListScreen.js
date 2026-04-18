import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import grammarData from '../data/grammar_data.json';

const ICONS = ['📝', '👤', '🚫', '❓', '✏️', '🔑', '👋', '🔮', '🌿', '📦', '📰', '🥐', '🎨', '📍', '🕐', '🪞', '⏮️', '🏃', '👆', '🔄'];

export default function GrammarListScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Grammar Lessons 📚</Text>
      <Text style={styles.subtitle}>{grammarData.length} interactive lessons with exercises</Text>

      <FlatList
        data={grammarData}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('GrammarDetail', { lesson: item, index })}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{ICONS[index] || '📖'}</Text>
            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>
                {item.exercises?.length || 0} exercises
                {item.tips ? ' · has tips' : ''}
              </Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        )}
      />

      {/* AI Generate More */}
      <TouchableOpacity
        style={styles.aiCard}
        onPress={() => navigation.navigate('AIGrammarGenerator')}
      >
        <Text style={styles.aiIcon}>🤖</Text>
        <View style={styles.aiInfo}>
          <Text style={styles.aiTitle}>Generate More Lessons</Text>
          <Text style={styles.aiDesc}>AI creates custom grammar lessons on any topic</Text>
        </View>
      </TouchableOpacity>
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
    borderLeftColor: '#A560FF',
  },
  icon: { fontSize: 28, marginRight: SPACING.md },
  info: { flex: 1 },
  title: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  meta: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  arrow: { color: COLORS.textMuted, fontSize: FONTS.size.xl },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: '#A560FF',
  },
  aiIcon: { fontSize: 32, marginRight: SPACING.md },
  aiInfo: { flex: 1 },
  aiTitle: { color: '#A560FF', fontSize: FONTS.size.md, fontWeight: 'bold' },
  aiDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
});
