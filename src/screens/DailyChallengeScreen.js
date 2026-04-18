import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';

const TOTAL = 10;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function generateChallenge() {
  const questions = [];
  // Mix vocab and sentence questions
  const vocabs = shuffle(vocabData).slice(0, 5);
  const sents = shuffle(sentencesData).slice(0, 5);

  vocabs.forEach(v => {
    const wrongs = shuffle(vocabData.filter(w => w.id !== v.id)).slice(0, 3);
    questions.push({
      type: 'vocab',
      question: `What does "${v.french}" mean?`,
      french: v.french,
      options: shuffle([v.english, ...wrongs.map(w => w.english)]),
      correct: v.english,
    });
  });

  sents.forEach(s => {
    const wrongs = shuffle(sentencesData.filter(w => w.id !== s.id)).slice(0, 3);
    questions.push({
      type: 'sentence',
      question: `Translate: "${s.english}"`,
      french: s.french,
      options: shuffle([s.french, ...wrongs.map(w => w.french)]),
      correct: s.french,
    });
  });

  return shuffle(questions).slice(0, TOTAL);
}

export default function DailyChallengeScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [questions] = useState(generateChallenge);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  const q = questions[current];

  const handleSelect = useCallback((option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === q.correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
      if (q.french) speakFrench(q.french);
    }

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        const finalScore = score + (correct ? 1 : 0);
        dispatch({ type: 'ADD_XP', payload: 50 + finalScore * 5 });
        dispatch({ type: 'COMPLETE_DAILY_CHALLENGE' });
        dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
        navigation.replace('SessionComplete', { reviewed: TOTAL, correct: finalScore, total: TOTAL });
      }
    }, 1000);
  }, [selected, q, current, score]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <ProgressBar progress={((current + 1) / questions.length) * 100} color={COLORS.accent} />
        </View>
        <Text style={styles.score}>⚡ {score}/{TOTAL}</Text>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Daily Challenge</Text>
        <Text style={styles.bannerXP}>+50 XP bonus!</Text>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.qNum}>{current + 1}/{TOTAL}</Text>
        <Text style={styles.questionText}>{q.question}</Text>
      </View>

      <View style={styles.options}>
        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.option,
              selected === opt && isCorrect && styles.optCorrect,
              selected === opt && !isCorrect && styles.optWrong,
              selected !== null && opt === q.correct && styles.optCorrect,
            ]}
            onPress={() => handleSelect(opt)}
            disabled={selected !== null}
          >
            <Text style={styles.optText} numberOfLines={2}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  score: { color: COLORS.accent, fontSize: FONTS.size.md, fontWeight: 'bold' },
  banner: { backgroundColor: COLORS.accent, margin: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  bannerText: { color: '#fff', fontSize: FONTS.size.lg, fontWeight: 'bold' },
  bannerXP: { color: '#fff', fontSize: FONTS.size.sm, opacity: 0.9 },
  questionCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, margin: SPACING.md },
  qNum: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  questionText: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 8 },
  options: { padding: SPACING.md },
  option: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  optCorrect: { borderColor: COLORS.correct, backgroundColor: '#0D2E0D' },
  optWrong: { borderColor: COLORS.wrong, backgroundColor: '#2E0D0D' },
  optText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600', textAlign: 'center' },
});
