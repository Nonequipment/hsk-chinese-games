import { fireEvent, render, screen } from '@testing-library/react';
import { LibraryClient } from '@/app/library/library-client';
import { curriculum } from '@/app/lib/curriculum/load';
it('searches the full library and keeps duplicate Hanzi rows separate', () => {
  render(<LibraryClient sets={curriculum.sets} items={curriculum.items} progress={[]} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '只' } });
  expect(screen.getAllByText('只').length).toBeGreaterThan(1);
  fireEvent.change(screen.getByLabelText('สถานะ'), { target: { value: 'not-started' } });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  expect(screen.getByText('S60')).toBeVisible();
});
