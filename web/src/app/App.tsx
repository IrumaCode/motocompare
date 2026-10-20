import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { COMPARE_PATH } from '../features/comparison/compare-url';
import { HomePage } from '../features/home/HomePage';
import { MotorcycleDetailPage } from '../features/motorcycle-detail/MotorcycleDetailPage';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';

// Code splitting: Chart.js is only used by the compare page, so that page (and Chart.js with
// it) is downloaded the first time someone opens it, not with the rest of the app.
const ComparePage = lazy(() =>
  import('../features/comparison/ComparePage').then((module) => ({
    default: module.ComparePage,
  })),
);

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="motos" element={<CatalogPage />} />
        <Route path="motos/:slug" element={<MotorcycleDetailPage />} />
        <Route
          path={COMPARE_PATH}
          element={
            // The chunk is small and usually arrives at once: announce it without a visual flash
            <Suspense fallback={<p className="sr-only">Cargando la comparación…</p>}>
              <ComparePage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
