import type { CoolingType, EngineType, TransmissionType } from '../../generated/graphql/graphql';

// Spanish names for the API enums. Records keyed by the enum make the compiler flag
// any value added to the API but not translated here.

export const ENGINE_TYPE_LABELS: Record<EngineType, string> = {
  SINGLE: 'Monocilíndrico',
  PARALLEL_TWIN: 'Bicilíndrico en paralelo',
  V_TWIN: 'Bicilíndrico en V',
  BOXER_TWIN: 'Bicilíndrico bóxer',
  INLINE_THREE: 'Tricilíndrico en línea',
  INLINE_FOUR: 'Tetracilíndrico en línea',
  V_FOUR: 'Tetracilíndrico en V',
};

export const COOLING_LABELS: Record<CoolingType, string> = {
  AIR: 'Por aire',
  AIR_OIL: 'Por aire y aceite',
  AIR_LIQUID: 'Por aire y líquido',
  LIQUID: 'Líquida',
};

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  MANUAL: 'Manual',
  CVT: 'Automática (CVT)',
  DCT: 'Doble embrague (DCT)',
};
