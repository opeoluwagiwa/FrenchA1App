import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, LEVELS, BADGES } from '../utils/theme';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';

export default function ProfileScreen() {
  const { state, dispatch } = useApp();

  const currentLevel = LEVELS.find(l => l.level === state.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === state.level + 1);
  const xpProgress = nextLevel
    ? ((state.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  const allBadges = BADGES.map(b => ({
    ...b,
    earned: state.badges.includes(b.id),
  }));

  const stats = [
    { label: 'Total XP', value: state.xp, icon: '⭐' },
    { label: 'Current Level', value: `${currentLevel.level} - ${currentLevel.name}`, icon: currentLevel.icon },
    { label: 'Day Streak', value: state.streak, icon: '🔥' },
    { label: 'Words Learned', value: state.wordsLearned, icon: '📖' },
    { label: 'Sentences Learned', value: state.sentencesLearned, icon: '💬' },
    { label: 'Flashcards Reviewed', value: state.flashcardsReviewed, icon: '🃏' },
    { label: 'Quizzes Completed', value: state.quizzesCompleted, icon: '🧠' },
    { label: 'Perfect Quizzes', value: state.perfectQuizzes, icon: '🏆' },
    { label: 'Speed Rounds', value: state.speedRounds, icon: '⚡' },
    { label: 'Sentences Composed', value: state.sentencesComposed, icon: '✍️' },
    { label: 'Grammar Lessons', value: `${state.grammarCompleted}/8`, icon: '📚' },
    { label: 'Dialogues Practiced', value: state.dialoguesCompleted, icon: '💬' },
    { label: 'Badges Earned', value: `${state.badges.length}/${BADGES.length}`, icon: '🏅' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{currentLevel.icon}</Text>
        </View>
        <Text style={styles.levelName}>{currentLevel.name}</Text>
        <Text style={styles.levelNum}>Level {currentLevel.level}</Text>
        <View style={styles.xpRow}>
          <ProgressBar progress={xpProgress} color={COLORS.xp} style={{ flex: 1 }} />
          <Text style={styles.xpText}>{state.xp} XP</Text>
        </View>
      </View>

      {/* Streak */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View>
          <Text style={styles.streakTitle}>{state.streak} Day Streak</Text>
          <Text style={styles.streakSubtext}>Keep going!</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.statsGrid}>
        {stats.map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Badges */}
      <Text style={styles.sectionTitle}>Badges</Text>
      <View style={styles.badgesGrid}>
        {allBadges.map((b, i) => (
          <View key={i} style={[styles.badgeCard, !b.earned && styles.badgeLocked]}>
            <Text style={[styles.badgeIcon, !b.earned && styles.badgeIconLocked]}>
              {b.earned ? b.icon : '🔒'}
            </Text>
            <Text style={[styles.badgeName, !b.earned && styles.badgeNameLocked]}>
              {b.name}
            </Text>
            <Text style={styles.badgeDesc}>{b.desc}</Text>
          </View>
        ))}
      </View>

      {/* Level Roadmap */}
      <Text style={styles.sectionTitle}>Level Roadmap</Text>
      {LEVELS.map((l, i) => (
        <View key={i} style={[styles.roadmapItem, l.level <= state.level && styles.roadmapActive]}>
          <View style={[styles.roadmapDot, l.level <= state.level && styles.roadmapDotActive]} />
          <Text style={styles.roadmapIcon}>{l.icon}</Text>
          <View>
            <Text style={[styles.roadmapName, l.level <= state.level && styles.roadmapNameActive]}>
              Level {l.level} - {l.name}
            </Text>
            <Text style={styles.roadmapXP}>{l.xpRequired} XP</Text>
          </View>
          {l.level === state.level && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>YOU</Text></View>}
        </View>
      ))}

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <TouchableOpacity style={styles.settingRow} onPress={() => dispatch({ type: 'TOGGLE_SOUND' })}>
        <Text style={styles.settingLabel}>🔊 Sound Effects</Text>
        <Text style={styles.settingValue}>{state.soundEnabled ? 'On' : 'Off'}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FrenchA1 v1.0</Text>
        <Text style={styles.footerText}>A1 Level - Prepared for Tobi</Text>
        <Text style={styles.footerSubtext}>A2, B1, B2 coming soon!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  profileHeader: { alignItems: 'center', paddingVertical: SPACING.lg },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: COLORS.xp },
  avatarText: { fontSize: 40 },
  levelName: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  levelNum: { color: COLORS.xp, fontSize: FONTS.size.md },
  xpRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: SPACING.md },
  xpText: { color: COLORS.xp, fontSize: FONTS.size.sm, fontWeight: 'bold', width: 70, textAlign: 'right' },
  streakCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.streakBg, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  streakEmoji: { fontSize: 32, marginRight: SPACING.md },
  streakTitle: { color: COLORS.streak, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  streakSubtext: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: 100, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', marginBottom: 8 },
  statIcon: { fontSize: 20 },
  statValue: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold', marginTop: 4 },
  statLabel: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: { width: 100, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', marginBottom: 8 },
  badgeLocked: { opacity: 0.4 },
  badgeIcon: { fontSize: 28 },
  badgeIconLocked: { fontSize: 20 },
  badgeName: { color: COLORS.text, fontSize: FONTS.size.xs, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },
  badgeNameLocked: { color: COLORS.textMuted },
  badgeDesc: { color: COLORS.textMuted, fontSize: 9, textAlign: 'center', marginTop: 2 },
  roadmapItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderLeftWidth: 2, borderLeftColor: COLORS.border, paddingLeft: SPACING.md, marginLeft: 10 },
  roadmapActive: { borderLeftColor: COLORS.primary },
  roadmapDot: { position: 'absolute', left: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border },
  roadmapDotActive: { backgroundColor: COLORS.primary },
  roadmapIcon: { fontSize: 24, marginRight: SPACING.sm },
  roadmapName: { color: COLORS.textMuted, fontSize: FONTS.size.md },
  roadmapNameActive: { color: COLORS.text, fontWeight: 'bold' },
  roadmapXP: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  currentBadge: { position: 'absolute', right: 0, backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  currentBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  settingLabel: { color: COLORS.text, fontSize: FONTS.size.md },
  settingValue: { color: COLORS.primary, fontSize: FONTS.size.md, fontWeight: 'bold' },
  footer: { alignItems: 'center', paddingVertical: SPACING.xl, marginTop: SPACING.lg },
  footerText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  footerSubtext: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 4 },
});
