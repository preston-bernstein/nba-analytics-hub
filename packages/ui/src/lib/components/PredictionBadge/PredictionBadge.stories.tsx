import type { Meta, StoryObj } from '@storybook/react';
import { PredictionBadge } from './PredictionBadge';

const meta: Meta<typeof PredictionBadge> = {
  title: 'UI/PredictionBadge',
  component: PredictionBadge,
};

export default meta;

type Story = StoryObj<typeof PredictionBadge>;

export const Default: Story = {
  args: {
    prediction: {
      homeTeamId: 'ATL',
      awayTeamId: 'BOS',
      homeWinProbability: 0.62,
      awayWinProbability: 0.38,
      modelVersion: 'mock-v1',
    },
  },
};
