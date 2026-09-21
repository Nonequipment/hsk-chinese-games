import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '@/src/App';

it('renders a learning route after a direct navigation', () => {
  render(
    <MemoryRouter initialEntries={['/learn/set-01']}>
      <App />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: /เรียน set 1/i })).toBeVisible();
});
