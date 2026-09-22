import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/src/App';

it('renders a learning route after a direct navigation', async () => {
  render(
    <MemoryRouter initialEntries={['/learn/set-01']}>
      <App />
    </MemoryRouter>,
  );

  expect(await screen.findByText('爸爸')).toBeVisible();
  expect(screen.getByRole('button', { name: /ซ่อนพินอิน/i })).toBeVisible();
});

it('stores a completed card locally', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/learn/set-01']}><App /></MemoryRouter>);
  await user.click(await screen.findByRole('button', { name: /จำคำนี้แล้ว/ }));
  expect(localStorage.getItem('hsk-mission-remembered')).toContain('V0001');
});

it('renders the vocabulary library route', async () => {
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: /คลังคำศัพท์/i })).toBeVisible();
});

