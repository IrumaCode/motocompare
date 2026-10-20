import type { MockLink } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { ThemeProvider } from '../app/theme/ThemeProvider';
import { ComparisonDnd } from '../features/comparison/ComparisonDnd';
import { ComparisonProvider } from '../features/comparison/ComparisonProvider';

interface RenderOptions {
  /** Initial URL, e.g. "/comparar?moto=a&moto=b" */
  route?: string;
  /** Route pattern that renders `ui`, when the page reads URL params like :slug */
  path?: string;
  /** Answers the fake GraphQL server gives, in order */
  mocks?: readonly MockLink.MockedResponse[];
}

/** Shows the current URL, so tests can check navigation like users see it in the address bar. */
function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname + location.search}</output>;
}

/**
 * Renders `ui` inside the same providers as the real app (main.tsx and AppLayout), with a
 * router in memory and Apollo answered by `mocks` instead of the network.
 */
export function renderWithProviders(
  ui: ReactElement,
  { route = '/', path = '*', mocks = [] }: RenderOptions = {},
): RenderResult {
  return render(
    <MockedProvider mocks={mocks}>
      <ThemeProvider>
        <MemoryRouter initialEntries={[route]}>
          <ComparisonProvider>
            <ComparisonDnd>
              <Routes>
                <Route path={path} element={ui} />
              </Routes>
              <LocationProbe />
            </ComparisonDnd>
          </ComparisonProvider>
        </MemoryRouter>
      </ThemeProvider>
    </MockedProvider>,
  );
}
