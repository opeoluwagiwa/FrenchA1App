import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import * as FileSystem from 'expo-file-system';
import { LEVELS, BADGES } from '../utils/theme';
import { OPENAI_API_KEY } from '../config';

const AppContext = createContext();

const STATE_FILE = FileSystem.documentDirectory + 'french_a1_state.json';

const initialState = {
  xp: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  lives: 5,
  livesLastRefill: null,
  cardStates: {},
  wordsLearned: 0,
  sentencesLearned: 0,
  flashcardsReviewed: 0,
  quizzesCompleted: 0,
  perfectQuizzes: 0,
  speedRounds: 0,
  sentencesComposed: 0,
  grammarCompleted: 0,
  dialoguesCompleted: 0,
  categoriesStudied: [],
  nightStudy: 0,
  morningStudy: 0,
  badges: [],
  mistakes: [],
  dailyChallengeCompleted: false,
  dailyChallengeDate: null,
  wordOfDayIndex: 0,
  wordOfDayDate: null,
  soundEnabled: true,
  apiKey: OPENAI_API_KEY,
  isLoaded: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, isLoaded: true };

    case 'ADD_XP': {
      const newXp = state.xp + action.payload;
      const newLevel = LEVELS.reduce((lvl, l) => newXp >= l.xpRequired ? l.level : lvl, 1);
      return { ...state, xp: newXp, level: newLevel };
    }

    case 'UPDATE_STREAK': {
      const today = new Date().toDateString();
      const lastDate = state.lastStudyDate;
      let newStreak = state.streak;

      if (lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          newStreak = state.streak + 1;
        } else if (lastDate !== today) {
          newStreak = 1;
        }
      }

      const hour = new Date().getHours();
      return {
        ...state,
        streak: newStreak,
        lastStudyDate: today,
        nightStudy: hour >= 22 ? state.nightStudy + 1 : state.nightStudy,
        morningStudy: hour < 7 ? state.morningStudy + 1 : state.morningStudy,
      };
    }

    case 'UPDATE_CARD_STATE':
      return {
        ...state,
        cardStates: { ...state.cardStates, [action.payload.id]: action.payload },
      };

    case 'LOSE_LIFE':
      return { ...state, lives: Math.max(0, state.lives - 1) };

    case 'REFILL_LIVES':
      return { ...state, lives: 5, livesLastRefill: Date.now() };

    case 'INCREMENT_STAT':
      return { ...state, [action.payload.stat]: (state[action.payload.stat] || 0) + (action.payload.value || 1) };

    case 'ADD_CATEGORY_STUDIED': {
      const cats = Array.isArray(state.categoriesStudied) ? [...state.categoriesStudied] : [];
      if (!cats.includes(action.payload)) cats.push(action.payload);
      return { ...state, categoriesStudied: cats };
    }

    case 'ADD_MISTAKE':
      return {
        ...state,
        mistakes: [...state.mistakes.filter(m => m.id !== action.payload.id), action.payload].slice(-100),
      };

    case 'REMOVE_MISTAKE':
      return { ...state, mistakes: state.mistakes.filter(m => m.id !== action.payload) };

    case 'EARN_BADGE':
      if (state.badges.includes(action.payload)) return state;
      return { ...state, badges: [...state.badges, action.payload] };

    case 'COMPLETE_DAILY_CHALLENGE':
      return { ...state, dailyChallengeCompleted: true, dailyChallengeDate: new Date().toDateString() };

    case 'UPDATE_WORD_OF_DAY':
      return { ...state, wordOfDayIndex: action.payload, wordOfDayDate: new Date().toDateString() };

    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };

    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef(null);

  // Load state from file
  useEffect(() => {
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(STATE_FILE);
        if (info.exists) {
          const raw = await FileSystem.readAsStringAsync(STATE_FILE);
          const parsed = JSON.parse(raw);
          dispatch({ type: 'LOAD_STATE', payload: parsed });
        } else {
          dispatch({ type: 'LOAD_STATE', payload: {} });
        }
      } catch (e) {
        console.log('Load error:', e);
        dispatch({ type: 'LOAD_STATE', payload: {} });
      }
    })();
  }, []);

  // Debounced save - only saves 1 second after last change
  useEffect(() => {
    if (!state.isLoaded) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const toSave = { ...state };
      delete toSave.isLoaded;
      FileSystem.writeAsStringAsync(STATE_FILE, JSON.stringify(toSave)).catch(e =>
        console.log('Save error:', e)
      );
    }, 1000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state]);

  // Check badges
  useEffect(() => {
    if (!state.isLoaded) return;
    const stats = {
      flashcards_reviewed: state.flashcardsReviewed,
      words_learned: state.wordsLearned,
      streak: state.streak,
      perfect_quizzes: state.perfectQuizzes,
      speed_rounds: state.speedRounds,
      sentences_composed: state.sentencesComposed,
      grammar_completed: state.grammarCompleted,
      dialogues_completed: state.dialoguesCompleted,
      categories_studied: Array.isArray(state.categoriesStudied) ? state.categoriesStudied.length : 0,
      night_study: state.nightStudy,
      morning_study: state.morningStudy,
    };

    BADGES.forEach(badge => {
      if (state.badges.includes(badge.id)) return;
      const [key, op, val] = badge.condition.split(' ');
      if (op === '>=' && stats[key] >= parseInt(val)) {
        dispatch({ type: 'EARN_BADGE', payload: badge.id });
      }
    });
  }, [state.flashcardsReviewed, state.wordsLearned, state.streak, state.perfectQuizzes,
      state.speedRounds, state.sentencesComposed, state.grammarCompleted, state.dialoguesCompleted,
      state.categoriesStudied, state.nightStudy, state.morningStudy]);

  // Refill lives
  useEffect(() => {
    if (!state.isLoaded) return;
    if (state.lives < 5) {
      const elapsed = Date.now() - (state.livesLastRefill || 0);
      const livesToAdd = Math.floor(elapsed / (30 * 60 * 1000));
      if (livesToAdd > 0) {
        dispatch({ type: 'REFILL_LIVES' });
      }
    }
  }, [state.isLoaded]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
