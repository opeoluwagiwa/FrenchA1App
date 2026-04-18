import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';

export default function SessionCompleteScreen({ route, navigation }) {
  const { reviewed = 0, correct = 0, total = 0 } = route.params || {};
  const { state } = useApp();
  const accuracy = total > 0 ? Math.round((correct / reviewed) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '👏' : '💪'}</Text>
      <Text style={styles.title}>
        {accuracy >= 80 ? 'Excellent!' : accuracy >= 50 ? 'Good Job!' : 'Keep Practicing!'}
      </Text>

      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Cards Reviewed</Text>
          <Text style={styles.statValue}>{reviewed}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Correct</Text>
          <Text style={[styles.statValue, { color: COLORS.correct }]}>{correct}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={[styles.statValue, { color: accuracy >= 80 ? COLORS.correct : COLORS.accent }]}>{accuracy}%</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>XP Earned</Text>
          <Text style={[styles.statValue, { color: COLORS.xp }]}>+{correct * 10}</Text>
        </View>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakText}>{state.streak} Day Streak!</Text>
      </View>

      <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.popToTop()}>
        <Text style={styles.continueBtnText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  emoji: { fontSize: 72 },
  title: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.md, marginBottom: SPACING.lg },
  statsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, width: '100%', marginBottom: SPACING.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  statLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.md },
  statValue: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.streakBg, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.full, marginBottom: SPACING.lg },
  streakEmoji: { fontSize: 24, marginRight: 8 },
  streakText: { color: COLORS.streak, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  continueBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 48, paddingVertical: 16, borderRadius: RADIUS.lg },
  continueBtnText: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: 'bold' },
});
