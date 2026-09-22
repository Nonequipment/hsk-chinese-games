import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('offers practice and exam from a study card', async () => {
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);

  expect(await screen.findByRole('link', { name: 'เล่นเกมฝึกฝน' })).toHaveAttribute('href', '/practice/S01');
  expect(screen.getByRole('link', { name: 'สอบชุดนี้' })).toHaveAttribute('href', '/exam/S01');
});

it('renders a practice route with game modes', async () => {
  render(<MemoryRouter initialEntries={['/practice/S01']}><App /></MemoryRouter>);

  expect(await screen.findByRole('heading', { name: 'เกมฝึกฝน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'เลือกความหมาย' })).toBeVisible();
});

it('renders an exam route with the required three stages', async () => {
  render(<MemoryRouter initialEntries={['/exam/S01']}><App /></MemoryRouter>);

  expect(await screen.findByRole('heading', { name: 'สอบชุดคำศัพท์' })).toBeVisible();
  expect(screen.getByRole('button', { name: /ความหมาย/ })).toBeVisible();
  expect(screen.getByRole('button', { name: 'พิมพ์ตัวจีน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'เสียงวรรณยุกต์' })).toBeVisible();
});
