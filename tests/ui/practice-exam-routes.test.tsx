import { render, screen } from '@testing-library/react';
import { beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

beforeEach(() => localStorage.clear());

it('keeps games outside the learning card', async () => {
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);
  expect(await screen.findByText('爸爸')).toBeVisible();
  expect(screen.queryByRole('link', { name: 'เล่นเกมฝึกฝน' })).not.toBeInTheDocument();
});

it('renders a practice route with game modes', async () => {
  render(<MemoryRouter initialEntries={['/practice/S01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'เกมฝึกฝน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'เลือกความหมาย' })).toBeVisible();
});

it('locks an exam until every card is remembered', async () => {
  render(<MemoryRouter initialEntries={['/exam/S01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'ยังเปิดข้อสอบไม่ได้' })).toBeVisible();
});

