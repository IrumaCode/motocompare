import type { ComponentProps } from 'react';
import { MotorcycleCard } from '../motorcycles/MotorcycleCard';
import { CompareToggle } from './CompareToggle';
import { DragHandle } from './DragHandle';

type MotorcycleCardData = ComponentProps<typeof MotorcycleCard>['motorcycle'];

/** Catalog card plus the two ways to send it to the comparison tray: drag or button. */
export function ComparableMotorcycleCard({ motorcycle }: { motorcycle: MotorcycleCardData }) {
  const item = { slug: motorcycle.slug, name: motorcycle.name, brandName: motorcycle.brand.name };

  return (
    <MotorcycleCard
      motorcycle={motorcycle}
      actions={
        <>
          <DragHandle item={item} />
          <CompareToggle item={item} />
        </>
      }
    />
  );
}
