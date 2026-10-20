import type { ComponentProps } from 'react';
import { MotorcycleCard } from '../motorcycles/MotorcycleCard';
import { CompareToggle } from './CompareToggle';

type MotorcycleCardData = ComponentProps<typeof MotorcycleCard>['motorcycle'];

/** Catalog card plus the controls to send it to the comparison tray. */
export function ComparableMotorcycleCard({ motorcycle }: { motorcycle: MotorcycleCardData }) {
  const item = { slug: motorcycle.slug, name: motorcycle.name, brandName: motorcycle.brand.name };

  return <MotorcycleCard motorcycle={motorcycle} actions={<CompareToggle item={item} />} />;
}
