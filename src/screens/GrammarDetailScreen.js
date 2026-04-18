import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { speakFrench } from '../utils/speech';
import { chatWithAI } from '../utils/ai';

export default function GrammarDetailScreen({ route, navigation }) {
  const { lesson, index } = route.params;
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('learn'); // 'learn', 'practice', 'ai'
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [exerciseResults, setExerciseResults] = useState({});
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const exercises = lesson.exercises || [];

  const checkExercise = useCallback((idx, userAnswer) => {
    const correct = userAnswer.trim().toLowerCase() === exercises[idx].a.toLowerCase();
    setExerciseResults(prev => ({ ...prev, [idx]: correct }));
    if (correct) {
      setScore(s => s + 1);
      dispatch({ type: 'ADD_XP', payload: 5 });
    }
  }, [exercises]);

  const checkAll = () => {
    exercises.forEach((ex, i) => {
      const ans = exerciseAnswers[i] || '';
      checkExercise(i, ans);
    });
    setShowResults(true);
  };

  const askAI = async () => {
    if (!aiQuestion.trim() || aiLoading || !state.apiKey) return;
    setAiLoading(true);
    const prompt = `The student is studying this grammar topic: "${lesson.title}". They ask: "${aiQuestion}".
Give a clear, short explanation (max 5 sentences) with 2 example sentences. Format examples as:
🇫🇷 French sentence
🇬🇧 English translation`;
    const result = await chatWithAI(state.apiKey, [{ role: 'user', content: prompt }],
      'You are a French grammar tutor for A1 beginners. Be concise, encouraging, and use simple English. Always include examples.');
    setAiAnswer(result.text || result.error || 'Could not get answer.');
    setAiLoading(false);
  };

  const handleComplete = () => {
    dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'grammarCompleted' } });
    dispatch({ type: 'ADD_XP', payload: 30 });
    navigation.goBack();
  };

  // Parse content into readable chunks
  const lines = lesson.content.split('\n').filter(l => l.trim());

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{lesson.title}</Text>

      {/* Tab switcher */}
      <View style={styles.tabRow}>
        {['learn', 'practice', 'ai'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'learn' ? '📖 Learn' : tab === 'practice' ? '✏️ Practice' : '🤖 Ask AI'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LEARN TAB */}
      {activeTab === 'learn' && (
        <View>
          {lines.map((line, i) => {
            // Detect examples
            if (line.includes('->') || line.includes('→')) {
              const parts = line.split(/->|→/);
              return (
                <TouchableOpacity key={i} style={styles.exampleCard} onPress={() => speakFrench(parts[0]?.trim())}>
                  <Text style={styles.exampleFr}>{parts[0]?.trim()}</Text>
                  {parts[1] && <Text style={styles.exampleEn}>→ {parts[1].trim()}</Text>}
                  <Text style={styles.tapToHear}>tap to hear 🔊</Text>
                </TouchableOpacity>
              );
            }
            // Detect conjugations
            if (line.includes(':') && (line.includes('Je ') || line.includes('Tu ') || line.includes('AVOIR') || line.includes('ÊTRE'))) {
              return (
                <View key={i} style={styles.conjugationCard}>
                  <Text style={styles.conjugationText}>{line}</Text>
                </View>
              );
            }
            return <Text key={i} style={styles.paragraph}>{line}</Text>;
          })}

          {/* Tips */}
          {lesson.tips && (
            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 Pro Tip</Text>
              <Text style={styles.tipText}>{lesson.tips}</Text>
            </View>
          )}

          {/* Quick examples to listen */}
          {exercises.length > 0 && (
            <View style={styles.listenSection}>
              <Text style={styles.sectionLabel}>Listen & Repeat</Text>
              {exercises.slice(0, 3).map((ex, i) => (
                <TouchableOpacity key={i} style={styles.listenCard} onPress={() => speakFrench(ex.q.replace('_____', ex.a).replace('___', ex.a))}>
                  <Text style={styles.listenFr}>{ex.q.replace('_____', ex.a).replace('___', ex.a)}</Text>
                  <Text style={styles.listenHint}>{ex.hint}</Text>
                  <Text style={styles.listenIcon}>🔊</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* PRACTICE TAB */}
      {activeTab === 'practice' && (
        <View>
          <Text style={styles.practiceIntro}>Fill in the blanks to test your knowledge!</Text>

          {exercises.map((ex, i) => (
            <View key={i} style={[styles.exerciseCard, exerciseResults[i] !== undefined && (exerciseResults[i] ? styles.exerciseCorrect : styles.exerciseWrong)]}>
              <Text style={styles.exerciseNum}>Q{i + 1}</Text>
              <Text style={styles.exerciseQ}>{ex.q}</Text>
              <Text style={styles.exerciseHint}>💡 {ex.hint}</Text>

              <TextInput
                style={styles.exerciseInput}
                value={exerciseAnswers[i] || ''}
                onChangeText={text => setExerciseAnswers(prev => ({ ...prev, [i]: text }))}
                placeholder="Your answer..."
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                editable={exerciseResults[i] === undefined}
              />

              {exerciseResults[i] !== undefined && (
                <View style={styles.exerciseFeedback}>
                  <Text style={styles.exerciseFeedbackText}>
                    {exerciseResults[i] ? '✅ Correct!' : `❌ Answer: ${ex.a}`}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {!showResults ? (
            <TouchableOpacity style={styles.checkBtn} onPress={checkAll}>
              <Text style={styles.checkBtnText}>Check All Answers</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resultsCard}>
              <Text style={styles.resultsEmoji}>{score >= exercises.length * 0.8 ? '🏆' : score >= exercises.length * 0.5 ? '👏' : '💪'}</Text>
              <Text style={styles.resultsText}>{score}/{exercises.length} correct!</Text>
              <Text style={styles.resultsXP}>+{score * 5} XP earned</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => {
                setExerciseAnswers({});
                setExerciseResults({});
                setScore(0);
                setShowResults(false);
              }}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* AI TAB */}
      {activeTab === 'ai' && (
        <View>
          <Text style={styles.aiIntro}>Ask anything about "{lesson.title}"</Text>

          {!state.apiKey ? (
            <View style={styles.noKeyCard}>
              <Text style={styles.noKeyText}>🔑 Set up your API key in AI Tutor settings to use this feature</Text>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.aiInput}
                value={aiQuestion}
                onChangeText={setAiQuestion}
                placeholder="e.g. Why do we add -e for feminine?"
                placeholderTextColor={COLORS.textMuted}
                multiline
              />

              <TouchableOpacity
                style={[styles.aiBtn, (!aiQuestion.trim() || aiLoading) && styles.aiBtnDisabled]}
                onPress={askAI}
                disabled={!aiQuestion.trim() || aiLoading}
              >
                <Text style={styles.aiBtnText}>{aiLoading ? 'Thinking...' : '🤖 Ask AI Tutor'}</Text>
              </TouchableOpacity>

              {/* Quick AI questions */}
              <Text style={styles.quickLabel}>Quick questions:</Text>
              {[
                `Explain ${lesson.title.split('.')[1]?.trim() || lesson.title} simply`,
                `Give me 5 example sentences for this rule`,
                `What are common mistakes beginners make with this?`,
                `How is this different from English?`,
              ].map((q, i) => (
                <TouchableOpacity key={i} style={styles.quickBtn} onPress={() => { setAiQuestion(q); }}>
                  <Text style={styles.quickText}>{q}</Text>
                </TouchableOpacity>
              ))}

              {aiLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.md }} />}

              {aiAnswer ? (
                <View style={styles.aiAnswerCard}>
                  <Text style={styles.aiAnswerLabel}>🤖 AI Tutor</Text>
                  <Text style={styles.aiAnswerText}>{aiAnswer}</Text>
                </View>
              ) : null}
            </>
          )}
        </View>
      )}

      {/* Complete button */}
      <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
        <Text style={styles.completeBtnText}>Mark as Completed (+30 XP) ✅</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  title: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginBottom: SPACING.md },
  tabRow: { flexDirection: 'row', marginBottom: SPACING.lg },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: COLORS.bgCard, marginHorizontal: 3 },
  tabActive: { backgroundColor: '#A560FF' },
  tabText: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  paragraph: { color: COLORS.textSecondary, fontSize: FONTS.size.md, lineHeight: 26, marginBottom: SPACING.sm },
  exampleCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  exampleFr: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  exampleEn: { color: COLORS.primary, fontSize: FONTS.size.sm, marginTop: 4 },
  tapToHear: { color: COLORS.textMuted, fontSize: 10, marginTop: 4 },
  conjugationCard: { backgroundColor: COLORS.bgLight, borderRadius: RADIUS.md, padding: SPACING.md, marginVertical: SPACING.xs },
  conjugationText: { color: COLORS.text, fontSize: FONTS.size.md },
  tipCard: { backgroundColor: '#2A1F00', borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.gold },
  tipTitle: { color: COLORS.gold, fontSize: FONTS.size.md, fontWeight: 'bold' },
  tipText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 8, lineHeight: 22 },
  listenSection: { marginTop: SPACING.lg },
  sectionLabel: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold', marginBottom: SPACING.sm },
  listenCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.xs },
  listenFr: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: '600', flex: 1 },
  listenHint: { color: COLORS.textMuted, fontSize: FONTS.size.xs, flex: 1 },
  listenIcon: { fontSize: 20 },
  // Practice tab
  practiceIntro: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginBottom: SPACING.md },
  exerciseCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderLeftWidth: 3, borderLeftColor: COLORS.border },
  exerciseCorrect: { borderLeftColor: COLORS.correct },
  exerciseWrong: { borderLeftColor: COLORS.wrong },
  exerciseNum: { color: COLORS.textMuted, fontSize: FONTS.size.xs, fontWeight: 'bold' },
  exerciseQ: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold', marginTop: 4 },
  exerciseHint: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 4 },
  exerciseInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.text, fontSize: FONTS.size.md, marginTop: 8, borderWidth: 1, borderColor: COLORS.border },
  exerciseFeedback: { marginTop: 6 },
  exerciseFeedbackText: { fontSize: FONTS.size.sm, fontWeight: 'bold', color: COLORS.text },
  checkBtn: { backgroundColor: '#A560FF', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  checkBtnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  resultsCard: { alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.md },
  resultsEmoji: { fontSize: 48 },
  resultsText: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: 8 },
  resultsXP: { color: COLORS.xp, fontSize: FONTS.size.md, marginTop: 4 },
  retryBtn: { backgroundColor: COLORS.secondary, paddingHorizontal: 24, paddingVertical: 10, borderRadius: RADIUS.lg, marginTop: SPACING.md },
  retryText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold' },
  // AI tab
  aiIntro: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginBottom: SPACING.md },
  noKeyCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center' },
  noKeyText: { color: COLORS.textMuted, fontSize: FONTS.size.md, textAlign: 'center' },
  aiInput: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.text, fontSize: FONTS.size.md, borderWidth: 1, borderColor: COLORS.border, minHeight: 50 },
  aiBtn: { backgroundColor: '#A560FF', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.sm },
  aiBtnDisabled: { opacity: 0.4 },
  aiBtnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  quickLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  quickBtn: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.sm, marginBottom: SPACING.xs },
  quickText: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  aiAnswerCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.lg, marginTop: SPACING.md, borderLeftWidth: 4, borderLeftColor: '#A560FF' },
  aiAnswerLabel: { color: '#A560FF', fontSize: FONTS.size.xs, fontWeight: 'bold' },
  aiAnswerText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 24, marginTop: 8 },
  // Complete
  completeBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xl },
  completeBtnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
});
