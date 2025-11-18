import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppShell } from './AppShell';

const meta = {
  component: AppShell,
  title: 'Layout/AppShell',
  args: {
    title: 'NBA Analytics Hub',
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof AppShell>;

export const Basic: Story = {
  args: {
    children: <div>Dashboard content goes here.</div>,
  },
};

export const WithNav: Story = {
  args: {
    nav: (
      <>
        <button type="button">Games</button>
        <button type="button">Teams</button>
        <button type="button">Models</button>
      </>
    ),
    children: <div>Content with a simple nav.</div>,
  },
};

export const WithCustomFooter: Story = {
  args: {
    footer: <span>Custom footer · v0.1</span>,
    children: <div>Content with custom footer.</div>,
  },
};
