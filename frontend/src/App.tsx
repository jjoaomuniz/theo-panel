import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from '@/components/layout/Layout';
import NeuralMap from '@/pages/NeuralMap';
import Dashboard from '@/pages/Dashboard';
import Agents from '@/pages/Agents';
import Coverage from '@/pages/Coverage';
import Costs from '@/pages/Costs';
import CronJobs from '@/pages/CronJobs';
import LLMs from '@/pages/LLMs';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <NeuralMap /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'agents', element: <Agents /> },
      { path: 'coverage', element: <Coverage /> },
      { path: 'costs', element: <Costs /> },
      { path: 'cronjobs', element: <CronJobs /> },
      { path: 'llms', element: <LLMs /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
