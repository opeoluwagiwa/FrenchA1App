import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

const TABS = [
  { key: 'home', label: 'Home', icon: '⌂' },
  { key: 'journey', label: 'Journey', icon: '◆' },
  { key: 'learn', label: 'Learn', icon: '▦' },
  { key: 'quiz', label: 'Quiz', icon: '◎' },
  { key: 'ai', label: 'AI Tutor', icon: '◈' },
  { key: 'profile', label: 'Profile', icon: '○' },
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
            <Text style={[styles.icon, isActive && { color: COLORS.primary, fontSize: 22 }]}>
              {tab.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
            {isActive && <View style={[styles.indicator, { backgroundColor: COLORS.primary }]} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSoft,
    paddingBottom: 10,
    paddingTop: 8,
    height: 68,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  icon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 3,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: -1,
    width: 20,
    height: 2,
    borderRadius: 1,
  },
});
