import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../utils/theme';
import CustomTabBar from '../components/CustomTabBar';

// Screens
import HomeScreen from '../screens/HomeScreen';
import FlashcardCategoriesScreen from '../screens/FlashcardCategoriesScreen';
import FlashcardScreen from '../screens/FlashcardScreen';
import SessionCompleteScreen from '../screens/SessionCompleteScreen';
import QuizMenuScreen from '../screens/QuizMenuScreen';
import MCQQuizScreen from '../screens/MCQQuizScreen';
import FillBlankQuizScreen from '../screens/FillBlankQuizScreen';
import MatchingQuizScreen from '../screens/MatchingQuizScreen';
import UnscrambleQuizScreen from '../screens/UnscrambleQuizScreen';
import SpeedRoundScreen from '../screens/SpeedRoundScreen';
import ListeningQuizScreen from '../screens/ListeningQuizScreen';
import TranslationQuizScreen from '../screens/TranslationQuizScreen';
import SentenceComposerScreen from '../screens/SentenceComposerScreen';
import GrammarListScreen from '../screens/GrammarListScreen';
import GrammarDetailScreen from '../screens/GrammarDetailScreen';
import DialogueListScreen from '../screens/DialogueListScreen';
import DialogueDetailScreen from '../screens/DialogueDetailScreen';
import PronunciationScreen from '../screens/PronunciationScreen';
import DailyChallengeScreen from '../screens/DailyChallengeScreen';
import MistakesReviewScreen from '../screens/MistakesReviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIMenuScreen from '../screens/AIMenuScreen';
import AIChatScreen from '../screens/AIChatScreen';
import AISettingsScreen from '../screens/AISettingsScreen';
import GrammarExplainerScreen from '../screens/GrammarExplainerScreen';
import SentenceCorrectorScreen from '../screens/SentenceCorrectorScreen';
import StoryGeneratorScreen from '../screens/StoryGeneratorScreen';
import RolePlayScreen from '../screens/RolePlayScreen';
import PersonalizedLessonScreen from '../screens/PersonalizedLessonScreen';
import ProgressChartsScreen from '../screens/ProgressChartsScreen';
import ThemedChallengeScreen from '../screens/ThemedChallengeScreen';
import DictionaryScreen from '../screens/DictionaryScreen';
import AudioPracticeScreen from '../screens/AudioPracticeScreen';
import AIGrammarGeneratorScreen from '../screens/AIGrammarGeneratorScreen';

const Stack = createNativeStackNavigator();

const defaultScreenOptions = {
  headerStyle: { backgroundColor: COLORS.bg },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: 'bold' },
  contentStyle: { backgroundColor: COLORS.bg },
  headerShadowVisible: false,
};

// All screens in one flat stack to avoid nested navigators
function MainStack({ activeTab, onTabPress }) {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={defaultScreenOptions}>
        {/* Tab root screens - we conditionally show the right one */}
        <Stack.Screen name="TabRoot" options={{ headerShown: false }}>
          {(props) => <TabRouter {...props} activeTab={activeTab} />}
        </Stack.Screen>

        {/* Shared screens accessible from any tab */}
        <Stack.Screen name="FlashcardCategories" component={FlashcardCategoriesScreen} options={{ title: 'Flashcards' }} />
        <Stack.Screen name="Flashcard" component={FlashcardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="QuizMenu" component={QuizMenuScreen} options={{ title: 'Quizzes' }} />
        <Stack.Screen name="MCQQuiz" component={MCQQuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FillBlankQuiz" component={FillBlankQuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MatchingQuiz" component={MatchingQuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="UnscrambleQuiz" component={UnscrambleQuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SpeedRound" component={SpeedRoundScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ListeningQuiz" component={ListeningQuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TranslationQuiz" component={TranslationQuizScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SentenceComposer" component={SentenceComposerScreen} options={{ title: 'Composer' }} />
        <Stack.Screen name="GrammarList" component={GrammarListScreen} options={{ title: 'Grammar' }} />
        <Stack.Screen name="GrammarDetail" component={GrammarDetailScreen} options={{ title: 'Lesson' }} />
        <Stack.Screen name="DialogueList" component={DialogueListScreen} options={{ title: 'Dialogues' }} />
        <Stack.Screen name="DialogueDetail" component={DialogueDetailScreen} options={{ title: 'Dialogue' }} />
        <Stack.Screen name="Pronunciation" component={PronunciationScreen} options={{ title: 'Pronunciation' }} />
        <Stack.Screen name="DailyChallenge" component={DailyChallengeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MistakesReview" component={MistakesReviewScreen} options={{ title: 'Mistakes' }} />
        <Stack.Screen name="AIMenu" component={AIMenuScreen} options={{ title: 'AI Tutor' }} />
        <Stack.Screen name="AIChat" component={AIChatScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AISettings" component={AISettingsScreen} options={{ title: 'AI Settings' }} />
        <Stack.Screen name="GrammarExplainer" component={GrammarExplainerScreen} options={{ title: 'Grammar AI' }} />
        <Stack.Screen name="SentenceCorrector" component={SentenceCorrectorScreen} options={{ title: 'Corrector' }} />
        <Stack.Screen name="StoryGenerator" component={StoryGeneratorScreen} options={{ title: 'Stories' }} />
        <Stack.Screen name="RolePlay" component={RolePlayScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PersonalizedLesson" component={PersonalizedLessonScreen} options={{ title: 'My Lessons' }} />
        <Stack.Screen name="ProgressCharts" component={ProgressChartsScreen} options={{ title: 'Progress' }} />
        <Stack.Screen name="ThemedChallenge" component={ThemedChallengeScreen} options={{ title: 'Challenges' }} />
        <Stack.Screen name="Dictionary" component={DictionaryScreen} options={{ title: 'Dictionary' }} />
        <Stack.Screen name="AudioPractice" component={AudioPracticeScreen} options={{ title: 'Audio Practice' }} />
        <Stack.Screen name="AIGrammarGenerator" component={AIGrammarGeneratorScreen} options={{ title: 'AI Grammar' }} />
      </Stack.Navigator>
      <CustomTabBar activeTab={activeTab} onTabPress={onTabPress} />
    </View>
  );
}

function TabRouter({ activeTab, navigation }) {
  switch (activeTab) {
    case 'home':
      return <HomeScreen navigation={navigation} />;
    case 'learn':
      return <FlashcardCategoriesScreen navigation={navigation} />;
    case 'quiz':
      return <QuizMenuScreen navigation={navigation} />;
    case 'ai':
      return <AIMenuScreen navigation={navigation} />;
    case 'profile':
      return <ProfileScreen navigation={navigation} />;
    default:
      return <HomeScreen navigation={navigation} />;
  }
}

export default function AppNavigator() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabPress = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  return (
    <NavigationContainer>
      <MainStack activeTab={activeTab} onTabPress={handleTabPress} />
    </NavigationContainer>
  );
}
