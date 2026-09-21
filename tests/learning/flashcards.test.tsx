import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest'; import { FlashcardSession } from '@/app/learn/[setId]/flashcard-session'; import { getSet } from '@/app/lib/curriculum/load';
it('requires reveal and a memory choice before completing a card', async () => {
  const saveCard=vi.fn().mockResolvedValue(undefined); const set=getSet('S01')!;
  render(<FlashcardSession set={set} initialProgress={[]} saveCard={saveCard}/>);
  expect(screen.getByText('爸爸')).toBeVisible(); expect(screen.queryByText('bàba')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'เปิดคำตอบ'})); expect(screen.getByText('bàba')).toBeVisible();
  await act(async()=>fireEvent.click(screen.getByRole('button',{name:'จำได้แล้ว'})));
  expect(saveCard).toHaveBeenCalledWith(expect.objectContaining({itemId:'V0001',status:'remembered'}));
});
