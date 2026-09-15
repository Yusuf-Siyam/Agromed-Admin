import SettingsView from './components/SettingsView';
import PlatformControls from './components/PlatformControls';

export const SettingsRoutes = [
  {
    path: '/settings',
    element: <SettingsView />
  },
  {
    path: '/platform-controls',
    element: <PlatformControls />
  }
];
