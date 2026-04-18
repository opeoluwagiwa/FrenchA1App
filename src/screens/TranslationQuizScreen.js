import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import sentencesData from '../data/sentences_data.json';

const TOTAL = 8;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function normalize(s) {
  return s.toLowerCase().replace(/[.,!?''""\s]+/g, ' ').trim();
}

export default function TranslationQuizScreen({ navigation }) {
  const { dispatch } = useApp();
  const [questions] = useState(() => shuffle(sentencesData.filter(s => s.french.split(' ').length <= 6)).slice(0, TOTAL));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  const q = questions[current];

  const handleSubmit = useCallback(() => {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
    const userNorm = normalize(input);
    const correctNorm = normalize(q.french);
    // Allow fuzzy match (80% of words correct)
    const userWords = userNorm.split(' ');
    const correctWords = correctNorm.split(' ');
    const matchCount = correctWords.filter(w => userWords.includes(w)).length;
    const correct = matchCount / correctWords.length >= 0.75;

    setIsCorrect(correct);
    if (correct) {
      dispatch({ type: 'ADD_XP', payload: 25 });
      setScore(s => s + 1);
    } else {
      dispatch({ type: 'LOSE_LIFE' });
    }
    speakFrench(q.french);
  }, [input, submitted, q]);

  const handleNext = useCallback(() => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setInput('');
      setSubmitted(false);
      setIsCorrect(null);
    } else {
      dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
      navigation.replace('SessionComplete', { reviewed: TOTAL, correct: score + (isCorrect ? 1 : 0), total: TOTAL });
    }
  }, [current, score, isCorrect]);

  if (!q) return null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <ProgressBar progress={((current + 1) / questions.length) * 100} color={COLORS.gold} />
        </View>
        <Text style={styles.score}>⭐ {score}</Text>
      </View>

      <View style={styles.promptCard}>
        <Text style={styles.label}>Translate to French 🇫🇷</Text>
        <Text style={styles.english}>{q.english}</Text>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, submitted && (isCorrect ? styles.inputCorrect : styles.inputWrong)]}
          value={input}
          onChangeText={setInput}
          placeholder="Type in French..."
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitted}
          onSubmitEditing={handleSubmit}
          multiline
        />

        {!submitted ? (
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <View style={[styles.fbBox, isCorrect ? styles.fbCorrect : styles.fbWrong]}>
              <Text style={styles.fbEmoji}>{isCorrect ? '🎉' : '❌'}</Text>
              <View>
                <Text style={styles.fbText}>{isCorrect ? 'Correct! +25 XP' : 'Not quite...'}</Text>
                <Text style={styles.correctAnswer}>{q.french}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.btn} onPress={handleNext}>
              <Text style={styles.btnText}>{current < questions.length - 1 ? 'Next' : 'Finish'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  score: { color: COLORS.gold, fontSize: FONTS.size.md, fontWeight: 'bold' },
  promptCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, margin: SPACING.md },
  label: { color: COLORS.gold, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  english: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 8, lineHeight: 30 },
  inputArea: { padding: SPACING.md, flex: 1 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputCorrect: { borderColor: COLORS.correct },
  inputWrong: { borderColor: COLORS.wrong },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  fbBox: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm },
  fbCorrect: { backgroundColor: '#0D2E0D' },
  fbWrong: { backgroundColor: '#2E0D0D' },
  fbEmoji: { fontSize: 28, marginRight: 12 },
  fbText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  correctAnswer: { color: COLORS.primary, fontSize: FONTS.size.sm, marginTop: 2 },
});
