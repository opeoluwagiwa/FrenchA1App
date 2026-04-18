import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, PanResponder,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../utils/theme';
import { useApp } from '../context/AppContext';
import { calculateNextReview, getDueCards } from '../utils/srs';
import { speakFrench, speakSlow } from '../utils/speech';
import ProgressBar from '../components/ProgressBar';
import XPBadge from '../components/XPBadge';
import vocabData from '../data/vocab_data.json';
import sentencesData from '../data/sentences_data.json';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = 80;

function RatingButton({ color, emoji, label, hint, days, onPress }) {
  return (
    <TouchableOpacity style={{ flex: 1, alignItems: 'center' }} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.ratingBtnInner, { backgroundColor: color }]}>
        <Text style={styles.ratingEmoji}>{emoji}</Text>
        <Text style={styles.ratingLabel}>{label}</Text>
      </View>
      <View style={styles.ratingHintRow}>
        <View style={styles.ratingHintBadge}>
          <Text style={styles.ratingHintKey}>{hint}</Text>
        </View>
        <Text style={styles.ratingHintDays}>{days}</Text>
      </View>
    </TouchableOpacity>
  );
}

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
    return data.filter(d => d.category === category).map(item => ({
      ...item,
      cardId: `${prefix}${item.id}`,
      ...(state.cardStates[`${prefix}${item.id}`] || {}),
    }));
  }, [category, type]);

  const dueCards = useMemo(() => getDueCards(categoryItems, 20), [categoryItems]);
  const cards = dueCards.length > 0 ? dueCards : categoryItems.slice(0, 20);
  const currentCard = cards[currentIndex];

  const flipCard = useCallback(() => {
    setIsFlipped(prev => {
      if (!prev && currentCard) speakFrench(currentCard.french);
      return !prev;
    });
  }, [currentCard]);

  const handleSwipe = useCallback((quality) => {
    if (!currentCard) return;
    const updated = calculateNextReview(
      state.cardStates[currentCard.cardId] || { id: currentCard.cardId }, quality
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

    setSessionStats(prev => ({ reviewed: prev.reviewed + 1, correct: prev.correct + (quality >= 3 ? 1 : 0) }));
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
            pan.setValue({ x: 0, y: 0 }); handleSwipe(5);
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: { x: -width, y: 0 }, duration: 200, useNativeDriver: false }).start(() => {
            pan.setValue({ x: 0, y: 0 }); handleSwipe(1);
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
        <Text style={{ fontSize: 60 }}>🎉</Text>
        <Text style={styles.doneTitle}>All caught up!</Text>
        <Text style={styles.doneText}>No cards due for review in this category.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMasc = currentCard.french.startsWith('le ') || currentCard.french.startsWith('un ');
  const isFem = currentCard.french.startsWith('la ') || currentCard.french.startsWith('une ');

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <ProgressBar progress={(currentIndex / cards.length) * 100} height={10} />
        </View>
        <Text style={styles.counter}>{currentIndex + 1}<Text style={{ color: COLORS.textFaint }}>/{cards.length}</Text></Text>
      </View>

      <XPBadge amount={10} visible={showXP} />

      {/* Swipe hints */}
      <View style={styles.swipeHints}>
        <Text style={[styles.swipeHint, { color: COLORS.wrong }]}>← Hard</Text>
        <Text style={[styles.swipeHint, { color: COLORS.textMuted }]}>Tap to flip</Text>
        <Text style={[styles.swipeHint, { color: COLORS.correct }]}>Easy →</Text>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <Animated.View {...panResponder.panHandlers} style={[styles.cardOuter, { transform: [{ translateX: pan.x }] }]}>
          <TouchableOpacity activeOpacity={0.9} onPress={flipCard} style={{ flex: 1 }}>
            {!isFlipped ? (
              <View style={styles.cardFace}>
                {/* Gender tag */}
                {(isMasc || isFem) && (
                  <View style={[styles.genderTag, { backgroundColor: isMasc ? COLORS.masculine : COLORS.feminine }]}>
                    <Text style={styles.genderText}>{isMasc ? 'MASCULIN' : 'FEMININ'}</Text>
                  </View>
                )}
                <Text style={styles.categoryLabel}>{category}</Text>
                <Text style={styles.frenchWord}>{currentCard.french}</Text>
                <Text style={styles.pronunciation}>[{currentCard.pronunciation}]</Text>
                <View style={styles.speakRow}>
                  <TouchableOpacity style={styles.speakCircle} onPress={() => speakFrench(currentCard.french)}>
                    <Text style={{ fontSize: 22 }}>🔊</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.speakCircle} onPress={() => speakSlow(currentCard.french)}>
                    <Text style={{ fontSize: 22 }}>🐢</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.revealHint}>TAP TO REVEAL</Text>
              </View>
            ) : (
              <View style={[styles.cardFace, styles.cardBack]}>
                <Text style={styles.categoryLabel}>{category}</Text>
                <Text style={styles.frenchWordSmall}>{currentCard.french}</Text>
                <View style={styles.divider} />
                <Text style={styles.englishWord}>{currentCard.english}</Text>
                <Text style={styles.pronunciation}>[{currentCard.pronunciation}]</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 3D Rating buttons */}
      <View style={styles.ratingRow}>
        <RatingButton color={COLORS.wrong} emoji="😣" label="HARD" hint="1" days="< 1 min" onPress={() => handleSwipe(1)} />
        <RatingButton color="#FF9600" emoji="🤔" label="GOOD" hint="2" days="10 min" onPress={() => handleSwipe(3)} />
        <RatingButton color={COLORS.correct} emoji="😄" label="EASY" hint="3" days="4 jours" onPress={() => handleSwipe(5)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.xl },
  closeBtn: { width: 32, height: 32, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCard, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 14 },
  counter: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  swipeHints: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: 6 },
  swipeHint: { fontSize: 11, fontWeight: '600' },
  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  cardOuter: { width: width - 40, height: height * 0.42 },
  cardFace: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: 26,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBack: { backgroundColor: COLORS.bgElev },
  genderTag: { position: 'absolute', top: 18, right: 18, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  genderText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  categoryLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  frenchWord: { color: COLORS.text, fontSize: 52, fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center', lineHeight: 56, letterSpacing: -1.5 },
  frenchWordSmall: { color: COLORS.textSecondary, fontSize: 20, fontStyle: 'italic', textAlign: 'center' },
  pronunciation: { color: COLORS.textSecondary, fontSize: 15, fontStyle: 'italic', marginTop: 12 },
  englishWord: { color: COLORS.primary, fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  divider: { width: 60, height: 2, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  speakRow: { flexDirection: 'row', marginTop: 24 },
  speakCircle: { width: 50, height: 50, borderRadius: RADIUS.full, backgroundColor: COLORS.bgCardHi, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  revealHint: { position: 'absolute', bottom: 16, color: COLORS.textFaint, fontSize: 11, letterSpacing: 1 },
  // Rating buttons
  ratingRow: { flexDirection: 'row', paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl, marginTop: SPACING.md },
  ratingBtnInner: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  ratingEmoji: { fontSize: 26, lineHeight: 30 },
  ratingLabel: { fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 1.2, marginTop: 4 },
  ratingHintRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingHintBadge: { backgroundColor: COLORS.bgCard, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1, borderColor: COLORS.borderSoft, marginRight: 5 },
  ratingHintKey: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '700' },
  ratingHintDays: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  // Done state
  doneTitle: { color: COLORS.text, fontSize: 24, fontWeight: 'bold', marginTop: SPACING.md },
  doneText: { color: COLORS.textSecondary, fontSize: 15, marginTop: SPACING.sm },
  backBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: RADIUS.lg, marginTop: SPACING.lg },
  backBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
