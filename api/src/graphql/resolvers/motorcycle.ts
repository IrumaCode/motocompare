import type {
  MotorcycleImage,
  MotorcycleResolvers,
} from '../../generated/graphql/resolvers-types.js';
import type { Motorcycle as MotorcycleModel } from '../../generated/prisma/client.js';

/** The seed writes the image columns all together, so a path implies the rest of the credit. */
function toImage(motorcycle: MotorcycleModel): MotorcycleImage | null {
  const { imagePath, imageAuthor, imageLicense, imageLicenseUrl, imageSourceUrl } = motorcycle;
  if (!imagePath || !imageAuthor || !imageLicense || !imageLicenseUrl || !imageSourceUrl) {
    return null;
  }
  return {
    url: imagePath,
    author: imageAuthor,
    license: imageLicense,
    licenseUrl: imageLicenseUrl,
    sourceUrl: imageSourceUrl,
  };
}

// Scalar fields come straight from the Prisma model; only derived and related fields need code
export const Motorcycle: MotorcycleResolvers = {
  brand: (motorcycle, _args, { loaders }) => loaders.brandById.load(motorcycle.brandId),
  category: (motorcycle, _args, { loaders }) => loaders.categoryById.load(motorcycle.categoryId),
  priceCop: (motorcycle, _args, { services }) => services.prices.toCop(motorcycle.priceUsd),
  image: (motorcycle) => toImage(motorcycle),
  powerPercentile: (motorcycle, _args, { loaders }) =>
    loaders.powerPercentile.load(motorcycle.powerHp),
};
