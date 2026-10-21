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
import { CATALOG_PAGE_SIZE, catalogQuery, filterOptionsQuery } from './catalog-queries';
import { CatalogPage } from './CatalogPage';

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

type CatalogMockOptions = Partial<MockLink.MockedResponse> & {
  /** Matches across all pages, when it differs from the motorcycles on this page */
  totalCount?: number;
};

/**
 * The catalog query the page sends for this URL, answered with these motorcycles. The variables
 * come from the same URL mapping the page uses, so a bug in that mapping would pass here too:
 * catalog-search-params.test.ts is the test that guards it.
 */
function catalogMock(
  query: string,
  motorcycles: readonly MotorcycleMock[],
  { totalCount = motorcycles.length, ...response }: CatalogMockOptions = {},
): MockLink.MockedResponse {
  const params: CatalogParams = parseCatalogParams(new URLSearchParams(query));
  return {
    request: { query: catalogQuery, variables: toMotorcyclesVariables(params, CATALOG_PAGE_SIZE) },
    result: {
      data: {
        motorcycles: { __typename: 'MotorcyclePage', totalCount, items: motorcycles },
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

  it('moves to another page and takes the focus to the results', async () => {
    const user = userEvent.setup();
    renderCatalog('', [
      catalogMock('', [mt07], { totalCount: 13 }),
      catalogMock('pagina=2', [z900], { totalCount: 13 }),
    ]);

    await user.click(await screen.findByRole('link', { name: 'Página 2' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/motos?pagina=2');
    expect(await screen.findByRole('link', { name: 'Z900' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resultados' })).toHaveFocus();
  });

  it('explains when the page in the URL does not exist', async () => {
    renderCatalog('pagina=5', [catalogMock('pagina=5', [], { totalCount: 2 })]);

    expect(await screen.findByText('Esta página no existe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir a la página 1' })).toBeInTheDocument();
  });

  it('does not keep showing the old list after a filter change fails', async () => {
    const user = userEvent.setup();
    renderCatalog('', [
      catalogMock('', [mt07, z900]),
      catalogMock('marca=kawasaki', [], { result: undefined, error: new Error('Failed to fetch') }),
    ]);
    await screen.findByRole('link', { name: 'MT-07' });

    await user.click(await within(sidebar()).findByRole('button', { name: 'Kawasaki' }));

    // The previous results would look like the filtered ones: the error replaces them
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el catálogo');
    expect(screen.queryByRole('link', { name: 'MT-07' })).not.toBeInTheDocument();
  });

  it('shows an error with a retry when the API fails', async () => {
    renderCatalog('', [
      catalogMock('', [], { result: undefined, error: new Error('Failed to fetch') }),
    ]);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos cargar el catálogo');
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
