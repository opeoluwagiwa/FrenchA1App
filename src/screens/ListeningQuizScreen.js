import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench, speakSlow } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import vocabData from '../data/vocab_data.json';

const TOTAL = 10;
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

function generateQuestions() {
  return shuffle(vocabData).slice(0, TOTAL).map(v => {
    const wrongs = shuffle(vocabData.filter(w => w.id !== v.id)).slice(0, 3);
    return {
      french: v.french,
      correct: v.english,
      options: shuffle([v.english, ...wrongs.map(w => w.english)]),
    };
  });
}

export default function ListeningQuizScreen({ navigation }) {
  const { dispatch } = useApp();
  const [questions] = useState(generateQuestions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  const q = questions[current];

  useEffect(() => {
    speakFrench(q.french);
  }, [current]);

  const handleSelect = useCallback((option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === q.correct;
    setIsCorrect(correct);
    if (correct) {
      dispatch({ type: 'ADD_XP', payload: 15 });
      setScore(s => s + 1);
    } else {
      dispatch({ type: 'LOSE_LIFE' });
    }

    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
        navigation.replace('SessionComplete', { reviewed: TOTAL, correct: score + (correct ? 1 : 0), total: TOTAL });
      }
    }, 1200);
  }, [selected, q, current, score]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <ProgressBar progress={((current + 1) / questions.length) * 100} />
        </View>
        <Text style={styles.score}>⭐ {score}</Text>
      </View>

      <View style={styles.listenArea}>
        <Text style={styles.label}>What do you hear?</Text>
        <TouchableOpacity style={styles.playBtn} onPress={() => speakFrench(q.french)}>
          <Text style={styles.playIcon}>🔊</Text>
          <Text style={styles.playText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.slowPlayBtn} onPress={() => speakSlow(q.french)}>
          <Text style={styles.slowText}>🐢 Slow</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.options}>
        {q.options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.option,
              selected === opt && isCorrect && styles.optionCorrect,
              selected === opt && !isCorrect && styles.optionWrong,
              selected !== null && opt === q.correct && styles.optionCorrect,
            ]}
            onPress={() => handleSelect(opt)}
            disabled={selected !== null}
          >
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selected !== null && (
        <View style={[styles.feedback, isCorrect ? styles.fbCorrect : styles.fbWrong]}>
          <Text style={styles.fbText}>
            {isCorrect ? '🎉 Correct!' : `❌ It was "${q.french}" = ${q.correct}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  score: { color: COLORS.gold, fontSize: FONTS.size.md, fontWeight: 'bold' },
  listenArea: { alignItems: 'center', padding: SPACING.xl },
  label: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginBottom: SPACING.lg },
  playBtn: {
    backgroundColor: '#00C9A7',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  playIcon: { fontSize: 40 },
  playText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold' },
  slowPlayBtn: { backgroundColor: COLORS.bgCard, paddingHorizontal: 20, paddingVertical: 8, borderRadius: RADIUS.full },
  slowText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
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
  optionCorrect: { borderColor: COLORS.correct, backgroundColor: '#0D2E0D' },
  optionWrong: { borderColor: COLORS.wrong, backgroundColor: '#2E0D0D' },
  optionText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600' },
  feedback: { padding: SPACING.md, alignItems: 'center' },
  fbCorrect: { backgroundColor: '#0D2E0D' },
  fbWrong: { backgroundColor: '#2E0D0D' },
  fbText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
});
