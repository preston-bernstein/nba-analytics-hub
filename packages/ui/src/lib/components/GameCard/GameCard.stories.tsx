import type { Meta, StoryObj } from '@storybook/react';
import { GameCard } from './GameCard';

const meta: Meta<typeof GameCard> = {
  title: 'UI/GameCard',
  component: GameCard,
};

export default meta;

type Story = StoryObj<typeof GameCard>;

export const Default: Story = {
  args: {
    game: {
      id: '1',
      homeTeamId: 'ATL',
      awayTeamId: 'LAL',
      startTimeUtc: new Date().toISOString(),
    },
  },
};
