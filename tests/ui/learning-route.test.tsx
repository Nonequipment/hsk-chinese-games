import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('shows real vocabulary for a friendly set route and lets the learner hide pinyin', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/learn/set-01']}><App /></MemoryRouter>);

  expect(await screen.findByText('爸爸')).toBeVisible();
  expect(screen.getByText('bàba')).toBeVisible();
  expect(screen.getByText('พ่อ')).toBeVisible();

  await user.click(screen.getByRole('button', { name: /ซ่อนพินอิน/ }));
  expect(screen.queryByText('bàba')).not.toBeInTheDocument();
});
