import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/src/App';

it('renders the HSK Mission start route', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /เรียนจีนทุกวัน/i })).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'เมนูหลัก' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible();
});
