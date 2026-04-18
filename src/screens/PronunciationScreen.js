import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { speakFrench, speakSlow } from '../utils/speech';

const SOUNDS = [
  {
    category: 'Vowel Sounds',
    items: [
      { sound: 'ou', example: 'bonjour', meaning: 'hello', tip: 'Like "oo" in "food"' },
      { sound: 'u', example: 'tu', meaning: 'you', tip: 'Round your lips like "oo" but say "ee"' },
      { sound: 'eu', example: 'deux', meaning: 'two', tip: 'Like "uh" but with rounded lips' },
      { sound: 'oi', example: 'moi', meaning: 'me', tip: 'Sounds like "wah"' },
      { sound: 'ai/ei', example: 'lait', meaning: 'milk', tip: 'Like "eh" in "bet"' },
      { sound: 'au/eau', example: 'beau', meaning: 'beautiful', tip: 'Like "oh" in "go"' },
    ],
  },
  {
    category: 'Nasal Sounds',
    items: [
      { sound: 'an/en', example: 'enfant', meaning: 'child', tip: 'Say "ahn" through your nose' },
      { sound: 'on', example: 'bonjour', meaning: 'hello', tip: 'Say "ohn" through your nose' },
      { sound: 'in/ain', example: 'pain', meaning: 'bread', tip: 'Say "ehn" through your nose' },
      { sound: 'un', example: 'un', meaning: 'one', tip: 'Say "uhn" through your nose' },
    ],
  },
  {
    category: 'Tricky Consonants',
    items: [
      { sound: 'r', example: 'rue', meaning: 'street', tip: 'Gargle gently at the back of your throat' },
      { sound: 'gn', example: 'montagne', meaning: 'mountain', tip: 'Like "ny" in "canyon"' },
      { sound: 'j/ge', example: 'je', meaning: 'I', tip: 'Like "zh" in "measure"' },
      { sound: 'ch', example: 'chat', meaning: 'cat', tip: 'Like "sh" in "shoe"' },
      { sound: 'qu', example: 'que', meaning: 'that', tip: 'Just a "k" sound (no "w")' },
      { sound: 'h', example: 'homme', meaning: 'man', tip: 'Always silent in French!' },
    ],
  },
  {
    category: 'Silent Letters',
    items: [
      { sound: 'final e', example: 'table', meaning: 'table', tip: 'Usually silent at end of word' },
      { sound: 'final s', example: 'les amis', meaning: 'the friends', tip: 'Silent unless liaison (linking)' },
      { sound: 'final t/d', example: 'petit', meaning: 'small', tip: 'Usually silent at end' },
      { sound: 'final x', example: 'deux', meaning: 'two', tip: 'Silent at end' },
    ],
  },
  {
    category: 'Liaison (Linking)',
    items: [
      { sound: 'les amis', example: 'les amis', meaning: 'friends', tip: '"lay zah-MEE" - s links to vowel' },
      { sound: 'un ami', example: 'un ami', meaning: 'a friend', tip: '"uhn nah-MEE" - n links to vowel' },
      { sound: 'vous avez', example: 'vous avez', meaning: 'you have', tip: '"voo zah-VAY" - s links' },
    ],
  },
];

export default function PronunciationScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Pronunciation Guide 🗣️</Text>
      <Text style={styles.subtitle}>Tap any example to hear it spoken</Text>

      {SOUNDS.map((section, si) => (
        <View key={si}>
          <Text style={styles.sectionTitle}>{section.category}</Text>
          {section.items.map((item, ii) => (
            <TouchableOpacity
              key={ii}
              style={styles.card}
              onPress={() => speakFrench(item.example)}
              onLongPress={() => speakSlow(item.example)}
              activeOpacity={0.7}
            >
              <View style={styles.soundBadge}>
                <Text style={styles.soundText}>{item.sound}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.exampleRow}>
                  <Text style={styles.example}>{item.example}</Text>
                  <Text style={styles.meaning}>({item.meaning})</Text>
                </View>
                <Text style={styles.tip}>{item.tip}</Text>
              </View>
              <Text style={styles.speakIcon}>🔊</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>🎯 Practice Tips</Text>
        <Text style={styles.tipText}>1. Listen first, then repeat</Text>
        <Text style={styles.tipText}>2. Long press for slow playback 🐢</Text>
        <Text style={styles.tipText}>3. Record yourself and compare</Text>
        <Text style={styles.tipText}>4. Practice 10 minutes daily</Text>
        <Text style={styles.tipText}>5. Focus on nasal sounds - they're uniquely French!</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold' },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.lg },
  sectionTitle: { color: COLORS.text, fontSize: FONTS.size.lg, fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: SPACING.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  soundBadge: {
    backgroundColor: '#00C9A7',
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  soundText: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold' },
  info: { flex: 1 },
  exampleRow: { flexDirection: 'row', alignItems: 'center' },
  example: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  meaning: { color: COLORS.textMuted, fontSize: FONTS.size.sm },
  tip: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 2 },
  speakIcon: { fontSize: 20 },
  tipCard: {
    backgroundColor: '#1A2E1A',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: '#00C9A7',
  },
  tipTitle: { color: '#00C9A7', fontSize: FONTS.size.md, fontWeight: 'bold', marginBottom: 8 },
  tipText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: 4, lineHeight: 22 },
});
