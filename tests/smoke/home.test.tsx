import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
vi.mock('@/app/chatgpt-auth', () => ({ getChatGPTUser: async () => null, chatGPTSignInPath: () => '/signin-with-chatgpt' }));
import HomePage from '@/app/page';

it('renders the HSK 1200 product shell', async () => {
  render(await HomePage());
  expect(screen.getByRole('heading', { name: /HSK 4\.0.*1,200/ })).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'เมนูหลัก' })).toBeVisible();
});
