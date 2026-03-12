import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router';
import Layout from '@/components/layout/Layout';
import NeuralMap from '@/pages/NeuralMap';
import Coverage from '@/pages/Coverage';
import CronJobs from '@/pages/CronJobs';
import Tasks from '@/pages/Tasks';
import Memory from '@/pages/Memory';
import Calendar from '@/pages/Calendar';
import Office from '@/pages/Office';
import Team from '@/pages/Team';
import Login from '@/pages/Login';
import GitHub from '@/pages/GitHub';
import Vercel from '@/pages/Vercel';
import Supabase from '@/pages/Supabase';
import { isLoggedIn } from '@/lib/auth';

function RequireAuth() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RedirectIfAuth() {
  if (isLoggedIn()) return <Navigate to="/" replace />;
  return <Login />;
}

const router = createBrowserRouter([
  { path: '/login', element: <RedirectIfAuth /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <NeuralMap /> },
          { path: 'coverage', element: <Coverage /> },
          { path: 'cronjobs', element: <CronJobs /> },
          { path: 'tasks', element: <Tasks /> },
          { path: 'memory', element: <Memory /> },
          { path: 'calendar', element: <Calendar /> },
          { path: 'office', element: <Office /> },
          { path: 'team', element: <Team /> },
          { path: 'github', element: <GitHub /> },
          { path: 'vercel', element: <Vercel /> },
          { path: 'supabase', element: <Supabase /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
