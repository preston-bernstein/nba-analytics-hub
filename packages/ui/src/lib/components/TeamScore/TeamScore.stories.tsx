import type { Meta, StoryObj } from '@storybook/react';
import { TeamScore } from './TeamScore';

const meta: Meta<typeof TeamScore> = {
  title: 'UI/TeamScore',
  component: TeamScore,
  args: { name: 'Atlanta Hawks' },
};

export default meta;

type Story = StoryObj<typeof TeamScore>;

export const NoScore: Story = {};
export const WithScore: Story = { args: { score: 102, showScore: true } };
export const Winner: Story = { args: { score: 110, showScore: true, isWinner: true } };
