import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LibraryClient } from '@/app/library/library-client';
import { curriculum } from '@/app/lib/curriculum/load';
it('loads the full vocabulary index only when the learner searches', async () => {
  const loadItems = vi.fn().mockResolvedValue(curriculum.items);
  render(<LibraryClient sets={curriculum.sets} progress={[]} loadItems={loadItems} />);
  expect(loadItems).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '只' } });
  await waitFor(() => expect(loadItems).toHaveBeenCalledTimes(1));
  expect(screen.getAllByText('只').length).toBeGreaterThan(1);
  fireEvent.change(screen.getByLabelText('สถานะ'), { target: { value: 'not-started' } });
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  expect(screen.getByText('S60')).toBeVisible();
});
