// A1 Journey Path — 40 units covering all vocabulary categories + grammar + sentences
// Each unit maps to a vocabulary category and its related sentences + grammar

export const JOURNEY_UNITS = [
  // --- Block 1: Basics ---
  { id: 1, title: 'Greetings', subtitle: 'Say hello & goodbye', vocabCategory: 'Greetings & Politeness', sentenceCategory: 'Greetings & Basic Courtesy', grammarIndex: null, icon: '👋', color: '#58CC02' },
  { id: 2, title: 'Who Am I?', subtitle: 'Pronouns & basics', vocabCategory: 'Personal Pronouns & Basics', sentenceCategory: 'Introducing Yourself', grammarIndex: 1, icon: '👤', color: '#58CC02' },
  { id: 3, title: 'Numbers', subtitle: 'Count from 1 to 50', vocabCategory: 'Numbers (1-50)', sentenceCategory: 'Numbers, Days & Time', grammarIndex: null, icon: '🔢', color: '#58CC02' },
  { id: 4, title: 'Days & Time', subtitle: 'Calendar & clock', vocabCategory: 'Days, Months & Time', sentenceCategory: 'Numbers, Days & Time', grammarIndex: 14, icon: '📅', color: '#58CC02' },
  // Checkpoint 1
  { id: 5, title: 'Checkpoint 1', subtitle: 'Test your basics!', type: 'checkpoint', categories: ['Greetings & Politeness', 'Personal Pronouns & Basics', 'Numbers (1-50)', 'Days, Months & Time'], icon: '🏆', color: '#FFC800' },

  // --- Block 2: People & Body ---
  { id: 6, title: 'Family', subtitle: 'Meet the family', vocabCategory: 'Family & People', sentenceCategory: 'Family & Relationships', grammarIndex: 6, icon: '👨‍👩‍👧', color: '#1CB0F6' },
  { id: 7, title: 'Body & Health', subtitle: 'Parts & feelings', vocabCategory: 'The Body & Health', sentenceCategory: 'Health & Doctor', grammarIndex: null, icon: '💪', color: '#1CB0F6' },
  { id: 8, title: 'Colors', subtitle: 'Paint the rainbow', vocabCategory: 'Colors', sentenceCategory: 'Colors, Clothes & Appearance', grammarIndex: 12, icon: '🎨', color: '#1CB0F6' },
  { id: 9, title: 'Articles', subtitle: 'Le, la, les, un, une', vocabCategory: 'Articles & Determiners', sentenceCategory: null, grammarIndex: 0, icon: '📝', color: '#1CB0F6' },
  // Checkpoint 2
  { id: 10, title: 'Checkpoint 2', subtitle: 'Family & descriptions', type: 'checkpoint', categories: ['Family & People', 'The Body & Health', 'Colors', 'Articles & Determiners'], icon: '🏆', color: '#FFC800' },

  // --- Block 3: Food & Dining ---
  { id: 11, title: 'At the Restaurant', subtitle: 'Order like a pro', vocabCategory: 'Restaurant & Food', sentenceCategory: 'At the Restaurant', grammarIndex: 11, icon: '🍽️', color: '#FF9600' },
  { id: 12, title: 'Drinks', subtitle: 'Beverages & ordering', vocabCategory: 'Drinks', sentenceCategory: 'Food & Drinks', grammarIndex: null, icon: '☕', color: '#FF9600' },
  { id: 13, title: 'More Food', subtitle: 'Cooking & ingredients', vocabCategory: 'More Food & Cooking', sentenceCategory: 'At the Supermarket', grammarIndex: null, icon: '🧑‍🍳', color: '#FF9600' },
  { id: 14, title: '-ER Verbs', subtitle: 'Parler, manger, aimer...', vocabCategory: 'Common Verbs', sentenceCategory: 'Common Verbs & Phrases', grammarIndex: 4, icon: '✏️', color: '#FF9600' },
  // Checkpoint 3
  { id: 15, title: 'Checkpoint 3', subtitle: 'Food & verbs', type: 'checkpoint', categories: ['Restaurant & Food', 'Drinks', 'More Food & Cooking', 'Common Verbs'], icon: '🏆', color: '#FFC800' },

  // --- Block 4: Daily Life ---
  { id: 16, title: 'Shopping', subtitle: 'Clothes & stores', vocabCategory: 'Shopping & Clothes', sentenceCategory: 'Shopping & Market', grammarIndex: null, icon: '🛍️', color: '#A560FF' },
  { id: 17, title: 'House & Home', subtitle: 'Rooms & furniture', vocabCategory: 'House & Home', sentenceCategory: 'At Home & Daily Routine', grammarIndex: 13, icon: '🏠', color: '#A560FF' },
  { id: 18, title: 'Avoir & Être', subtitle: 'The two key verbs', vocabCategory: 'Etre & Avoir Conjugations', sentenceCategory: null, grammarIndex: 5, icon: '🔑', color: '#A560FF' },
  { id: 19, title: 'Daily Routine', subtitle: 'Everyday actions', vocabCategory: 'Everyday Actions', sentenceCategory: 'Everyday Actions & Habits', grammarIndex: 15, icon: '☀️', color: '#A560FF' },
  // Checkpoint 4
  { id: 20, title: 'Checkpoint 4', subtitle: 'Daily life mastery', type: 'checkpoint', categories: ['Shopping & Clothes', 'House & Home', 'Everyday Actions'], icon: '🏆', color: '#FFC800' },

  // --- Block 5: Getting Around ---
  { id: 21, title: 'City & Places', subtitle: 'Navigate the city', vocabCategory: 'City & Places', sentenceCategory: 'Directions & Transport', grammarIndex: null, icon: '🏙️', color: '#FF6B9D' },
  { id: 22, title: 'Transport', subtitle: 'Bus, train, taxi', vocabCategory: 'Transport & Travel', sentenceCategory: 'Travel & Hotel', grammarIndex: null, icon: '🚌', color: '#FF6B9D' },
  { id: 23, title: 'Questions', subtitle: 'Ask the right way', vocabCategory: null, sentenceCategory: 'Common Questions', grammarIndex: 3, icon: '❓', color: '#FF6B9D' },
  { id: 24, title: 'Negation', subtitle: 'Say no in French', vocabCategory: null, sentenceCategory: 'Asking for Help', grammarIndex: 2, icon: '🚫', color: '#FF6B9D' },
  // Checkpoint 5
  { id: 25, title: 'Checkpoint 5', subtitle: 'Navigation & questions', type: 'checkpoint', categories: ['City & Places', 'Transport & Travel'], icon: '🏆', color: '#FFC800' },

  // --- Block 6: Work & Education ---
  { id: 26, title: 'School', subtitle: 'Classroom French', vocabCategory: 'School & Education', sentenceCategory: 'At School', grammarIndex: null, icon: '🎓', color: '#00C9A7' },
  { id: 27, title: 'Work', subtitle: 'Office & professions', vocabCategory: 'Work & Professions', sentenceCategory: 'Work & Office', grammarIndex: null, icon: '💼', color: '#00C9A7' },
  { id: 28, title: '-IR Verbs', subtitle: 'Finir, choisir...', vocabCategory: null, sentenceCategory: null, grammarIndex: 8, icon: '📗', color: '#00C9A7' },
  { id: 29, title: 'Adjectives', subtitle: 'Describe everything', vocabCategory: 'Common Adjectives', sentenceCategory: 'Describing People & Things', grammarIndex: 12, icon: '🌟', color: '#00C9A7' },
  // Checkpoint 6
  { id: 30, title: 'Checkpoint 6', subtitle: 'Work & descriptions', type: 'checkpoint', categories: ['School & Education', 'Work & Professions', 'Common Adjectives'], icon: '🏆', color: '#FFC800' },

  // --- Block 7: Social & Culture ---
  { id: 31, title: 'Emotions', subtitle: 'Express how you feel', vocabCategory: 'Emotions & Descriptions', sentenceCategory: 'Feelings & Emotions', grammarIndex: null, icon: '😊', color: '#E63946' },
  { id: 32, title: 'Hobbies', subtitle: 'Free time fun', vocabCategory: 'Hobbies & Leisure', sentenceCategory: 'Hobbies & Free Time', grammarIndex: null, icon: '⚽', color: '#E63946' },
  { id: 33, title: 'Weather', subtitle: 'Sun, rain, snow', vocabCategory: 'Weather & Nature', sentenceCategory: 'Weather & Seasons', grammarIndex: null, icon: '🌤️', color: '#E63946' },
  { id: 34, title: 'Possessives', subtitle: 'Mon, ton, son...', vocabCategory: null, sentenceCategory: null, grammarIndex: 6, icon: '👋', color: '#E63946' },
  // Checkpoint 7
  { id: 35, title: 'Checkpoint 7', subtitle: 'Social & culture', type: 'checkpoint', categories: ['Emotions & Descriptions', 'Hobbies & Leisure', 'Weather & Nature'], icon: '🏆', color: '#FFC800' },

  // --- Block 8: Advanced A1 ---
  { id: 36, title: 'Technology', subtitle: 'Modern life vocab', vocabCategory: 'Technology & Communication', sentenceCategory: 'Technology & Communication', grammarIndex: null, icon: '📱', color: '#3B82F6' },
  { id: 37, title: 'Past Tense', subtitle: 'Talk about yesterday', vocabCategory: null, sentenceCategory: 'Talking About the Past', grammarIndex: 16, icon: '⏮️', color: '#3B82F6' },
  { id: 38, title: 'Future Tense', subtitle: 'Plans & intentions', vocabCategory: null, sentenceCategory: 'Talking About the Future', grammarIndex: 7, icon: '🔮', color: '#3B82F6' },
  { id: 39, title: 'Nationalities', subtitle: 'Countries & languages', vocabCategory: 'Nationalities & Languages', sentenceCategory: null, grammarIndex: null, icon: '🌍', color: '#3B82F6' },
  // Final Boss
  { id: 40, title: 'A1 Final Exam', subtitle: 'Prove your mastery!', type: 'boss', categories: null, icon: '👑', color: '#FFC800' },
];

// Activity types for each unit stage
export const STAGE_TYPES = [
  { key: 'flashcards', label: 'Learn Words', icon: '▦', desc: 'Review all vocabulary' },
  { key: 'listen', label: 'Listen', icon: '♪', desc: 'Hear and identify words' },
  { key: 'mcq', label: 'Quiz', icon: '◎', desc: 'Multiple choice questions' },
  { key: 'sentences', label: 'Sentences', icon: '≡', desc: 'Learn full phrases' },
  { key: 'compose', label: 'Compose', icon: '⊞', desc: 'Build sentences from tiles' },
  { key: 'fillblank', label: 'Fill Blank', icon: '⊟', desc: 'Complete the sentence' },
  { key: 'match', label: 'Match', icon: '⊡', desc: 'Match words to meanings' },
  { key: 'unscramble', label: 'Unscramble', icon: '◈', desc: 'Rearrange the words' },
  { key: 'translate', label: 'Translate', icon: '⇄', desc: 'English to French' },
  { key: 'speed', label: 'Speed Round', icon: '◆', desc: 'Beat the clock!' },
  { key: 'grammar', label: 'Grammar', icon: '≡', desc: 'Learn the rule' },
  { key: 'boss', label: 'Boss Battle', icon: '★', desc: 'Mixed challenge — 80% to pass' },
];
