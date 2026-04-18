import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../utils/theme';

export default function ProgressBar({ progress, color = COLORS.primary, height = 8, style }) {
  return (
    <View style={[styles.container, { height }, style]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: color, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: RADIUS.full,
  },
});
