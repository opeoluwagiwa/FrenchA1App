import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  FlatList, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { chatWithAI } from '../utils/ai';
import { speakFrench } from '../utils/speech';

const ROLES = [
  {
    id: 'waiter',
    title: 'Restaurant Waiter 🍽️',
    icon: '🍽️',
    yourRole: 'You are the customer',
    aiRole: 'Waiter at a French restaurant',
    systemPrompt: `You are a waiter at a French restaurant. The customer just sat down.
- Greet them warmly, hand them the menu, take their order
- Ask about drinks, appetizers, main course, dessert
- Be polite and use "vous"
- Suggest daily specials
- At the end, bring the bill
- Stay in character throughout`,
    suggestedPhrases: ['Je voudrais...', 'L\'addition, s\'il vous plaît', 'Qu\'est-ce que vous recommandez ?', 'Un verre d\'eau, s\'il vous plaît'],
  },
  {
    id: 'doctor',
    title: 'Doctor Visit 🏥',
    icon: '🏥',
    yourRole: 'You are the patient',
    aiRole: 'French doctor',
    systemPrompt: `You are a French doctor. A patient has come to see you.
- Ask about their symptoms
- Ask follow-up questions (how long, where does it hurt, etc.)
- Give simple advice and maybe prescribe something
- Be caring and professional
- Use "vous" with the patient`,
    suggestedPhrases: ['J\'ai mal à...', 'Je suis malade', 'J\'ai de la fièvre', 'Depuis deux jours'],
  },
  {
    id: 'shopkeeper',
    title: 'Clothing Shop 👗',
    icon: '👗',
    yourRole: 'You are the shopper',
    aiRole: 'Shop assistant',
    systemPrompt: `You are a shop assistant in a French clothing store.
- Greet the customer and ask what they're looking for
- Suggest sizes, colors, styles
- Tell them prices
- Offer to find different sizes
- Help them at the checkout
- Be friendly and helpful`,
    suggestedPhrases: ['Je cherche...', 'C\'est combien ?', 'Avez-vous une autre taille ?', 'Je peux essayer ?'],
  },
  {
    id: 'landlord',
    title: 'Apartment Viewing 🏠',
    icon: '🏠',
    yourRole: 'You are looking for an apartment',
    aiRole: 'Landlord showing an apartment',
    systemPrompt: `You are a landlord showing an apartment in Paris to a potential tenant.
- Show them around the rooms
- Describe the apartment features
- Tell them about the neighborhood
- Discuss the rent and conditions
- Answer their questions about the lease`,
    suggestedPhrases: ['C\'est combien par mois ?', 'Il y a combien de chambres ?', 'Les charges sont incluses ?', 'Je peux visiter ?'],
  },
  {
    id: 'colleague',
    title: 'Office Colleague 💼',
    icon: '💼',
    yourRole: 'You are a new employee',
    aiRole: 'Friendly French colleague',
    systemPrompt: `You are a friendly French colleague welcoming a new employee on their first day.
- Show them around the office
- Introduce them to the team
- Explain lunch customs
- Make small talk about hobbies and weekends
- Be casual but professional, use "tu"`,
    suggestedPhrases: ['Enchanté !', 'Qu\'est-ce que tu fais ce week-end ?', 'Où est la cantine ?', 'Tu travailles ici depuis longtemps ?'],
  },
  {
    id: 'neighbor',
    title: 'New Neighbor 🏘️',
    icon: '🏘️',
    yourRole: 'You just moved in',
    aiRole: 'Friendly French neighbor',
    systemPrompt: `You are a friendly French neighbor meeting someone who just moved into the building.
- Welcome them to the neighborhood
- Tell them about local shops, parks, restaurants
- Share building rules (trash days, quiet hours)
- Invite them for coffee
- Be warm and neighborly`,
    suggestedPhrases: ['Bonjour, je suis votre nouveau voisin', 'Où est le supermarché ?', 'Merci pour votre aide', 'Avec plaisir !'],
  },
];

const BASE_SYSTEM = `Rules for the role-play:
- Use ONLY simple A1-level French
- Keep responses SHORT (2-3 sentences)
- After your French response, add English translation in parentheses
- If the user makes mistakes, gently correct with: "✏️ [wrong] → [correct]"
- Stay in character at all times
- Be patient and encouraging
- React naturally to what the user says`;

export default function RolePlayScreen({ route, navigation }) {
  const { state, dispatch } = useApp();
  const role = route?.params?.role || ROLES[0];
  const [messages, setMessages] = useState([]);
  const [apiMessages, setApiMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPhrases, setShowPhrases] = useState(true);
  const flatListRef = useRef(null);
  const systemPrompt = BASE_SYSTEM + '\n\n' + role.systemPrompt;

  useEffect(() => {
    (async () => {
      const result = await chatWithAI(state.apiKey, [], systemPrompt);
      if (result.error) {
        setMessages([{ id: '0', role: 'system', text: 'Error: ' + result.error }]);
      } else {
        setMessages([{ id: '0', role: 'assistant', text: result.text }]);
        setApiMessages([{ role: 'assistant', content: result.text }]);
        speakFrench(result.text.split('\n')[0]);
      }
      setLoading(false);
    })();
  }, []);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput('');
    setShowPhrases(false);

    const userMsg = { id: String(messages.length), role: 'user', text: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    const newApiMessages = [...apiMessages, { role: 'user', content: userText }];
    setApiMessages(newApiMessages);

    setLoading(true);
    const result = await chatWithAI(state.apiKey, newApiMessages, systemPrompt);

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
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        {!isUser && <Text style={styles.roleLabel}>{role.aiRole}</Text>}
        {isUser && <Text style={styles.youLabel}>You ({role.yourRole})</Text>}
        <Text style={[styles.messageText, isUser && styles.userText]}>{item.text}</Text>
        {!isUser && item.role !== 'system' && (
          <TouchableOpacity onPress={() => speakFrench(item.text.split('\n')[0])}>
            <Text style={styles.speakText}>🔊</Text>
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
        <View style={styles.headerCenter}>
          <Text style={styles.title}>{role.title}</Text>
          <Text style={styles.roleDesc}>{role.yourRole}</Text>
        </View>
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
          <Text style={styles.loadingText}>Responding...</Text>
        </View>
      )}

      {/* Suggested phrases */}
      {showPhrases && !loading && (
        <View style={styles.phrasesRow}>
          <Text style={styles.phrasesLabel}>Suggested:</Text>
          <FlatList
            horizontal
            data={role.suggestedPhrases}
            keyExtractor={(_, i) => String(i)}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.phraseChip} onPress={() => sendMessage(item)}>
                <Text style={styles.phraseText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Respond in French..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

export { ROLES };

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { color: COLORS.secondary, fontSize: FONTS.size.md },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { color: COLORS.text, fontSize: FONTS.size.md, fontWeight: 'bold' },
  roleDesc: { color: COLORS.textMuted, fontSize: FONTS.size.xs },
  messageList: { padding: SPACING.md },
  bubble: { maxWidth: '85%', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.secondary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: COLORS.bgCard },
  roleLabel: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  youLabel: { color: '#89E219', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  messageText: { color: COLORS.text, fontSize: FONTS.size.md, lineHeight: 22 },
  userText: { color: '#fff' },
  speakText: { fontSize: 18, marginTop: 4 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: 4 },
  loadingText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, marginLeft: 8 },
  phrasesRow: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  phrasesLabel: { color: COLORS.textMuted, fontSize: 10, marginBottom: 4 },
  phraseChip: { backgroundColor: COLORS.bgLight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, marginRight: 8 },
  phraseText: { color: COLORS.secondary, fontSize: FONTS.size.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border },
  input: { flex: 1, backgroundColor: COLORS.bgInput, borderRadius: RADIUS.lg, padding: SPACING.sm, paddingHorizontal: SPACING.md, color: COLORS.text, fontSize: FONTS.size.md, maxHeight: 100, marginRight: SPACING.sm },
  sendBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});
