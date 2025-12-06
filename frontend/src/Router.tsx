import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import TaskListPage from './pages/TaskListPage';
import TaskCreationPage from './pages/TaskCreationPage';

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <TaskListPage />,
            },
            {
                path: '/create-task',
                element: <TaskCreationPage />,
            },
        ],
    },
]);

export default router;
