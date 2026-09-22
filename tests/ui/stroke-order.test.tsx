import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('shows stroke-order practice directly in the flashcard with memory controls', async () => {
  render(<MemoryRouter initialEntries={['/learn/S01']}><App /></MemoryRouter>);

  expect(await screen.findByLabelText('ลำดับขีดบนการ์ด')).toBeVisible();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'คำก่อนหน้า' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'คำถัดไป' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'จำไม่ได้' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'จำคำนี้แล้ว' })).toBeVisible();
});
