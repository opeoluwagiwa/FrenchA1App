import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { chatWithAI } from '../utils/ai';
import { speakFrench } from '../utils/speech';
import vocabData from '../data/vocab_data.json';

const THEMES = [
  { id: 'adventure', title: 'Adventure 🏔️', prompt: 'an adventure story' },
  { id: 'daily', title: 'Daily Life 🌅', prompt: 'a story about a typical day in Paris' },
  { id: 'food', title: 'Food & Cooking 🍳', prompt: 'a story about cooking a French meal' },
  { id: 'travel', title: 'Travel 🧳', prompt: 'a story about traveling in France' },
  { id: 'mystery', title: 'Mystery 🔍', prompt: 'a short mystery story' },
  { id: 'friendship', title: 'Friendship 👫', prompt: 'a story about making a new friend' },
  { id: 'school', title: 'School 🎓', prompt: 'a story about a day at school' },
  { id: 'market', title: 'Market Day 🛒', prompt: 'a story about shopping at a French market' },
];

const SYSTEM_PROMPT = `You are a French story generator for A1 beginners. Rules:
- Write a SHORT story (8-12 sentences max)
- Use ONLY simple A1-level French (present tense, basic vocabulary)
- After each French sentence, put the English translation in parentheses on the same line
- Use simple subject-verb-object structures
- Include dialogue when possible (use quotation marks)
- Make the story fun and engaging
- End with a simple moral or happy ending
- Format: Each sentence on its own line
- Bold the title with **Title**`;

export default function StoryGeneratorScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Get words the user has learned for personalization
  const learnedWords = useMemo(() => {
    const learned = [];
    Object.entries(state.cardStates).forEach(([key, card]) => {
      if (card.repetition >= 1) {
        const vocab = vocabData.find(v => `v_${v.id}` === key);
        if (vocab) learned.push(vocab.french);
      }
    });
    return learned.slice(0, 30);
  }, [state.cardStates]);

  const generateStory = async (theme) => {
    if (loading) return;
    setSelectedTheme(theme);
    setLoading(true);
    setStory('');

    const wordList = learnedWords.length > 5
      ? `Try to include some of these words the student has learned: ${learnedWords.join(', ')}.`
      : '';

    const userPrompt = `Write ${theme.prompt} in simple A1 French. ${wordList}`;

    const result = await chatWithAI(state.apiKey, [{ role: 'user', content: userPrompt }], SYSTEM_PROMPT);

    if (result.error) {
      setStory('Error: ' + result.error);
    } else {
      setStory(result.text);
      dispatch({ type: 'ADD_XP', payload: 15 });
    }
    setLoading(false);
  };

  const speakStory = () => {
    if (!story) return;
    // Extract only French parts (before parentheses)
    const lines = story.split('\n').filter(l => l.trim());
    const frenchParts = lines.map(l => l.replace(/\(.*?\)/g, '').replace(/\*\*/g, '').trim()).filter(l => l);
    const fullFrench = frenchParts.join('. ');
    speakFrench(fullFrench);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Story Generator 📚</Text>
      <Text style={styles.subtitle}>
        AI creates short stories using words you've learned ({learnedWords.length} words known)
      </Text>

      <Text style={styles.sectionLabel}>Choose a theme:</Text>
      <View style={styles.themesGrid}>
        {THEMES.map((theme) => (
          <TouchableOpacity
            key={theme.id}
            style={[styles.themeCard, selectedTheme?.id === theme.id && styles.themeSelected]}
            onPress={() => generateStory(theme)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.themeTitle}>{theme.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Writing your story...</Text>
        </View>
      )}

      {story && !loading ? (
        <View style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <Text style={styles.storyLabel}>Your Story</Text>
            <TouchableOpacity onPress={speakStory}>
              <Text style={styles.speakBtn}>🔊 Listen</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.storyText}>{story}</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => generateStory(selectedTheme)}
          >
            <Text style={styles.newBtnText}>Generate Another</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.lg },
  sectionLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  themesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  themeCard: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  themeSelected: { borderColor: COLORS.primary, backgroundColor: '#0D2E0D' },
  themeTitle: { color: COLORS.text, fontSize: FONTS.size.sm, fontWeight: '600' },
  loadingCard: { alignItems: 'center', padding: SPACING.xl, marginTop: SPACING.lg },
  loadingText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginTop: SPACING.md },
  storyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#00C9A7',
  },
  storyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  storyLabel: { color: '#00C9A7', fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  speakBtn: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  storyText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 26 },
  newBtn: { backgroundColor: '#00C9A7', borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', marginTop: SPACING.lg },
  newBtnText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold' },
});
