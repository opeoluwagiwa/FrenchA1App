import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { SCENARIOS } from '../utils/ai';
import { ROLES } from '../screens/RolePlayScreen';

export default function AIMenuScreen({ navigation }) {
  const { state } = useApp();

  const features = [
    {
      title: 'Grammar Explainer',
      icon: '📖',
      desc: 'Ask any French grammar question',
      screen: 'GrammarExplainer',
      color: '#A560FF',
    },
    {
      title: 'Sentence Corrector',
      icon: '✏️',
      desc: 'Write French and get corrections',
      screen: 'SentenceCorrector',
      color: COLORS.accent,
    },
    {
      title: 'Story Generator',
      icon: '📚',
      desc: 'AI creates stories with your vocabulary',
      screen: 'StoryGenerator',
      color: '#00C9A7',
    },
    {
      title: 'Personalized Lessons',
      icon: '🎓',
      desc: 'AI targets your weak areas',
      screen: 'PersonalizedLesson',
      color: COLORS.primary,
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>AI Tutor 🤖</Text>
      <Text style={styles.subtitle}>Your personal French teacher</Text>

      {!state.apiKey && (
        <TouchableOpacity style={styles.setupCard} onPress={() => navigation.navigate('AISettings')}>
          <Text style={styles.setupIcon}>🔑</Text>
          <Text style={styles.setupTitle}>Set up API Key first</Text>
          <Text style={styles.setupDesc}>Enter your OpenAI API key to unlock AI features</Text>
        </TouchableOpacity>
      )}

      {/* Tools */}
      {features.map((f, i) => (
        <TouchableOpacity
          key={i}
          style={[styles.card, { borderLeftColor: f.color }, !state.apiKey && styles.disabled]}
          onPress={() => state.apiKey && navigation.navigate(f.screen)}
          activeOpacity={0.7}
        >
          <Text style={styles.cardIcon}>{f.icon}</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{f.title}</Text>
            <Text style={styles.cardDesc}>{f.desc}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      ))}

      {/* Role-Play Scenarios */}
      <Text style={styles.sectionTitle}>Role-Play Practice 🎭</Text>
      <Text style={styles.sectionDesc}>AI plays a character — you respond in French</Text>

      {ROLES.map((role, i) => (
        <TouchableOpacity
          key={'role_' + i}
          style={[styles.scenarioCard, { borderLeftColor: COLORS.accent }, !state.apiKey && styles.disabled]}
          onPress={() => state.apiKey && navigation.navigate('RolePlay', { role })}
          activeOpacity={0.7}
        >
          <Text style={styles.scenarioTitle}>{role.title}</Text>
          <Text style={styles.scenarioRole}>{role.yourRole}</Text>
        </TouchableOpacity>
      ))}

      {/* Free Chat Scenarios */}
      <Text style={styles.sectionTitle}>Free Conversation 💬</Text>
      <Text style={styles.sectionDesc}>Open-ended chat practice</Text>

      {SCENARIOS.map((scenario, i) => (
        <TouchableOpacity
          key={'chat_' + i}
          style={[styles.scenarioCard, !state.apiKey && styles.disabled]}
          onPress={() => state.apiKey && navigation.navigate('AIChat', { scenario })}
          activeOpacity={0.7}
        >
          <Text style={styles.scenarioTitle}>{scenario.title}</Text>
        </TouchableOpacity>
      ))}

      {/* Settings */}
      <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('AISettings')}>
        <Text style={styles.settingsText}>⚙️ API Key Settings</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.lg },
  setupCard: {
    backgroundColor: '#2A1F00',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
    alignItems: 'center',
  },
  setupIcon: { fontSize: 32 },
  setupTitle: { color: COLORS.gold, fontSize: FONTS.size.md, fontWeight: 'bold', marginTop: 8 },
  setupDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  disabled: { opacity: 0.4 },
  cardIcon: { fontSize: 28, marginRight: SPACING.md },
  cardInfo: { flex: 1 },
  cardTitle: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  cardDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  arrow: { color: COLORS.textMuted, fontSize: FONTS.size.xl },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.size.xl, fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: 4 },
  sectionDesc: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.md },
  scenarioCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  scenarioTitle: { color: COLORS.text, fontSize: FONTS.size.md },
  scenarioRole: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: 2 },
  settingsBtn: { marginTop: SPACING.lg, alignItems: 'center', padding: SPACING.md },
  settingsText: { color: COLORS.textMuted, fontSize: FONTS.size.md },
});
