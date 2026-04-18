import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import sentencesData from '../data/sentences_data.json';

const TOTAL = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateFillBlanks() {
  const questions = [];
  const samples = shuffle(sentencesData.filter(s => s.french.split(' ').length >= 3)).slice(0, TOTAL);

  samples.forEach(s => {
    const words = s.french.split(' ');
    // Pick a word to blank out (not first word, not articles)
    const skipWords = new Set(['Je', 'Tu', 'Il', 'Elle', 'Nous', 'Vous', 'Ils', 'Elles', 'Le', 'La', 'Les', 'Un', 'Une', 'Des', 'On', 'Ce', 'C\'est']);
    const candidates = words.map((w, i) => ({ word: w, idx: i })).filter(w => w.idx > 0 && !skipWords.has(w.word) && w.word.length > 2);

    if (candidates.length === 0) return;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    const blanked = words.map((w, i) => i === chosen.idx ? '_____' : w).join(' ');

    questions.push({
      sentence: blanked,
      answer: chosen.word.toLowerCase().replace(/[.,!?]/g, ''),
      fullSentence: s.french,
      english: s.english,
      pronunciation: s.pronunciation,
    });
  });

  return questions;
}

export default function FillBlankQuizScreen({ navigation }) {
  const { dispatch } = useApp();
  const [questions] = useState(() => generateFillBlanks());
  const [currentQ, setCurrentQ] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  const question = questions[currentQ];

  const handleSubmit = useCallback(() => {
    if (!input.trim() || submitted) return;
    setSubmitted(true);
    const userAnswer = input.trim().toLowerCase().replace(/[.,!?]/g, '');
    const correct = userAnswer === question.answer;
    setIsCorrect(correct);

    if (correct) {
      dispatch({ type: 'ADD_XP', payload: 20 });
      setScore(s => s + 1);
    } else {
      dispatch({ type: 'LOSE_LIFE' });
    }

    speakFrench(question.fullSentence);
  }, [input, submitted, question]);

  const handleNext = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setInput('');
      setSubmitted(false);
      setIsCorrect(null);
    } else {
      dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
      navigation.replace('SessionComplete', {
        reviewed: questions.length,
        correct: score + (isCorrect ? 1 : 0),
        total: questions.length,
      });
    }
  }, [currentQ, questions.length, score, isCorrect]);

  if (!question) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>Not enough data for this quiz. Learn more sentences first!</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <ProgressBar progress={((currentQ + 1) / questions.length) * 100} />
        </View>
        <Text style={styles.score}>⭐ {score}</Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.label}>Fill in the blank</Text>
        <Text style={styles.sentence}>{question.sentence}</Text>
        <Text style={styles.english}>({question.english})</Text>
      </View>

      <View style={styles.inputArea}>
        <TextInput
          style={[styles.input, submitted && (isCorrect ? styles.inputCorrect : styles.inputWrong)]}
          value={input}
          onChangeText={setInput}
          placeholder="Type the missing word..."
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!submitted}
          onSubmitEditing={handleSubmit}
        />

        {!submitted ? (
          <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <View style={[styles.feedbackBox, isCorrect ? styles.correctBox : styles.wrongBox]}>
              <Text style={styles.feedbackEmoji}>{isCorrect ? '🎉' : '❌'}</Text>
              <Text style={styles.feedbackText}>
                {isCorrect ? 'Correct!' : `Answer: ${question.answer}`}
              </Text>
            </View>
            <Text style={styles.fullSentence}>{question.fullSentence}</Text>
            <TouchableOpacity style={[styles.btn, { marginTop: SPACING.md }]} onPress={handleNext}>
              <Text style={styles.btnText}>
                {currentQ < questions.length - 1 ? 'Next' : 'Finish'}
              </Text>
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
  questionCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, margin: SPACING.md, ...SHADOWS.card },
  label: { color: COLORS.secondary, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  sentence: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 12, lineHeight: 32 },
  english: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginTop: 8, fontStyle: 'italic' },
  inputArea: { padding: SPACING.md },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  inputCorrect: { borderColor: COLORS.correct },
  inputWrong: { borderColor: COLORS.wrong },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  feedbackBox: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm },
  correctBox: { backgroundColor: '#0D2E0D' },
  wrongBox: { backgroundColor: '#2E0D0D' },
  feedbackEmoji: { fontSize: 24, marginRight: 8 },
  feedbackText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  fullSentence: { color: COLORS.textSecondary, fontSize: FONTS.size.md, fontStyle: 'italic', textAlign: 'center' },
  errorText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, textAlign: 'center', padding: SPACING.lg },
});
