import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../utils/theme';

export default function LivesDisplay({ lives }) {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={[styles.heart, i <= lives ? styles.heartFull : styles.heartEmpty]}>
          {i <= lives ? '❤️' : '🖤'}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    fontSize: 16,
  },
  heartFull: {},
  heartEmpty: {
    opacity: 0.4,
  },
});
