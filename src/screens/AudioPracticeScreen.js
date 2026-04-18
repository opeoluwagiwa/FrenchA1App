import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { speakFrench, speakSlow } from '../utils/speech';
import sentencesData from '../data/sentences_data.json';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}

export default function AudioPracticeScreen({ navigation }) {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sentence] = useState(() => shuffle(sentencesData.filter(s => s.french.split(' ').length <= 8))[0]);
  const [nextSentence, setNextSentence] = useState(null);
  const soundRef = useRef(null);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow microphone access to record.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setRecordedUri(null);
    } catch (err) {
      console.log('Recording error:', err);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordedUri(uri);
    setRecording(null);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  };

  const playRecording = async () => {
    if (!recordedUri) return;
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) setIsPlaying(false);
      });
      await sound.playAsync();
    } catch (err) {
      console.log('Playback error:', err);
    }
  };

  const loadNext = () => {
    const next = shuffle(sentencesData.filter(s => s.french.split(' ').length <= 8 && s.id !== sentence.id))[0];
    // We can't easily update state with navigation, so just reload
    navigation.replace('AudioPractice');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Pronunciation Practice 🎙️</Text>
      <Text style={styles.subtitle}>Listen, record yourself, and compare</Text>

      {/* Target sentence */}
      <View style={styles.sentenceCard}>
        <Text style={styles.label}>Say this in French:</Text>
        <Text style={styles.frenchText}>{sentence.french}</Text>
        <Text style={styles.pronunciation}>[{sentence.pronunciation}]</Text>
        <Text style={styles.englishText}>{sentence.english}</Text>

        <View style={styles.listenRow}>
          <TouchableOpacity style={styles.listenBtn} onPress={() => speakFrench(sentence.french)}>
            <Text style={styles.listenIcon}>🔊</Text>
            <Text style={styles.listenLabel}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listenBtn} onPress={() => speakSlow(sentence.french)}>
            <Text style={styles.listenIcon}>🐢</Text>
            <Text style={styles.listenLabel}>Slow</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recording controls */}
      <View style={styles.recordSection}>
        <Text style={styles.stepLabel}>Step 1: Listen to the phrase above</Text>
        <Text style={styles.stepLabel}>Step 2: Record yourself saying it</Text>

        <TouchableOpacity
          style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={styles.recordEmoji}>{isRecording ? '⏹️' : '🎤'}</Text>
          <Text style={styles.recordText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>

        {isRecording && (
          <Text style={styles.recordingIndicator}>Recording... Speak now!</Text>
        )}
      </View>

      {/* Playback comparison */}
      {recordedUri && (
        <View style={styles.compareSection}>
          <Text style={styles.stepLabel}>Step 3: Compare!</Text>

          <View style={styles.compareRow}>
            <TouchableOpacity style={styles.compareBtn} onPress={() => speakFrench(sentence.french)}>
              <Text style={styles.compareEmoji}>🔊</Text>
              <Text style={styles.compareLabel}>Native</Text>
            </TouchableOpacity>

            <Text style={styles.vs}>vs</Text>

            <TouchableOpacity style={[styles.compareBtn, styles.compareBtnYou]} onPress={playRecording}>
              <Text style={styles.compareEmoji}>{isPlaying ? '⏸️' : '▶️'}</Text>
              <Text style={styles.compareLabel}>You</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.retryBtn} onPress={() => setRecordedUri(null)}>
            <Text style={styles.retryText}>🔄 Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Next sentence */}
      <TouchableOpacity style={styles.nextBtn} onPress={loadNext}>
        <Text style={styles.nextText}>Next Sentence →</Text>
      </TouchableOpacity>

      {/* Tips */}
      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>🎯 Tips</Text>
        <Text style={styles.tipText}>1. Listen to the native audio 2-3 times first</Text>
        <Text style={styles.tipText}>2. Pay attention to nasal sounds and liaison</Text>
        <Text style={styles.tipText}>3. Record yourself and compare the rhythm</Text>
        <Text style={styles.tipText}>4. Don't worry about being perfect — practice makes progress!</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: SPACING.md },
  header: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.sm },
  subtitle: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: SPACING.lg },
  sentenceCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#00C9A7',
  },
  label: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  frenchText: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', textAlign: 'center' },
  pronunciation: { color: COLORS.textMuted, fontSize: FONTS.size.sm, fontStyle: 'italic', marginTop: 4 },
  englishText: { color: COLORS.primary, fontSize: FONTS.size.md, marginTop: 8 },
  listenRow: { flexDirection: 'row', marginTop: SPACING.md },
  listenBtn: { alignItems: 'center', marginHorizontal: SPACING.md, backgroundColor: COLORS.bgLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.lg },
  listenIcon: { fontSize: 24 },
  listenLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.xs, marginTop: 2 },
  recordSection: { marginTop: SPACING.lg, alignItems: 'center' },
  stepLabel: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginBottom: 4 },
  recordBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.wrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  recordBtnActive: { backgroundColor: '#CC0000' },
  recordEmoji: { fontSize: 36 },
  recordText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: 'bold', marginTop: 4 },
  recordingIndicator: { color: COLORS.wrong, fontSize: FONTS.size.md, fontWeight: 'bold', marginTop: SPACING.md },
  compareSection: { marginTop: SPACING.lg, alignItems: 'center' },
  compareRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.md },
  compareBtn: {
    backgroundColor: '#00C9A7',
    width: 100,
    height: 80,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compareBtnYou: { backgroundColor: COLORS.secondary },
  compareEmoji: { fontSize: 28 },
  compareLabel: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold', marginTop: 4 },
  vs: { color: COLORS.textMuted, fontSize: FONTS.size.lg, marginHorizontal: SPACING.md },
  retryBtn: { marginTop: SPACING.md },
  retryText: { color: COLORS.accent, fontSize: FONTS.size.md },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: SPACING.xl },
  nextText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
  tipCard: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, marginTop: SPACING.lg },
  tipTitle: { color: COLORS.gold, fontSize: FONTS.size.sm, fontWeight: 'bold' },
  tipText: { color: COLORS.textSecondary, fontSize: FONTS.size.sm, marginTop: 4, lineHeight: 20 },
});
