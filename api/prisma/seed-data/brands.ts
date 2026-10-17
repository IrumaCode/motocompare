export interface BrandSeed {
  slug: string;
  name: string;
  country: string;
}

export const brands: BrandSeed[] = [
  { slug: 'yamaha', name: 'Yamaha', country: 'Japón' },
  { slug: 'honda', name: 'Honda', country: 'Japón' },
  { slug: 'kawasaki', name: 'Kawasaki', country: 'Japón' },
  { slug: 'ktm', name: 'KTM', country: 'Austria' },
  { slug: 'bmw', name: 'BMW Motorrad', country: 'Alemania' },
];
