import type { Meta, StoryObj } from '@storybook/react';
import { ProbabilityBar } from './ProbabilityBar';

const meta: Meta<typeof ProbabilityBar> = {
  title: 'UI/ProbabilityBar',
  component: ProbabilityBar,
  args: { awayPct: 38, homePct: 62, awayLabel: 'BOS', homeLabel: 'ATL' },
};

export default meta;

type Story = StoryObj<typeof ProbabilityBar>;

export const HomeFavored: Story = {};
export const AwayFavored: Story = { args: { awayPct: 71, homePct: 29 } };
export const Even: Story = { args: { awayPct: 50, homePct: 50 } };
