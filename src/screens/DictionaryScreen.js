import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { speakFrench } from '../utils/speech';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';

export default function DictionaryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState('vocab'); // 'vocab' or 'sentences'

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    const data = mode === 'vocab' ? vocabData : sentencesData;
    return data.filter(item =>
      item.french.toLowerCase().includes(q) ||
      item.english.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [search, mode]);

  const allCategories = useMemo(() => {
    const data = mode === 'vocab' ? vocabData : sentencesData;
    const cats = {};
    data.forEach(item => {
      if (!cats[item.category]) cats[item.category] = [];
      cats[item.category].push(item);
    });
    return Object.entries(cats).map(([name, items]) => ({ name, count: items.length }));
  }, [mode]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const categoryItems = useMemo(() => {
    if (!selectedCategory) return [];
    const data = mode === 'vocab' ? vocabData : sentencesData;
    return data.filter(item => item.category === selectedCategory);
  }, [selectedCategory, mode]);

  const renderItem = ({ item }) => {
    const isMasc = item.french.startsWith('le ') || item.french.startsWith('un ');
    const isFem = item.french.startsWith('la ') || item.french.startsWith('une ');
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => speakFrench(item.french)}
        activeOpacity={0.7}
      >
        <View style={styles.itemMain}>
          <View style={styles.frenchRow}>
            <Text style={styles.frenchText}>{item.french}</Text>
            {isMasc && <View style={[styles.genderDot, { backgroundColor: COLORS.masculine }]} />}
            {isFem && <View style={[styles.genderDot, { backgroundColor: COLORS.feminine }]} />}
          </View>
          <Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
          <Text style={styles.englishText}>{item.english}</Text>
        </View>
        <Text style={styles.speakIcon}>🔊</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.header}>Dictionary 📖</Text>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={(t) => { setSearch(t); setSelectedCategory(null); }}
        placeholder="Search French or English..."
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
      />

      {/* Mode toggle */}
      <View style={styles.modeRow}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'vocab' && styles.modeBtnActive]}
          onPress={() => { setMode('vocab'); setSelectedCategory(null); }}
        >
          <Text style={[styles.modeText, mode === 'vocab' && styles.modeTextActive]}>
            Words ({vocabData.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'sentences' && styles.modeBtnActive]}
          onPress={() => { setMode('sentences'); setSelectedCategory(null); }}
        >
          <Text style={[styles.modeText, mode === 'sentences' && styles.modeTextActive]}>
            Phrases ({sentencesData.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Gender legend */}
      {mode === 'vocab' && (
        <View style={styles.legendRow}>
          <View style={[styles.genderDot, { backgroundColor: COLORS.masculine }]} />
          <Text style={styles.legendText}>Masculine </Text>
          <View style={[styles.genderDot, { backgroundColor: COLORS.feminine }]} />
          <Text style={styles.legendText}>Feminine</Text>
        </View>
      )}

      {/* Results or Categories */}
      {search.trim() ? (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={item => `${mode}_${item.id}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No results found</Text>}
        />
      ) : selectedCategory ? (
        <>
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.backLink}>
            <Text style={styles.backLinkText}>← All Categories</Text>
          </TouchableOpacity>
          <Text style={styles.catTitle}>{selectedCategory}</Text>
          <FlatList
            data={categoryItems}
            renderItem={renderItem}
            keyExtractor={item => `${mode}_${item.id}`}
            contentContainerStyle={styles.list}
          />
        </>
      ) : (
        <FlatList
          data={allCategories}
          keyExtractor={item => item.name}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.catCard}
              onPress={() => setSelectedCategory(item.name)}
            >
              <Text style={styles.catName}>{item.name}</Text>
              <Text style={styles.catCount}>{item.count}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', padding: SPACING.md, paddingBottom: 0 },
  searchInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.md,
    margin: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeRow: { flexDirection: 'row', marginHorizontal: SPACING.md, marginBottom: SPACING.sm },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, marginHorizontal: 4 },
  modeBtnActive: { backgroundColor: COLORS.secondary },
  modeText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  modeTextActive: { color: '#fff', fontWeight: 'bold' },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  genderDot: { width: 10, height: 10, borderRadius: 5, marginRight: 4 },
  legendText: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginRight: 12 },
  list: { paddingHorizontal: SPACING.md },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 4,
  },
  itemMain: { flex: 1 },
  frenchRow: { flexDirection: 'row', alignItems: 'center' },
  frenchText: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  pronunciation: { color: COLORS.textMuted, fontSize: FONTS.size.xs, fontStyle: 'italic', marginTop: 2 },
  englishText: { color: COLORS.primary, fontSize: FONTS.size.sm, marginTop: 2 },
  speakIcon: { fontSize: 20, marginLeft: 8 },
  emptyText: { color: COLORS.textMuted, textAlign: 'center', padding: SPACING.xl, fontSize: FONTS.size.md },
  backLink: { paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  backLinkText: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  catTitle: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  catCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: 4,
  },
  catName: { color: COLORS.text, fontSize: FONTS.size.md },
  catCount: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
});
