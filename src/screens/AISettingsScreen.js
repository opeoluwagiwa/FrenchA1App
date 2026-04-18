import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';

export default function AISettingsScreen({ navigation }) {
  const { state, dispatch } = useApp();
  const [key, setKey] = useState(state.apiKey || '');
  const [testing, setTesting] = useState(false);

  const testKey = async () => {
    if (!key.trim()) return;
    setTesting(true);
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: 'Say "bonjour" in one word' }],
          max_tokens: 10,
        }),
      });
      const data = await res.json();
      if (data.error) {
        Alert.alert('Invalid Key', data.error.message);
      } else {
        dispatch({ type: 'SET_API_KEY', payload: key.trim() });
        Alert.alert('Success!', 'API key is working. AI features are now unlocked!');
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Could not connect. Check your internet.');
    }
    setTesting(false);
  };

  const removeKey = () => {
    dispatch({ type: 'SET_API_KEY', payload: '' });
    setKey('');
    Alert.alert('Removed', 'API key has been removed.');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>AI Settings 🔑</Text>
      <Text style={styles.desc}>
        Enter your OpenAI API key to unlock AI-powered features like chat, grammar explanations, and sentence corrections.
      </Text>

      <Text style={styles.label}>API Key</Text>
      <TextInput
        style={styles.input}
        value={key}
        onChangeText={setKey}
        placeholder="sk-..."
        placeholderTextColor={COLORS.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />

      <Text style={styles.hint}>
        Get your key at platform.openai.com → API Keys
      </Text>

      <TouchableOpacity
        style={[styles.btn, (!key.trim() || testing) && styles.btnDisabled]}
        onPress={testKey}
        disabled={!key.trim() || testing}
      >
        <Text style={styles.btnText}>{testing ? 'Testing...' : 'Save & Test Key'}</Text>
      </TouchableOpacity>

      {state.apiKey ? (
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>✅</Text>
          <Text style={styles.statusText}>API key is active</Text>
          <TouchableOpacity onPress={removeKey}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.statusCard, styles.statusInactive]}>
          <Text style={styles.statusIcon}>🔒</Text>
          <Text style={styles.statusText}>No API key set</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Privacy</Text>
        <Text style={styles.infoText}>
          Your API key is stored only on your device. It is never sent anywhere except directly to OpenAI's servers when you use AI features.
        </Text>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.bg, padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.xl },
  desc: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginTop: SPACING.sm, lineHeight: 22 },
  label: { color: COLORS.text, fontSize: FONTS.size.sm, fontWeight: 'bold', marginTop: SPACING.lg, marginBottom: SPACING.xs },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  hint: { color: COLORS.textMuted, fontSize: FONTS.size.xs, marginTop: SPACING.xs },
  btn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  btnDisabled: { opacity: 0.4 },
  btnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D2E0D',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  statusInactive: { backgroundColor: COLORS.bgCard },
  statusIcon: { fontSize: 20, marginRight: SPACING.sm },
  statusText: { color: COLORS.text, fontSize: FONTS.size.sm, flex: 1 },
  removeText: { color: COLORS.wrong, fontSize: FONTS.size.sm },
  infoCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.lg },
  infoTitle: { color: COLORS.text, fontSize: FONTS.size.sm, fontWeight: 'bold' },
  infoText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4, lineHeight: 20 },
});
