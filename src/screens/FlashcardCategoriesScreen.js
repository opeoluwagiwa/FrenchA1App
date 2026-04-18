import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';
import ProgressBar from '../components/ProgressBar';

export default function FlashcardCategoriesScreen({ navigation }) {
  const { state } = useApp();

  const categories = useMemo(() => {
    const catMap = {};

    vocabData.forEach(v => {
      if (!catMap[v.category]) {
        catMap[v.category] = { name: v.category, type: 'vocab', items: [], learned: 0 };
      }
      catMap[v.category].items.push(v);
      if (state.cardStates[`v_${v.id}`]?.repetition >= 2) {
        catMap[v.category].learned++;
      }
    });

    return Object.values(catMap);
  }, [state.cardStates]);

  const sentenceCategories = useMemo(() => {
    const catMap = {};
    sentencesData.forEach(s => {
      if (!catMap[s.category]) {
        catMap[s.category] = { name: s.category, type: 'sentence', items: [], learned: 0 };
      }
      catMap[s.category].items.push(s);
      if (state.cardStates[`s_${s.id}`]?.repetition >= 2) {
        catMap[s.category].learned++;
      }
    });
    return Object.values(catMap);
  }, [state.cardStates]);

  const allCategories = [
    { type: 'header', title: 'Vocabulary (1,000 words)' },
    ...categories,
    { type: 'header', title: 'Sentences (1,000+ phrases)' },
    ...sentenceCategories,
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    const progress = item.items.length > 0 ? (item.learned / item.items.length) * 100 : 0;
    const isComplete = progress >= 100;

    return (
      <TouchableOpacity
        style={[styles.card, isComplete && styles.cardComplete]}
        onPress={() => navigation.navigate('Flashcard', { category: item.name, type: item.type })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          {isComplete && <Text style={styles.checkmark}>✅</Text>}
        </View>
        <Text style={styles.cardCount}>
          {item.learned}/{item.items.length} {item.type === 'vocab' ? 'words' : 'phrases'}
        </Text>
        <ProgressBar
          progress={progress}
          color={isComplete ? COLORS.primary : COLORS.secondary}
          style={{ marginTop: 8 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={allCategories}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.title || item.name + index}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  list: { padding: SPACING.md },
  sectionHeader: {
    color: COLORS.text,
    fontSize: FONTS.size.xl,
    fontWeight: 'bold',
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    ...SHADOWS.card,
  },
  cardComplete: { borderLeftColor: COLORS.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold', flex: 1 },
  checkmark: { fontSize: 16 },
  cardCount: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4 },
});
