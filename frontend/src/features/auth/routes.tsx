import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import SessionExpired from './components/SessionExpired';
import Unauthorized from './components/Unauthorized';

export const AuthRoutes = [
  { path: 'login', element: <Login /> },
  { path: 'forgot-password', element: <ForgotPassword /> },
  { path: 'reset-password', element: <ResetPassword /> },
  { path: 'session-expired', element: <SessionExpired /> },
  { path: 'unauthorized', element: <Unauthorized /> }
];
