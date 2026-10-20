import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { CompareToggle } from './CompareToggle';
import type { ComparisonItem } from './comparison-selection';
import { ComparisonTray } from './ComparisonTray';

const STORAGE_KEY = 'motocompare-comparison';

const ITEMS: ComparisonItem[] = [
  { slug: 'yamaha-mt-07-2024', name: 'MT-07', brandName: 'Yamaha' },
  { slug: 'kawasaki-z900-2024', name: 'Z900', brandName: 'Kawasaki' },
  { slug: 'ktm-390-duke-2024', name: '390 Duke', brandName: 'KTM' },
  { slug: 'honda-cb650r-2024', name: 'CB650R', brandName: 'Honda' },
  { slug: 'bmw-r-1300-gs-2024', name: 'R 1300 GS', brandName: 'BMW' },
];

/** Five compare buttons plus the tray, as on a catalog page. */
function CatalogLike() {
  return (
    <>
      {ITEMS.map((item) => (
        <CompareToggle key={item.slug} item={item} />
      ))}
      <ComparisonTray />
    </>
  );
}

// Browsers name these buttons "Comparar Yamaha MT-07", but the library Testing Library uses in
// jsdom drops the space before the visually hidden part ("CompararYamaha MT-07"). Checked
// against Chromium's accessibility tree, so the test accepts both.
const toggle = (name: string) =>
  screen.getByRole('button', { name: new RegExp(`^Comparar ?${name}$`) });
const tray = () => screen.getByRole('complementary', { name: 'Bandeja de comparación' });

describe('compare button and tray', () => {
  it('adds a motorcycle to the tray and remembers it', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogLike />);
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();

    await user.click(toggle('Yamaha MT-07'));

    expect(toggle('Yamaha MT-07')).toHaveAttribute('aria-pressed', 'true');
    expect(within(tray()).getByRole('status')).toHaveTextContent('1 de 4');
    expect(localStorage.getItem(STORAGE_KEY)).toContain('yamaha-mt-07-2024');
  });

  it('removes it when pressed again', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogLike />);

    await user.click(toggle('Yamaha MT-07'));
    await user.click(toggle('Yamaha MT-07'));

    expect(toggle('Yamaha MT-07')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('links to the comparison once there are two motorcycles', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogLike />);

    await user.click(toggle('Yamaha MT-07'));
    expect(within(tray()).getByRole('button', { name: 'Ver comparación' })).toBeDisabled();

    await user.click(toggle('Kawasaki Z900'));
    expect(within(tray()).getByRole('link', { name: /Ver comparación/ })).toHaveAttribute(
      'href',
      '/comparar?moto=yamaha-mt-07-2024&moto=kawasaki-z900-2024',
    );
  });

  it('blocks a fifth motorcycle but keeps the button focusable and explains why', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogLike />);
    for (const { brandName, name } of ITEMS.slice(0, 4)) {
      await user.click(toggle(`${brandName} ${name}`));
    }

    const fifth = toggle('BMW R 1300 GS');
    await user.click(fifth);

    expect(fifth).toHaveAttribute('aria-disabled', 'true');
    expect(fifth).toHaveAccessibleDescription(
      'La comparación ya tiene 4 motos. Quita una para añadir otra.',
    );
    expect(fifth).toHaveAttribute('aria-pressed', 'false');
    expect(within(tray()).getByRole('status')).toHaveTextContent('4 de 4');
  });

  it('removes a motorcycle from the tray', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CatalogLike />);
    await user.click(toggle('Yamaha MT-07'));
    await user.click(toggle('Kawasaki Z900'));

    await user.click(screen.getByRole('button', { name: 'Quitar Yamaha MT-07 de la comparación' }));

    expect(toggle('Yamaha MT-07')).toHaveAttribute('aria-pressed', 'false');
    expect(within(tray()).getByRole('status')).toHaveTextContent('1 de 4');
  });

  it('restores the tray saved by a previous visit', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ITEMS.slice(0, 2)));

    renderWithProviders(<CatalogLike />);

    expect(within(tray()).getByRole('status')).toHaveTextContent('2 de 4');
    expect(toggle('Kawasaki Z900')).toHaveAttribute('aria-pressed', 'true');
  });

  it('follows changes made in another tab', () => {
    renderWithProviders(<CatalogLike />);

    // The browser fires "storage" in every other tab when one of them writes localStorage
    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: JSON.stringify(ITEMS.slice(0, 3)),
        }),
      );
    });

    expect(within(tray()).getByRole('status')).toHaveTextContent('3 de 4');
  });
});
