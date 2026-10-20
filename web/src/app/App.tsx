import { Route, Routes } from 'react-router';
import { CatalogPage } from '../features/catalog/CatalogPage';
import { ComparePage } from '../features/comparison/ComparePage';
import { COMPARE_PATH } from '../features/comparison/comparison-selection';
import { HomePage } from '../features/home/HomePage';
import { MotorcycleDetailPage } from '../features/motorcycle-detail/MotorcycleDetailPage';
import { AppLayout } from './AppLayout';
import { NotFoundPage } from './NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="motos" element={<CatalogPage />} />
        <Route path="motos/:slug" element={<MotorcycleDetailPage />} />
        <Route path={COMPARE_PATH} element={<ComparePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
