import { Route, Routes } from 'react-router';
import { CatalogPage } from '../features/catalog/CatalogPage';
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
