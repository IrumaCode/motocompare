import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { describe, expect, it, vi } from 'vitest';
import { duke, mt07, z900, type MotorcycleMock } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { compareQuery } from './compare-query';
import { ComparePage } from './ComparePage';

// jsdom has no <canvas> drawing, so Chart.js itself is replaced. Our own chart code (config,
// hook, accessible canvas) still runs; only the drawing library is fake.
vi.mock('./charts/chart-setup', () => ({
  Chart: class {
    destroy() {
      // nothing was drawn
    }
  },
}));

const href = (...slugs: string[]) => `/comparar?${slugs.map((slug) => `moto=${slug}`).join('&')}`;

function compareMock(
  motorcycles: readonly MotorcycleMock[],
  response: Partial<MockLink.MockedResponse> = {},
): MockLink.MockedResponse {
  return {
    request: { query: compareQuery, variables: { slugs: motorcycles.map((m) => m.slug) } },
    result: { data: { compare: motorcycles } },
    ...response,
  };
}

function renderPage(route: string, mocks: readonly MockLink.MockedResponse[] = []) {
  return renderWithProviders(<ComparePage />, { route, path: '/comparar', mocks });
}

function required<T>(value: T | null | undefined, what: string): T {
  if (value == null) throw new Error(`Expected ${what} in the page`);
  return value;
}

/** Motorcycle names in the table head (group rows like "Motor" are column headers too). */
function columnHeaders() {
  const [head] = within(screen.getByRole('table')).getAllByRole('rowgroup');
  return within(required(head, 'a table head'))
    .getAllByRole('columnheader')
    .map((header) => header.textContent);
}

/** The value cells of the spec row with this label. */
async function rowCells(label: string) {
  const header = await screen.findByRole('rowheader', { name: label });
  return within(required(header.closest('tr'), `a "${label}" row`)).getAllByRole('cell');
}

describe('ComparePage', () => {
  it('asks for at least two motorcycles', () => {
    renderPage(href('yamaha-mt-07-2024'));

    expect(screen.getByRole('heading', { name: 'Elige al menos 2 motos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toHaveAttribute('href', '/motos');
  });

  it('compares the motorcycles in the order of the link', async () => {
    renderPage(href(z900.slug, mt07.slug), [compareMock([z900, mt07])]);

    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(columnHeaders()).toEqual(['KawasakiZ900', 'YamahaMT-07']);
    expect(
      screen.getByRole('heading', { name: 'Carrera de potencia por kilo' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Gráfico de radar que compara Kawasaki Z900, Yamaha MT-07/ }),
    ).toBeInTheDocument();
  });

  it('marks the best value of each row', async () => {
    renderPage(href(mt07.slug, z900.slug), [compareMock([mt07, z900])]);

    const powerCells = await rowCells('Potencia');
    const weightCells = await rowCells('Peso en orden de marcha');

    // MT-07 is lighter, Z900 is more powerful
    expect(powerCells[1]).toHaveTextContent('(mejor valor)');
    expect(powerCells[0]).not.toHaveTextContent('(mejor valor)');
    expect(weightCells[0]).toHaveTextContent('(mejor valor)');
  });

  it('shows a not-found page when a motorcycle of the link does not exist', async () => {
    renderPage(href(mt07.slug, 'nope'), [
      {
        request: { query: compareQuery, variables: { slugs: [mt07.slug, 'nope'] } },
        result: {
          errors: [
            new GraphQLError('Unknown motorcycles: nope', {
              extensions: { code: 'BAD_USER_INPUT' },
            }),
          ],
        },
      },
    ]);

    expect(
      await screen.findByRole('heading', { name: 'Alguna moto del enlace no existe' }),
    ).toBeInTheDocument();
  });

  it('offers a retry after a network error', async () => {
    const user = userEvent.setup();
    renderPage(href(mt07.slug, z900.slug), [
      compareMock([mt07, z900], { result: undefined, error: new Error('Failed to fetch') }),
      compareMock([mt07, z900]),
    ]);

    await user.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('removes a column without going back to the loading skeleton', async () => {
    const user = userEvent.setup();
    renderPage(href(mt07.slug, z900.slug, duke.slug), [
      compareMock([mt07, z900, duke]),
      compareMock([mt07, duke]),
    ]);
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: /^Quitar ?Kawasaki Z900$/ }));

    expect(screen.getByTestId('location')).toHaveTextContent(href(mt07.slug, duke.slug));
    // While the new list loads, the remaining columns stay on screen
    expect(screen.queryByText('Cargando la comparación…')).not.toBeInTheDocument();
    expect(columnHeaders()).toEqual(['YamahaMT-07', 'KTM390 Duke']);
  });
});
