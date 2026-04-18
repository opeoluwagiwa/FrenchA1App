import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { startChat, continueChat, SCENARIOS } from '../utils/ai';
import { speakFrench } from '../utils/speech';

export default function AIChatScreen({ route, navigation }) {
  const { state, dispatch } = useApp();
  const scenario = route?.params?.scenario || SCENARIOS[0];
  const [messages, setMessages] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!state.apiKey) {
      navigation.replace('AISettings');
      return;
    }
    // Start conversation
    (async () => {
      const result = await startChat(state.apiKey, scenario);
      if (result.error) {
        setMessages([{ id: '0', role: 'system', text: 'Error: ' + result.error }]);
      } else {
        setMessages([{ id: '0', role: 'assistant', text: result.text }]);
        setApiMessages([{ role: 'assistant', content: result.text }]);
        setSystemPrompt(result.systemPrompt);
        speakFrench(result.text.split('\n')[0]); // Speak the French part
      }
      setLoading(false);
    })();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');

    const userMsg = { id: String(messages.length), role: 'user', text: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const newApiMessages = [...apiMessages, { role: 'user', content: userText }];
    setApiMessages(newApiMessages);

    setLoading(true);
    const result = await continueChat(state.apiKey, newApiMessages, systemPrompt);

    if (result.error) {
      setMessages([...newMessages, { id: String(newMessages.length), role: 'system', text: 'Error: ' + result.error }]);
    } else {
      setMessages([...newMessages, { id: String(newMessages.length), role: 'assistant', text: result.text }]);
      setApiMessages([...newApiMessages, { role: 'assistant', content: result.text }]);
      dispatch({ type: 'ADD_XP', payload: 5 });
      speakFrench(result.text.split('\n')[0]);
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    const isError = item.role === 'system';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble, isError && styles.errorBubble]}>
        {!isUser && !isError && <Text style={styles.aiLabel}>🤖 French Partner</Text>}
        <Text style={[styles.messageText, isUser && styles.userText]}>{item.text}</Text>
        {!isUser && !isError && (
          <TouchableOpacity onPress={() => speakFrench(item.text.split('\n')[0])} style={styles.speakBtn}>
            <Text style={styles.speakText}>🔊 Listen</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{scenario.title}</Text>
        <View style={{ width: 50 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.loadingText}>Typing...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type in French or English..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md, paddingTop: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { color: COLORS.secondary, fontSize: FONTS.size.md },
  title: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  messageList: { padding: SPACING.md, paddingBottom: SPACING.lg },
  bubble: { maxWidth: '85%', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.secondary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.bgCard },
  errorBubble: { alignSelf: 'center', backgroundColor: '#2E0D0D' },
  aiLabel: { color: COLORS.textMuted, fontSize: 10, marginBottom: 4 },
  messageText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 22 },
  userText: { color: '#fff' },
  speakBtn: { marginTop: 6 },
  speakText: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 4 },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginLeft: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: FONTS.size.md,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
