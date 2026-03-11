import { createBrowserRouter, RouterProvider } from 'react-router';
import Layout from '@/components/layout/Layout';
import NeuralMap from '@/pages/NeuralMap';
import Dashboard from '@/pages/Dashboard';
import TasksBoard from '@/pages/TasksBoard';
import ContentPipeline from '@/pages/ContentPipeline';
import Memory from '@/pages/Memory';
import Calendar from '@/pages/Calendar';
import Office from '@/pages/Office';
import Team from '@/pages/Team';
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
      { path: 'tasks', element: <TasksBoard /> },
      { path: 'pipeline', element: <ContentPipeline /> },
      { path: 'memory', element: <Memory /> },
      { path: 'calendar', element: <Calendar /> },
      { path: 'office', element: <Office /> },
      { path: 'team', element: <Team /> },
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
