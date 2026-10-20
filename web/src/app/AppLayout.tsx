import { Outlet } from 'react-router';
import { ComparisonDnd } from '../features/comparison/ComparisonDnd';
import { ComparisonProvider } from '../features/comparison/ComparisonProvider';
import { ComparisonTray } from '../features/comparison/ComparisonTray';
import { Footer } from './Footer';
import { Header } from './Header';

export function AppLayout() {
  return (
    <ComparisonProvider>
      <ComparisonDnd>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
            <Outlet />
          </main>
          <Footer />
          <ComparisonTray />
        </div>
      </ComparisonDnd>
    </ComparisonProvider>
  );
}
