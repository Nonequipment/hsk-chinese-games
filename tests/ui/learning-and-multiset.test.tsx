import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/App';

it('shows a replay sound button directly below the Thai translation', async () => {
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);
  expect(await screen.findByRole('button', { name: 'ฟังคำอ่านซ้ำ' })).toBeVisible();
});

it('shows stroke order canvases for every character in the word', async () => {
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);
  expect(await screen.findAllByLabelText(/ภาพเคลื่อนไหวลำดับขีด/)).toHaveLength(2);
});

it('lets a learner select multiple sets for a game', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/games']}><App /></MemoryRouter>);
  expect(await screen.findByRole('button', { name: 'เลือก S02' })).toBeVisible();
  expect(screen.getByRole('link', { name: /เริ่มเล่น 1 เซ็ตที่เลือก/ })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'เลือก S02' }));
  expect(screen.getByRole('link', { name: /เริ่มเล่น 2 เซ็ตที่เลือก/ })).toHaveAttribute('href', '/practice/S01+S02');
  await user.click(screen.getByRole('button', { name: 'ลบ S01' }));
  await user.click(screen.getByRole('button', { name: 'ลบ S02' }));
  expect(screen.getByRole('button', { name: 'เลือกอย่างน้อย 1 เซ็ตเพื่อเริ่มเกม' })).toBeDisabled();
});

it('loads all words from combined sets into one game', async () => {
  render(<MemoryRouter initialEntries={['/practice/S01+S02+S03']}><App /></MemoryRouter>);
  expect(await screen.findByText(/S01 \+ S02 \+ S03 · 60 คำ/)).toBeVisible();
});

