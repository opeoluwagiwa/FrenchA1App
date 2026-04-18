import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import { STAGE_TYPES } from '../data/journey_units';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';
import grammarData from '../data/grammar_data.json';

export default function JourneyUnitScreen({ route, navigation }) {
  const { unit } = route.params;
  const { state, dispatch } = useApp();

  // Get content for this unit
  const vocabItems = useMemo(() =>
    unit.vocabCategory ? vocabData.filter(v => v.category === unit.vocabCategory) : [],
  [unit.vocabCategory]);

  const sentenceItems = useMemo(() =>
    unit.sentenceCategory ? sentencesData.filter(s => s.category === unit.sentenceCategory) : [],
  [unit.sentenceCategory]);

  const grammarLesson = unit.grammarIndex !== null && unit.grammarIndex !== undefined
    ? grammarData[unit.grammarIndex] : null;

  const totalVocab = vocabItems.length;
  const totalSentences = sentenceItems.length;

  // Build the stages for this unit
  const stages = useMemo(() => {
    const s = [];
    if (totalVocab > 0) {
      s.push({ ...STAGE_TYPES[0], count: totalVocab, screen: 'Flashcard', params: { category: unit.vocabCategory, type: 'vocab' } }); // flashcards
      s.push({ ...STAGE_TYPES[1], count: totalVocab, screen: 'ListeningQuiz' }); // listen
      s.push({ ...STAGE_TYPES[2], count: totalVocab, screen: 'MCQQuiz' }); // mcq
      s.push({ ...STAGE_TYPES[6], count: totalVocab, screen: 'MatchingQuiz' }); // match
    }
    if (totalSentences > 0) {
      s.push({ ...STAGE_TYPES[3], count: totalSentences, screen: 'Flashcard', params: { category: unit.sentenceCategory, type: 'sentence' } }); // sentences
      s.push({ ...STAGE_TYPES[4], count: totalSentences, screen: 'SentenceComposer' }); // compose
      s.push({ ...STAGE_TYPES[5], count: totalSentences, screen: 'FillBlankQuiz' }); // fill blank
      s.push({ ...STAGE_TYPES[7], count: totalSentences, screen: 'UnscrambleQuiz' }); // unscramble
    }
    if (totalVocab > 0 || totalSentences > 0) {
      s.push({ ...STAGE_TYPES[8], count: totalVocab + totalSentences, screen: 'TranslationQuiz' }); // translate
      s.push({ ...STAGE_TYPES[9], count: totalVocab, screen: 'SpeedRound' }); // speed
    }
    if (grammarLesson) {
      s.push({ ...STAGE_TYPES[10], count: 1, screen: 'GrammarDetail', params: { lesson: grammarLesson, index: unit.grammarIndex } }); // grammar
    }
    // Boss battle always last
    s.push({ ...STAGE_TYPES[11], count: totalVocab + totalSentences, screen: 'MCQQuiz' }); // boss

    return s;
  }, [totalVocab, totalSentences, grammarLesson]);

  const stagesCompleted = state[`journey_unit_${unit.id}`] || 0;
  const overallPct = Math.round((stagesCompleted / stages.length) * 100);

  const handleStagePress = (stage, index) => {
    // Mark stage as completed when they return
    dispatch({ type: 'INCREMENT_STAT', payload: { stat: `journey_unit_${unit.id}`, value: 0 } }); // ensure key exists

    if (stage.params) {
      navigation.navigate(stage.screen, stage.params);
    } else {
      navigation.navigate(stage.screen);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={[styles.header, { borderLeftColor: unit.color }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.unitIcon}>{unit.icon}</Text>
        <Text style={styles.unitTitle}>{unit.title}</Text>
        <Text style={styles.unitSubtitle}>{unit.subtitle}</Text>

        <View style={styles.statsRow}>
          {totalVocab > 0 && (
            <View style={styles.statPill}>
              <Text style={styles.statText}>{totalVocab} words</Text>
            </View>
          )}
          {totalSentences > 0 && (
            <View style={styles.statPill}>
              <Text style={styles.statText}>{totalSentences} phrases</Text>
            </View>
          )}
          {grammarLesson && (
            <View style={styles.statPill}>
              <Text style={styles.statText}>Grammar</Text>
            </View>
          )}
        </View>

        <View style={styles.progressArea}>
          <ProgressBar progress={overallPct} color={unit.color} height={8} />
          <Text style={styles.progressText}>{stagesCompleted}/{stages.length} stages · {overallPct}%</Text>
        </View>
      </View>

      {/* Star display */}
      <View style={styles.starsRow}>
        {[1, 2, 3].map(s => (
          <Text key={s} style={[styles.star, overallPct >= s * 33 && styles.starEarned]}>
            {overallPct >= s * 33 ? '★' : '☆'}
          </Text>
        ))}
      </View>

      {/* Stages list */}
      <Text style={styles.sectionLabel}>STAGES</Text>

      {stages.map((stage, i) => {
        const isCompleted = i < stagesCompleted;
        const isCurrent = i === stagesCompleted;
        const isLocked = i > stagesCompleted;
        const isBoss = stage.key === 'boss';

        return (
          <TouchableOpacity
            key={i}
            style={[
              styles.stageCard,
              isCompleted && styles.stageCompleted,
              isCurrent && styles.stageCurrent,
              isLocked && styles.stageLocked,
              isBoss && styles.stageBoss,
            ]}
            onPress={() => !isLocked && handleStagePress(stage, i)}
            disabled={isLocked}
            activeOpacity={0.7}
          >
            <View style={styles.stageLeft}>
              <View style={[
                styles.stageNum,
                isCompleted && { backgroundColor: COLORS.correct },
                isCurrent && { backgroundColor: unit.color },
                isBoss && { backgroundColor: COLORS.gold },
              ]}>
                <Text style={styles.stageNumText}>
                  {isCompleted ? '✓' : isBoss ? '★' : `${i + 1}`}
                </Text>
              </View>
            </View>

            <View style={styles.stageInfo}>
              <Text style={[styles.stageLabel, isLocked && { color: COLORS.textFaint }]}>
                {stage.label}
              </Text>
              <Text style={[styles.stageDesc, isLocked && { color: COLORS.textFaint }]}>
                {stage.desc}{stage.count ? ` · ${stage.count} items` : ''}
              </Text>
            </View>

            <View style={styles.stageRight}>
              {isCompleted && <Text style={{ color: COLORS.correct, fontWeight: 'bold' }}>Done</Text>}
              {isCurrent && <Text style={{ color: unit.color, fontWeight: 'bold' }}>Start →</Text>}
              {isLocked && <Text style={{ color: COLORS.textFaint }}>Locked</Text>}
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  // Header
  header: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  backBtn: { marginBottom: 12 },
  backText: { color: COLORS.secondary, fontSize: 14 },
  unitIcon: { fontSize: 48, marginBottom: 8 },
  unitTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  unitSubtitle: { color: COLORS.textSecondary, fontSize: 15, marginTop: 4 },
  statsRow: { flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' },
  statPill: { backgroundColor: COLORS.bgCardHi, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, marginRight: 8, marginBottom: 4 },
  statText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  progressArea: { marginTop: 16 },
  progressText: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, textAlign: 'right' },
  // Stars
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  star: { fontSize: 32, color: COLORS.border, marginHorizontal: 4 },
  starEarned: { color: COLORS.gold },
  // Section
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.5, marginBottom: 10, marginLeft: 4, marginTop: 8 },
  // Stages
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  stageCompleted: { borderColor: COLORS.correct, backgroundColor: 'rgba(88,204,2,0.05)' },
  stageCurrent: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: 'rgba(88,204,2,0.08)' },
  stageLocked: { opacity: 0.45 },
  stageBoss: { borderColor: COLORS.gold, backgroundColor: 'rgba(255,200,0,0.05)' },
  stageLeft: { marginRight: 12 },
  stageNum: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgCardHi,
    justifyContent: 'center', alignItems: 'center',
  },
  stageNumText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  stageInfo: { flex: 1 },
  stageLabel: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  stageDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  stageRight: {},
});
