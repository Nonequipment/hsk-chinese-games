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
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/practice/S01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'เกมฝึกฝน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'เลือกความหมาย' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'พิมพ์พินอินและโทน' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'แยกโทน' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'ปิดเสียงอัตโนมัติ' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'ซ่อนพินอิน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'สุ่มข้อใหม่' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'พิมพ์พินอินและโทน' }));
  expect(screen.getByPlaceholderText('เช่น ba4ba')).toHaveFocus();
});

it('locks an exam until every card is remembered', async () => {
  render(<MemoryRouter initialEntries={['/exam/S01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'ยังเปิดข้อสอบไม่ได้' })).toBeVisible();
});

it('starts a randomized 60-question exam containing all three question styles', async () => {
  const user = userEvent.setup();
  localStorage.setItem('hsk-mission-remembered', JSON.stringify(Array.from({ length: 20 }, (_, index) => `V${String(index + 1).padStart(4, '0')}`)));
  render(<MemoryRouter initialEntries={['/exam/S01']}><App /></MemoryRouter>);
  expect(await screen.findByText(/สุ่มลำดับโจทย์ทั้ง 3 รูปแบบ/i)).toBeVisible();
  expect(screen.getByText(/ตอบผิดจะแสดงเฉลยก่อนเริ่มใหม่/i)).toBeVisible();
  expect(screen.getByText(/คำตอบจะไม่แสดงก่อนตอบ/i)).toBeVisible();
  await user.click(await screen.findByRole('button', { name: 'เริ่มสอบ 60 ข้อ' }));
  expect(screen.getByText('ข้อ 1 / 60')).toBeVisible();
  expect(screen.getAllByText(/เลือกความหมาย|พิมพ์ตัวจีน|พิมพ์พินอินพร้อมเลขวรรณยุกต์/).length).toBeGreaterThan(0);
});

