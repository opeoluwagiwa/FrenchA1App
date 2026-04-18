import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../utils/theme';

const TABS = [
  { key: 'home', label: 'Accueil', icon: '🏠' },
  { key: 'learn', label: 'Apprendre', icon: '📖' },
  { key: 'quiz', label: 'Quiz', icon: '🎯' },
  { key: 'ai', label: 'Tuteur', icon: '✨' },
  { key: 'profile', label: 'Profil', icon: '👤' },
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
    fontSize: 20,
    opacity: 0.45,
  },
  iconActive: {
    fontSize: 24,
    opacity: 1,
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: -1,
    width: 24,
    height: 2,
    borderRadius: 1,
  },
});
