import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, LEVELS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import vocabData from '../data/vocab_data.json';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [wordOfDay, setWordOfDay] = useState(null);

  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' });
    const today = new Date().toDateString();
    if (state.wordOfDayDate !== today) {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const idx = dayOfYear % vocabData.length;
      dispatch({ type: 'UPDATE_WORD_OF_DAY', payload: idx });
      setWordOfDay(vocabData[idx]);
    } else {
      setWordOfDay(vocabData[state.wordOfDayIndex]);
    }
  }, []);

  const currentLevel = LEVELS.find(l => l.level === state.level) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === state.level + 1);
  const xpProgress = nextLevel
    ? ((state.xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100
    : 100;

  const features = [
    { title: 'Flashcards', icon: '▦', desc: 'SRS vocab cards', screen: 'FlashcardCategories', color: COLORS.primary },
    { title: 'Quiz', icon: '◎', desc: 'Test knowledge', screen: 'QuizMenu', color: COLORS.secondary },
    { title: 'Composer', icon: '⊞', desc: 'Build sentences', screen: 'SentenceComposer', color: COLORS.accent },
    { title: 'Grammar', icon: '≡', desc: 'Learn the rules', screen: 'GrammarList', color: COLORS.xp },
    { title: 'Dialogues', icon: '⊡', desc: 'Conversations', screen: 'DialogueList', color: COLORS.feminine },
    { title: 'Pronunciation', icon: '♪', desc: 'Sound it out', screen: 'Pronunciation', color: '#00C9A7' },
    { title: 'Dictionary', icon: '⊟', desc: '2,000+ words', screen: 'Dictionary', color: COLORS.accent },
    { title: 'Audio', icon: '●', desc: 'Record & compare', screen: 'AudioPractice', color: COLORS.wrong },
    { title: 'Challenges', icon: '◆', desc: 'Themed quizzes', screen: 'ThemedChallenge', color: COLORS.gold },
    { title: 'Progress', icon: '▤', desc: 'Your stats', screen: 'ProgressCharts', color: COLORS.xp },
  ];

  if (!state.isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: COLORS.text, fontSize: 18 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour!</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        {/* Hearts */}
        <View style={styles.heartsRow}>
          {[1, 2, 3, 4, 5].map(i => (
            <Text key={i} style={{ fontSize: 14, opacity: i <= state.lives ? 1 : 0.3 }}>
              {i <= state.lives ? '❤️' : '🖤'}
            </Text>
          ))}
        </View>
      </View>

      {/* Streak + XP row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: COLORS.streakBg }]}>
            <Text style={{ fontSize: 18 }}>🔥</Text>
          </View>
          <View>
            <Text style={styles.statNum}>{state.streak}</Text>
            <Text style={styles.statLabel}>jours</Text>
          </View>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: 'rgba(180, 135, 255, 0.12)' }]}>
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </View>
          <View>
            <Text style={styles.statNum}>{state.xp}</Text>
            <Text style={styles.statLabel}>XP · Niv. {state.level}</Text>
          </View>
        </View>
      </View>

      {/* Daily lesson hero card */}
      <TouchableOpacity
        style={styles.heroCard}
        onPress={() => navigation.navigate('DailyChallenge')}
        activeOpacity={0.85}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>TODAY'S LESSON</Text>
          <Text style={styles.heroTitle}>
            {state.dailyChallengeCompleted && state.dailyChallengeDate === new Date().toDateString()
              ? 'Completed!' : 'Daily Challenge'}
          </Text>
          <Text style={styles.heroDesc}>10 mixed questions · 8 min</Text>
          <View style={styles.heroBottom}>
            <View style={{ flex: 1 }}>
              <ProgressBar
                progress={state.dailyChallengeCompleted ? 100 : 0}
                color="#fff"
                height={5}
              />
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>+50 XP</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Word of the day — editorial card */}
      {wordOfDay && (
        <View style={styles.wodCard}>
          <View style={styles.wodHeader}>
            <Text style={styles.wodLabel}>WORD OF THE DAY</Text>
            <Text style={{ fontSize: 16 }}>🔊</Text>
          </View>
          <Text style={styles.wodFrench}>{wordOfDay.french}</Text>
          <Text style={styles.wodPron}>[{wordOfDay.pronunciation}]</Text>
          <Text style={styles.wodEnglish}>{wordOfDay.english}</Text>
        </View>
      )}

      {/* Continue learning */}
      <Text style={styles.sectionLabel}>CONTINUE</Text>
      <View style={styles.continueCard}>
        {[
          { icon: '🃏', fr: 'Flashcards', en: 'Flashcards', pct: Math.min(100, (state.wordsLearned / 10) * 100), screen: 'FlashcardCategories' },
          { icon: '💬', fr: 'Dialogue', en: 'Conversations', pct: Math.min(100, (state.dialoguesCompleted / 8) * 100), screen: 'DialogueList' },
          { icon: '📚', fr: 'Grammaire', en: 'Articles', pct: Math.min(100, (state.grammarCompleted / 20) * 100), screen: 'GrammarList' },
        ].map((r, i, arr) => (
          <TouchableOpacity
            key={i}
            style={[styles.continueRow, i < arr.length - 1 && styles.continueRowBorder]}
            onPress={() => navigation.navigate(r.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.continueIcon}>
              <Text style={{ fontSize: 20 }}>{r.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.continueFr}>{r.fr}</Text>
              <Text style={styles.continueEn}>{r.en}</Text>
              <View style={{ marginTop: 6 }}>
                <ProgressBar progress={r.pct} color={r.pct >= 100 ? COLORS.correct : COLORS.primary} height={3} />
              </View>
            </View>
            <View style={[styles.continuePill, r.pct >= 100 && styles.continuePillDone]}>
              <Text style={[styles.continuePillText, r.pct >= 100 && { color: COLORS.correct }]}>
                {r.pct >= 100 ? 'Done' : 'In progress'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Feature Grid */}
      <Text style={styles.sectionLabel}>LEARN</Text>
      <View style={styles.featureGrid}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.featureCard, { borderLeftWidth: 3, borderLeftColor: f.color }]}
            onPress={() => navigation.navigate(f.screen)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 26, marginBottom: 6 }}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mistakes review */}
      {state.mistakes.length > 0 && (
        <TouchableOpacity
          style={styles.mistakeCard}
          onPress={() => navigation.navigate('MistakesReview')}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 24, marginRight: 12 }}>🔄</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.text, fontSize: 14, fontWeight: '700' }}>Review Mistakes</Text>
            <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }}>{state.mistakes.length} items</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.md, paddingTop: SPACING.sm },
  greeting: { color: COLORS.text, fontSize: 34, fontWeight: 'bold', fontStyle: 'italic' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4 },
  heartsRow: { flexDirection: 'row' },
  // Stats
  statsRow: { flexDirection: 'row', marginBottom: SPACING.md },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 14,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  statNum: { color: COLORS.text, fontSize: 22, fontWeight: '800', lineHeight: 24 },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  // Hero
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xxl,
    padding: 18,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  heroContent: {},
  heroLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5 },
  heroTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 6, lineHeight: 30 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  heroBadge: { backgroundColor: 'rgba(0,0,0,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, marginLeft: 10 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  // Word of day
  wodCard: {
    backgroundColor: COLORS.bgElev,
    borderRadius: RADIUS.xl,
    padding: 18,
    marginBottom: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.gold,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  wodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  wodLabel: { fontSize: 10, fontWeight: '700', color: COLORS.gold, letterSpacing: 1.5 },
  wodFrench: { color: COLORS.text, fontSize: FONTS.size.display, fontWeight: 'bold', fontStyle: 'italic', letterSpacing: -1, lineHeight: 44 },
  wodPron: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, fontStyle: 'italic', marginTop: 6 },
  wodEnglish: { color: COLORS.text, fontSize: 14, marginTop: 10, lineHeight: 20 },
  // Section
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.5, marginTop: 8, marginBottom: 10, marginLeft: 4 },
  // Continue
  continueCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderSoft, marginBottom: SPACING.md, overflow: 'hidden' },
  continueRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  continueRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.borderSoft },
  continueIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: COLORS.bgCardHi, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  continueFr: { color: COLORS.text, fontSize: 17, fontWeight: '600', fontStyle: 'italic' },
  continueEn: { color: COLORS.textMuted, fontSize: 12, marginTop: 1 },
  continuePill: { backgroundColor: COLORS.bgCardHi, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  continuePillDone: { backgroundColor: 'rgba(88,204,2,0.12)' },
  continuePillText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  // Feature grid
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  featureTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '700' },
  featureDesc: { color: COLORS.textMuted, fontSize: 11, marginTop: 3 },
  // Mistakes
  mistakeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.wrong,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
});
