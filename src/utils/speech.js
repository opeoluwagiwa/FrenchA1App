import * as Speech from 'expo-speech';

export async function speakFrench(text, rate = 0.85) {
  const isSpeaking = await Speech.isSpeakingAsync();
  if (isSpeaking) {
    await Speech.stop();
  }
  Speech.speak(text, {
    language: 'fr-FR',
    rate,
    pitch: 1.0,
  });
}

export async function speakSlow(text) {
  return speakFrench(text, 0.55);
}

export function stopSpeaking() {
  Speech.stop();
}
