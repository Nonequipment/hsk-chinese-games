export function speakMandarin(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.resume();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.82;
  const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang.toLowerCase().startsWith('zh'));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
}
