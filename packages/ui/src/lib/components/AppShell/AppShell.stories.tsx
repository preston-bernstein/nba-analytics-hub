import type { Meta, StoryObj } from '@storybook/react-vite';
import { NbaAnalyticsHubUi } from './AppShell';
import { expect } from 'storybook/test';

const meta = {
  component: NbaAnalyticsHubUi,
  title: 'App/AppShell',
} satisfies Meta<typeof NbaAnalyticsHubUi>;
export default meta;

type Story = StoryObj<typeof NbaAnalyticsHubUi>;

export const Primary = {
  args: {},
} satisfies Story;

export const Heading = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/NbaAnalyticsHubUi/gi)).toBeTruthy();
  },
} satisfies Story;
