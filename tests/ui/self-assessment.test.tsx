import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('shows Chinese-only self-assessment cards that cycle from known to review', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/self-check']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'ด่านประเมินตน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'ปิดเสียงอัตโนมัติ' })).toBeVisible();
  const card = screen.getByRole('button', { name: 'ประเมินคำศัพท์ 爸爸' });
  expect(screen.queryByText('bàba')).not.toBeInTheDocument();
  await user.click(card);
  expect(card).toHaveAttribute('data-status', 'known');
  await user.click(card);
  expect(card).toHaveAttribute('data-status', 'review');
});

it('filters the self-assessment cards by search text', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/self-check']}><App /></MemoryRouter>);
  const search = await screen.findByRole('searchbox', { name: 'ค้นหาคำศัพท์' });
  await user.type(search, '爸爸');
  expect(screen.getByText('爸爸')).toBeVisible();
  expect(screen.queryByText('医生')).not.toBeInTheDocument();
});
