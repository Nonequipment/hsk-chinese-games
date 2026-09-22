import { afterEach, expect, it, vi } from 'vitest';
import { speakMandarin } from '../../src/lib/audio';

afterEach(() => vi.unstubAllGlobals());

it('speaks Chinese with the Mandarin language selected', () => {
  const cancel = vi.fn(); const resume = vi.fn(); const speak = vi.fn();
  vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; rate = 1; voice: unknown; constructor(public text: string) {} });
  Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { cancel, resume, speak, getVoices: () => [{ lang: 'zh-CN' }] } });

  speakMandarin('爸爸');

  expect(cancel).toHaveBeenCalledOnce();
  expect(resume).toHaveBeenCalledOnce();
  expect(speak).toHaveBeenCalledWith(expect.objectContaining({ text: '爸爸', lang: 'zh-CN' }));
});
