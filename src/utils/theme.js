// Duolingo-inspired color theme
export const COLORS = {
  // Primary
  primary: '#58CC02',       // Duolingo green
  primaryDark: '#46A302',
  primaryLight: '#89E219',

  // Secondary
  secondary: '#1CB0F6',     // Duolingo blue
  secondaryDark: '#0095D9',

  // Accent
  accent: '#FF9600',        // Orange
  accentDark: '#E08600',

  // Feedback
  correct: '#58CC02',
  wrong: '#FF4B4B',
  warning: '#FFC800',

  // Gender colors (for articles)
  masculine: '#1CB0F6',     // Blue for le/un
  feminine: '#FF6B9D',      // Pink for la/une

  // XP / Gold
  gold: '#FFC800',
  xp: '#A560FF',            // Purple for XP

  // Backgrounds
  bg: '#131F24',            // Dark background
  bgCard: '#1B2B33',
  bgLight: '#235264',
  bgInput: '#0D1B21',

  // Text
  text: '#FFFFFF',
  textSecondary: '#AFAFAF',
  textMuted: '#6B7B82',

  // Borders
  border: '#37464F',
  borderLight: '#4A5C66',

  // Streak
  streak: '#FF9600',
  streakBg: '#4A2800',

  // Hearts/Lives
  heart: '#FF4B4B',
  heartEmpty: '#3C1414',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
};

// Level thresholds
export const LEVELS = [
  { level: 1, name: 'Debutant', xpRequired: 0, icon: '🌱' },
  { level: 2, name: 'Curieux', xpRequired: 100, icon: '🌿' },
  { level: 3, name: 'Apprenti', xpRequired: 300, icon: '🌳' },
  { level: 4, name: 'Explorateur', xpRequired: 600, icon: '⭐' },
  { level: 5, name: 'Bavard', xpRequired: 1000, icon: '🗣️' },
  { level: 6, name: 'Connaisseur', xpRequired: 1500, icon: '📚' },
  { level: 7, name: 'Avance', xpRequired: 2200, icon: '🏆' },
  { level: 8, name: 'Brillant', xpRequired: 3000, icon: '💎' },
  { level: 9, name: 'Maitre', xpRequired: 4000, icon: '👑' },
  { level: 10, name: 'Francophone', xpRequired: 5500, icon: '🇫🇷' },
];

export const BADGES = [
  { id: 'first_card', name: 'Premier Pas', desc: 'Review your first flashcard', icon: '🎯', condition: 'flashcards_reviewed >= 1' },
  { id: 'fifty_words', name: 'Polyglotte', desc: 'Learn 50 words', icon: '📖', condition: 'words_learned >= 50' },
  { id: 'hundred_words', name: 'Vocabulaire', desc: 'Learn 100 words', icon: '📚', condition: 'words_learned >= 100' },
  { id: 'five_hundred', name: 'Savant', desc: 'Learn 500 words', icon: '🧠', condition: 'words_learned >= 500' },
  { id: 'streak_3', name: 'En Feu', desc: '3-day streak', icon: '🔥', condition: 'streak >= 3' },
  { id: 'streak_7', name: 'Semaine Parfaite', desc: '7-day streak', icon: '💪', condition: 'streak >= 7' },
  { id: 'streak_30', name: 'Inarretable', desc: '30-day streak', icon: '🏅', condition: 'streak >= 30' },
  { id: 'quiz_master', name: 'Quiz Master', desc: 'Score 100% on 10 quizzes', icon: '🏆', condition: 'perfect_quizzes >= 10' },
  { id: 'speed_demon', name: 'Rapide', desc: 'Complete a speed round', icon: '⚡', condition: 'speed_rounds >= 1' },
  { id: 'composer', name: 'Compositeur', desc: 'Complete 20 sentence compositions', icon: '✍️', condition: 'sentences_composed >= 20' },
  { id: 'grammar_guru', name: 'Grammairien', desc: 'Complete all grammar lessons', icon: '📝', condition: 'grammar_completed >= 8' },
  { id: 'dialogue_pro', name: 'Conversant', desc: 'Practice all dialogues', icon: '💬', condition: 'dialogues_completed >= 8' },
  { id: 'all_categories', name: 'Completiste', desc: 'Study all vocabulary categories', icon: '🌟', condition: 'categories_studied >= 41' },
  { id: 'night_owl', name: 'Hibou', desc: 'Study after 10 PM', icon: '🦉', condition: 'night_study >= 1' },
  { id: 'early_bird', name: 'Matinal', desc: 'Study before 7 AM', icon: '🐦', condition: 'morning_study >= 1' },
];
