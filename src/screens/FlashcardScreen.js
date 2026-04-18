import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, PanResponder,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { calculateNextReview, getDueCards } from '../utils/srs';
import { speakFrench, speakSlow } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import XPBadge from '../components/XPBadge';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

export default function FlashcardScreen({ route, navigation }) {
  const { category, type } = route.params;
  const { state, dispatch } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0 });

  const pan = useRef(new Animated.ValueXY()).current;

  const data = type === 'vocab' ? vocabData : sentencesData;
  const prefix = type === 'vocab' ? 'v_' : 's_';

  const categoryItems = useMemo(() => {
    const items = data.filter(d => d.category === category);
    return items.map(item => ({
      ...item,
      cardId: `${prefix}${item.id}`,
      ...(state.cardStates[`${prefix}${item.id}`] || {}),
    }));
  }, [category, type]);

  const dueCards = useMemo(() => {
    return getDueCards(categoryItems, 20);
  }, [categoryItems]);

  const cards = dueCards.length > 0 ? dueCards : categoryItems.slice(0, 20);
  const currentCard = cards[currentIndex];

  const flipCard = useCallback(() => {
    setIsFlipped(prev => {
      if (!prev && currentCard) {
        speakFrench(currentCard.french);
      }
      return !prev;
    });
  }, [currentCard]);

  const handleSwipe = useCallback((quality) => {
    if (!currentCard) return;

    const updated = calculateNextReview(
      state.cardStates[currentCard.cardId] || { id: currentCard.cardId },
      quality
    );
    dispatch({ type: 'UPDATE_CARD_STATE', payload: updated });
    dispatch({ type: 'INCREMENT_STAT', payload: { stat: 'flashcardsReviewed' } });
    dispatch({ type: 'ADD_CATEGORY_STUDIED', payload: category });

    if (quality >= 3) {
      if (updated.repetition === 2) {
        dispatch({ type: 'INCREMENT_STAT', payload: { stat: type === 'vocab' ? 'wordsLearned' : 'sentencesLearned' } });
      }
      dispatch({ type: 'ADD_XP', payload: quality >= 5 ? 15 : 10 });
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1500);
    } else {
      dispatch({ type: 'ADD_MISTAKE', payload: { id: currentCard.cardId, french: currentCard.french, english: currentCard.english, pronunciation: currentCard.pronunciation } });
    }

    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: prev.correct + (quality >= 3 ? 1 : 0),
    }));

    setIsFlipped(false);
    pan.setValue({ x: 0, y: 0 });

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate('SessionComplete', {
        reviewed: sessionStats.reviewed + 1,
        correct: sessionStats.correct + (quality >= 3 ? 1 : 0),
        total: cards.length,
      });
    }
  }, [currentCard, currentIndex, cards.length, sessionStats]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: width, y: 0 }, duration: 200, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            handleSwipe(5);
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: -width, y: 0 }, duration: 200, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            handleSwipe(1);
          });
        } else {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  if (!currentCard) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.doneTitle}>All caught up!</Text>
        <Text style={styles.doneText}>No cards due for review in this category.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const genderColor = currentCard.french.startsWith('le ') || currentCard.french.startsWith('un ')
    ? COLORS.masculine
    : currentCard.french.startsWith('la ') || currentCard.french.startsWith('une ')
      ? COLORS.feminine : null;

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: SPACING.md }}>
          <ProgressBar progress={(currentIndex / cards.length) * 100} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}/{cards.length}</Text>
      </View>

      <XPBadge amount={10} visible={showXP} />

      {/* Swipe hints */}
      <View style={styles.swipeHints}>
        <Text style={[styles.swipeHint, { color: COLORS.wrong }]}>← Hard</Text>
        <Text style={[styles.swipeHint, { color: COLORS.textMuted }]}>Tap to flip</Text>
        <Text style={[styles.swipeHint, { color: COLORS.correct }]}>Easy →</Text>
      </View>

      {/* Card - simple flip using conditional render */}
      <View style={styles.cardContainer}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card, { transform: [{ translateX: pan.x }] }]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={styles.cardTouchable}>
            {!isFlipped ? (
              /* Front - French */
              <View style={styles.cardFace}>
                {genderColor && (
                  <View style={[styles.genderTag, { backgroundColor: genderColor }]}>
                    <Text style={styles.genderText}>
                      {currentCard.french.startsWith('le ') || currentCard.french.startsWith('un ') ? 'Masculine' : 'Feminine'}
                    </Text>
                  </View>
                )}
                <Text style={styles.categoryTag}>{category}</Text>
                <Text style={styles.frenchText}>{currentCard.french}</Text>
                <Text style={styles.pronunciationText}>[{currentCard.pronunciation}]</Text>
                <View style={styles.speakRow}>
                  <TouchableOpacity style={styles.speakBtn} onPress={() => speakSlow(currentCard.french)}>
                    <Text style={styles.speakIcon}>🐢</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.speakBtn} onPress={() => speakFrench(currentCard.french)}>
                    <Text style={styles.speakIcon}>🔊</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tapHint}>Tap to reveal</Text>
              </View>
            ) : (
              /* Back - English */
              <View style={[styles.cardFace, styles.cardBack]}>
                <Text style={styles.categoryTag}>{category}</Text>
                <Text style={styles.frenchTextSmall}>{currentCard.french}</Text>
                <View style={styles.divider} />
                <Text style={styles.englishText}>{currentCard.english}</Text>
                <Text style={styles.pronunciationText}>[{currentCard.pronunciation}]</Text>
                <Text style={styles.tapHint}>Tap to flip back</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Rating Buttons */}
      <View style={styles.ratingRow}>
        <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: COLORS.wrong }]} onPress={() => handleSwipe(1)}>
          <Text style={styles.ratingEmoji}>😣</Text>
          <Text style={styles.ratingLabel}>Hard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: COLORS.accent }]} onPress={() => handleSwipe(3)}>
          <Text style={styles.ratingEmoji}>🤔</Text>
          <Text style={styles.ratingLabel}>Good</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ratingBtn, { backgroundColor: COLORS.correct }]} onPress={() => handleSwipe(5)}>
          <Text style={styles.ratingEmoji}>😄</Text>
          <Text style={styles.ratingLabel}>Easy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { color: COLORS.textSecondary, fontSize: FONTS.size.xl },
  counter: { color: COLORS.textSecondary, fontSize: FONTS.size.sm },
  swipeHints: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, marginBottom: SPACING.sm },
  swipeHint: { fontSize: FONTS.size.xs },
  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.md },
  card: { width: width - SPACING.md * 2, height: height * 0.45 },
  cardTouchable: { flex: 1 },
  cardFace: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardBack: { backgroundColor: COLORS.bgLight },
  genderTag: { position: 'absolute', top: SPACING.md, right: SPACING.md, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  genderText: { color: '#fff', fontSize: FONTS.size.xs, fontWeight: 'bold' },
  categoryTag: { color: COLORS.textMuted, fontSize: FONTS.size.xs, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  frenchText: { color: COLORS.text, fontSize: FONTS.size.hero, fontWeight: 'bold', textAlign: 'center' },
  frenchTextSmall: { color: COLORS.textSecondary, fontSize: FONTS.size.lg, textAlign: 'center' },
  pronunciationText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, fontStyle: 'italic', marginTop: 8 },
  englishText: { color: COLORS.primary, fontSize: FONTS.size.xxl, fontWeight: 'bold', textAlign: 'center' },
  divider: { width: 60, height: 2, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  speakRow: { flexDirection: 'row', marginTop: SPACING.lg },
  speakBtn: { marginHorizontal: 12 },
  speakIcon: { fontSize: 28 },
  tapHint: { color: COLORS.textMuted, fontSize: FONTS.size.xs, position: 'absolute', bottom: SPACING.md },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', padding: SPACING.md, paddingBottom: SPACING.xl },
  ratingBtn: { alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: RADIUS.lg, minWidth: 90 },
  ratingEmoji: { fontSize: 24 },
  ratingLabel: { color: '#fff', fontSize: FONTS.size.sm, fontWeight: 'bold', marginTop: 4 },
  emoji: { fontSize: 60 },
  doneTitle: { color: COLORS.text, fontSize: FONTS.size.xxl, fontWeight: 'bold', marginTop: SPACING.md },
  doneText: { color: COLORS.textSecondary, fontSize: FONTS.size.md, marginTop: SPACING.sm },
  backBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.lg, marginTop: SPACING.lg },
  backBtnText: { color: '#fff', fontSize: FONTS.size.md, fontWeight: 'bold' },
});
