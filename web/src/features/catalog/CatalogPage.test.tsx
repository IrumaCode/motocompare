import type { MockLink } from '@apollo/client/testing';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mt07, z900, type MotorcycleMock } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import {
  parseCatalogParams,
  toMotorcyclesVariables,
  type CatalogParams,
} from './catalog-search-params';
import { catalogQuery, filterOptionsQuery } from './catalog-queries';
import { CatalogPage } from './CatalogPage';

const PAGE_SIZE = 12;

const filterOptionsMock: MockLink.MockedResponse = {
  request: { query: filterOptionsQuery },
  result: {
    data: {
      brands: [
        { __typename: 'Brand', id: '1', slug: 'yamaha', name: 'Yamaha' },
        { __typename: 'Brand', id: '3', slug: 'kawasaki', name: 'Kawasaki' },
      ],
      categories: [{ __typename: 'Category', id: '1', slug: 'naked', name: 'Naked' }],
    },
  },
};

/** The catalog query the page sends for this URL, answered with these motorcycles. */
function catalogMock(
  query: string,
  motorcycles: readonly MotorcycleMock[],
  response: Partial<MockLink.MockedResponse> = {},
): MockLink.MockedResponse {
  const params: CatalogParams = parseCatalogParams(new URLSearchParams(query));
  return {
    request: { query: catalogQuery, variables: toMotorcyclesVariables(params, PAGE_SIZE) },
    result: {
      data: {
        motorcycles: {
          __typename: 'MotorcyclePage',
          totalCount: motorcycles.length,
          items: motorcycles,
        },
      },
    },
    ...response,
  };
}

function renderCatalog(query: string, mocks: readonly MockLink.MockedResponse[]) {
  return renderWithProviders(<CatalogPage />, {
    route: `/motos${query ? `?${query}` : ''}`,
    path: '/motos',
    mocks: [filterOptionsMock, ...mocks],
  });
}

// Desktop sidebar (the mobile dialog renders the same filters a second time)
const sidebar = () => screen.getByRole('complementary', { name: 'Filtros' });

describe('CatalogPage', () => {
  it('loads the motorcycles that match the filters in the URL', async () => {
    renderCatalog('marca=yamaha', [catalogMock('marca=yamaha', [mt07])]);

    expect(await screen.findByRole('link', { name: 'MT-07' })).toHaveAttribute(
      'href',
      '/motos/yamaha-mt-07-2024',
    );
    expect(screen.getByText('1 moto')).toBeInTheDocument();
    expect(await within(sidebar()).findByRole('button', { name: 'Yamaha' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('writes a filter into the URL', async () => {
    const user = userEvent.setup();
    renderCatalog('', [catalogMock('', [mt07, z900]), catalogMock('marca=kawasaki', [z900])]);

    await user.click(await within(sidebar()).findByRole('button', { name: 'Kawasaki' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/motos?marca=kawasaki');
    expect(await screen.findByText('1 moto')).toBeInTheDocument();
  });

  it('writes the sort order into the URL', async () => {
    const user = userEvent.setup();
    renderCatalog('', [
      catalogMock('', [mt07, z900]),
      catalogMock('orden=potencia-desc', [z900, mt07]),
    ]);
    await screen.findByText('2 motos');

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Ordenar por' }),
      'Más potentes primero',
    );

    expect(screen.getByTestId('location')).toHaveTextContent('/motos?orden=potencia-desc');
  });

  it('offers to clear the filters when nothing matches', async () => {
    const user = userEvent.setup();
    renderCatalog('precio=hasta-6000', [
      catalogMock('precio=hasta-6000', []),
      catalogMock('', [mt07, z900]),
    ]);

    await user.click(await screen.findByRole('button', { name: 'Limpiar filtros' }));

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/motos$/);
    expect(await screen.findByText('2 motos')).toBeInTheDocument();
  });

  it('shows an error with a retry when the API fails', async () => {
    renderCatalog('', [
      catalogMock('', [], { result: undefined, error: new Error('Failed to fetch') }),
    ]);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el catálogo');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
