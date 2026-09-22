import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
  render(<MemoryRouter initialEntries={['/games']}><App /></MemoryRouter>);
  expect(await screen.findByRole('checkbox', { name: 'เลือก SET 01' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'เล่น 1 เซ็ตที่เลือก' })).toBeVisible();
});

it('loads all words from combined sets into one game', async () => {
  render(<MemoryRouter initialEntries={['/practice/S01+S02+S03']}><App /></MemoryRouter>);
  expect(await screen.findByText(/S01 \+ S02 \+ S03 · 60 คำ/)).toBeVisible();
});

