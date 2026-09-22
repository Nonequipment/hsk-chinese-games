import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('shows the self-assessment library with an audible word card and status controls', async () => {
  render(<MemoryRouter initialEntries={['/self-check']}><App /></MemoryRouter>);
  expect(await screen.findByRole('heading', { name: 'ด่านประเมินตน' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'ปิดเสียงอัตโนมัติ' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'ทำเครื่องหมายว่าจำได้ 爸爸' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'ทำเครื่องหมายว่าต้องทบทวน 爸爸' })).toBeVisible();
});

it('filters the self-assessment cards by search text', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/self-check']}><App /></MemoryRouter>);
  const search = await screen.findByRole('searchbox', { name: 'ค้นหาคำศัพท์' });
  await user.type(search, '爸爸');
  expect(screen.getByText('爸爸')).toBeVisible();
  expect(screen.queryByText('医生')).not.toBeInTheDocument();
});
