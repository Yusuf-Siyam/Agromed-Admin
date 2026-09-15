import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastProvider } from './components/shared/Toast';
import { SuperAdminSessionProvider } from './features/auth/SuperAdminSession';

function App() {
  return (
    <ToastProvider>
      <SuperAdminSessionProvider>
        <RouterProvider router={router} />
      </SuperAdminSessionProvider>
    </ToastProvider>
  );
}

export default App;
