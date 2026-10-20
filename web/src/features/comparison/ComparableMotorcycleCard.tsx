import type { ComponentProps } from 'react';
import { MotorcycleCard } from '../motorcycles/MotorcycleCard';
import { CompareToggle } from './CompareToggle';
import { toComparisonItem } from './comparison-selection';
import { DragHandle } from './DragHandle';

type MotorcycleCardData = ComponentProps<typeof MotorcycleCard>['motorcycle'];

/** Catalog card plus the two ways to send it to the comparison tray: drag or button. */
export function ComparableMotorcycleCard({ motorcycle }: { motorcycle: MotorcycleCardData }) {
  const item = toComparisonItem(motorcycle);

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
