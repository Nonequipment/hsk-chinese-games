import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('opens a stroke-order practice panel for the current Chinese word', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);

  await user.click(await screen.findByRole('button', { name: /ดูลำดับขีด/ }));
  expect(await screen.findByRole('dialog', { name: 'ลำดับขีด 爸爸' })).toBeVisible();
  expect(screen.getAllByText('爸').length).toBeGreaterThan(0);
});
