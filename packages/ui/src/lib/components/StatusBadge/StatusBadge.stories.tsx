import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './StatusBadge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  args: { status: 'scheduled' },
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Scheduled: Story = { args: { status: 'scheduled' } };
export const Live: Story = { args: { status: 'live', children: 'Q3 4:12' } };
export const Final: Story = { args: { status: 'final' } };
export const Postponed: Story = { args: { status: 'postponed' } };
export const Canceled: Story = { args: { status: 'canceled' } };

export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-2">
      {(['scheduled', 'live', 'final', 'postponed', 'canceled'] as const).map((status) => (
        <StatusBadge key={status} status={status} />
      ))}
    </div>
  ),
};
