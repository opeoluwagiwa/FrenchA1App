import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import sentencesData from '../data/sentences_data.json';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getChallenge() {
  const sentence = sentencesData.filter(s => {
    const wc = s.french.split(' ').length;
    return wc >= 3 && wc <= 10;
  });
  const chosen = sentence[Math.floor(Math.random() * sentence.length)];
  const words = chosen.french.split(' ');
  // Add 2-3 distractor words
  const distractors = ['est', 'pas', 'le', 'la', 'un', 'une', 'de', 'du', 'au', 'les', 'des', 'en', 'avec', 'pour', 'sur'];
  const extraWords = shuffle(distractors.filter(d => !words.includes(d))).slice(0, Math.min(2, Math.max(1, 8 - words.length)));

  return {
    ...chosen,
    words,
    tiles: shuffle([...words, ...extraWords]),
    distractorCount: extraWords.length,
  };
}

export default function SentenceComposerScreen({ navigation }) {
  const { dispatch } = useApp();
  const [challenge, setChallenge] = useState(getChallenge);
  const [selected, setSelected] = useState([]);
  const [available, setAvailable] = useState(challenge.tiles.map((w, i) => ({ word: w, idx: i, used: false })));
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [completed, setCompleted] = useState(0);

  const handleTileTap = useCallback((item) => {
    if (isChecked || item.used) return;
    setSelected(prev => [...prev, item]);
    setAvailable(prev => prev.map(a => a.idx === item.idx ? { ...a, used: true } : a));
  }, [isChecked]);

  const handleRemove = useCallback((index) => {
    if (isChecked) return;
    const removed = selected[index];
    setSelected(prev => prev.filter((_, i) => i !== index));
    setAvailable(prev => prev.map(a => a.idx === removed.idx ? { ...a, used: false } : a));
  }, [selected, isChecked]);

  const handleCheck = useCallback(() => {
    const built = selected.map(s => s.word).join(' ');
    const correct = built === challenge.words.join(' ');
    setIsChecked(true);
    setIsCorrect(correct);

    if (correct) {
      dispatch({ type: 'ADD_XP', payload: 25 });
      dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'sentencesComposed' } });
      setCompleted(c => c + 1);
      speakFrench(challenge.french);
    } else {
      dispatch({ type: 'LOSE_LIFE' });
    }
  }, [selected, challenge]);

  const handleNext = useCallback(() => {
    const newChallenge = getChallenge();
    setChallenge(newChallenge);
    setSelected([]);
    setAvailable(newChallenge.tiles.map((w, i) => ({ word: w, idx: i, used: false })));
    setIsChecked(false);
    setIsCorrect(null);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sentence Composer ✍️</Text>
        <Text style={styles.completed}>{completed} done</Text>
      </View>

      <View style={styles.promptCard}>
        <Text style={styles.promptLabel}>Translate to French:</Text>
        <Text style={styles.promptText}>{challenge.english}</Text>
        <Text style={styles.hintText}>💡 There are {challenge.distractorCount} extra word(s)</Text>
      </View>

      {/* Built sentence area */}
      <View style={[styles.buildArea, isChecked && isCorrect && styles.buildCorrect, isChecked && !isCorrect && styles.buildWrong]}>
        {selected.length === 0 ? (
          <Text style={styles.buildPlaceholder}>Tap the tiles below to compose</Text>
        ) : (
          <View style={styles.tileRow}>
            {selected.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={styles.selectedTile}
                onPress={() => handleRemove(i)}
                disabled={isChecked}
              >
                <Text style={styles.tileText}>{item.word}</Text>
                {!isChecked && <Text style={styles.tileRemove}>×</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Available tiles */}
      <View style={styles.availableArea}>
        <View style={styles.tileRow}>
          {available.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.availableTile, item.used && styles.usedTile]}
              onPress={() => handleTileTap(item)}
              disabled={item.used || isChecked}
            >
              <Text style={[styles.tileText, item.used && styles.usedText]}>{item.word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Feedback */}
      {isChecked && (
        <View style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.wrongFeedback]}>
          <Text style={styles.feedbackEmoji}>{isCorrect ? '🎉' : '❌'}</Text>
          <Text style={styles.feedbackText}>
            {isCorrect ? 'Parfait! +25 XP' : `Correct: ${challenge.french}`}
          </Text>
          {isCorrect && (
            <TouchableOpacity style={styles.speakBtn} onPress={() => speakFrench(challenge.french)}>
              <Text style={styles.speakIcon}>🔊 Listen</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Action */}
      <View style={styles.actionArea}>
        {!isChecked ? (
          <TouchableOpacity
            style={[styles.btn, selected.length === 0 && styles.btnDisabled]}
            onPress={handleCheck}
            disabled={selected.length === 0}
          >
            <Text style={styles.btnText}>Check</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>Next Sentence</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.md, paddingTop: SPACING.sm },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  title: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  completed: { color: COLORS.primary, fontSize: FONTS.size.sm, fontWeight: 'bold' },
  promptCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOWS.card },
  promptLabel: { color: COLORS.accent, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  promptText: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 8, lineHeight: 30 },
  hintText: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 8 },
  buildArea: {
    minHeight: 80,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
  },
  buildCorrect: { borderColor: COLORS.correct },
  buildWrong: { borderColor: COLORS.wrong },
  buildPlaceholder: { color: COLORS.textMuted, textAlign: 'center', fontSize: FONTS.size.sm },
  tileRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  selectedTile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  tileRemove: { color: '#fff', fontSize: 18, marginLeft: 6, fontWeight: 'bold' },
  availableArea: { marginBottom: SPACING.lg },
  availableTile: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    margin: 3,
  },
  usedTile: { backgroundColor: 'transparent', opacity: 0.3 },
  tileText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600' },
  usedText: { color: COLORS.textMuted },
  feedback: { padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center', marginBottom: SPACING.md },
  correctFeedback: { backgroundColor: '#0D2E0D' },
  wrongFeedback: { backgroundColor: '#2E0D0D' },
  feedbackEmoji: { fontSize: 32 },
  feedbackText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold', marginTop: 4 },
  speakBtn: { marginTop: 8 },
  speakIcon: { color: COLORS.secondary, fontSize: FONTS.size.md },
  actionArea: { marginTop: SPACING.sm },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
});
