import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { chatWithAI } from '../utils/ai';
import { speakFrench } from '../utils/speech';

const SYSTEM_PROMPT = `You are a personalized French tutor for an A1 beginner. Based on the student's weak areas and mistakes, create a focused mini-lesson. Rules:
- Keep the lesson SHORT (under 200 words)
- Structure: 1) Brief explanation 2) 3-4 examples with translations 3) 2 quick practice questions
- Use ONLY A1-level French
- Format examples as: "🇫🇷 French" then "🇬🇧 English"
- Format practice questions as: "❓ [question]"
- Be encouraging
- End with "💪 Keep practicing!"`;

export default function PersonalizedLessonScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [lesson, setLesson] = useState('');
  const [loading, setLoading] = useState(false);
  const [lessonType, setLessonType] = useState(null);

  // Analyze mistakes to find weak areas
  const analysis = useMemo(() => {
    const mistakes = state.mistakes || [];
    const categories = {};
    mistakes.forEach(m => {
      const cat = m.category || 'general';
      categories[cat] = (categories[cat] || 0) + 1;
    });

    const weakAreas = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => ({ category: cat, count }));

    const mistakeWords = mistakes.slice(-10).map(m => `"${m.french}" = ${m.english}`).join(', ');

    return {
      totalMistakes: mistakes.length,
      weakAreas,
      mistakeWords,
      wordsLearned: state.wordsLearned,
      quizzesCompleted: state.quizzesCompleted,
      level: state.level,
    };
  }, [state.mistakes, state.wordsLearned, state.quizzesCompleted]);

  const generateLesson = async (type) => {
    if (loading) return;
    setLessonType(type);
    setLoading(true);
    setLesson('');

    let prompt = '';
    switch (type) {
      case 'mistakes':
        prompt = `The student has made mistakes with these words/phrases: ${analysis.mistakeWords || 'various basic words'}. Create a focused lesson to help them master these specific items.`;
        break;
      case 'weak':
        prompt = `The student is weak in these areas: ${analysis.weakAreas.map(w => w.category).join(', ') || 'basic vocabulary'}. Create a lesson targeting their weakest area.`;
        break;
      case 'next':
        prompt = `The student has learned ${analysis.wordsLearned} words and completed ${analysis.quizzesCompleted} quizzes (Level ${analysis.level}). Suggest what they should learn next and create a lesson for it.`;
        break;
      case 'review':
        prompt = `Create a comprehensive review lesson covering: greetings, numbers, basic verbs (être, avoir, aller), and common phrases. Mix different topics for variety.`;
        break;
    }

    const result = await chatWithAI(state.apiKey, [{ role: 'user', content: prompt }], SYSTEM_PROMPT);

    if (result.error) {
      setLesson('Error: ' + result.error);
    } else {
      setLesson(result.text);
      dispatch({ type: 'ADD_XP', payload: 20 });
    }
    setLoading(false);
  };

  const lessonOptions = [
    {
      id: 'mistakes',
      title: 'Fix My Mistakes',
      icon: '🔧',
      desc: `Practice ${analysis.totalMistakes} items you got wrong`,
      color: COLORS.wrong,
      disabled: analysis.totalMistakes === 0,
    },
    {
      id: 'weak',
      title: 'Target Weak Areas',
      icon: '🎯',
      desc: analysis.weakAreas.length > 0 ? `Focus on: ${analysis.weakAreas[0]?.category}` : 'Learn more to identify weak areas',
      color: COLORS.accent,
      disabled: analysis.weakAreas.length === 0,
    },
    {
      id: 'next',
      title: 'What Should I Learn Next?',
      icon: '🚀',
      desc: `You know ${analysis.wordsLearned} words — AI suggests next steps`,
      color: COLORS.primary,
      disabled: false,
    },
    {
      id: 'review',
      title: 'General Review',
      icon: '📋',
      desc: 'Review all the basics in one lesson',
      color: COLORS.secondary,
      disabled: false,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Personalized Lessons 🎓</Text>
      <Text style={styles.subtitle}>AI creates lessons based on your progress</Text>

      {/* Stats summary */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{analysis.wordsLearned}</Text>
          <Text style={styles.statLabel}>Words Known</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{analysis.totalMistakes}</Text>
          <Text style={styles.statLabel}>Mistakes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{analysis.weakAreas.length}</Text>
          <Text style={styles.statLabel}>Weak Areas</Text>
        </View>
      </View>

      {/* Lesson options */}
      {lessonOptions.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={[styles.optionCard, { borderLeftColor: opt.color }, opt.disabled && styles.disabled]}
          onPress={() => !opt.disabled && generateLesson(opt.id)}
          disabled={opt.disabled || loading}
          activeOpacity={0.7}
        >
          <Text style={styles.optionIcon}>{opt.icon}</Text>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>{opt.title}</Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {loading && (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.loadingText}>Creating your personalized lesson...</Text>
        </View>
      )}

      {lesson && !loading ? (
        <View style={styles.lessonCard}>
          <Text style={styles.lessonLabel}>Your Lesson</Text>
          <Text style={styles.lessonText}>{lesson}</Text>
          <TouchableOpacity style={styles.anotherBtn} onPress={() => generateLesson(lessonType)}>
            <Text style={styles.anotherBtnText}>Generate Another</Text>
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
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.md },
  statsCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg },
  statItem: { alignItems: 'center' },
  statNum: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold' },
  statLabel: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  disabled: { opacity: 0.4 },
  optionIcon: { fontSize: 28, marginRight: SPACING.md },
  optionInfo: { flex: 1 },
  optionTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  optionDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  loadingCard: { alignItems: 'center', padding: SPACING.xl },
  loadingText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginTop: SPACING.md },
  lessonCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  lessonLabel: { color: COLORS.primary, fontSize: FONTS.size.xs, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  lessonText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 26, marginTop: 8 },
  anotherBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.sm, alignItems: 'center', marginTop: SPACING.lg },
  anotherBtnText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold' },
});
