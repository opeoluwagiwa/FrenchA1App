import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

export default function XPBadge({ amount, visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(1);
      translateY.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -60, duration: 1500, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.text}>+{amount} XP</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    zIndex: 100,
  },
  container: {
    backgroundColor: COLORS.xp,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  text: {
    color: COLORS.text,
    fontSize: FONTS.size.lg,
    fontWeight: 'bold',
  },
});
