import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';

export default function MistakesReviewScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [revealed, setRevealed] = useState(new Set());

  const toggleReveal = (id) => {
    setRevealed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_MISTAKE', payload: id });
    dispatch({ type: 'ADD_XP', payload: 5 });
  };

  if (state.mistakes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emptyEmoji}>🎉</Text>
        <Text style={styles.emptyText}>No mistakes to review!</Text>
        <Text style={styles.emptySubtext}>Keep up the great work</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Review Mistakes 🔄</Text>
      <Text style={styles.subtitle}>{state.mistakes.length} items to review</Text>

      <FlatList
        data={state.mistakes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => toggleReveal(item.id)}
            onLongPress={() => speakFrench(item.french)}
          >
            <Text style={styles.french}>{item.french}</Text>
            {item.pronunciation && (
              <Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
            )}
            {revealed.has(item.id) && (
              <Text style={styles.english}>{item.english}</Text>
            )}
            <View style={styles.cardActions}>
              <Text style={styles.hint}>{revealed.has(item.id) ? 'tap to hide' : 'tap to reveal'}</Text>
              <TouchableOpacity style={styles.gotItBtn} onPress={() => handleRemove(item.id)}>
                <Text style={styles.gotItText}>Got it! ✓</Text>
              </TouchableOpacity>
            </View>
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
  list: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.wrong,
  },
  french: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  pronunciation: { color: COLORS.textMuted, fontSize: FONTS.size.sm, fontStyle: 'italic', marginTop: 2 },
  english: { color: COLORS.primary, fontSize: FONTS.size.md, marginTop: 8 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  hint: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  gotItBtn: { backgroundColor: COLORS.correct, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.full },
  gotItText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: 'bold' },
  emptyEmoji: { fontSize: 60 },
  emptyText: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.md },
  emptySubtext: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginTop: SPACING.sm },
  backBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.lg, marginTop: SPACING.lg },
  backBtnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
});
