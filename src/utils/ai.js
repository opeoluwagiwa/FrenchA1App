const SYSTEM_PROMPT_CHAT = `You are a friendly French conversation partner for an A1 beginner. Rules:
- Use ONLY simple A1-level French (present tense, basic vocabulary)
- Keep responses SHORT (1-3 sentences max)
- After your French response, add a line break then the English translation in parentheses
- If the user makes a grammar/spelling mistake, gently correct it before responding
- Format corrections as: "✏️ Small fix: [wrong] → [correct]"
- Stay in character for the scenario
- Be encouraging and use simple words
- If the user writes in English, respond in French but keep it very simple`;

const SYSTEM_PROMPT_GRAMMAR = `You are a French grammar expert explaining to an A1 beginner. Rules:
- Give SHORT, clear explanations (max 4-5 sentences)
- Use simple English to explain
- Always include 2-3 example sentences with translations
- Format examples as: "🇫🇷 French sentence" then "🇬🇧 English translation"
- Focus on practical usage, not linguistic theory
- Be encouraging`;

const SYSTEM_PROMPT_CORRECT = `You are a French writing corrector for an A1 beginner. Rules:
- Check the user's French text for errors
- List each correction as: "✏️ [wrong] → [correct] (reason)"
- Then show the full corrected sentence
- Rate their attempt: ⭐ (needs work), ⭐⭐ (good try), ⭐⭐⭐ (excellent)
- Add a brief encouraging comment in French (with translation)
- If the text is perfect, celebrate it!
- Keep explanations simple and short`;

const SCENARIOS = [
  { id: 'cafe', title: 'At a Cafe ☕', prompt: 'You are a waiter at a Parisian cafe. Greet the customer and ask what they would like. Start the conversation.' },
  { id: 'directions', title: 'Asking Directions 🗺️', prompt: 'You are a friendly Parisian. Someone approaches you asking for directions. Start by saying hello and asking if they need help.' },
  { id: 'shopping', title: 'Shopping 🛍️', prompt: 'You are a shop assistant in a clothing store. Greet the customer and ask if they need help finding something.' },
  { id: 'hotel', title: 'At the Hotel 🏨', prompt: 'You are a hotel receptionist. Greet the guest who just arrived and ask for their reservation name.' },
  { id: 'doctor', title: 'At the Doctor 🏥', prompt: 'You are a doctor. A patient has arrived. Greet them and ask what is wrong.' },
  { id: 'market', title: 'At the Market 🍎', prompt: 'You are a vendor at a French market selling fruits and vegetables. Greet the customer warmly.' },
  { id: 'train', title: 'Train Station 🚂', prompt: 'You are a ticket agent at a train station. Ask the customer where they would like to go.' },
  { id: 'friend', title: 'Meeting a Friend 👋', prompt: 'You are meeting your French friend for the first time. Introduce yourself and ask about their day.' },
];

export { SCENARIOS };

export async function chatWithAI(apiKey, messages, systemPrompt) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) {
      return { error: data.error.message };
    }
    return { text: data.choices[0].message.content };
  } catch (e) {
    return { error: 'Network error. Check your connection.' };
  }
}

export async function startChat(apiKey, scenario) {
  const systemPrompt = SYSTEM_PROMPT_CHAT + '\n\nScenario: ' + scenario.prompt;
  const result = await chatWithAI(apiKey, [], systemPrompt);
  return { ...result, systemPrompt };
}

export async function continueChat(apiKey, messages, systemPrompt) {
  return chatWithAI(apiKey, messages, systemPrompt);
}

export async function explainGrammar(apiKey, question) {
  return chatWithAI(apiKey, [{ role: 'user', content: question }], SYSTEM_PROMPT_GRAMMAR);
}

export async function correctSentence(apiKey, sentence) {
  return chatWithAI(apiKey, [{ role: 'user', content: sentence }], SYSTEM_PROMPT_CORRECT);
}
