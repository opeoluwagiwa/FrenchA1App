import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { explainGrammar } from '../utils/ai';

const QUICK_QUESTIONS = [
  "When do I use le vs la?",
  "How do I conjugate -ER verbs?",
  "What's the difference between tu and vous?",
  "How does negation (ne...pas) work?",
  "When do I use avoir vs etre?",
  "How do possessives (mon, ma, mes) work?",
  "How do I ask questions in French?",
  "What's the near future tense (aller + infinitive)?",
];

export default function GrammarExplainerScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async (q) => {
    const queryText = q || question;
    if (!queryText.trim() || loading) return;
    setLoading(true);
    setAnswer('');

    const result = await explainGrammar(state.apiKey, queryText);
    if (result.error) {
      setAnswer('Error: ' + result.error);
    } else {
      setAnswer(result.text);
      dispatch({ type: 'ADD_XP', payload: 10 });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Grammar Explainer 📖</Text>
      <Text style={styles.subtitle}>Ask any French grammar question</Text>

      <TextInput
        style={styles.input}
        value={question}
        onChangeText={setQuestion}
        placeholder="e.g. When do I use le vs la?"
        placeholderTextColor={COLORS.textMuted}
        multiline
      />

      <TouchableOpacity
        style={[styles.btn, (!question.trim() || loading) && styles.btnDisabled]}
        onPress={() => askQuestion()}
        disabled={!question.trim() || loading}
      >
        <Text style={styles.btnText}>{loading ? 'Thinking...' : 'Ask'}</Text>
      </TouchableOpacity>

      {/* Quick questions */}
      <Text style={styles.quickLabel}>Quick Questions</Text>
      {QUICK_QUESTIONS.map((q, i) => (
        <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => { setQuestion(q); askQuestion(q); }}>
          <Text style={styles.quickText}>{q}</Text>
        </TouchableOpacity>
      ))}

      {/* Answer */}
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      )}

      {answer ? (
        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>Answer</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      ) : null}

      <View style={{ height: 40 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.md },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 50,
  },
  btn: { backgroundColor: '#A560FF', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  quickLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  quickBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs },
  quickText: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginLeft: 8 },
  answerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#A560FF',
  },
  answerLabel: { color: '#A560FF', fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  answerText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 24, marginTop: 8 },
});
