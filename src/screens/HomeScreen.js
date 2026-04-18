import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, LEVELS, BADGES } from '../utils/theme';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import LivesDisplay from '../components/LivesDisplay';
import vocabData from '../data/vocab_data.json';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [wordOfDay, setWordOfDay] = useState(null);

  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' });
    // Word of the day
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

  const earnedBadges = BADGES.filter(b => state.badges.includes(b.id));

  const features = [
    { title: 'Flashcards', icon: '🃏', desc: 'SRS-powered vocab', screen: 'FlashcardCategories', color: COLORS.primary },
    { title: 'Quiz', icon: '🧠', desc: 'Test your knowledge', screen: 'QuizMenu', color: COLORS.secondary },
    { title: 'Composer', icon: '✍️', desc: 'Build sentences', screen: 'SentenceComposer', color: COLORS.accent },
    { title: 'Grammar', icon: '📚', desc: 'Learn the rules', screen: 'GrammarList', color: '#A560FF' },
    { title: 'Dialogues', icon: '💬', desc: 'Real conversations', screen: 'DialogueList', color: '#FF6B9D' },
    { title: 'Pronunciation', icon: '🗣️', desc: 'Sound it out', screen: 'Pronunciation', color: '#00C9A7' },
    { title: 'Dictionary', icon: '📖', desc: 'Search 2,000+ words', screen: 'Dictionary', color: '#E08600' },
    { title: 'Audio Practice', icon: '🎙️', desc: 'Record & compare', screen: 'AudioPractice', color: '#FF4B4B' },
    { title: 'Challenges', icon: '🎯', desc: 'Themed quizzes', screen: 'ThemedChallenge', color: '#FFC800' },
    { title: 'Progress', icon: '📊', desc: 'Track your stats', screen: 'ProgressCharts', color: '#A560FF' },
  ];

  if (!state.isLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Bonjour! 🇫🇷</Text>
          <Text style={styles.subtitle}>Let's learn French today</Text>
        </View>
        <LivesDisplay lives={state.lives} />
      </View>

      {/* Level & XP Card */}
      <View style={[styles.card, styles.levelCard]}>
        <View style={styles.levelRow}>
          <Text style={styles.levelIcon}>{currentLevel.icon}</Text>
          <View style={styles.levelInfo}>
            <Text style={styles.levelName}>Level {currentLevel.level} - {currentLevel.name}</Text>
            <Text style={styles.xpText}>{state.xp} XP {nextLevel ? `/ ${nextLevel.xpRequired} XP` : '(MAX)'}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakNum}>{state.streak}</Text>
          </View>
        </View>
        <ProgressBar progress={xpProgress} color={COLORS.xp} style={{ marginTop: 8 }} />
      </View>

      {/* Word of the Day */}
      {wordOfDay && (
        <TouchableOpacity style={[styles.card, styles.wodCard]} activeOpacity={0.8}>
          <Text style={styles.wodLabel}>Word of the Day</Text>
          <Text style={styles.wodFrench}>{wordOfDay.french}</Text>
          <Text style={styles.wodPronunciation}>[{wordOfDay.pronunciation}]</Text>
          <Text style={styles.wodEnglish}>{wordOfDay.english}</Text>
        </TouchableOpacity>
      )}

      {/* Daily Challenge */}
      <TouchableOpacity
        style={[styles.card, styles.dailyCard, state.dailyChallengeCompleted && state.dailyChallengeDate === new Date().toDateString() && styles.dailyDone]}
        onPress={() => navigation.navigate('DailyChallenge')}
        activeOpacity={0.8}
      >
        <View style={styles.dailyRow}>
          <Text style={styles.dailyIcon}>
            {state.dailyChallengeCompleted && state.dailyChallengeDate === new Date().toDateString() ? '✅' : '⚡'}
          </Text>
          <View>
            <Text style={styles.dailyTitle}>Daily Challenge</Text>
            <Text style={styles.dailyDesc}>
              {state.dailyChallengeCompleted && state.dailyChallengeDate === new Date().toDateString()
                ? 'Completed! Come back tomorrow'
                : '10 mixed questions for bonus XP'}
            </Text>
          </View>
          <Text style={styles.dailyXP}>+50 XP</Text>
        </View>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{state.wordsLearned}</Text>
          <Text style={styles.statLabel}>Words</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{state.quizzesCompleted}</Text>
          <Text style={styles.statLabel}>Quizzes</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{state.flashcardsReviewed}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{state.streak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* Feature Grid */}
      <Text style={styles.sectionTitle}>Learn</Text>
      <View style={styles.featureGrid}>
        {features.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.featureCard, { borderColor: f.color }]}
            onPress={() => navigation.navigate(f.screen)}
            activeOpacity={0.7}
          >
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Mistakes Review */}
      {state.mistakes.length > 0 && (
        <TouchableOpacity
          style={[styles.card, styles.mistakeCard]}
          onPress={() => navigation.navigate('MistakesReview')}
          activeOpacity={0.8}
        >
          <Text style={styles.mistakeIcon}>🔄</Text>
          <View>
            <Text style={styles.mistakeTitle}>Review Mistakes</Text>
            <Text style={styles.mistakeDesc}>{state.mistakes.length} items to review</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Recent Badges */}
      {earnedBadges.length > 0 && (
        <View style={styles.badgeSection}>
          <Text style={styles.sectionTitle}>Badges Earned</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {earnedBadges.map((b, i) => (
              <View key={i} style={styles.badgeItem}>
                <Text style={styles.badgeIcon}>{b.icon}</Text>
                <Text style={styles.badgeName}>{b.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  loadingText: { color: COLORS.text, fontSize: FONTS.size.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  headerLeft: {},
  greeting: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  card: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOWS.card },
  levelCard: { borderLeftWidth: 4, borderLeftColor: COLORS.xp },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelIcon: { fontSize: 32, marginRight: SPACING.sm },
  levelInfo: { flex: 1 },
  levelName: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  xpText: { color: COLORS.xp, fontSize: FONTS.size.sm, marginTop: 2 },
  streakBadge: { alignItems: 'center', backgroundColor: COLORS.streakBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.md },
  streakIcon: { fontSize: 20 },
  streakNum: { color: COLORS.streak, fontSize: FONTS.size.md, fontWeight: 'bold' },
  wodCard: { borderLeftWidth: 4, borderLeftColor: COLORS.gold, alignItems: 'center', paddingVertical: SPACING.lg },
  wodLabel: { color: COLORS.gold, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  wodFrench: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: 8 },
  wodPronunciation: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4, fontStyle: 'italic' },
  wodEnglish: { color: COLORS.primary, fontSize: FONTS.size.lg, marginTop: 4 },
  dailyCard: { borderLeftWidth: 4, borderLeftColor: COLORS.accent },
  dailyDone: { opacity: 0.6 },
  dailyRow: { flexDirection: 'row', alignItems: 'center' },
  dailyIcon: { fontSize: 28, marginRight: SPACING.sm },
  dailyTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  dailyDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  dailyXP: { color: COLORS.accent, fontWeight: 'bold', fontSize: FONTS.size.md, flex: 0, paddingLeft: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  statBox: { flex: 1, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.sm, alignItems: 'center', marginHorizontal: 4 },
  statNum: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold' },
  statLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, marginTop: 2 },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginBottom: SPACING.md, marginTop: SPACING.sm },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: {
    width: (width - SPACING.md * 2 - SPACING.sm) / 2,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  featureIcon: { fontSize: 32, marginBottom: 8 },
  featureTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  featureDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, marginTop: 4 },
  mistakeCard: { flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: COLORS.wrong },
  mistakeIcon: { fontSize: 28, marginRight: SPACING.sm },
  mistakeTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  mistakeDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  badgeSection: { marginTop: SPACING.sm },
  badgeItem: { alignItems: 'center', marginRight: SPACING.md, backgroundColor: COLORS.bgCard, padding: SPACING.sm, borderRadius: RADIUS.md, minWidth: 80 },
  badgeIcon: { fontSize: 28 },
  badgeName: { color: COLORS.text, fontSize: FONTS.size.xs, marginTop: 4, textAlign: 'center' },
});
