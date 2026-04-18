import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import vocabData from '../data/vocab_data.json';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MatchingQuizScreen({ navigation }) {
  const { dispatch } = useApp();

  const [pairs] = useState(() => {
    const items = shuffle(vocabData).slice(0, 6);
    return items.map(v => ({ id: v.id, french: v.french, english: v.english }));
  });

  const [frenchOrder] = useState(() => shuffle([...pairs]));
  const [englishOrder] = useState(() => shuffle([...pairs]));
  const [selectedFrench, setSelectedFrench] = useState(null);
  const [selectedEnglish, setSelectedEnglish] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [attempts, setAttempts] = useState(0);

  const handleFrenchPress = (item) => {
    if (matched.has(item.id)) return;
    setSelectedFrench(item);
    speakFrench(item.french);

    if (selectedEnglish) {
      checkMatch(item, selectedEnglish);
    }
  };

  const handleEnglishPress = (item) => {
    if (matched.has(item.id)) return;
    setSelectedEnglish(item);

    if (selectedFrench) {
      checkMatch(selectedFrench, item);
    }
  };

  const checkMatch = (fr, en) => {
    setAttempts(a => a + 1);
    if (fr.id === en.id) {
      // Match!
      const newMatched = new Set(matched);
      newMatched.add(fr.id);
      setMatched(newMatched);
      setSelectedFrench(null);
      setSelectedEnglish(null);
      dispatch({ type: 'ADD_XP', payload: 10 });

      if (newMatched.size === pairs.length) {
        setTimeout(() => {
          dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'quizzesCompleted' } });
          navigation.replace('SessionComplete', {
            reviewed: pairs.length,
            correct: pairs.length,
            total: pairs.length,
          });
        }, 500);
      }
    } else {
      setWrongPair({ fr: fr.id, en: en.id });
      dispatch({ type: 'LOSE_LIFE' });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedFrench(null);
        setSelectedEnglish(null);
      }, 600);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Match the Pairs</Text>
        <Text style={styles.matchCount}>{matched.size}/{pairs.length}</Text>
      </View>

      <Text style={styles.instruction}>Tap a French word, then tap its English meaning</Text>

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.colHeader}>Francais 🇫🇷</Text>
          {frenchOrder.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tile,
                styles.frenchTile,
                matched.has(item.id) && styles.tileMatched,
                selectedFrench?.id === item.id && styles.tileSelected,
                wrongPair?.fr === item.id && styles.tileWrong,
              ]}
              onPress={() => handleFrenchPress(item)}
              disabled={matched.has(item.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tileText, matched.has(item.id) && styles.tileTextMatched]}>
                {item.french}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.column}>
          <Text style={styles.colHeader}>English 🇬🇧</Text>
          {englishOrder.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.tile,
                styles.englishTile,
                matched.has(item.id) && styles.tileMatched,
                selectedEnglish?.id === item.id && styles.tileSelected,
                wrongPair?.en === item.id && styles.tileWrong,
              ]}
              onPress={() => handleEnglishPress(item)}
              disabled={matched.has(item.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tileText, matched.has(item.id) && styles.tileTextMatched]}>
                {item.english}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  title: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold' },
  matchCount: { color: COLORS.primary, fontSize: FONTS.size.md, fontWeight: 'bold' },
  instruction: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, textAlign: 'center', marginBottom: SPACING.md },
  columns: { flexDirection: 'row', flex: 1, padding: SPACING.sm },
  column: { flex: 1, paddingHorizontal: SPACING.xs },
  colHeader: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textAlign: 'center', marginBottom: SPACING.sm, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  tile: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  frenchTile: { borderColor: COLORS.secondary + '40' },
  englishTile: { borderColor: COLORS.accent + '40' },
  tileSelected: { borderColor: COLORS.gold, borderWidth: 3, backgroundColor: COLORS.bgLight },
  tileMatched: { backgroundColor: '#0D2E0D', borderColor: COLORS.correct, opacity: 0.6 },
  tileWrong: { backgroundColor: '#2E0D0D', borderColor: COLORS.wrong },
  tileText: { color: COLORS.text, fontSize: FONTS.size.sm, textAlign: 'center', fontWeight: '600' },
  tileTextMatched: { textDecorationLine: 'line-through', color: COLORS.textMuted },
});
