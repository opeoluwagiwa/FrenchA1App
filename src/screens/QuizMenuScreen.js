import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import LivesDisplay from '../components/LivesDisplay';

export default function QuizMenuScreen({ navigation }) {
  const { state } = useApp();

  const quizTypes = [
    {
      title: 'Multiple Choice',
      icon: '🎯',
      desc: 'Pick the correct answer from 4 options',
      screen: 'MCQQuiz',
      color: COLORS.secondary,
    },
    {
      title: 'Fill in the Blank',
      icon: '✏️',
      desc: 'Complete the French sentence',
      screen: 'FillBlankQuiz',
      color: COLORS.accent,
    },
    {
      title: 'Matching Pairs',
      icon: '🔗',
      desc: 'Match French words to English meanings',
      screen: 'MatchingQuiz',
      color: '#A560FF',
    },
    {
      title: 'Sentence Unscramble',
      icon: '🧩',
      desc: 'Put the words in the right order',
      screen: 'UnscrambleQuiz',
      color: '#FF6B9D',
    },
    {
      title: 'Speed Round',
      icon: '⚡',
      desc: 'Answer as many as you can in 60 seconds!',
      screen: 'SpeedRound',
      color: COLORS.wrong,
    },
    {
      title: 'Listening Quiz',
      icon: '👂',
      desc: 'Listen and pick the right translation',
      screen: 'ListeningQuiz',
      color: '#00C9A7',
    },
    {
      title: 'Translation Challenge',
      icon: '🔄',
      desc: 'Translate from English to French',
      screen: 'TranslationQuiz',
      color: COLORS.gold,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Quiz Arena 🧠</Text>
        <LivesDisplay lives={state.lives} />
      </View>
      <Text style={styles.subtitle}>Choose your challenge</Text>

      {state.lives === 0 && (
        <View style={styles.noLives}>
          <Text style={styles.noLivesText}>❤️ No lives left! Wait 30 min or review flashcards to recover.</Text>
        </View>
      )}

      {quizTypes.map((quiz, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.card, { borderLeftColor: quiz.color }, state.lives === 0 && styles.disabled]}
          onPress={() => state.lives > 0 && navigation.navigate(quiz.screen)}
          activeOpacity={state.lives > 0 ? 0.7 : 1}
        >
          <Text style={styles.icon}>{quiz.icon}</Text>
          <View style={styles.info}>
            <Text style={styles.cardTitle}>{quiz.title}</Text>
            <Text style={styles.cardDesc}>{quiz.desc}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginBottom: SPACING.lg },
  noLives: { backgroundColor: '#3C1414', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  noLivesText: { color: COLORS.wrong, fontSize: FONTS.size.sm, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    ...SHADOWS.card,
  },
  disabled: { opacity: 0.4 },
  icon: { fontSize: 32, marginRight: SPACING.md },
  info: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  cardDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  arrow: { color: COLORS.textMuted, fontSize: FONTS.size.xl },
});
