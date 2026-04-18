import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';

export default function DialogueDetailScreen({ route, navigation }) {
  const { dialogue, index } = route.params;
  const { dispatch } = useApp();
  const [revealedLines, setRevealedLines] = useState(new Set());
  const [showEnglish, setShowEnglish] = useState(false);

  const toggleLine = (i) => {
    setRevealedLines(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleComplete = () => {
    dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'dialoguesCompleted' } });
    dispatch({ type: 'ADD_XP', payload: 25 });
    navigation.goBack();
  };

  const speakerColors = {};
  let colorIdx = 0;
  const palette = [COLORS.secondary, COLORS.accent, '#A560FF', '#FF6B9D', '#00C9A7'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{dialogue.title}</Text>
      <Text style={styles.setting}>{dialogue.setting}</Text>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, showEnglish && styles.toggleActive]}
          onPress={() => setShowEnglish(!showEnglish)}
        >
          <Text style={[styles.toggleText, showEnglish && styles.toggleTextActive]}>
            {showEnglish ? 'Hide English' : 'Show English'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.speakAllBtn} onPress={() => {
          dialogue.lines?.forEach((line, i) => {
            setTimeout(() => speakFrench(line.french), i * 2500);
          });
        }}>
          <Text style={styles.speakAllText}>🔊 Play All</Text>
        </TouchableOpacity>
      </View>

      {dialogue.lines?.map((line, i) => {
        if (!speakerColors[line.speaker]) {
          speakerColors[line.speaker] = palette[colorIdx % palette.length];
          colorIdx++;
        }
        const color = speakerColors[line.speaker];
        const isRevealed = revealedLines.has(i);

        return (
          <TouchableOpacity
            key={i}
            style={[styles.bubble, { borderLeftColor: color }]}
            onPress={() => toggleLine(i)}
            onLongPress={() => speakFrench(line.french)}
            activeOpacity={0.8}
          >
            <Text style={[styles.speaker, { color }]}>{line.speaker}</Text>
            <Text style={styles.frenchLine}>{line.french}</Text>
            {(showEnglish || isRevealed) && (
              <Text style={styles.englishLine}>{line.english}</Text>
            )}
            <Text style={styles.tapHint}>tap to {isRevealed ? 'hide' : 'reveal'} | long press to hear</Text>
          </TouchableOpacity>
        );
      })}

      {(!dialogue.lines || dialogue.lines.length === 0) && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Dialogue content will be available in the next update!</Text>
        </View>
      )}

      <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
        <Text style={styles.completeBtnText}>Complete (+25 XP)</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  title: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold' },
  setting: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4, fontStyle: 'italic', marginBottom: SPACING.md },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  toggleBtn: { backgroundColor: COLORS.bgCard, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border },
  toggleActive: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  toggleText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  toggleTextActive: { color: '#fff' },
  speakAllBtn: { backgroundColor: COLORS.bgCard, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  speakAllText: { color: COLORS.text, fontSize: FONTS.size.sm },
  bubble: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  speaker: { fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  frenchLine: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600', marginTop: 6, lineHeight: 24 },
  englishLine: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4, fontStyle: 'italic' },
  tapHint: { color: COLORS.textMuted, fontSize: 10, marginTop: 6 },
  emptyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, textAlign: 'center' },
  completeBtn: {
    backgroundColor: '#FF6B9D',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  completeBtnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
});
