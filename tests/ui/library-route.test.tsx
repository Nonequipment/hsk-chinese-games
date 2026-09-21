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
