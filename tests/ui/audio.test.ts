import { afterEach, expect, it, vi } from 'vitest';
import { playCorrectEffect, speakMandarin } from '../../src/lib/audio';

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

it('plays a rising audio effect for a correct answer', () => {
  const oscillator = { type: '', frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn().mockReturnThis(), start: vi.fn(), stop: vi.fn(), addEventListener: vi.fn() };
  const gain = { gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn().mockReturnValue({}) };
  class AudioContextMock { currentTime = 0; destination = {}; createOscillator = () => oscillator; createGain = () => gain; close = vi.fn(); }
  Object.defineProperty(window, 'AudioContext', { configurable: true, value: AudioContextMock });

  playCorrectEffect();

  expect(oscillator.type).toBe('sine');
  expect(oscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalled();
  expect(oscillator.start).toHaveBeenCalledOnce();
});
