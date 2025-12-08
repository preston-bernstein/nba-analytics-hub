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
      provider: 'mock-provider',
      homeTeam: { id: 'ATL', name: 'Atlanta Hawks', externalId: 14 },
      awayTeam: { id: 'LAL', name: 'Los Angeles Lakers', externalId: 13 },
      startTime: new Date().toISOString(),
      status: 'SCHEDULED',
      score: { home: 0, away: 0 },
      meta: { season: '2024-2025', upstreamGameId: 9999 },
    },
  },
};
