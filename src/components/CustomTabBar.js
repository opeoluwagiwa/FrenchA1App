import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

const TABS = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'learn', label: 'Learn', icon: '🃏' },
  { key: 'quiz', label: 'Quiz', icon: '🧠' },
  { key: 'ai', label: 'AI Tutor', icon: '🤖' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function CustomTabBar({ activeTab, onTabPress }) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 8,
    paddingTop: 6,
    height: 65,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.5,
  },
  iconActive: {
    fontSize: 26,
    opacity: 1,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  labelActive: {
    color: COLORS.primary,
  },
});
