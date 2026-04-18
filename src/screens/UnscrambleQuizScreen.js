import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import sentencesData from '../data/sentences_data.json';

const { width } = Dimensions.get('window');
const TOTAL = 8;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestions() {
  const sentences = shuffle(
    sentencesData.filter(s => {
      const words = s.french.split(' ');
      return words.length >= 3 && words.length <= 8;
    })
  ).slice(0, TOTAL);

  return sentences.map(s => ({
    ...s,
    words: s.french.split(' '),
    scrambled: shuffle(s.french.split(' ')),
  }));
}

export default function UnscrambleQuizScreen({ navigation }) {
  const { dispatch } = useApp();
  const [questions] = useState(() => generateQuestions());
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState(questions[0]?.scrambled || []);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);

  const question = questions[currentQ];

  const handleWordTap = useCallback((word, index) => {
    if (isChecked) return;
    setSelectedWords(prev => [...prev, { word, fromIndex: index }]);
    setAvailableWords(prev => prev.map((w, i) => i === index ? null : w));
  }, [isChecked]);

  const handleRemoveWord = useCallback((index) => {
    if (isChecked) return;
    const item = selectedWords[index];
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => {
      const newArr = [...prev];
      newArr[item.fromIndex] = item.word;
      return newArr;
    });
  }, [selectedWords, isChecked]);

  const handleCheck = useCallback(() => {
    const userSentence = selectedWords.map(w => w.word).join(' ');
    const correct = userSentence === question.words.join(' ');
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      dispatch({ type: 'ADD_XP', payload: 20 });
      setScore(s => s + 1);
      speakFrench(question.french);
    } else {
      dispatch({ type: 'LOSE_LIFE' });
    }
  }, [selectedWords, question]);

  const handleNext = useCallback(() => {
    if (currentQ < questions.length - 1) {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      setSelectedWords([]);
      setAvailableWords(questions[nextQ].scrambled);
      setIsChecked(false);
      setIsCorrect(null);
    } else {
      dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
      navigation.replace('SessionComplete', {
        reviewed: questions.length,
        correct: score + (isCorrect ? 1 : 0),
        total: questions.length,
      });
    }
  }, [currentQ, questions, score, isCorrect]);

  if (!question) return null;

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

      <View style={styles.questionCard}>
        <Text style={styles.label}>Unscramble the sentence 🧩</Text>
        <Text style={styles.english}>{question.english}</Text>
      </View>

      {/* Selected words (answer area) */}
      <View style={styles.answerArea}>
        <View style={styles.wordRow}>
          {selectedWords.length === 0 ? (
            <Text style={styles.placeholder}>Tap words below to build the sentence</Text>
          ) : (
            selectedWords.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.wordTile, styles.selectedTile, isChecked && isCorrect && styles.correctTile, isChecked && !isCorrect && styles.wrongTile]}
                onPress={() => handleRemoveWord(i)}
                disabled={isChecked}
              >
                <Text style={styles.wordText}>{item.word}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </View>

      {/* Available words */}
      <View style={styles.availableArea}>
        <View style={styles.wordRow}>
          {availableWords.map((word, i) => (
            word ? (
              <TouchableOpacity
                key={i}
                style={[styles.wordTile, styles.availableTile]}
                onPress={() => handleWordTap(word, i)}
                disabled={isChecked}
              >
                <Text style={styles.wordText}>{word}</Text>
              </TouchableOpacity>
            ) : (
              <View key={i} style={[styles.wordTile, styles.emptyTile]} />
            )
          ))}
        </View>
      </View>

      {/* Feedback */}
      {isChecked && (
        <View style={[styles.feedbackBox, isCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? '🎉 Parfait!' : `❌ Correct: ${question.french}`}
          </Text>
        </View>
      )}

      {/* Action Button */}
      <View style={styles.bottomBar}>
        {!isChecked ? (
          <TouchableOpacity
            style={[styles.btn, selectedWords.length !== question.words.length && styles.btnDisabled]}
            onPress={handleCheck}
            disabled={selectedWords.length !== question.words.length}
          >
            <Text style={styles.btnText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>{currentQ < questions.length - 1 ? 'Next' : 'Finish'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  score: { color: COLORS.gold, fontSize: FONTS.size.md, fontWeight: 'bold' },
  questionCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, margin: SPACING.md },
  label: { color: COLORS.accent, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  english: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 8 },
  answerArea: { minHeight: 80, margin: SPACING.md, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.lg, padding: SPACING.sm, borderWidth: 2, borderColor: COLORS.border },
  placeholder: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textAlign: 'center', padding: SPACING.md },
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  availableArea: { margin: SPACING.md },
  wordTile: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, borderWidth: 2, margin: 2 },
  selectedTile: { backgroundColor: COLORS.bgLight, borderColor: COLORS.secondary },
  availableTile: { backgroundColor: COLORS.bgCard, borderColor: COLORS.border },
  emptyTile: { backgroundColor: 'transparent', borderColor: COLORS.border, minWidth: 50, minHeight: 42, opacity: 0.3 },
  correctTile: { borderColor: COLORS.correct, backgroundColor: '#0D2E0D' },
  wrongTile: { borderColor: COLORS.wrong, backgroundColor: '#2E0D0D' },
  wordText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600' },
  feedbackBox: { margin: SPACING.md, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
  correctFeedback: { backgroundColor: '#0D2E0D' },
  wrongFeedback: { backgroundColor: '#2E0D0D' },
  feedbackText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  bottomBar: { padding: SPACING.md, marginTop: 'auto' },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
});
