import { render, screen } from '@testing-library/react';
import { Dashboard } from '@/app/components/dashboard/dashboard';
import { createDashboardSnapshot } from '@/app/lib/dashboard/service';
it('shows the adaptive daily mission and resume target', () => {
  render(<Dashboard snapshot={createDashboardSnapshot({ signedIn: true, completedSets: 3, recommendedSets: 3, resumeSetId: 'S04' })} />);
  expect(screen.getByText('ภารกิจวันนี้')).toBeVisible();
  expect(screen.getByText('แนะนำ 3 เซ็ต')).toBeVisible();
  expect(screen.getByRole('link', { name: 'เรียนต่อ' })).toHaveAttribute('href', '/learn/S04');
  expect(screen.getByLabelText('ความก้าวหน้า 3 จาก 60 เซ็ต')).toBeVisible();
});
