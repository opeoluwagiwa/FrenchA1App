import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { correctSentence } from '../utils/ai';
import { speakFrench } from '../utils/speech';

export default function SentenceCorrectorScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCorrect = async () => {
    if (!sentence.trim() || loading) return;
    setLoading(true);
    setResult('');

    const res = await correctSentence(state.apiKey, sentence.trim());
    if (res.error) {
      setResult('Error: ' + res.error);
    } else {
      setResult(res.text);
      dispatch({ type: 'ADD_XP', payload: 10 });
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>Sentence Corrector ✏️</Text>
      <Text style={styles.subtitle}>Write anything in French and get corrections</Text>

      <Text style={styles.label}>Your French text:</Text>
      <TextInput
        style={styles.input}
        value={sentence}
        onChangeText={setSentence}
        placeholder="e.g. Je suis aller au magasin hier"
        placeholderTextColor={COLORS.textMuted}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.btn, (!sentence.trim() || loading) && styles.btnDisabled]}
        onPress={handleCorrect}
        disabled={!sentence.trim() || loading}
      >
        <Text style={styles.btnText}>{loading ? 'Checking...' : 'Check My French'}</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.accent} />
          <Text style={styles.loadingText}>Analyzing your French...</Text>
        </View>
      )}

      {result ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Corrections</Text>
          <Text style={styles.resultText}>{result}</Text>
          <TouchableOpacity style={styles.speakBtn} onPress={() => {
            // Try to find corrected sentence and speak it
            const lines = result.split('\n');
            const corrected = lines.find(l => l.includes('✅') || l.includes('Corrected'));
            speakFrench(corrected || sentence);
          }}>
            <Text style={styles.speakText}>🔊 Hear corrected version</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Try writing about:</Text>
        <Text style={styles.tipText}>- What you did today</Text>
        <Text style={styles.tipText}>- Describe your family</Text>
        <Text style={styles.tipText}>- Order food at a restaurant</Text>
        <Text style={styles.tipText}>- Talk about the weather</Text>
        <Text style={styles.tipText}>- Introduce yourself</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.lg },
  label: { color: COLORS.text, fontSize: FONTS.size.sm, fontWeight: 'bold', marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 100,
  },
  btn: { backgroundColor: COLORS.accent, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.lg },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginLeft: 8 },
  resultCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  resultLabel: { color: COLORS.accent, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  resultText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 24, marginTop: 8 },
  speakBtn: { marginTop: SPACING.md },
  speakText: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  tipCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.lg },
  tipTitle: { color: COLORS.gold, fontSize: FONTS.size.sm, fontWeight: 'bold' },
  tipText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4 },
});
