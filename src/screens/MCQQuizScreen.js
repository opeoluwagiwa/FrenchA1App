import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import XPBadge from '../components/XPBadge';
import vocabData from '../data/vocab_data.json';
import quizzesData from '../data/quizzes_vocab.json';
import { chatWithAI } from '../utils/ai';

const TOTAL_QUESTIONS = 10;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions() {
  // Mix from pre-made quizzes and auto-generated from vocab
  const questions = [];

  // Pre-made quizzes
  const preQuizzes = shuffle(quizzesData).slice(0, 5);
  preQuizzes.forEach(q => {
    const correctLetter = q.answer.charAt(0);
    const correctOption = q.options.find(o => o.startsWith(correctLetter));
    questions.push({
      question: q.question,
      options: shuffle(q.options.map(o => o.slice(3).trim())),
      correct: correctOption ? correctOption.slice(3).trim() : '',
      type: 'premade',
    });
  });

  // Auto-generated: show French word, pick English meaning
  const vocabSample = shuffle(vocabData).slice(0, 5);
  vocabSample.forEach(v => {
    const wrongOptions = shuffle(vocabData.filter(w => w.id !== v.id)).slice(0, 3).map(w => w.english);
    const options = shuffle([v.english, ...wrongOptions]);
    questions.push({
      question: `What does "${v.french}" mean?`,
      french: v.french,
      options,
      correct: v.english,
      type: 'vocab',
    });
  });

  return shuffle(questions).slice(0, TOTAL_QUESTIONS);
}

export default function MCQQuizScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [questions] = useState(() => generateQuestions());
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);

  const question = questions[currentQ];

  const handleSelect = useCallback((option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === question.correct;
    setIsCorrect(correct);

    if (correct) {
      dispatch({ type: 'ADD_XP', payload: 15 });
      setScore(s => s + 1);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1000);
      if (question.french) speakFrench(question.french);
    } else {
      dispatch({ type: 'LOSE_LIFE' });
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setIsCorrect(null);
        setHint('');
      } else {
        const finalScore = score + (correct ? 1 : 0);
        dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
        if (finalScore === TOTAL_QUESTIONS) {
          dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'perfectQuizzes' } });
        }
        navigation.replace('SessionComplete', {
          reviewed: TOTAL_QUESTIONS,
          correct: finalScore,
          total: TOTAL_QUESTIONS,
        });
      }
    }, 1200);
  }, [selected, question, currentQ, score]);

  const getOptionStyle = (option) => {
    if (selected === null) return styles.option;
    if (option === question.correct) return [styles.option, styles.optionCorrect];
    if (option === selected && !isCorrect) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionDimmed];
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <ProgressBar progress={((currentQ + 1) / questions.length) * 100} />
        </View>
        <Text style={styles.score}>⭐ {score}</Text>
      </View>

      <XPBadge amount={15} visible={showXP} />

      <Animated.View style={[styles.questionCard, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={styles.qNumber}>Question {currentQ + 1}/{questions.length}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
      </Animated.View>

      <View style={styles.optionsContainer}>
        {question.options.map((option, i) => (
          <TouchableOpacity
            key={i}
            style={getOptionStyle(option)}
            onPress={() => handleSelect(option)}
            activeOpacity={0.7}
            disabled={selected !== null}
          >
            <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
            <Text style={styles.optionText}>{option}</Text>
            {selected !== null && option === question.correct && <Text style={styles.checkIcon}>✓</Text>}
            {selected === option && !isCorrect && <Text style={styles.crossIcon}>✗</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Smart Hint Button */}
      {selected === null && state.apiKey ? (
        <TouchableOpacity
          style={styles.hintBtn}
          onPress={async () => {
            if (hintLoading || hint) return;
            setHintLoading(true);
            const res = await chatWithAI(state.apiKey, [{ role: 'user', content: `Give me a ONE sentence hint (no answer) for: ${question.question}` }],
              'You give brief hints for French quiz questions. Never reveal the answer. Just give a helpful clue in under 15 words.');
            setHint(res.text || 'Think about the context!');
            setHintLoading(false);
          }}
          disabled={hintLoading || !!hint}
        >
          <Text style={styles.hintText}>{hintLoading ? '💭 Thinking...' : hint ? `💡 ${hint}` : '💡 Get a Hint'}</Text>
        </TouchableOpacity>
      ) : null}

      {selected !== null && (
        <View style={[styles.feedbackBar, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? '🎉 Correct!' : `❌ The answer is: ${question.correct}`}
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
  questionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    ...SHADOWS.card,
  },
  qNumber: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1 },
  questionText: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 8, lineHeight: 30 },
  optionsContainer: { padding: SPACING.md, flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCorrect: { borderColor: COLORS.correct, backgroundColor: '#0D2E0D' },
  optionWrong: { borderColor: COLORS.wrong, backgroundColor: '#2E0D0D' },
  optionDimmed: { opacity: 0.5 },
  optionLetter: { color: COLORS.textMuted, fontSize: FONTS.size.md, fontWeight: 'bold', width: 28 },
  optionText: { color: COLORS.text, fontSize: FONTS.size.md, flex: 1 },
  checkIcon: { color: COLORS.correct, fontSize: FONTS.size.xl, fontWeight: 'bold' },
  crossIcon: { color: COLORS.wrong, fontSize: FONTS.size.xl, fontWeight: 'bold' },
  feedbackBar: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  feedbackCorrect: { backgroundColor: '#0D2E0D' },
  feedbackWrong: { backgroundColor: '#2E0D0D' },
  feedbackText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  hintBtn: { padding: SPACING.sm, marginHorizontal: SPACING.md, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.gold },
  hintText: { color: COLORS.gold, fontSize: FONTS.size.sm },
});
