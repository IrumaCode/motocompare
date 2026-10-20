import type { MockLink } from '@apollo/client/testing';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mt07 } from '../../test/fixtures';
import { renderWithProviders } from '../../test/render';
import { motorcycleDetailQuery } from './motorcycle-detail-query';
import { MotorcycleDetailPage } from './MotorcycleDetailPage';

const DETAIL = {
  ...mt07,
  powerPercentile: 37.9,
  image: {
    __typename: 'MotorcycleImage',
    url: '/motos/yamaha-mt-07-2024.webp',
    author: 'Jane Doe',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
  },
};

function detailMock(slug: string, motorcycle: typeof DETAIL | null): MockLink.MockedResponse {
  return {
    request: { query: motorcycleDetailQuery, variables: { slug } },
    result: { data: { motorcycle } },
  };
}

function renderDetail(slug: string, mocks: readonly MockLink.MockedResponse[]) {
  return renderWithProviders(<MotorcycleDetailPage />, {
    route: `/motos/${slug}`,
    path: '/motos/:slug',
    mocks,
  });
}

describe('MotorcycleDetailPage', () => {
  it('shows the specs, the price and the photo credit', async () => {
    renderDetail(mt07.slug, [detailMock(mt07.slug, DETAIL)]);

    expect(await screen.findByRole('heading', { level: 1, name: 'MT-07' })).toBeInTheDocument();
    expect(screen.getByText('Más potente que el 38 % del catálogo')).toBeInTheDocument();
    // es-CO formats US$ 8.199 with a non-breaking space after the symbol
    expect(screen.getByText(/US\$\s8\.199/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute(
      'href',
      DETAIL.image.licenseUrl,
    );
  });

  it('can be added to the comparison from the detail page', async () => {
    const user = userEvent.setup();
    renderDetail(mt07.slug, [detailMock(mt07.slug, DETAIL)]);

    await user.click(await screen.findByRole('button', { name: /^Comparar ?Yamaha MT-07$/ }));

    expect(localStorage.getItem('motocompare-comparison')).toContain(mt07.slug);
  });

  it('shows a not-found page for an unknown motorcycle', async () => {
    renderDetail('nope', [detailMock('nope', null)]);

    expect(await screen.findByRole('heading', { name: 'Moto no encontrada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute('href', '/motos');
  });
});
