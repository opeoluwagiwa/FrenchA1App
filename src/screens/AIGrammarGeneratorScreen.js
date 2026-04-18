import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { chatWithAI } from '../utils/ai';
import { speakFrench } from '../utils/speech';

const TOPICS = [
  { title: 'Plural Rules', prompt: 'How to make French nouns and adjectives plural (add -s, -x, irregular plurals)' },
  { title: 'Contractions (au, du, à l\')', prompt: 'French contractions: à + le = au, de + le = du, à + les = aux, de + les = des' },
  { title: 'Comparisons', prompt: 'How to compare in French: plus...que, moins...que, aussi...que (more than, less than, as...as)' },
  { title: 'Direct Object Pronouns', prompt: 'French direct object pronouns: me, te, le, la, nous, vous, les — position before the verb' },
  { title: 'Indirect Object Pronouns', prompt: 'French indirect object pronouns: me, te, lui, nous, vous, leur — and when to use them' },
  { title: 'The Imperative Mood', prompt: 'How to give commands in French: imperative of -er, -ir, -re verbs and irregular imperatives' },
  { title: 'Weather Expressions', prompt: 'How to talk about weather: Il fait + adj, Il pleut, Il neige, Il y a du vent/soleil' },
  { title: 'Expressions with Avoir', prompt: 'French expressions using avoir: avoir faim, soif, chaud, froid, peur, besoin, envie, sommeil, raison, tort' },
  { title: 'Expressions with Faire', prompt: 'French expressions using faire: faire du sport, faire la cuisine, faire les courses, faire attention, faire un voyage' },
  { title: 'Y and En Pronouns', prompt: 'The pronouns y (replaces à + place/thing) and en (replaces de + thing/quantity) with examples' },
  { title: 'Since & For (Depuis)', prompt: 'How to express duration: depuis (since/for) with present tense — Je travaille ici depuis 3 ans' },
  { title: 'Countries & Prepositions', prompt: 'Prepositions with countries: en France, au Japon, aux États-Unis, en Italie — rules for gender' },
];

const SYSTEM_PROMPT = `You are a French grammar tutor creating a mini-lesson for an A1 beginner. Create an engaging, structured lesson:

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

📌 RULE:
[One clear rule in 2-3 sentences]

📝 HOW IT WORKS:
[Step-by-step explanation, max 4 steps]

🇫🇷 EXAMPLES:
[5 example sentences, each followed by English translation]
Example: "Je vais au cinéma." = I go to the cinema.

⚠️ COMMON MISTAKES:
[2-3 common mistakes beginners make]

🧠 MEMORY TRICK:
[One fun mnemonic or trick to remember the rule]

Keep everything SHORT and SIMPLE. Use only A1 vocabulary.`;

export default function AIGrammarGeneratorScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const generateLesson = async (topic) => {
    if (loading || !state.apiKey) return;
    setSelectedTopic(topic);
    setLoading(true);
    setLesson('');

    const result = await chatWithAI(
      state.apiKey,
      [{ role: 'user', content: `Create a mini grammar lesson about: ${topic.prompt}` }],
      SYSTEM_PROMPT
    );

    if (result.error) {
      setLesson('Error: ' + result.error);
    } else {
      setLesson(result.text);
      dispatch({ type: 'ADD_XP', payload: 20 });
    }
    setLoading(false);
  };

  // Parse lesson into styled sections
  const renderLesson = () => {
    if (!lesson) return null;
    const sections = lesson.split('\n').filter(l => l.trim());

    return sections.map((line, i) => {
      const trimmed = line.trim();
      // Section headers
      if (trimmed.startsWith('📌') || trimmed.startsWith('📝') || trimmed.startsWith('🇫🇷') || trimmed.startsWith('⚠️') || trimmed.startsWith('🧠')) {
        return <Text key={i} style={styles.lessonHeader}>{trimmed}</Text>;
      }
      // French examples (contain quotes or =)
      if (trimmed.includes('"') && trimmed.includes('=')) {
        const parts = trimmed.split('=');
        const french = parts[0].replace(/"/g, '').replace(/Example:|[0-9]+\./g, '').trim();
        return (
          <TouchableOpacity key={i} style={styles.lessonExample} onPress={() => speakFrench(french)}>
            <Text style={styles.lessonFr}>{parts[0].trim()}</Text>
            {parts[1] && <Text style={styles.lessonEn}>= {parts[1].trim()}</Text>}
            <Text style={styles.tapHear}>🔊</Text>
          </TouchableOpacity>
        );
      }
      // Warning/mistake lines
      if (trimmed.startsWith('❌') || trimmed.startsWith('✗') || trimmed.startsWith('-')) {
        return <Text key={i} style={styles.lessonWarning}>{trimmed}</Text>;
      }
      // Regular text
      return <Text key={i} style={styles.lessonText}>{trimmed}</Text>;
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>AI Grammar Generator 🤖</Text>
      <Text style={styles.subtitle}>Pick a topic and AI creates a complete lesson</Text>

      {!state.apiKey && (
        <View style={styles.noKey}>
          <Text style={styles.noKeyText}>🔑 API key required. Set it up in AI Tutor settings.</Text>
        </View>
      )}

      <Text style={styles.sectionLabel}>Choose a topic:</Text>
      <View style={styles.topicsGrid}>
        {TOPICS.map((topic, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.topicChip, selectedTopic?.title === topic.title && styles.topicSelected]}
            onPress={() => generateLesson(topic)}
            disabled={loading || !state.apiKey}
          >
            <Text style={[styles.topicText, selectedTopic?.title === topic.title && styles.topicTextSelected]}>
              {topic.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingArea}>
          <ActivityIndicator color="#A560FF" size="large" />
          <Text style={styles.loadingText}>Creating your lesson...</Text>
        </View>
      )}

      {lesson && !loading && (
        <View style={styles.lessonCard}>
          <Text style={styles.lessonTitle}>{selectedTopic?.title}</Text>
          {renderLesson()}

          <TouchableOpacity style={styles.generateBtn} onPress={() => generateLesson(selectedTopic)}>
            <Text style={styles.generateBtnText}>🔄 Generate Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.md },
  noKey: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  noKeyText: { color: COLORS.textMuted, textAlign: 'center' },
  sectionLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  topicChip: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicSelected: { backgroundColor: '#A560FF', borderColor: '#A560FF' },
  topicText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  topicTextSelected: { color: '#fff', fontWeight: 'bold' },
  loadingArea: { alignItems: 'center', padding: SPACING.xl },
  loadingText: { color: COLORS.textSecondary, marginTop: SPACING.md },
  lessonCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#A560FF',
  },
  lessonTitle: { color: '#A560FF', fontSize: FONTS.size.lg, fontWeight: 'bold', marginBottom: SPACING.md },
  lessonHeader: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold', marginTop: SPACING.md, marginBottom: 4 },
  lessonText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, lineHeight: 24, marginBottom: 2 },
  lessonExample: {
    backgroundColor: COLORS.bgLight,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginVertical: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  lessonFr: { color: COLORS.text, fontSize: FONTS.size.sm, fontWeight: 'bold' },
  lessonEn: { color: COLORS.primary, fontSize: FONTS.size.sm, marginLeft: 4 },
  tapHear: { fontSize: 14, marginLeft: 6 },
  lessonWarning: { color: COLORS.accent, fontSize: FONTS.size.sm, lineHeight: 22, marginBottom: 2 },
  generateBtn: { backgroundColor: '#A560FF', borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', marginTop: SPACING.lg },
  generateBtnText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold' },
});
