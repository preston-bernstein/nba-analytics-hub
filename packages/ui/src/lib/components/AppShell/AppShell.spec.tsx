import { render } from '@testing-library/react';

import NbaAnalyticsHubUi from './AppShell';

describe('NbaAnalyticsHubUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NbaAnalyticsHubUi />);
    expect(baseElement).toBeTruthy();
  });
});
