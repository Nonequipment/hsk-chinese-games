import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

beforeEach(() => localStorage.clear());

it('separates learning, games and exams in the primary navigation', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('link', { name: '▣ เรียน' })).toHaveAttribute('href', '/library');
  expect(screen.getByRole('link', { name: '⚡ เกม' })).toHaveAttribute('href', '/games');
  expect(screen.getByRole('link', { name: '✦ สอบ' })).toHaveAttribute('href', '/exams');
});

it('places sound and pinyin controls in the flashcard settings', async () => {
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('button', { name: 'ปิดเสียงอัตโนมัติ' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'ซ่อนพินอิน' })).toBeVisible();
});

