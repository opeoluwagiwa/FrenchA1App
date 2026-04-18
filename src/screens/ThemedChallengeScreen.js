import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';

const THEMES = [
  { id: 'restaurant', title: 'Restaurant Week 🍽️', categories: ['Restaurant & Food', 'Drinks', 'At the Restaurant'], color: '#FF6B9D', duration: '7 days' },
  { id: 'travel', title: 'Travel Mode ✈️', categories: ['Transport & Travel', 'At the Hotel', 'City & Places', 'Travel & Hotel', 'At the Airport', 'Directions & Transport'], color: COLORS.secondary, duration: '7 days' },
  { id: 'social', title: 'Social Butterfly 🦋', categories: ['Greetings & Politeness', 'Family & People', 'Emotions & Descriptions', 'Introducing Yourself', 'Family & Relationships'], color: '#A560FF', duration: '5 days' },
  { id: 'shopping', title: 'Shopping Spree 🛍️', categories: ['Shopping & Clothes', 'Shopping & Market', 'At the Supermarket', 'Colors, Clothes & Appearance'], color: COLORS.accent, duration: '5 days' },
  { id: 'daily', title: 'Daily Routine ☀️', categories: ['Everyday Actions', 'At Home & Daily Routine', 'Everyday Actions & Habits'], color: COLORS.primary, duration: '7 days' },
  { id: 'health', title: 'Health & Wellness 💊', categories: ['The Body & Health', 'Health & Doctor', 'Pharmacy & Wellness'], color: '#00C9A7', duration: '5 days' },
  { id: 'work', title: 'Office French 💼', categories: ['Work & Professions', 'Work & Office', 'Technology & Communication'], color: COLORS.gold, duration: '5 days' },
  { id: 'numbers', title: 'Number Cruncher 🔢', categories: ['Numbers (1-50)', 'Numbers (51-100 & Ordinals)', 'Numbers, Days & Time'], color: COLORS.wrong, duration: '3 days' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

export default function ThemedChallengeScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  const startChallenge = (theme) => {
    setSelectedTheme(theme);
    // Get vocab and sentences from these categories
    const themeVocab = vocabData.filter(v => theme.categories.some(c => v.category.includes(c) || c.includes(v.category)));
    const themeSentences = sentencesData.filter(s => theme.categories.some(c => s.category.includes(c) || c.includes(s.category)));
    const allItems = [...themeVocab, ...themeSentences];

    if (allItems.length < 4) {
      // Fallback to just vocab
      const fallback = shuffle(vocabData).slice(0, 40);
      generateQuiz(fallback);
    } else {
      generateQuiz(allItems);
    }
  };

  const generateQuiz = (items) => {
    const qs = shuffle(items).slice(0, 10).map(item => {
      const wrongs = shuffle(items.filter(w => w.id !== item.id)).slice(0, 3).map(w => w.english);
      return {
        french: item.french,
        correct: item.english,
        options: shuffle([item.english, ...wrongs]),
        pronunciation: item.pronunciation,
      };
    });
    setQuestions(qs);
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setQuizActive(true);
  };

  const handleAnswer = useCallback((option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === questions[currentQ].correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      dispatch({ type: 'ADD_XP', payload: 15 });
      speakFrench(questions[currentQ].french);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        setQuizActive(false);
        dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
      }
    }, 1000);
  }, [selected, currentQ, questions]);

  // Results screen
  if (selectedTheme && !quizActive && questions.length > 0) {
    const finalScore = score + (isCorrect ? 1 : 0);
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING.lg }]}>
        <Text style={{ fontSize: 60 }}>{finalScore >= 8 ? '🏆' : finalScore >= 5 ? '👏' : '💪'}</Text>
        <Text style={styles.resultTitle}>{selectedTheme.title} Complete!</Text>
        <Text style={styles.resultScore}>{finalScore}/{questions.length} correct</Text>
        <Text style={styles.resultXP}>+{finalScore * 15} XP earned</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => startChallenge(selectedTheme)}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backBtn} onPress={() => { setSelectedTheme(null); setQuestions([]); }}>
          <Text style={styles.backText}>Choose Another Theme</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Quiz mode
  if (quizActive && questions.length > 0) {
    const q = questions[currentQ];
    return (
      <View style={styles.container}>
        <View style={styles.quizHeader}>
          <Text style={[styles.themeTag, { backgroundColor: selectedTheme.color }]}>{selectedTheme.title}</Text>
          <Text style={styles.qCount}>{currentQ + 1}/{questions.length}</Text>
        </View>
        <View style={styles.questionCard}>
          <Text style={styles.questionFrench}>{q.french}</Text>
          <Text style={styles.questionPron}>[{q.pronunciation}]</Text>
        </View>
        <View style={styles.optionsArea}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.option,
                selected === opt && isCorrect && styles.optCorrect,
                selected === opt && !isCorrect && styles.optWrong,
                selected !== null && opt === q.correct && styles.optCorrect,
              ]}
              onPress={() => handleAnswer(opt)}
              disabled={selected !== null}
            >
              <Text style={styles.optText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Theme selection
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Themed Challenges 🎯</Text>
      <Text style={styles.subtitle}>Focus on a specific topic for intensive practice</Text>

      {THEMES.map((theme) => (
        <TouchableOpacity
          key={theme.id}
          style={[styles.themeCard, { borderLeftColor: theme.color }]}
          onPress={() => startChallenge(theme)}
          activeOpacity={0.7}
        >
          <Text style={styles.themeTitle}>{theme.title}</Text>
          <Text style={styles.themeDuration}>{theme.duration} challenge</Text>
          <Text style={styles.themeCats}>{theme.categories.slice(0, 3).join(' · ')}</Text>
        </TouchableOpacity>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.lg },
  themeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  themeTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  themeDuration: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  themeCats: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, marginTop: 4 },
  themeTag: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, overflow: 'hidden' },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  qCount: { color: COLORS.textSecondary, fontSize: FONTS.size.md },
  questionCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.xl, padding: SPACING.xl, margin: SPACING.md, alignItems: 'center' },
  questionFrench: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', textAlign: 'center' },
  questionPron: { color: COLORS.textMuted, fontSize: FONTS.size.sm, fontStyle: 'italic', marginTop: 8 },
  optionsArea: { padding: SPACING.md },
  option: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center' },
  optCorrect: { borderColor: COLORS.correct, backgroundColor: '#0D2E0D' },
  optWrong: { borderColor: COLORS.wrong, backgroundColor: '#2E0D0D' },
  optText: { color: COLORS.text, fontSize: FONTS.size.md },
  resultTitle: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.md },
  resultScore: { color: COLORS.textSecondary, fontSize: FONTS.size.lg, marginTop: SPACING.sm },
  resultXP: { color: COLORS.xp, fontSize: FONTS.size.md, fontWeight: 'bold', marginTop: 4 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.lg, marginTop: SPACING.lg },
  retryText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  backBtn: { marginTop: SPACING.md },
  backText: { color: COLORS.textSecondary, fontSize: FONTS.size.md },
});
