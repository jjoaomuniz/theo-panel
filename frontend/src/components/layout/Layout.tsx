import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import ErrorBoundary from '@/components/shared/ErrorBoundary';

export default function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
