import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

it('mixes meaning, Chinese typing, and numbered-pinyin questions in one exam', async () => {
  const user = userEvent.setup();
  localStorage.setItem('hsk-mission-remembered', JSON.stringify(Array.from({ length: 20 }, (_, index) => `V${String(index + 1).padStart(4, '0')}`)));
  render(<MemoryRouter initialEntries={['/exam/S01']}><App /></MemoryRouter>);
  await user.click(await screen.findByRole('button', { name: 'เริ่มสอบ 60 ข้อ' }));
  expect(screen.getByText('เลือกความหมาย · ไม่มีพินอิน')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'พ่อ' }));
  expect(screen.getByText('พิมพ์ตัวจีนให้ถูกต้อง')).toBeVisible();
  await user.type(screen.getByRole('textbox', { name: 'พิมพ์คำตอบสอบ' }), '爸爸');
  await user.click(screen.getByRole('button', { name: 'ส่งคำตอบ' }));
  expect(screen.getAllByText('พิมพ์พินอินพร้อมเลขวรรณยุกต์').length).toBeGreaterThan(0);
  expect(screen.getByText('ข้อ 3 / 60')).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'พิมพ์คำตอบสอบ' })).toHaveAttribute('placeholder', 'เช่น ba4ba');
});

