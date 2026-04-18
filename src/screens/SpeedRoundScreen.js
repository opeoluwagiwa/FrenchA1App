import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import vocabData from '../data/vocab_data.json';

const DURATION = 60; // seconds

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion() {
  const correct = vocabData[Math.floor(Math.random() * vocabData.length)];
  const wrongs = shuffle(vocabData.filter(v => v.id !== correct.id)).slice(0, 3);
  const options = shuffle([correct.english, ...wrongs.map(w => w.english)]);
  return { french: correct.french, correct: correct.english, options };
}

export default function SpeedRoundScreen({ navigation }) {
  const { dispatch } = useApp();
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [question, setQuestion] = useState(generateQuestion);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [flash, setFlash] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          setIsActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  useEffect(() => {
    if (!isActive && timeLeft === 0) {
      dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'speedRounds' } });
      dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
      dispatch({ type: 'ADD_XP', payload: score * 5 });
      setTimeout(() => {
        navigation.replace('SessionComplete', {
          reviewed: total,
          correct: score,
          total,
        });
      }, 1500);
    }
  }, [isActive, timeLeft]);

  const handleAnswer = useCallback((option) => {
    if (!isActive) return;
    const correct = option === question.correct;
    setTotal(t => t + 1);
    setFlash(correct ? 'correct' : 'wrong');

    if (correct) {
      setScore(s => s + 1);
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      setFlash(null);
      setQuestion(generateQuestion());
    }, 300);
  }, [isActive, question]);

  const timerColor = timeLeft <= 10 ? COLORS.wrong : timeLeft <= 30 ? COLORS.accent : COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => { setIsActive(false); navigation.goBack(); }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={[styles.timer, { borderColor: timerColor }]}>
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        </View>
        <Animated.Text style={[styles.scoreText, { transform: [{ scale: scaleAnim }] }]}>
          ⭐ {score}
        </Animated.Text>
      </View>

      {!isActive && timeLeft === 0 ? (
        <View style={styles.gameOver}>
          <Text style={styles.gameOverEmoji}>⚡</Text>
          <Text style={styles.gameOverTitle}>Time's Up!</Text>
          <Text style={styles.gameOverScore}>{score} correct out of {total}</Text>
        </View>
      ) : (
        <>
          <View style={[styles.questionArea, flash === 'correct' && styles.flashCorrect, flash === 'wrong' && styles.flashWrong]}>
            <Text style={styles.frenchWord}>{question.french}</Text>
          </View>

          <View style={styles.optionsGrid}>
            {question.options.map((option, i) => (
              <TouchableOpacity
                key={i}
                style={styles.optionBtn}
                onPress={() => handleAnswer(option)}
                activeOpacity={0.6}
              >
                <Text style={styles.optionText} numberOfLines={2}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  timer: { borderWidth: 3, borderRadius: RADIUS.full, width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  timerText: { fontSize: FONTS.size.xl, fontWeight: 'bold' },
  scoreText: { color: COLORS.gold, fontSize: FONTS.size.xl, fontWeight: 'bold' },
  questionArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
  },
  flashCorrect: { backgroundColor: '#0D2E0D' },
  flashWrong: { backgroundColor: '#2E0D0D' },
  frenchWord: { color: COLORS.text, fontSize: FONTS.size.hero, fontWeight: 'bold', textAlign: 'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.sm, paddingBottom: SPACING.xl, justifyContent: 'space-between' },
  optionBtn: {
    width: 160,
    marginBottom: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600', textAlign: 'center' },
  gameOver: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gameOverEmoji: { fontSize: 60 },
  gameOverTitle: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.md },
  gameOverScore: { color: COLORS.textSecondary, fontSize: FONTS.size.lg, marginTop: SPACING.sm },
});
