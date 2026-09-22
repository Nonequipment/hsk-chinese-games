import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../src/App';

it('searches vocabulary by Thai meaning and previews the matching Chinese word', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);

  await user.type(await screen.findByLabelText('ค้นหาคำศัพท์'), 'พ่อ');
  expect(await screen.findByText('爸爸')).toBeVisible();
});

it('labels fully studied sets as ready for an exam and passed sets as remembered', async () => {
  localStorage.setItem('hsk-mission-remembered', JSON.stringify(Array.from({ length: 20 }, (_, index) => `V${String(index + 1).padStart(4, '0')}`)));
  localStorage.setItem('hsk-mission-exam-passed-sets', JSON.stringify(['S02']));
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);

  expect(await screen.findByText('เรียนไปแล้ว · พร้อมสอบ')).toBeVisible();
  expect(screen.getByText('✓ สอบผ่าน')).toBeVisible();
});
