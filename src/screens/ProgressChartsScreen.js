import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';

function Bar({ label, value, maxValue, color }) {
  const width = maxValue > 0 ? Math.max(4, (value / maxValue) * 100) : 4;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.barValue}>{value}</Text>
    </View>
  );
}

export default function ProgressChartsScreen({ navigation }) {
  const { state } = useApp();

  const categoryProgress = useMemo(() => {
    const cats = {};
    Object.entries(state.cardStates).forEach(([key, card]) => {
      if (key.startsWith('v_')) {
        // Find the vocab item to get category
        const learned = card.repetition >= 2;
        // Group by rough category
        const catKey = learned ? 'learned' : 'in_progress';
        cats[catKey] = (cats[catKey] || 0) + 1;
      }
    });
    return cats;
  }, [state.cardStates]);

  const totalCards = Object.keys(state.cardStates).length;
  const learnedCards = Object.values(state.cardStates).filter(c => c.repetition >= 2).length;
  const inProgressCards = Object.values(state.cardStates).filter(c => c.repetition >= 1 && c.repetition < 2).length;
  const newCards = 1000 - totalCards;

  const stats = [
    { label: 'XP Earned', value: state.xp, max: 5500, color: COLORS.xp },
    { label: 'Words Learned', value: state.wordsLearned, max: 1000, color: COLORS.primary },
    { label: 'Sentences', value: state.sentencesLearned, max: 1000, color: COLORS.secondary },
    { label: 'Quizzes Done', value: state.quizzesCompleted, max: 100, color: COLORS.accent },
    { label: 'Perfect Quizzes', value: state.perfectQuizzes, max: 50, color: COLORS.gold },
    { label: 'Flashcard Reviews', value: state.flashcardsReviewed, max: 500, color: '#A560FF' },
    { label: 'Compositions', value: state.sentencesComposed, max: 100, color: '#FF6B9D' },
    { label: 'Grammar Lessons', value: state.grammarCompleted, max: 8, color: '#00C9A7' },
  ];

  const streakData = state.streak;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Progress Charts 📊</Text>

      {/* Overview ring */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewRow}>
          <View style={styles.ringContainer}>
            <View style={[styles.ring, { borderColor: COLORS.primary }]}>
              <Text style={styles.ringPercent}>{Math.round((state.wordsLearned / 1000) * 100)}%</Text>
              <Text style={styles.ringLabel}>A1</Text>
            </View>
          </View>
          <View style={styles.overviewStats}>
            <Text style={styles.overviewTitle}>A1 Completion</Text>
            <Text style={styles.overviewDetail}>{state.wordsLearned} / 1,000 words</Text>
            <Text style={styles.overviewDetail}>{state.sentencesLearned} / 1,000 sentences</Text>
            <Text style={styles.overviewDetail}>{state.grammarCompleted} / 8 grammar lessons</Text>
          </View>
        </View>
      </View>

      {/* Vocabulary Breakdown */}
      <Text style={styles.sectionTitle}>Vocabulary Status</Text>
      <View style={styles.vocabCard}>
        <View style={styles.vocabRow}>
          <View style={[styles.vocabDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.vocabLabel}>Mastered</Text>
          <Text style={styles.vocabValue}>{learnedCards}</Text>
        </View>
        <View style={styles.vocabRow}>
          <View style={[styles.vocabDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.vocabLabel}>In Progress</Text>
          <Text style={styles.vocabValue}>{inProgressCards}</Text>
        </View>
        <View style={styles.vocabRow}>
          <View style={[styles.vocabDot, { backgroundColor: COLORS.textMuted }]} />
          <Text style={styles.vocabLabel}>Not Started</Text>
          <Text style={styles.vocabValue}>{newCards}</Text>
        </View>
        {/* Simple bar visualization */}
        <View style={styles.stackedBar}>
          <View style={[styles.stackedSegment, { flex: learnedCards || 1, backgroundColor: COLORS.primary }]} />
          <View style={[styles.stackedSegment, { flex: inProgressCards || 1, backgroundColor: COLORS.accent }]} />
          <View style={[styles.stackedSegment, { flex: newCards || 1, backgroundColor: COLORS.textMuted }]} />
        </View>
      </View>

      {/* Streak Calendar */}
      <Text style={styles.sectionTitle}>Current Streak</Text>
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNum}>{streakData}</Text>
        <Text style={styles.streakLabel}>Day{streakData !== 1 ? 's' : ''} in a row!</Text>
        <View style={styles.streakDots}>
          {[1, 2, 3, 4, 5, 6, 7].map(d => (
            <View key={d} style={[styles.dot, d <= streakData && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.weekLabel}>This week</Text>
      </View>

      {/* Stats Bars */}
      <Text style={styles.sectionTitle}>All-Time Stats</Text>
      <View style={styles.barsCard}>
        {stats.map((s, i) => (
          <Bar key={i} label={s.label} value={s.value} maxValue={s.max} color={s.color} />
        ))}
      </View>

      {/* Milestones */}
      <Text style={styles.sectionTitle}>Next Milestones</Text>
      <View style={styles.milestonesCard}>
        {state.wordsLearned < 50 && (
          <Text style={styles.milestone}>📖 Learn 50 words — {50 - state.wordsLearned} to go</Text>
        )}
        {state.wordsLearned < 100 && state.wordsLearned >= 50 && (
          <Text style={styles.milestone}>📚 Learn 100 words — {100 - state.wordsLearned} to go</Text>
        )}
        {state.streak < 7 && (
          <Text style={styles.milestone}>🔥 7-day streak — {7 - state.streak} days to go</Text>
        )}
        {state.quizzesCompleted < 10 && (
          <Text style={styles.milestone}>🧠 Complete 10 quizzes — {10 - state.quizzesCompleted} to go</Text>
        )}
        {state.grammarCompleted < 8 && (
          <Text style={styles.milestone}>📝 Finish all grammar — {8 - state.grammarCompleted} to go</Text>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm, marginBottom: SPACING.md },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  overviewCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg },
  overviewRow: { flexDirection: 'row', alignItems: 'center' },
  ringContainer: { marginRight: SPACING.lg },
  ring: { width: 80, height: 80, borderRadius: 40, borderWidth: 6, justifyContent: 'center', alignItems: 'center' },
  ringPercent: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  ringLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  overviewStats: { flex: 1 },
  overviewTitle: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  overviewDetail: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  vocabCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md },
  vocabRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  vocabDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  vocabLabel: { color: COLORS.text, fontSize: FONTS.size.sm, flex: 1 },
  vocabValue: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontWeight: 'bold' },
  stackedBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginTop: SPACING.sm },
  stackedSegment: { height: 12 },
  streakCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center' },
  streakEmoji: { fontSize: 40 },
  streakNum: { color: COLORS.streak, fontSize: 48, fontWeight: 'bold' },
  streakLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.md },
  streakDots: { flexDirection: 'row', marginTop: SPACING.md },
  dot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.border, marginHorizontal: 4 },
  dotActive: { backgroundColor: COLORS.streak },
  weekLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 8 },
  barsCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md },
  barRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  barLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, width: 100 },
  barTrack: { flex: 1, height: 10, backgroundColor: COLORS.border, borderRadius: 5, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { color: COLORS.text, fontSize: FONTS.size.xs, fontWeight: 'bold', width: 35, textAlign: 'right' },
  milestonesCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md },
  milestone: { color: COLORS.text, fontSize: FONTS.size.sm, paddingVertical: 6, lineHeight: 22 },
});
