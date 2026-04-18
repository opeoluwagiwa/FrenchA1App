import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import ProgressBar from '../components/ProgressBar';
import { JOURNEY_UNITS } from '../data/journey_units';

const { width } = Dimensions.get('window');
const NODE_SIZE = 64;

export default function JourneyScreen({ navigation }) {
  const { state } = useApp();

  // Calculate completion for each unit
  const unitProgress = useMemo(() => {
    const progress = {};
    JOURNEY_UNITS.forEach(unit => {
      const key = `journey_unit_${unit.id}`;
      const stagesCompleted = state[key] || 0;
      const totalStages = unit.type === 'checkpoint' || unit.type === 'boss' ? 1 : 12;
      progress[unit.id] = {
        completed: stagesCompleted,
        total: totalStages,
        pct: totalStages > 0 ? Math.round((stagesCompleted / totalStages) * 100) : 0,
        stars: stagesCompleted >= totalStages ? 3 : stagesCompleted >= totalStages * 0.8 ? 2 : stagesCompleted >= totalStages * 0.5 ? 1 : 0,
      };
    });
    return progress;
  }, [state]);

  // Determine which units are unlocked
  const isUnlocked = (unitId) => {
    if (unitId === 1) return true;
    const prevProgress = unitProgress[unitId - 1];
    return prevProgress && prevProgress.pct >= 50; // Need 50% of previous to unlock next
  };

  const totalCompleted = Object.values(unitProgress).filter(p => p.pct >= 100).length;
  const overallPct = Math.round((totalCompleted / JOURNEY_UNITS.length) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>A1 Journey</Text>
        <Text style={styles.headerSubtitle}>Your path to French fluency</Text>
        <View style={styles.overallProgress}>
          <ProgressBar progress={overallPct} color={COLORS.primary} height={8} />
          <Text style={styles.overallText}>{totalCompleted}/{JOURNEY_UNITS.length} units · {overallPct}%</Text>
        </View>
      </View>

      {/* Path */}
      <View style={styles.path}>
        {JOURNEY_UNITS.map((unit, i) => {
          const unlocked = isUnlocked(unit.id);
          const progress = unitProgress[unit.id];
          const isCheckpoint = unit.type === 'checkpoint';
          const isBoss = unit.type === 'boss';
          const isDone = progress.pct >= 100;
          // Zigzag pattern
          const offset = i % 2 === 0 ? 0 : 60;

          return (
            <View key={unit.id}>
              {/* Connector line */}
              {i > 0 && (
                <View style={[styles.connector, { marginLeft: width / 2 - 1 }]}>
                  <View style={[styles.connectorLine, isDone && { backgroundColor: COLORS.primary }]} />
                </View>
              )}

              <TouchableOpacity
                style={[styles.nodeRow, { paddingLeft: offset }]}
                onPress={() => unlocked && navigation.navigate('JourneyUnit', { unit })}
                disabled={!unlocked}
                activeOpacity={0.7}
              >
                {/* Node circle */}
                <View style={[
                  styles.node,
                  isCheckpoint && styles.nodeCheckpoint,
                  isBoss && styles.nodeBoss,
                  isDone && styles.nodeDone,
                  !unlocked && styles.nodeLocked,
                  { borderColor: isDone ? COLORS.primary : unlocked ? unit.color : COLORS.border },
                ]}>
                  {isDone ? (
                    <Text style={styles.nodeStars}>
                      {'★'.repeat(progress.stars)}{'☆'.repeat(3 - progress.stars)}
                    </Text>
                  ) : (
                    <Text style={[styles.nodeIcon, !unlocked && { opacity: 0.3 }]}>{unit.icon}</Text>
                  )}
                </View>

                {/* Info */}
                <View style={[styles.nodeInfo, !unlocked && { opacity: 0.35 }]}>
                  <View style={styles.nodeHeader}>
                    <Text style={styles.nodeTitle}>{unit.title}</Text>
                    {isCheckpoint && <Text style={styles.checkpointBadge}>CHECKPOINT</Text>}
                    {isBoss && <Text style={styles.bossBadge}>FINAL EXAM</Text>}
                  </View>
                  <Text style={styles.nodeSubtitle}>{unit.subtitle}</Text>
                  {!isCheckpoint && !isBoss && unlocked && (
                    <View style={styles.nodeProgressRow}>
                      <ProgressBar progress={progress.pct} color={unit.color} height={4} />
                      <Text style={styles.nodeProgressText}>{progress.completed}/12</Text>
                    </View>
                  )}
                  {!unlocked && <Text style={styles.lockedText}>Complete previous unit to unlock</Text>}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },
  // Header
  header: { padding: SPACING.md, paddingTop: SPACING.xl },
  headerTitle: { color: COLORS.text, fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  overallProgress: { marginTop: 12 },
  overallText: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, textAlign: 'right' },
  // Path
  path: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },
  connector: { height: 20, alignItems: 'center' },
  connectorLine: { width: 2, height: 20, backgroundColor: COLORS.border },
  nodeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  node: {
    width: NODE_SIZE, height: NODE_SIZE,
    borderRadius: NODE_SIZE / 2,
    backgroundColor: COLORS.bgCard,
    borderWidth: 3,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  nodeCheckpoint: { borderRadius: 16, width: NODE_SIZE + 4, height: NODE_SIZE + 4 },
  nodeBoss: { borderRadius: 16, width: NODE_SIZE + 8, height: NODE_SIZE + 8, backgroundColor: '#2A1F00' },
  nodeDone: { backgroundColor: '#0D2E0D' },
  nodeLocked: { backgroundColor: COLORS.bgInput, borderColor: COLORS.border },
  nodeIcon: { fontSize: 28 },
  nodeStars: { color: COLORS.gold, fontSize: 14, fontWeight: 'bold', letterSpacing: 2 },
  nodeInfo: { flex: 1 },
  nodeHeader: { flexDirection: 'row', alignItems: 'center' },
  nodeTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  checkpointBadge: { color: COLORS.gold, fontSize: 9, fontWeight: '800', backgroundColor: 'rgba(255,200,0,0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, letterSpacing: 1 },
  bossBadge: { color: COLORS.wrong, fontSize: 9, fontWeight: '800', backgroundColor: 'rgba(255,75,75,0.12)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, letterSpacing: 1 },
  nodeSubtitle: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  nodeProgressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  nodeProgressText: { color: COLORS.textMuted, fontSize: 10, marginLeft: 8, fontWeight: '600' },
  lockedText: { color: COLORS.textFaint, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
});
